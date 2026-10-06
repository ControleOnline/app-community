const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),babel=require('@babel/core');
const root=path.resolve(process.env.CONTROLEONLINE_MODULES_ROOT || path.join(__dirname, '../node_modules/@controleonline'));
function load(file,deps,globals={}){const exports={},filename=path.join(root,file);const {code}=babel.transformSync(fs.readFileSync(filename,'utf8'),{filename,babelrc:false,configFile:false,presets:[require.resolve('@babel/preset-env'),require.resolve('@babel/preset-react')]});vm.runInNewContext(code,{exports,console,setTimeout,clearTimeout,AbortController,...globals,require:id=>{assert.ok(Object.hasOwn(deps,id),id);return deps[id];}});return exports;}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup({online=true,storageFails=false}={}){
 const records=new Map();let scope='company3-device403-sessionA',calls=[];
 const module=load('ui-products/src/react/utils/cachedCatalogActions.js',{'@controleonline/ui-common/src/api/localDB':class {async get(){if(storageFails)throw Error('blocked');return null;}async saveItem(){if(storageFails)throw Error('quota');}},'@controleonline/ui-common/src/api':{api:{}},'./catalogCacheScope':{getCatalogCacheScope:async()=>scope}},{navigator:{onLine:online}});
 const store=()=>{const getters={resourceEndpoint:'products',items:[],totalItems:0,isLoading:false};return {getters,actions:{getItems:async()=>['legacy'],setItems:v=>getters.items=v,setTotalItems:v=>getters.totalItems=v,setIsLoading:v=>getters.isLoading=v,setIsLoadingList:()=>{}}};};
 const deps={getScope:async()=>scope,read:async id=>records.get(id),write:async v=>records.set(v.id,v),fetch:async(endpoint,query)=>{calls.push({endpoint,query});return {member:[{id:query.page||1,product:'Water'}],totalItems:3};}};
 const create=(s=store(),overrides={})=>({store:s,actions:module.createCachedCatalogActions(s,3,'products',{...deps,...overrides})});
 return {records,calls,deps,create,module,setScope:v=>scope=v};
}
const q={company:3,itemsPerPage:1,page:1};
test('first load saves the existing endpoint response, page and total',async()=>{const s=setup(),{store,actions}=s.create();const data=await actions.getItems(q);assert.equal(data.catalogPage,1);assert.equal(store.getters.totalItems,3);assert.equal(s.calls.length,1);assert.equal(s.calls[0].endpoint,'products');assert.equal(s.records.size,1);});
test('remount restores every loaded page without a repeated request',async()=>{const s=setup(),a=s.create();await a.actions.getItems(q);await a.actions.getItems({...q,page:2,append:true});const b=s.create(),data=await b.actions.getItems(q);assert.equal(data.length,2);assert.equal(data.catalogPage,2);assert.equal(data.catalogLastPageCount,1);assert.equal(s.calls.length,2);});
test('cached empty results are valid; an unseen offline category is not assumed empty',async()=>{const s=setup({online:false});await assert.rejects(s.create().actions.getItems(q),/ainda não foi carregado/);assert.equal(s.calls.length,0);const a=setup();await a.create(undefined,{fetch:async()=>({member:[],totalItems:0})}).actions.getItems(q);assert.equal((await a.create().actions.getItems(q)).length,0);assert.equal(a.calls.length,0);});
test('identical requests deduplicate and all list reads have concurrency one',async()=>{const s=setup();let count=0,max=0,requests=0;const fetch=async()=>{requests++;count++;max=Math.max(max,count);await tick();count--;return {member:[{id:1}],totalItems:1};};const a=s.create(undefined,{fetch}),b=s.create(undefined,{fetch});await Promise.all([a.actions.getItems(q),b.actions.getItems(q),s.create(undefined,{fetch}).actions.getItems({...q,product:'Tea'})]);assert.equal(requests,2);assert.equal(max,1);});
test('stale data opens immediately while refresh updates the next visit without overwriting the active view',async()=>{const s=setup();await s.create().actions.getItems(q);[...s.records.values()][0].pages[1].updatedAt=0;let resolve;const waiting=new Promise(r=>resolve=r),b=s.create(undefined,{fetch:()=>waiting});assert.equal((await b.actions.getItems(q))[0].product,'Water');assert.equal(b.store.getters.isLoading,false);resolve({member:[{id:1,product:'Updated'}],totalItems:1});await tick();await tick();assert.equal(b.store.getters.items[0].product,'Water');assert.equal((await s.create().actions.getItems(q))[0].product,'Updated');});
test('failed background refresh retains cache and is not retried on every visit',async()=>{const s=setup();await s.create().actions.getItems(q);[...s.records.values()][0].pages[1].updatedAt=0;let failed=0;const a=s.create(undefined,{fetch:async()=>{failed++;throw Error('offline');}});await a.actions.getItems(q);await tick();await tick();await a.actions.getItems(q);await tick();assert.equal(failed,1);assert.equal(a.store.getters.isLoading,false);});
test('manual refresh bypasses cache and invalidates later pages without leaking metadata to the API',async()=>{const s=setup(),a=s.create();await a.actions.getItems(q);await a.actions.getItems({...q,page:2,append:true});const result=await a.actions.getItems({...q,__storeMeta:{catalogRefresh:true}});assert.equal(result.catalogPage,1);assert.equal(result.length,1);assert.equal(s.calls.length,3);assert.equal(Object.hasOwn(s.calls[2].query,'__storeMeta'),false);assert.equal(Object.hasOwn(s.calls[1].query,'append'),false);});
test('filters, devices and sessions have isolated cache keys',async()=>{const s=setup();await s.create().actions.getItems(q);await s.create().actions.getItems({...q,product:'Tea'});s.setScope('company3-device404-sessionA');await s.create().actions.getItems(q);s.setScope('company3-device404-sessionB');await s.create().actions.getItems(q);assert.equal(s.calls.length,4);assert.equal(s.records.size,4);});
test('a late response after a device change is discarded',async()=>{const s=setup();let resolve;const waiting=new Promise(r=>resolve=r),a=s.create(undefined,{fetch:()=>waiting});const pending=a.actions.getItems(q);await tick();s.setScope('device404');resolve({member:[{id:1}],totalItems:1});await assert.rejects(pending,/contexto do PDV mudou/);assert.equal(s.records.size,0);});
test('storage failure falls back to memory and unavailable browser scope keeps the original store behavior',async()=>{const s=setup({storageFails:true}),a=s.create(undefined,{read:s.module.readCatalogRecord,write:s.module.writeCatalogRecord});await a.actions.getItems(q);await a.actions.getItems(q);assert.equal(s.calls.length,1);const b=s.create(undefined,{getScope:async()=>null});assert.equal((await b.actions.getItems(q))[0],'legacy');});
test('pagination resumes after the last restored page and marks manual refresh only for cached catalogs',async()=>{
 const React=require('react'),renderer=require('react-test-renderer');global.IS_REACT_ACT_ENVIRONMENT=true;
 const module=load('ui-default/src/react/components/table/useDefaultTablePagination.js',{react:React,'../inputs/defaultInputUtils':{getColumnKey:x=>x.name,isDateLikeColumn:()=>false},'./DefaultTable.utils':{normalizeCollectionItems:x=>x,resolveDateRangeQuery:()=>({}),resolveFilterQueryValue:x=>x,resolveHasMore:()=>false,stableSerialize:JSON.stringify}});
 let current;const queries=[],items=[{id:1},{id:2}],store={getters:{resourceEndpoint:'products',items},actions:{}};
 const actions={catalogCache:true,getItems:async query=>{queries.push(query);return Object.assign([...items],{catalogPage:query.page===1?2:3,catalogLastPageCount:1});}};
 const props={autoMode:true,columnsForTable:[],filters:{},isFocused:true,requestParams:{company:3,itemsPerPage:1},resolvedActions:actions,resolvedTotalItems:4,store,storeName:'products',resolvedSort:{}};
 const Probe=()=>{current=module.useDefaultTablePagination(props);return null;};let tree;
 await renderer.act(async()=>{tree=renderer.create(React.createElement(Probe));});assert.equal(current.currentPage,2);await renderer.act(async()=>current.handleEndReached());assert.equal(queries[1].page,3);await renderer.act(async()=>current.handleRefresh());assert.equal(queries[2].__storeMeta.catalogRefresh,true);await renderer.act(async()=>tree.unmount());
});

