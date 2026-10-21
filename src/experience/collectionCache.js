// Query snapshots supplement domain actions; filters and authorization remain in the ERP modules.
const copy=value=>value==null?value:JSON.parse(JSON.stringify(value));
const stable=value=>value==null?'null':Array.isArray(value)?`[${value.map(stable).join(',')}]`:typeof value==='object'?`{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`:JSON.stringify(value);
const interrupted=()=>Object.assign(new Error('Contexto da leitura alterado.'),{name:'AbortError'});
export function createCollectionCache({getScope,storage,now=()=>Date.now(),freshMs=30000,maxAgeMs=86400000,maxEntries=40,maxBytes=2000000,onRefresh=()=>{}}){
 const entries=new Map(),pending=new Map(),listeners=new Set();let scope=getScope(),revision=0,status={},hits=0,misses=0;
 const emit=(endpoint,value)=>{status={...status,[endpoint]:value};listeners.forEach(fn=>fn());};
 const invalidate=({persistent=true}={})=>{revision++;entries.clear();pending.clear();status={};listeners.forEach(fn=>fn());return Promise.resolve(persistent?storage?.clear?.():undefined).catch(()=>{});};
 const sync=()=>{const next=getScope();if(scope!==next){const previous=scope;scope=next;invalidate({persistent:!!previous||!next});}};
 const wrap=store=>{
  const original=store.actions.getItems;
  const endpoint=store.getters.resourceEndpoint;
  return {...store.actions,catalogCache:true,getItems(params={}){
   sync();const {__storeMeta:meta={},append=false,...query}=params;
   if(append||!getScope())return original(params);
   const capturedScope=scope,capturedRevision=revision;
   const requestKey=stable({append:false,endpoint,params:query});
   const key=stable([scope,endpoint,query]);
   const valid=()=>scope===getScope()&&scope===capturedScope&&revision===capturedRevision;
   store.actions.setActiveRequestKey(requestKey);
   const owns=()=>valid()&&(!store.getters.activeRequestKey||store.getters.activeRequestKey===requestKey)&&(!store.getters.lastCompletedRequest?.requestKey||store.getters.lastCompletedRequest.requestKey===requestKey||store.getters.activeRequestKey===requestKey);
   const present=entry=>{
    if(!valid())throw interrupted();
    store.actions.setActiveRequestKey(requestKey);store.actions.setItems(copy(entry.items));store.actions.setTotalItems(entry.totalItems);store.actions.setSummary?.(copy(entry.summary||{}));store.actions.setError?.(null);store.actions.setIsLoading?.(false);store.actions.setIsLoadingList?.(false);
    store.actions.setLastCompletedRequest?.({requestKey,status:'success',completedAt:now()});
    return copy(entry.items);
   };
   const network=(cached)=>{
    if(pending.has(key))return pending.get(key);
    misses++;
    if(cached)emit(endpoint,{mode:'refreshing',at:cached.at});
    onRefresh();
    const work=Promise.resolve(original({...query,__storeMeta:{...meta,preserveItems:!!cached,skipSystemError:!!cached||meta.skipSystemError===true}})).then(items=>{
     if(!valid())throw interrupted();
     const rows=Array.isArray(items)?items:items?.member||items?.['hydra:member']||[];
     if(owns()){
      const entry={items:copy(rows),totalItems:store.getters.totalItems??rows.length,summary:copy(store.getters.summary||{}),at:now()};
      const bytes=JSON.stringify(entry).length*2;
      if(bytes<=maxBytes){entries.set(key,entry);while(entries.size>maxEntries||[...entries.values()].reduce((n,e)=>n+JSON.stringify(e).length*2,0)>maxBytes)entries.delete(entries.keys().next().value);void Promise.resolve(storage?.put?.(key,entry)).catch(()=>{});}
      store.actions.setLastCompletedRequest?.({requestKey,status:'success',completedAt:now()});emit(endpoint,{mode:'fresh',at:entry.at});
     }
     return rows;
    }).catch(error=>{
     if(!valid())throw interrupted();
     const denied=Number(error?.status||error?.response?.status)===401||Number(error?.status||error?.response?.status)===403;
     if(denied){const owned=owns();void invalidate();if(owned){store.actions.setItems([]);store.actions.setTotalItems(0);store.actions.setError?.(error.message||'Acesso não autorizado.');emit(endpoint,{mode:'error'});}throw error;}
     if(cached&&owns()){
      present(cached);emit(endpoint,{mode:'offline',at:cached.at});return copy(cached.items);
     }
     if(owns())emit(endpoint,{mode:'error'});throw error;
    }).finally(()=>{if(pending.get(key)===work)pending.delete(key);});
    pending.set(key,work);return work;
   };
   return (async()=>{
    let entry=entries.get(key);
    if(!entry&&storage){try{entry=await storage.get(key);}catch{/* Storage denial must not block the API. */}}
    if(!valid())throw interrupted();
    if(entry&&(!Array.isArray(entry.items)||!Number.isFinite(entry.at)||now()-entry.at>maxAgeMs||now()<entry.at))entry=null;
    if(entry)entries.set(key,entry);
    if(entry&&!meta.catalogRefresh){
     hits++;
     const items=present(entry);emit(endpoint,{mode:'cached',at:entry.at});
     if(now()-entry.at>=freshMs)void network(entry).catch(()=>{});
     return items;
    }
    if(entry&&meta.catalogRefresh)present(entry);
    return network(entry);
   })();
  }};
 };
 return {wrap,invalidate,stats:()=>({hits,misses,entries:entries.size}),snapshot:()=>status,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);},dispose:()=>{entries.clear();pending.clear();listeners.clear();}};
}
