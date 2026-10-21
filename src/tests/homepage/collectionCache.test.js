import {createCollectionCache} from '../../experience/collectionCache';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function fixture({storage,scope='one',now=()=>100}={}){
 let context=scope;
 const state={resourceEndpoint:'people',items:[],totalItems:0};
 const actions={};for(const [method,field] of Object.entries({setItems:'items',setTotalItems:'totalItems',setSummary:'summary',setError:'error',setIsLoading:'isLoading',setIsLoadingList:'isLoadingList',setActiveRequestKey:'activeRequestKey',setLastCompletedRequest:'lastCompletedRequest'}))actions[method]=value=>{state[field]=value;};
 const getItems=jest.fn(async query=>{state.items=[{id:1}];state.totalItems=23;return state.items;});
 actions.getItems=getItems;const store={getters:state,actions};
 const cache=createCollectionCache({getScope:()=>context,storage,now,freshMs:20,maxAgeMs:1000});
 const wrapped=cache.wrap(store);return {cache,store,wrapped,getItems,setScope:value=>{context=value;}};
}
it('reuses the exact query without HTTP and restores its store after another list',async()=>{
 const f=fixture();await f.wrapped.getItems({company:3,page:1});f.store.getters.items=[{id:'other'}];
 expect(await f.wrapped.getItems({page:1,company:3})).toEqual([{id:1}]);expect(f.store.getters.totalItems).toBe(23);expect(f.getItems).toHaveBeenCalledTimes(1);
 await f.wrapped.getItems({company:3,page:2});expect(f.getItems).toHaveBeenCalledTimes(2);
});
it('presents stale rows immediately and refreshes without clearing them',async()=>{
 let now=100,finish;const f=fixture({now:()=>now});await f.wrapped.getItems({company:3});now=130;
 f.getItems.mockImplementationOnce(query=>{expect(query.__storeMeta.preserveItems).toBe(true);return new Promise(resolve=>{finish=()=>{f.store.getters.items=[{id:2}];resolve(f.store.getters.items);};});});
 expect(await f.wrapped.getItems({company:3})).toEqual([{id:1}]);expect(f.cache.snapshot().people.mode).toBe('refreshing');finish();await tick();expect(f.store.getters.items).toEqual([{id:2}]);
});
it('restores a persisted page after recreation and retains it on network failure',async()=>{
 const data=new Map(),storage={get:async key=>data.get(key),put:async(key,value)=>data.set(key,value),clear:async()=>data.clear()};
 const a=fixture({storage});await a.wrapped.getItems({company:3});await tick();a.cache.dispose();
 const b=fixture({storage,now:()=>130});b.getItems.mockRejectedValueOnce(new TypeError('Failed to fetch'));
 expect(await b.wrapped.getItems({company:3})).toEqual([{id:1}]);await tick();expect(b.store.getters.items).toEqual([{id:1}]);expect(b.cache.snapshot().people.mode).toBe('offline');
});
it('never restores a different identity/company scope or a response arriving after scope changed',async()=>{
 const f=fixture();await f.wrapped.getItems({company:3});f.setScope('two');await f.wrapped.getItems({company:3});expect(f.getItems).toHaveBeenCalledTimes(2);
 let done;f.getItems.mockImplementationOnce(()=>new Promise(resolve=>{done=resolve;}));const pending=f.wrapped.getItems({page:2});f.setScope('three');done([{id:'late'}]);await expect(pending).rejects.toMatchObject({name:'AbortError'});
});
it('invalidates reused pages after a write, rejects cold failures and handles empty lists',async()=>{
 const f=fixture();await f.wrapped.getItems({company:3});f.cache.invalidate();await f.wrapped.getItems({company:3});expect(f.getItems).toHaveBeenCalledTimes(2);
 f.getItems.mockRejectedValueOnce(new Error('unavailable'));await expect(f.wrapped.getItems({page:3})).rejects.toThrow('unavailable');
 f.getItems.mockImplementationOnce(async()=>{f.store.getters.items=[];f.store.getters.totalItems=0;return [];});await f.wrapped.getItems({page:4});expect(await f.wrapped.getItems({page:4})).toEqual([]);
});
it('manual refresh bypasses a fresh cached page and storage failure does not break online reads',async()=>{
 const f=fixture({storage:{get:async()=>{throw Error('blocked');},put:async()=>{throw Error('quota');},clear:async()=>{}}});
 await f.wrapped.getItems({company:3});await f.wrapped.getItems({company:3,__storeMeta:{catalogRefresh:true}});expect(f.getItems).toHaveBeenCalledTimes(2);
});
it('purges local rows on an authorization failure instead of showing them as offline data',async()=>{
 let now=100;const f=fixture({now:()=>now});await f.wrapped.getItems({company:3});now=130;
 f.getItems.mockRejectedValueOnce({status:403,message:'Forbidden'});await f.wrapped.getItems({company:3});await tick();expect(f.store.getters.items).toEqual([]);
});
it('keeps persisted pages while authentication/company bootstrap adopts its first valid scope',async()=>{
 const data=new Map(),storage={get:async key=>data.get(key),put:async(key,value)=>data.set(key,value),clear:async()=>data.clear()};
 const first=fixture({storage});await first.wrapped.getItems({company:3});await tick();first.cache.dispose();
 const restored=fixture({storage,scope:''});restored.setScope('one');expect(await restored.wrapped.getItems({company:3})).toEqual([{id:1}]);expect(restored.getItems).not.toHaveBeenCalled();
});