test('scope uses the effective master device and a session digest rather than persisting the token',async()=>{
 const {webcrypto}=require('node:crypto');let token='synthetic-session-A';const values=new Map([['device',JSON.stringify({id:403,type:'web'})]]);
 const scope=load('ui-products/src/react/utils/catalogCacheScope.js',{'@controleonline/ui-common/src/api':{api:{getToken:async()=>token}},'@env':{env:{API_ENTRYPOINT:'http://example.invalid',DOMAIN:'tenantA'}},'@controleonline/ui-common/src/utils/apiEntryPoint':{resolveApiEntryPoint:x=>x},'@controleonline/ui-common/src/utils/appDomain':{resolveAppDomain:x=>x}},{crypto:webcrypto,TextEncoder,localStorage:{getItem:key=>values.get(key)||null}});
 const first=await scope.getCatalogCacheScope(3);assert.equal(first.includes(token),false);assert.equal(JSON.parse(first)[5],'403');
 values.set('master-device',JSON.stringify({id:9,type:'pos'}));const master=await scope.getCatalogCacheScope(3);assert.equal(JSON.parse(master)[5],'9');assert.notEqual(first,master);
 token='synthetic-session-B';assert.notEqual(await scope.getCatalogCacheScope(3),master);assert.notEqual(await scope.getCatalogCacheScope(4),await scope.getCatalogCacheScope(3));
});

