import {readCatalogStorage,writeCatalogStorage,clearCatalogStorage} from '@controleonline/ui-products/src/react/utils/catalogCacheStorage.native';

let mockDisk;
jest.mock('@react-native-async-storage/async-storage',()=>({
 getItem:async key=>mockDisk.get(key)||null,
 multiSet:async pairs=>{for(const [key,value] of pairs)mockDisk.set(key,value);},
 getAllKeys:async()=>[...mockDisk.keys()],
 multiRemove:async keys=>{for(const key of keys)mockDisk.delete(key);},
}));
beforeEach(()=>{mockDisk=new Map();});

it('restores the existing catalog record after the native storage module is recreated',async()=>{
 const record={id:'scope:company3:products',pages:{1:{items:[{id:9}],updatedAt:Date.now()}},total:1};
 await writeCatalogStorage(record);
 let reopened;
 jest.isolateModules(()=>{reopened=require('@controleonline/ui-products/src/react/utils/catalogCacheStorage.native');});
 expect(await reopened.readCatalogStorage(record.id)).toEqual(record);
});

it('serializes concurrent catalog writes without losing the storage index',async()=>{
 await Promise.all([writeCatalogStorage({id:'category-A'}),writeCatalogStorage({id:'category-B'})]);
 expect(await readCatalogStorage('category-A')).toEqual({id:'category-A'});
 expect(await readCatalogStorage('category-B')).toEqual({id:'category-B'});
 await clearCatalogStorage();expect(mockDisk.size).toBe(0);
});

it('bounds retained catalog records and clears only the catalog namespace',async()=>{
 mockDisk.set('session','unrelated-fixture-session');mockDisk.set('theme','unrelated-theme');
 for(let id=0;id<101;id++)await writeCatalogStorage({id:String(id)});
 expect(await readCatalogStorage('0')).toBeNull();expect(await readCatalogStorage('100')).toEqual({id:'100'});
 await clearCatalogStorage();
 expect([...mockDisk.keys()].sort()).toEqual(['session','theme']);
});
