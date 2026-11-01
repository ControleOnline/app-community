import React from 'react';
import renderer,{act} from 'react-test-renderer';
import useCatalog from '../../components/single-item/useSingleItemCatalog';
const mockFetch=jest.fn(),mockCreate=jest.fn(()=>({getItems:jest.fn()}));
jest.mock('@controleonline/ui-common/src/api',()=>({api:{fetch:(...args)=>mockFetch(...args)}}));
jest.mock('@controleonline/ui-products/src/react/utils/cachedCatalogActions',()=>({createCachedCatalogActions:(...args)=>mockCreate(...args)}));
let tree,result;
const store={getters:{resourceEndpoint:'products'},actions:{}};
function Probe(props){result=useCatalog({enabled:true,store,companyId:3,deviceConfig:{id:5,configs:{}},context:'products',...props});return null;}
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;mockFetch.mockReset();mockCreate.mockClear();});
afterEach(()=>{if(tree)act(()=>tree.unmount());tree=null;});
it('resolves origin before exposing the table and separates caches for resolved showcases',async()=>{
  mockFetch.mockResolvedValue({source:'showcase',showcase:{id:8,name:'Serviços'},member:[]});
  await act(async()=>{tree=renderer.create(<Probe/>);});
  expect(result.ready).toBe(true);expect(result.sourceLabel).toBe('Vitrine: Serviços');
  expect(mockCreate.mock.calls.at(-1)[2]).toContain(':showcase:8');
  mockFetch.mockResolvedValue({source:'product',showcase:null,member:[]});
  await act(async()=>{tree.update(<Probe deviceConfig={{id:5,configs:{'pos-product-showcase-id':9}}}/>);});
  expect(result.sourceLabel).toBe('Catálogo geral');
  expect(mockCreate.mock.calls.at(-1)[2]).toContain(':product:');
});
it('allows retry after failure without substituting a general catalog',async()=>{
  mockFetch.mockRejectedValue(new Error('offline'));
  await act(async()=>{tree=renderer.create(<Probe/>);});
  expect(result.ready).toBe(false);expect(result.failed).toBe(true);
  mockFetch.mockResolvedValue({source:'product',showcase:null,member:[]});
  await act(async()=>result.retry());
  expect(result.ready).toBe(true);expect(result.sourceLabel).toBe('Catálogo geral');
});
it('leaves other modes on their existing catalog path',async()=>{
  await act(async()=>{tree=renderer.create(<Probe enabled={false}/>);});
  expect(result.actions).toBeNull();expect(mockFetch).not.toHaveBeenCalled();expect(mockCreate).not.toHaveBeenCalled();
});