test('view hydration restores category and scroll, saves changes and clears selection across companies',async()=>{
 const React=require('react'),renderer=require('react-test-renderer');global.IS_REACT_ACT_ENVIRONMENT=true;
 const writes=[],scrolls=[];
 const hook=load('ui-products/src/react/hooks/useCachedCatalogView.js',{react:React,'../utils/catalogCacheScope':{getCatalogCacheScope:async company=>`company${company}`},'../utils/cachedCatalogActions':{readCatalogRecord:async id=>id.includes('company3')?{view:{categoryId:'12',search:'water'},y:500}:null,writeCatalogRecord:async value=>writes.push(value)}}).default;
 let list,view,setView,tree;
 const Probe=({company=3})=>{const [state,set]=React.useState({categoryId:'',search:''});view=state;setView=set;const restore=React.useCallback(value=>set({categoryId:value.categoryId||'',search:value.search||''}),[]);list=hook({enabled:true,companyId:company,context:'products',viewKey:'categories',view:state,restore});return null;};
 await renderer.act(async()=>{tree=renderer.create(React.createElement(Probe));});assert.equal(view.categoryId,'12');assert.equal(view.search,'water');
 list.ref({scrollToOffset:value=>scrolls.push(value.offset)});list.onContentSizeChange(300,2000);assert.equal(scrolls[0],500);
 await renderer.act(async()=>setView({categoryId:'13',search:''}));assert.equal(scrolls.at(-1),0);
 await renderer.act(async()=>tree.update(React.createElement(Probe,{company:4})));assert.equal(view.categoryId,'');assert.equal(view.search,'');
 await renderer.act(async()=>tree.unmount());assert.ok(writes.some(value=>value.id.includes('company3')&&value.view.categoryId==='13'));
 assert.ok(writes.some(value=>value.id.includes('company4')&&value.y===0));
});


test('customization completion clears category and search but preserves cached pages and later selection',async()=>{
 const React=require('react'),renderer=require('react-test-renderer');global.IS_REACT_ACT_ENVIRONMENT=true;
 const records=new Map([['view:company3:categories',{view:{categoryId:'12',search:'combo'},y:500}],
   ['catalog-products',{pages:{1:{items:[{id:134,product:'Combo'}]}}}]]);
 const pages=records.get('catalog-products');let view,setView,tree;
 const hook=load('ui-products/src/react/hooks/useCachedCatalogView.js',{react:React,
   '../utils/catalogCacheScope':{getCatalogCacheScope:async()=> 'company3'},
   '../utils/cachedCatalogActions':{readCatalogRecord:async id=>records.get(id),writeCatalogRecord:async value=>records.set(value.id,{...value})}}).default;
 const Probe=({resetKey})=>{const [state,set]=React.useState({categoryId:'',search:''});view=state;setView=set;
   const restore=React.useCallback(v=>set({categoryId:v.categoryId||'',search:v.search||''}),[]);
   hook({enabled:true,companyId:3,context:'products',viewKey:'categories',resetKey,view:state,restore});return null;};
 await renderer.act(async()=>{tree=renderer.create(React.createElement(Probe));});assert.equal(view.categoryId,'12');
 await renderer.act(async()=>tree.update(React.createElement(Probe,{resetKey:'70:done1'})));
 assert.equal(view.categoryId,'');assert.equal(view.search,'');assert.equal(records.get('view:company3:categories').y,0);
 assert.strictEqual(records.get('catalog-products'),pages);
 await renderer.act(async()=>setView({categoryId:'13',search:''}));
 await renderer.act(async()=>tree.unmount());
 await renderer.act(async()=>{tree=renderer.create(React.createElement(Probe,{resetKey:'70:done1'}));});
 assert.equal(view.categoryId,'13');
 await renderer.act(async()=>tree.unmount());
 await renderer.act(async()=>{tree=renderer.create(React.createElement(Probe,{resetKey:'70:done2'}));});
 assert.equal(view.categoryId,'');assert.strictEqual(records.get('catalog-products'),pages);
 await renderer.act(async()=>tree.unmount());
});


