import {createErpExperience} from '../../experience/erpAdapter';
import eventBus from '@controleonline/ui-common/src/react/components/EventBus';

it('invalidates the shared waiter catalog after a successful product write, without treating order writes as product edits',async()=>{
 const api={fetch:jest.fn(async()=>({id:9}))};
 const x=createErpExperience({api,getContext:()=>({application:'MANAGER',company:3,principal:'fixture'})});
 const clear=jest.fn();eventBus.on('product-catalog-cache:cleared',clear);
 const uninstall=x.install();
 try{
  await api.fetch('products/9',{method:'PUT',body:{product:'fixture'}});
  expect(clear).toHaveBeenCalledTimes(1);
  await api.fetch('orders/1',{method:'PUT',body:{}});
  expect(clear).toHaveBeenCalledTimes(1);
  await api.fetch('products/9',{params:{company:3}});expect(clear).toHaveBeenCalledTimes(1);
 }finally{eventBus.off('product-catalog-cache:cleared',clear);uninstall();}
});

it('installs reversibly, learns only permitted reads, and makes a revisited list reusable', async () => {
  const original = jest.fn(async () => ({member: [{id: 1}], totalItems: 1}));
  const api = {fetch: original};
  let context = {application: 'MANAGER', company: '3', principal: 'user', session: 'session'};
  const x = createErpExperience({api, getContext: () => context});
  const uninstall = x.install();
  x.setCapabilities(['ClientsIndex']); x.begin('ClientsIndex', 'click'); x.present('ClientsIndex');
  await api.fetch('people', {params: {'link.company': '/people/3', 'link.linkType': 'client', itemsPerPage: 20, page: 1}});
  await x.prefetchRoute('ClientsIndex');
  x.begin('HomePage', 'click'); x.begin('ClientsIndex', 'click');
  await api.fetch('people', {params: {'link.company': '/people/3', 'link.linkType': 'client', itemsPerPage: 20, page: 1}});
  expect(original).toHaveBeenCalledTimes(1);
  expect(await x.prefetchRoute('SecretRoute')).toBe(false);
  context = {...context, company: '9'};
  await api.fetch('people', {params: {'link.company': '/people/9', page: 1}});
  expect(original).toHaveBeenCalledTimes(2);
  expect(JSON.stringify(x.journal.snapshot())).not.toContain('session');
  uninstall(); expect(api.fetch).toBe(original);
});

it('shares the event contract with SHOP without enabling the MANAGER runtime there', async () => {
  const x = createErpExperience({api: {fetch: async () => []}, getContext: () => ({application: 'SHOP', company: '7'})});
  x.begin('ShopLandingPage', 'command'); x.present('ShopLandingPage');
  expect(x.journal.snapshot().events.at(-1)).toMatchObject({schema: 'co.experience.v1', application: 'SHOP', type: 'screen.committed'});
  x.dispose();
});

it('keeps a clean prediction recipe when the existing API client enriches request options with headers', async () => {
  const api = {fetch: jest.fn(async (uri, options) => {options.headers = {authorization: 'synthetic'}; return {totalItems: 1};})};
  const x = createErpExperience({api, getContext: () => ({application:'MANAGER',company:'3',principal:'test'})});
  const uninstall = x.install(); x.setCapabilities(['ClientsIndex']); x.begin('ClientsIndex','click');
  await api.fetch('people', {params:{'link.company':'/people/3',itemsPerPage:20}});
  expect(await x.prefetchRoute('ClientsIndex')).toBe(true);
  uninstall();
});

it('does not abort a live read when menu capabilities change without an identity change', async () => {
  let done;
  const api={fetch:jest.fn(()=>new Promise(resolve=>{done=resolve;}))};
  const x=createErpExperience({api,getContext:()=>({application:'MANAGER',company:3,principal:'user'})});
  x.install(); x.setCapabilities(['ClientsIndex']); x.begin('ClientsIndex');
  const pending=api.fetch('people',{params:{page:1,itemsPerPage:20}});
  x.setCapabilities(['ClientsIndex','ProvidersIndex']);
  done({member:[],totalItems:0});
  await expect(pending).resolves.toMatchObject({totalItems:0});
  expect(x.stats().entries).toBe(0); x.dispose();
});

it('reuses a visited product page despite unrelated translation POSTs', async () => {
  const api={fetch:jest.fn(async()=>({member:[{id:1}],totalItems:1}))};
  const x=createErpExperience({api,getContext:()=>({application:'MANAGER',company:3,principal:'user'})});
  x.install(); x.setCapabilities(['ProductsPage']); x.begin('ProductsPage');
  const query={params:{itemsPerPage:20,page:1,company:3}};
  await api.fetch('products',query);
  await api.fetch('translates/resolve',{method:'POST',body:{keys:['products']}});
  x.begin('HomePage'); x.begin('ProductsPage'); await api.fetch('products',query);
  expect(x.stats().hits).toBe(1); x.dispose();
});

it('reuses scoped employee links on return and discards them on company switch', async()=>{
 let context={application:'MANAGER',company:3,principal:'test'};
 const api={fetch:jest.fn(async()=>({member:[{id:1}],totalItems:1}))};
 const x=createErpExperience({api,getContext:()=>context});x.install();x.setCapabilities(['EmployeesIndex']);x.begin('EmployeesIndex');
 const query={params:{company:'/people/3',peopleType:'employee',itemsPerPage:10,page:1}};
 await api.fetch('people_links',query);x.begin('HomePage');x.begin('EmployeesIndex');await api.fetch('people_links',query);
 expect(api.fetch).not.toBeUndefined();expect(x.stats().hits).toBe(1);
 context={...context,company:9};await api.fetch('people_links',{params:{...query.params,company:'/people/9'}});
 expect(x.stats().entries).toBe(1);expect(x.stats().misses).toBe(2);x.dispose();
});

it('installs collection reads only in supplied stores and purges them on writes and logout',async()=>{
 const state={resourceEndpoint:'people',items:[],totalItems:1};
 const actions={getItems:jest.fn(async()=>{state.items=[{id:1}];return state.items;}),setItems:v=>{state.items=v;},setTotalItems:v=>{state.totalItems=v;},setActiveRequestKey:v=>{state.activeRequestKey=v;},setLastCompletedRequest:v=>{state.lastCompletedRequest=v;}};
 const original=actions.getItems,store={getters:state,actions};
 const api={fetch:jest.fn(async()=>({}))};
 const x=createErpExperience({api,getContext:()=>({application:'MANAGER',company:3,principal:'a',active:true}),getStores:()=>({people:store})});
 const uninstall=x.install();expect(actions.getItems).not.toBe(original);expect(actions.catalogCache).toBe(true);
 await actions.getItems({page:1});await actions.getItems({page:1});expect(original).toHaveBeenCalledTimes(1);
 await api.fetch('people/1',{method:'PUT'});await actions.getItems({page:1});expect(original).toHaveBeenCalledTimes(2);
 x.reset();await actions.getItems({page:1});expect(original).toHaveBeenCalledTimes(3);uninstall();expect(actions.getItems).toBe(original);
});
