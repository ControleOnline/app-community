import {createCachedCatalogActions} from '@controleonline/ui-products/src/react/utils/cachedCatalogActions';
jest.mock('@controleonline/ui-common/src/api/localDB',()=>({__esModule:true,default:class {}}));
jest.mock('@controleonline/ui-common/src/api',()=>({api:{}}));
jest.mock('@controleonline/ui-products/src/react/utils/catalogCacheScope',()=>({getCatalogCacheScope:async()=>null}));
const storeFor=endpoint=>({getters:{resourceEndpoint:endpoint,items:[{id:'catalog-kept'}]},actions:{setItems:jest.fn(),setTotalItems:jest.fn(),setIsLoading:jest.fn(),setItem:jest.fn(),getItems:jest.fn(async()=>[])}});
it('reuses product, root group, options and second-level reads after reopening without publishing into catalog stores',async()=>{
 const records=new Map(),calls=[];
 const deps={publishStore:false,getScope:async()=> 'session:company3:device12',read:async key=>records.get(key),write:async record=>records.set(record.id,record),fetch:jest.fn(async(endpoint,query)=>{calls.push([endpoint,query]);return endpoint==='products/134'?{id:134,product:'Combo'}:{member:[{id:query.product||query.productGroup||1}],totalItems:1};})};
 const productStore=storeFor('products'),groupStore=storeFor('product_groups'),optionStore=storeFor('product_group_products');
 const open=async()=>{
  const products=createCachedCatalogActions(productStore,3,'products',deps),groups=createCachedCatalogActions(groupStore,3,'products',deps),options=createCachedCatalogActions(optionStore,3,'products',deps);
  await products.get(134);await groups.getItems({product:'134','product.productType':'component'});await options.getItems({productGroup:'/product_groups/10',productType:'component'});
  await groups.getItems({product:'102','product.productType':'component'});return options.getItems({productGroup:'/product_groups/20',productType:'component'});
 };
 const first=await open(),second=await open();expect(first).toEqual(second);expect(calls).toHaveLength(5);
 expect(groupStore.actions.setItems).not.toHaveBeenCalled();expect(optionStore.actions.setItems).not.toHaveBeenCalled();expect(productStore.getters.items).toEqual([{id:'catalog-kept'}]);
});
it('keeps sessions isolated and falls back to canonical actions when the device/session scope is unavailable',async()=>{
 const records=new Map(),store=storeFor('product_groups');let scope='company3:sessionA:device12';
 const fetch=jest.fn(async()=>({member:[{id:10}],totalItems:1}));
 const actions=createCachedCatalogActions(store,3,'products',{publishStore:false,getScope:async()=>scope,read:async key=>records.get(key),write:async record=>records.set(record.id,record),fetch});
 await actions.getItems({product:134});scope='company3:sessionB:device12';await actions.getItems({product:134});expect(fetch).toHaveBeenCalledTimes(2);
 scope=null;await actions.getItems({product:134});expect(store.actions.getItems).toHaveBeenCalledWith({product:134});
});