test('customization groups and options reuse the scoped persistent catalog without publishing over catalog stores',async()=>{
 const s=setup();let calls=0;
 const make=endpoint=>{const store={getters:{resourceEndpoint:endpoint},actions:{getItems:async()=>{throw Error('legacy should not run');},setItems:()=>{throw Error('must not replace global catalog');},setTotalItems:()=>{},setIsLoading:()=>{}}};
  return s.module.createCachedCatalogActions(store,3,'products',{...s.deps,publishStore:false,fetch:async()=>{calls++;return {member:[{id:10}],totalItems:1};}});};
 await make('product_groups').getItems({product:1343,'product.productType':'component'});
 await make('product_group_products').getItems({productGroup:'/product_groups/10',productType:'component'});
 await make('product_groups').getItems({product:1343,'product.productType':'component'});
 await make('product_group_products').getItems({productGroup:'/product_groups/10',productType:'component'});
 assert.equal(calls,2);assert.equal(s.records.size,2);
});
test('customization product details deduplicate and reload from the same scoped storage',async()=>{
 const s=setup();let calls=0;const items=[];
 const store={getters:{resourceEndpoint:'products'},actions:{get:async()=>{throw Error('legacy');},setItem:item=>items.push(item)}};
 const create=()=>s.module.createCachedCatalogActions(store,3,'products',{...s.deps,fetch:async endpoint=>{calls++;return {id:1343,product:'Combo',price:73};}});
 const [first,second]=await Promise.all([create().get(1343),create().get(1343)]);
 assert.equal(first.price,73);assert.equal(second.price,73);assert.equal(calls,1);
 assert.equal((await create().get(1343)).product,'Combo');assert.equal(calls,1);
 s.setScope('company4-device403-sessionA');await create().get(1343);assert.equal(calls,2);
});

test('new launch starts without category, search or scroll while keeping cached catalog data', async () => {
 const React=require('react'),renderer=require('react-test-renderer');global.IS_REACT_ACT_ENVIRONMENT=true;
 const records=new Map([['view:company3:categories',{view:{categoryId:'12',search:'water'},y:500,resetKey:'launch:70'}],
   ['catalog-products',{pages:{1:{items:[{id:134,product:'Combo'}]}}}]]);
 const pages=records.get('catalog-products');let view,setView,tree;
 const hook=load('ui-products/src/react/hooks/useCachedCatalogView.js',{react:React,
   '../utils/catalogCacheScope':{getCatalogCacheScope:async()=> 'company3'},
   '../utils/cachedCatalogActions':{readCatalogRecord:async id=>records.get(id),writeCatalogRecord:async value=>records.set(value.id,{...value})}}).default;
 const Probe=({resetKey})=>{const [state,set]=React.useState({categoryId:'',search:''});view=state;setView=set;
   const restore=React.useCallback(v=>set({categoryId:v.categoryId||'',search:v.search||''}),[]);
   hook({enabled:true,companyId:3,context:'products',viewKey:'categories',resetKey,view:state,restore});return null;};
 await renderer.act(async()=>{tree=renderer.create(React.createElement(Probe,{resetKey:'launch:71'}));});
 assert.equal(view.categoryId,'');assert.equal(view.search,'');
 assert.equal(records.get('view:company3:categories').y,0);assert.strictEqual(records.get('catalog-products'),pages);
 await renderer.act(async()=>setView({categoryId:'13',search:''}));
 await renderer.act(async()=>tree.unmount());
 await renderer.act(async()=>{tree=renderer.create(React.createElement(Probe,{resetKey:'launch:71'}));});
 assert.equal(view.categoryId,'13');
 await renderer.act(async()=>tree.update(React.createElement(Probe,{resetKey:'launch:72'})));
 assert.equal(view.categoryId,'');assert.equal(view.search,'');assert.strictEqual(records.get('catalog-products'),pages);
 await renderer.act(async()=>tree.unmount());
});
