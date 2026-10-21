import React from 'react';
import renderer,{act} from 'react-test-renderer';
import Service from '@controleonline/ui-common/src/react/components/ProductCatalogCacheService';
import eventBus from '@controleonline/ui-common/src/react/components/EventBus';

let mockStores,storage;
jest.mock('@store',()=>({useStore:name=>mockStores[name]}));
const previousStorage=globalThis.localStorage;
beforeEach(()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;
 storage=new Map([['session','preserved'],['theme','preserved'],['categories:products','old'],['categories-company:products','3'],['categories:supplies','old']]);
 globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
 const actions=()=>({setItems:jest.fn(),setMessage:jest.fn(),setMessages:jest.fn(),setReload:jest.fn()});
 mockStores={categories:{getters:{messages:[],message:{command:'clear-product-cache'}},actions:actions()},products:{getters:{},actions:actions()}};
});
afterEach(()=>{globalThis.localStorage=previousStorage;});

it('connects the existing device command to shared cache invalidation and list reload without clearing session or theme',()=>{
 const cleared=jest.fn();eventBus.once('product-catalog-cache:cleared',cleared);
 let tree;act(()=>{tree=renderer.create(<Service/>);});
 expect(cleared).toHaveBeenCalledTimes(1);
 expect(storage.has('categories:products')).toBe(false);expect(storage.has('categories:supplies')).toBe(false);
 expect(storage.get('session')).toBe('preserved');expect(storage.get('theme')).toBe('preserved');
 for(const name of ['categories','products']){
  expect(mockStores[name].actions.setItems).toHaveBeenCalledWith([]);
  expect(mockStores[name].actions.setReload).toHaveBeenCalledWith(true);
 }
 act(()=>tree.unmount());
});

it('does not invalidate the catalog for an unrelated device command',()=>{
 mockStores.categories.getters.message={command:'unrelated'};
 const cleared=jest.fn();eventBus.once('product-catalog-cache:cleared',cleared);
 let tree;act(()=>{tree=renderer.create(<Service/>);});
 expect(cleared).not.toHaveBeenCalled();expect(storage.get('categories:products')).toBe('old');
 expect(mockStores.products.actions.setItems).not.toHaveBeenCalled();
 eventBus.off('product-catalog-cache:cleared',cleared);act(()=>tree.unmount());
});
