import {createSingleItemCatalogFetch, createSingleItemCatalogStore, describeCatalogSource} from '../../components/single-item/singleItemCatalogSource';

it('uses the server-resolved showcase and keeps product filters and prices', async () => {
  const payload={source:'showcase',showcase:{id:8,name:'Serviços'},member:[{id:10,price:25}],totalItems:1};
  const fetch=jest.fn().mockResolvedValue(payload), onSource=jest.fn();
  const read=createSingleItemCatalogFetch({fetch,companyId:3,onSource});
  expect(await read('products',{page:2,product:'lavagem',type:['service'],'productCategory.category':'/categories/7'})).toBe(payload);
  expect(fetch).toHaveBeenCalledWith('product-showcases/catalog',expect.objectContaining({params:expect.objectContaining({company:'/people/3',integration_key:'pos',product:'lavagem',page:2,type:['service']})}));
  expect(onSource).toHaveBeenCalledWith(expect.objectContaining({source:'showcase',showcase:payload.showcase}));
  expect(describeCatalogSource(payload)).toBe('Vitrine: Serviços');
});
it('accepts an authoritative empty showcase without falling back',async()=>{
  const payload={source:'showcase',showcase:{id:8,name:'Vazia'},member:[],totalItems:0};
  const fetch=jest.fn().mockResolvedValue(payload);
  expect(await createSingleItemCatalogFetch({fetch,companyId:3})('products',{})).toBe(payload);
  expect(fetch).toHaveBeenCalledTimes(1);
});
it('identifies the general catalog only when the server explicitly returns it',async()=>{
  const payload={source:'product',showcase:null,member:[],totalItems:0};
  const fetch=jest.fn().mockResolvedValue(payload);
  await createSingleItemCatalogFetch({fetch,companyId:3})('products',{});
  expect(describeCatalogSource(payload)).toBe('Catálogo geral');
  expect(describeCatalogSource(null)).toBe('Carregando origem do catálogo…');
});
it('propagates failures and rejects malformed sources instead of silently showing general products',async()=>{
  const fetch=jest.fn().mockRejectedValue(new Error('Sem conexão'));
  await expect(createSingleItemCatalogFetch({fetch,companyId:3})('products',{})).rejects.toThrow('Sem conexão');
  fetch.mockResolvedValue({member:[],source:'showcase',showcase:null});
  await expect(createSingleItemCatalogFetch({fetch,companyId:3})('products',{})).rejects.toThrow('catálogo');
});
it('scopes detail reads to the same catalog and refuses a missing product',async()=>{
  const fetch=jest.fn().mockResolvedValue({source:'showcase',showcase:{id:8},member:[{id:10}],totalItems:1});
  expect(await createSingleItemCatalogFetch({fetch,companyId:3})('products/10',{})).toEqual({id:10});
  expect(fetch.mock.calls[0][1].params.id).toBe('10');
  fetch.mockResolvedValue({source:'showcase',showcase:{id:8},member:[],totalItems:0});
  await expect(createSingleItemCatalogFetch({fetch,companyId:3})('products/10',{})).rejects.toThrow('indisponível');
});
it('keeps the catalog on the no-storage/native fallback, including appended pages',async()=>{
  const originalGetItems=jest.fn(),setItems=jest.fn(),setTotalItems=jest.fn();
  const store={getters:{items:[{id:1}]},actions:{getItems:originalGetItems,setItems,setTotalItems}};
  const fetch=jest.fn().mockResolvedValue({member:[{id:1},{id:2}],totalItems:2});
  const adapted=createSingleItemCatalogStore(store,fetch);
  expect(await adapted.actions.getItems({page:2,append:true})).toEqual([{id:1},{id:2}]);
  expect(fetch).toHaveBeenCalledWith('products',{page:2});
  expect(originalGetItems).not.toHaveBeenCalled();
  expect(setTotalItems).toHaveBeenCalledWith(2);
});
it('resolves Manager PDV catalogs without changing the application authorization headers',async()=>{
 const fetch=jest.fn().mockResolvedValue({source:'product',showcase:null,member:[]});
 await createSingleItemCatalogFetch({fetch,companyId:3,device:'web-10',deviceType:'PDV'})('products',{},
   {headers:{'DEVICE-TYPE':'MANAGER'}});
 expect(fetch).toHaveBeenCalledWith('product-showcases/catalog',expect.objectContaining({
   headers:{'DEVICE-TYPE':'MANAGER'},params:expect.objectContaining({device:'web-10',deviceType:'PDV',company:'/people/3'})}));
});
