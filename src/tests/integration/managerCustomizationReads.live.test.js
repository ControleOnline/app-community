// Read-only API smoke. Persistence and cache scope are disposable test adapters.
import {api} from '@controleonline/ui-common/src/api';
import {createCachedCatalogActions} from '@controleonline/ui-products/src/react/utils/cachedCatalogActions';
jest.mock('react-native',()=>({Platform:{OS:'web',select:v=>v.web??v.default}}));
jest.mock('@env',()=>({env:{API_ENTRYPOINT:'http://localhost:8000',DOMAIN:'http://localhost:8081'}}));
jest.mock('@controleonline/ui-common/src/api/localDB',()=>({__esModule:true,default:class {}}));
const live=process.env.CO_LIVE_READS==='1'?test:test.skip;
live('reopens real customization product and group options with no additional API reads',async()=>{
 const nativeFetch=global.fetch,storage=global.localStorage,memory=new Map(),records=new Map();let reads=0;
 global.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v))};
 global.fetch=async(input,options={})=>{
  const url=new URL(input),method=String(options.method||'GET').toUpperCase();
  if(url.hostname!=='localhost'||url.port!=='8000'||(method!=='GET'&&!(method==='POST'&&url.pathname==='/token')))throw Error('Read-only local boundary');
  return nativeFetch(input,options);
 };
 try{
  const session=await api.fetch('token',{method:'POST',body:{username:process.env.CO_SMOKE_USER,password:process.env.CO_SMOKE_PASSWORD}});
  expect(Boolean(session.api_key||session.token)).toBe(true);memory.set('session',JSON.stringify(session));
  const catalog=await api.fetch('products',{params:{company:3,active:1,type:'custom',itemsPerPage:1,'productCategory.category':'/categories/296'}});
  const product=(catalog.member||catalog['hydra:member']||[])[0];expect(product?.id).toBeTruthy();
  const stores={};const deps={publishStore:false,getScope:async()=> 'read-only-test:company3:session:device',read:async id=>records.get(id),write:async record=>records.set(record.id,record),fetch:async(endpoint,params,options)=>{reads++;return api.fetch(endpoint,{params,...options});}};
  const storeFor=endpoint=>stores[endpoint]||(stores[endpoint]={getters:{resourceEndpoint:endpoint},actions:{getItems:()=>{throw Error('Unexpected unscoped fallback');},setItem:()=>{},setIsLoading:()=>{},setIsLoadingList:()=>{}}});
  const open=async()=>{
   const products=createCachedCatalogActions(storeFor('products'),3,'products',deps),groups=createCachedCatalogActions(storeFor('product_groups'),3,'products',deps),options=createCachedCatalogActions(storeFor('product_group_products'),3,'products',deps);
   const detail=await products.get(product.id);expect(detail.id).toBe(product.id);
   const groupRows=await groups.getItems({product:product.id,'product.productType':'component'});expect(groupRows.length).toBeGreaterThan(0);
   const rows=await options.getItems({productGroup:`/product_groups/${groupRows[0].id}`,productType:'component'});expect(rows.length).toBeGreaterThan(0);
   return {groups:groupRows.length,options:rows.length};
  };
  const started=Date.now(),first=await open(),cold=Date.now()-started,firstReads=reads;
  const warmStarted=Date.now(),second=await open(),warm=Date.now()-warmStarted;
  expect(second).toEqual(first);expect(reads).toBe(firstReads);
  console.log(JSON.stringify({firstReads,additionalReadsOnReopen:reads-firstReads,groups:first.groups,options:first.options,coldReadMs:cold,cachedReadMs:warm,persistence:'memory-test-adapter',businessWrites:0}));
 }finally{global.fetch=nativeFetch;global.localStorage=storage;}
},90000);
