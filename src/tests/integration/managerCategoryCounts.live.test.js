// Opt-in read-only test. Login and session exist only in process memory.
import {api} from '@controleonline/ui-common/src/api';
import {fetchCategoryProductCount} from '@controleonline/ui-products/src/react/pages/CategoriesPage/useCategoryProductCounts';
import {buildProductCatalogRequestParams} from '@controleonline/ui-products/src/react/utils/productCatalogRequestParams';
jest.mock('react-native',()=>({Platform:{OS:'web',select:values=>values.web??values.default}}));
jest.mock('@env',()=>({env:{API_ENTRYPOINT:'http://localhost:8000',DOMAIN:'http://localhost:8081'}}));
const live=process.env.CO_LIVE_READS==='1'?test:test.skip;
live('counts category descendants through the real canonical product filter without duplicate products',async()=>{
 const originalFetch=global.fetch,oldStorage=global.localStorage;
 const memory=new Map();global.localStorage={getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,String(value))};
 global.fetch=async(input,options={})=>{
  const url=new URL(input),method=String(options.method||'GET').toUpperCase();
  if(url.hostname!=='localhost'||url.port!=='8000'||(method!=='GET'&&!(method==='POST'&&url.pathname==='/token')))throw Error('Read-only local boundary');
  return originalFetch(input,options);
 };
 try{
  const session=await api.fetch('token',{method:'POST',body:{username:process.env.CO_SMOKE_USER,password:process.env.CO_SMOKE_PASSWORD}});
  expect(Boolean(session.api_key||session.token)).toBe(true);memory.set('session',JSON.stringify(session));
  const catalog=await api.fetch('categories?company=3&context=products&itemsPerPage=100');
  const categories=catalog.member||catalog['hydra:member']||[];expect(categories.length).toBeGreaterThan(0);
  const totals={};let next=0;
  const worker=async()=>{while(next<categories.length){const category=categories[next++];totals[category.id]=await fetchCategoryProductCount(category.id,3,'products');}};
  await Promise.all([worker(),worker()]);
  expect(Object.keys(totals)).toHaveLength(categories.length);expect(Object.values(totals).every(Number.isInteger)).toBe(true);
  const parent=await fetchCategoryProductCount(276,3,'products'),child=await fetchCategoryProductCount(281,3,'products');
  const idsFor=async categoryId=>{
   const params=buildProductCatalogRequestParams({categoryId,companyId:3,context:'products'}),ids=new Set();let page=1,total;
   do{const query=new URLSearchParams();Object.entries({...params,itemsPerPage:100,page}).forEach(([key,v])=>(Array.isArray(v)?v:[v]).forEach(item=>query.append(Array.isArray(v)?key+'[]':key,String(item))));
    const data=await api.fetch('products?'+query),rows=data.member||data['hydra:member']||[];
    total=data.totalItems??data['hydra:totalItems'];expect(rows.length).toBeGreaterThan(0);
    rows.forEach(row=>ids.add(row.id));page++;if(page>100)throw Error('Unexpected pagination');
   }while(ids.size<total);return ids;
  };
  const parentIds=await idsFor(276),childIds=await idsFor(281);
  expect(parentIds.size).toBe(parent);expect(childIds.size).toBe(child);expect([...childIds].every(id=>parentIds.has(id))).toBe(true);
  console.log(JSON.stringify({categoriesCounted:Object.keys(totals).length,parentDistinctTotal:parent,childDistinctTotal:child,childContainedInParent:true,businessWrites:0}));
 }finally{global.fetch=originalFetch;global.localStorage=oldStorage;}
},120000);
