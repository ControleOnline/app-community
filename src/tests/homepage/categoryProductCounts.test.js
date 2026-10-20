jest.mock('@controleonline/ui-products/src/react/utils/catalogCacheScope', () => ({getCatalogCacheScope: async () => null}));
jest.mock('@controleonline/ui-products/src/react/utils/catalogCacheStorage', () => ({readCatalogStorage: async () => null, writeCatalogStorage: async () => {}, clearCatalogStorage: async () => {}}));
jest.mock('@store', () => ({useStore: () => ({getters: {}})}));
import React from 'react';
import renderer,{act} from 'react-test-renderer';
import useCounts,{fetchCategoryProductCount} from '@controleonline/ui-products/src/react/pages/CategoriesPage/useCategoryProductCounts';
const mockFetch=jest.fn();
jest.mock('@controleonline/ui-common/src/api',()=>({api:{fetch:(...args)=>mockFetch(...args)}}));
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;mockFetch.mockReset();});
it('uses the same canonical sale filter and authoritative distinct total rather than summing descendants',async()=>{
 mockFetch.mockResolvedValue({'hydra:totalItems':9});expect(await fetchCategoryProductCount(276,3,'products')).toBe(9);
 const url=new URL(mockFetch.mock.calls[0][0],'http://local');expect(url.searchParams.get('productCategory.category')).toBe('/categories/276');
 expect(url.searchParams.get('company')).toBe('3');expect(url.searchParams.get('active')).toBe('1');expect(url.searchParams.getAll('type[]')).toEqual(['product','manufactured','custom','service','recipe']);expect(url.searchParams.get('itemsPerPage')).toBe('1');
 mockFetch.mockResolvedValue({});await expect(fetchCategoryProductCount(276,3,'products')).rejects.toThrow('unavailable');
});
it('limits background reads to two and discards pending work after leaving the screen',async()=>{
 const pending=[];mockFetch.mockImplementation((_url,options)=>new Promise(resolve=>pending.push({resolve,signal:options.signal})));
 let result,tree;function Probe(){result=useCounts({categories:[{id:276},{id:281},{id:282}],companyId:3,context:'products',enabled:true});return null;}
 await act(async()=>{tree=renderer.create(<Probe/>);});expect(mockFetch).toHaveBeenCalledTimes(2);expect(result.counts).toEqual({});
 await act(async()=>{pending[0].resolve({totalItems:45});});expect(mockFetch).toHaveBeenCalledTimes(3);expect(result.counts.__all_products__).toBe(45);
 act(()=>tree.unmount());expect(pending.every(p=>p.signal.aborted)).toBe(true);
 await act(async()=>{pending[1].resolve({totalItems:12});pending[2].resolve({totalItems:2});});expect(mockFetch).toHaveBeenCalledTimes(3);
});
it('does not issue additional requests outside the opt-in catalog',async()=>{
 function Probe(){useCounts({categories:[{id:1}],companyId:3,context:'products',enabled:false});return null;}
 let tree;await act(async()=>{tree=renderer.create(<Probe/>);});expect(mockFetch).not.toHaveBeenCalled();act(()=>tree.unmount());
});
