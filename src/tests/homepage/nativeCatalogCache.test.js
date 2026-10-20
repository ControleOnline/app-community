import {webcrypto} from 'node:crypto';
import {getCatalogCacheScope} from '@controleonline/ui-products/src/react/utils/catalogCacheScope';
import {createCachedCatalogActions} from '@controleonline/ui-products/src/react/utils/cachedCatalogActions';
import {invalidateProductCatalogCache} from '@controleonline/ui-common/src/react/utils/productCatalogCacheRevision';

let mockPlatform='android',mockToken='',mockDevice,mockAppType='MANAGER',mockLocal,mockAuth;
let sequence=0;
jest.mock('react-native',()=>({Platform:{get OS(){return mockPlatform;}}}));
jest.mock('@appType',()=>({get app_type(){return mockAppType;}}));
jest.mock('@store',()=>({getAllStores:()=>({auth:{getters:mockAuth}})}));
jest.mock('@controleonline/ui-common/src/api',()=>({api:{getToken:async()=>mockToken}}));
jest.mock('@controleonline/ui-common/src/api/localDB',()=>({__esModule:true,default:class {
 async get(){throw Error('IndexedDB unavailable');}
 async saveItem(){throw Error('IndexedDB unavailable');}
}}));
const originalCrypto=Object.getOwnPropertyDescriptor(globalThis,'crypto');
const originalEncoder=globalThis.TextEncoder;
const originalStorage=globalThis.localStorage;
beforeEach(()=>{
 mockPlatform='android';mockToken=`fixture-session-${++sequence}`;mockDevice={id:12,type:'APP'};
 Object.defineProperty(globalThis,'crypto',{configurable:true,value:undefined});
 globalThis.TextEncoder=undefined;
 mockAppType='MANAGER';mockLocal=new Map();mockAuth={isLogged:true,user:{id:7,roles:['ROLE_USER']}};
 globalThis.localStorage={getItem:key=>key==='device'?JSON.stringify(mockDevice):mockLocal.get(key)||null,setItem:(key,value)=>mockLocal.set(key,value)};
});
afterEach(()=>{
 if(originalCrypto)Object.defineProperty(globalThis,'crypto',originalCrypto);else delete globalThis.crypto;
 globalThis.TextEncoder=originalEncoder;globalThis.localStorage=originalStorage;
});
const store=()=>({getters:{resourceEndpoint:'products',items:[]},actions:{
 getItems:jest.fn(async()=>[{id:9}]),setItems:jest.fn(),setTotalItems:jest.fn(),setIsLoading:jest.fn(),
}});

it('reuses the waiter catalog in native memory without browser crypto, TextEncoder or IndexedDB',async()=>{
 const state=store(),fetch=jest.fn(async()=>({member:[{id:9}],totalItems:1}));
 const params={company:3,'productCategory.category':'/categories/296',page:1,itemsPerPage:20};
 const actions=createCachedCatalogActions(state,3,'products',{fetch});
 expect(await actions.getItems(params)).toEqual(expect.arrayContaining([{id:9}]));
 expect(await actions.getItems(params)).toEqual(expect.arrayContaining([{id:9}]));
 expect(fetch).toHaveBeenCalledTimes(1);
 expect(state.actions.getItems).not.toHaveBeenCalled();
 expect(state.actions.setItems).toHaveBeenLastCalledWith([{id:9}]);
});

it('keeps a one-way session fingerprint and isolates company, context, device and session',async()=>{
 const initial=await getCatalogCacheScope(3,'products');
 expect(initial).not.toBeNull();expect(initial).not.toContain(mockToken);
 expect(await getCatalogCacheScope(3,'products')).toBe(initial);
 expect(await getCatalogCacheScope(4,'products')).not.toBe(initial);
 expect(await getCatalogCacheScope(3,'supplies')).not.toBe(initial);
 mockAppType='POS';expect(await getCatalogCacheScope(3,'products')).not.toBe(initial);mockAppType='MANAGER';
 mockAuth.user.roles=['ROLE_MANAGER'];expect(await getCatalogCacheScope(3,'products')).not.toBe(initial);mockAuth.user.roles=['ROLE_USER'];
 mockAuth.user.id=8;expect(await getCatalogCacheScope(3,'products')).not.toBe(initial);mockAuth.user.id=7;
 mockDevice={id:13,type:'APP'};expect(await getCatalogCacheScope(3,'products')).not.toBe(initial);
 mockDevice={id:12,type:'APP'};mockToken+='-new';expect(await getCatalogCacheScope(3,'products')).not.toBe(initial);
 mockToken='';expect(await getCatalogCacheScope(3,'products')).toBeNull();
 mockToken='fixture-present';mockAuth.isLogged=false;expect(await getCatalogCacheScope(3,'products')).toBeNull();
});

it('does not publish a response from the previous native session',async()=>{
 let finish;
 const state=store(),fetch=jest.fn(()=>new Promise(resolve=>{finish=resolve;}));
 const actions=createCachedCatalogActions(state,3,'products',{fetch});
 const request=actions.getItems({company:3,page:1});
 for(let attempt=0;attempt<30&&!finish;attempt++)await Promise.resolve();
 expect(finish).toBeDefined();mockToken+='-changed';finish({member:[{id:9}],totalItems:1});
 await expect(request).rejects.toThrow('O contexto do PDV mudou.');
 expect(state.actions.setItems).not.toHaveBeenCalled();
});

it('preserves the web fallback when Web Crypto is unavailable',async()=>{
 mockPlatform='web';expect(await getCatalogCacheScope(3,'products')).toBeNull();
 const state=store(),fetch=jest.fn();
 await createCachedCatalogActions(state,3,'products',{fetch}).getItems({company:3});
 expect(state.actions.getItems).toHaveBeenCalledTimes(1);expect(fetch).not.toHaveBeenCalled();
});

it('uses the same SHA-256 scope on native and web for the same session and device',async()=>{
 mockToken+='-ç-🔐';
 const native=await getCatalogCacheScope(3,'products');mockPlatform='web';
 Object.defineProperty(globalThis,'crypto',{configurable:true,value:webcrypto});globalThis.TextEncoder=originalEncoder;
 expect(native).not.toBeNull();expect(await getCatalogCacheScope(3,'products')).toBe(native);
});

it('honors the existing clear-product-cache invalidation instead of restoring stale memory',async()=>{
 const state=store(),fetch=jest.fn(async()=>({member:[{id:9}],totalItems:1}));
 const actions=createCachedCatalogActions(state,3,'products',{fetch});
 await actions.getItems({company:3,page:1});
 const previous=await getCatalogCacheScope(3,'products');
 invalidateProductCatalogCache();
 expect(await getCatalogCacheScope(3,'products')).not.toBe(previous);
 await actions.getItems({company:3,page:1});
 expect(fetch).toHaveBeenCalledTimes(2);
});
