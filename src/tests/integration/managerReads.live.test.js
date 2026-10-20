// Opt-in, read-only local integration. Credentials are supplied in process memory.
import React, {useSyncExternalStore} from 'react';
import renderer, {act} from 'react-test-renderer';
import {api} from '@controleonline/ui-common/src/api';
import peopleModule from '@controleonline/ui-people/src/store/people';
import linksModule from '@controleonline/ui-people/src/store/people_link';
import categoriesModule from '@controleonline/ui-common/src/store/categories';
import {buildPeopleLinkRequestParams, buildCompanyLinksRequestParams, buildParentCompanyRequestParams} from '@controleonline/ui-people/src/react/utils/peopleLinkFilters';
import {normalizeRuntimeMenuResponse} from '@controleonline/ui-common/src/react/utils/runtimeMenu';
import {useDefaultTablePagination} from '@controleonline/ui-default/src/react/components/table/useDefaultTablePagination';
import CheckoutContent from '@controleonline/ui-orders/src/react/pages/checkout/AddProductScreen';
import {employeeListFields} from '../../experience/readProfiles';
import {createErpExperience} from '../../experience/erpAdapter';

jest.mock('react-native',()=>({Platform:{OS:'web',select:values=>values.web??values.default},StyleSheet:{create:styles=>styles,hairlineWidth:1},ActivityIndicator:'ActivityIndicator',Text:'Text',TouchableOpacity:'TouchableOpacity',View:'View'}));
jest.mock('@env',()=>({env:{API_ENTRYPOINT:'http://localhost:8000',DOMAIN:'http://localhost:8081',HTACCESS_USER:'',HTACCESS_PASSWORD:''}}));
let mockStores={};
jest.mock('@store',()=>({getAllStores:()=>mockStores,useStore:name=>{const store=mockStores[name];require('react').useSyncExternalStore(store.subscribe,store.snapshot);return store;}}));
jest.mock('@appType',()=>({app_type:'MANAGER'}));
jest.mock('@react-navigation/native',()=>({useIsFocused:()=>true,useRoute:()=>({params:{}}),useFocusEffect:callback=>require('react').useEffect(callback,[callback])}));
jest.mock('@controleonline/ui-common/src/react/components/MessageService',()=>({useMessage:()=>({showError:()=>{}})}));
jest.mock('@controleonline/ui-orders/src/react/components/LinkedOrderEntrySheet',()=>()=>null);
jest.mock('@controleonline/ui-products/src/react/pages/Categories',()=>props=>require('react').createElement('categories-catalog',{rows:mockStores.categories.getters.items.length,prefetched:props.route.params.categoriesPrefetched}));
jest.mock('@controleonline/ui-products/src/react/pages/Products',()=>()=>null);
jest.mock('@controleonline/ui-orders/src/react/hooks/usePosCartSession',()=>({__esModule:true,default:()=>({activeOrder:null,ensureActiveOrder:async()=>{throw Error('Business writes are disabled in this read test');},loadStoredDraftOrder:async()=>null,refreshActiveOrder:async()=>null,usesLinkedCheckOrders:false}),isLinkedOrderCodeRequiredError:()=>false,isPosOrderCreationCancelledError:()=>false}));
const enabled=process.env.CO_LIVE_READS==='1';
const live=enabled?test:test.skip;
const stateFor=module=>{
 const state={...module.state,items:[],filters:{},currentCompany:{},mainCompany:{}};
 let version=0;const subscribers=new Set();
 const commit=(name,value)=>{const mutation=module.mutations[name];if(!mutation)throw Error('Missing mutation '+name);mutation(state,value);version++;subscribers.forEach(fn=>fn());};
 const actions=Object.fromEntries(Object.entries(module.actions).map(([name,fn])=>[name,(...args)=>fn({commit,getters:state},...args)]));
 return {getters:state,actions,subscribe:fn=>{subscribers.add(fn);return()=>subscribers.delete(fn);},snapshot:()=>version};
};
const empty={};
function ReadTable({store,query,onReady,startedAt}){
 useSyncExternalStore(store.subscribe,store.snapshot);
 const page=useDefaultTablePagination({autoMode:true,isFocused:true,columnsForTable:store.getters.columns||[],filters:empty,
  requestParams:query,pageSize:query.itemsPerPage,paginationMode:'pages',resolvedActions:store.actions,
  store,storeName:store.getters.resourceEndpoint,resolvedTotalItems:store.getters.totalItems,showError:()=>{}});
 const ready=!page.resolvedIsLoading&&store.getters.lastCompletedRequest?.status==='success'&&store.getters.lastCompletedRequest.completedAt>=startedAt&&page.resolvedData.length>0;
 React.useEffect(()=>{if(ready)onReady(page.resolvedData.length);},[ready]);
 return React.createElement('read-table',{loading:page.resolvedIsLoading,rows:page.resolvedData.length});
}
live('canonical stores and DefaultTable pagination present real local data after navigation triggers',async()=>{
 expect(Boolean(process.env.CO_SMOKE_USER&&process.env.CO_SMOKE_PASSWORD)).toBe(true);
 global.IS_REACT_ACT_ENVIRONMENT=true;
 const memory=new Map();global.localStorage={getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,String(value)),removeItem:key=>memory.delete(key)};
 global.location={host:'localhost:8081'};
 const nativeFetch=global.fetch;const requests=[];let offline=false;
 const savedPages=new Map(),collectionStorage={get:async key=>savedPages.get(key),put:async(key,value)=>savedPages.set(key,JSON.parse(JSON.stringify(value))),clear:async()=>savedPages.clear()};
 global.fetch=async(input,options={})=>{
  if(offline)throw new TypeError('Failed to fetch');
  const url=new URL(input);const method=String(options.method||'GET').toUpperCase();
  if(!['localhost','127.0.0.1'].includes(url.hostname)||url.port!=='8000'||(method!=='GET'&&!(method==='POST'&&url.pathname==='/token')))throw Error('Read-only loopback test boundary');
  const started=performance.now();const result=await nativeFetch(input,options);
  requests.push({path:url.pathname.replace(/\d+/g,':id'),status:result.status,ms:Math.round(performance.now()-started)});return result;
 };
 let cleanup=()=>{},tree;
 try{
  const user=await api.fetch('token',{method:'POST',body:{username:process.env.CO_SMOKE_USER,password:process.env.CO_SMOKE_PASSWORD}});
  expect(Boolean(user.api_key)).toBe(true);memory.set('session',JSON.stringify(user));
  const people=stateFor(peopleModule),links=stateFor(linksModule),categories=stateFor(categoriesModule);
  const companies=await people.actions.myCompanies();expect(companies.length).toBeGreaterThan(0);
  const company=people.getters.currentCompany;expect(Boolean(company?.id)).toBe(true);
  const menus=normalizeRuntimeMenuResponse(await api.fetch('menus-people',{params:{myCompany:company.id,appType:'MANAGER',menuType:'home'}}),{appType:'MANAGER',allowFallback:false});
  expect(menus.length).toBeGreaterThan(0);
  const experience=createErpExperience({api,collectionStorage,getStores:()=>({people,people_link:links,categories}),getContext:()=>({company:company.id,principal:user.id||user.username,application:'MANAGER',session:user.api_key,active:true})});cleanup=experience.install();
  const definitions=[
   {route:'ClientsIndex',store:people,query:buildPeopleLinkRequestParams({currentCompany:company,selectedLinkType:'client',availableTypes:['client']})},
   {route:'EmployeesIndex',store:links,query:{...buildCompanyLinksRequestParams({currentCompany:company,selectedLinkType:'all'}),...employeeListFields}},
   {route:'MyCompaniesPage',store:people,query:buildParentCompanyRequestParams({user})},
   {route:'PdvPage',store:categories,query:{company:company.id,context:'products'}},
  ];
  experience.setCapabilities(definitions.map(d=>d.route));
  let firstClientRequests;
  for(const [step,definition] of [...definitions,...definitions].entries()){
   const start=performance.now();experience.begin(definition.route,'click');
   let resolveReady;const presented=new Promise(resolve=>{resolveReady=resolve;});
   const query={...definition.query,itemsPerPage:20,page:1};
   await act(async()=>{tree=renderer.create(React.createElement(ReadTable,{store:definition.store,query,onReady:resolveReady,startedAt:Date.now()}));});
   const deadline=Date.now()+20000;
   while(tree.root.findByType('read-table').props.loading&&Date.now()<deadline)await act(async()=>{await new Promise(resolve=>setTimeout(resolve,25));});
   const view=tree.root.findByType('read-table').props;
   expect(definition.store.getters.error).toBeFalsy();expect(view.loading).toBe(false);expect(view.rows).toBeGreaterThan(0);
   const count=await presented;expect(count).toBe(view.rows);
   if(step===3)firstClientRequests=requests.length;
   if(step>=4){expect(requests.length).toBe(firstClientRequests);expect(experience.catalog.stats().hits).toBeGreaterThan(0);}
   experience.dataCommitted(definition.route);
   process.stdout.write('LOCAL_READ_RESULT '+JSON.stringify({route:definition.route,ms:Math.round(performance.now()-start),rows:count,total:definition.store.getters.totalItems,cacheHits:experience.catalog.stats().hits})+'\n');
   await act(async()=>tree.unmount());tree=null;
  }
  const refreshStart=performance.now();
  const refresh=people.actions.getItems({...definitions[0].query,itemsPerPage:20,page:1,__storeMeta:{catalogRefresh:true}});
  expect(people.getters.items.length).toBe(20);
  await refresh;expect(people.getters.items.length).toBe(20);
  process.stdout.write('LOCAL_BACKGROUND_REFRESH '+JSON.stringify({ms:Math.round(performance.now()-refreshStart),rows:20,keptVisible:true})+'\n');
  const inert=()=>({getters:{item:{},items:[]},actions:{initQueue:()=>{}},subscribe:()=>()=>{},snapshot:()=>0});
  mockStores={people,orders:inert(),device:inert(),device_config:inert(),categories};
  categories.getters.items=[];
  const pdvStart=performance.now();
  await act(async()=>{tree=renderer.create(React.createElement(CheckoutContent,{navigation:{setParams:()=>{},addListener:()=>()=>{}},route:{name:'PdvPage',params:{showBottomToolBar:true}}}));});
  const pdvDeadline=Date.now()+20000;
  while(!tree.root.findAllByType('categories-catalog').length&&Date.now()<pdvDeadline)await act(async()=>{await new Promise(resolve=>setTimeout(resolve,25));});
  const catalog=tree.root.findByType('categories-catalog');expect(catalog.props.rows).toBeGreaterThan(0);expect(catalog.props.prefetched).toBe(true);
  process.stdout.write('LOCAL_PDV_CATEGORIES '+JSON.stringify({ms:Math.round(performance.now()-pdvStart),rows:catalog.props.rows})+'\n');
  await act(async()=>tree.unmount());tree=null;
  cleanup();
  for(const entry of savedPages.values())entry.at=Date.now()-31000;
  for(const store of [people,links,categories]){store.getters.items=[];delete store.getters.lastCompletedRequest;}
  const restored=createErpExperience({api,collectionStorage,getStores:()=>({people,people_link:links,categories}),getContext:()=>({company:company.id,principal:user.id||user.username,application:'MANAGER',session:user.api_key,active:true})});
  cleanup=restored.install();offline=true;
  for(const definition of definitions){
   const at=performance.now(),query={...definition.query,itemsPerPage:20,page:1};
   const rows=await definition.store.actions.getItems(query);
   await new Promise(resolve=>setTimeout(resolve,5));
   expect(rows.length).toBeGreaterThan(0);expect(definition.store.getters.items.length).toBe(rows.length);
   expect(restored.catalog.snapshot()[definition.store.getters.resourceEndpoint].mode).toBe('offline');
   process.stdout.write('LOCAL_OFFLINE_RESTORE '+JSON.stringify({route:definition.route,ms:Math.round(performance.now()-at),rows:rows.length})+'\n');
  }
  offline=false;
  process.stdout.write('LOCAL_HTTP_RESULTS '+JSON.stringify(requests.filter(r=>r.path!=='/token'))+'\n');
 }finally{if(tree)await act(async()=>tree.unmount());cleanup();memory.clear();global.fetch=nativeFetch;delete global.location;delete global.localStorage;}
},90000);
