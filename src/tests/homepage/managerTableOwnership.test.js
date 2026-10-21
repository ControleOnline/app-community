import React from 'react';
import renderer,{act} from 'react-test-renderer';
import {useDefaultTablePagination} from '@controleonline/ui-default/src/react/components/table/useDefaultTablePagination';
jest.mock('react-native',()=>({StyleSheet:{create:s=>s},Platform:{select:v=>v.web}}));
jest.mock('@store',()=>({getAllStores:()=>({})}));
jest.mock('@controleonline/ui-common/src/react/utils/storeColumns',()=>({formatStoreColumnValue:()=>''}));
global.IS_REACT_ACT_ENVIRONMENT=true;
it.each([1,2])('restores the correct collection and page %s after another retained list used its store',async page=>{
 const state={items:[],resourceEndpoint:'people'};
 const actions={getItems:jest.fn(query=>{const key=JSON.stringify(query);state.activeRequestKey=key;return Promise.resolve().then(()=>{state.items=[{id:query.scope,page:query.page}];state.lastCompletedRequest={requestKey:key,status:'success'};state.activeRequestKey='';return state.items;});})};
 const store={getters:state,actions};let result,tree;
 const base={autoMode:true,columnsForTable:[],filters:{},requestParams:{scope:'clients'},pageSize:20,paginationMode:'pages',resolvedTotalItems:45,store,storeName:'people',resolvedActions:actions};
 function Harness({focused}){result=useDefaultTablePagination({...base,isFocused:focused});return null;}
 try{
  await act(async()=>{tree=renderer.create(<Harness focused/>);});expect(result.resolvedData).toEqual([{id:'clients',page:1}]);
  if(page===2)await act(async()=>{await result.goToPage(2);});
  await act(async()=>{tree.update(<Harness focused={false}/>);});
  await actions.getItems({scope:'companies',itemsPerPage:20,page:1});
  await act(async()=>{tree.update(<Harness focused/>);});
  expect(actions.getItems).toHaveBeenCalledTimes(page===2?4:3);expect(result.resolvedData).toEqual([{id:'clients',page}]);
 }finally{act(()=>tree?.unmount());}
});
it('retries a previously failed read once on a new visit, without an automatic retry loop',async()=>{
 const state={items:[],resourceEndpoint:'people'};let result,tree;
 const actions={getItems:jest.fn().mockRejectedValueOnce(new Error('temporarily offline')).mockImplementation(async()=>{state.items=[{id:'restored'}];return state.items;})};
 const options={autoMode:true,columnsForTable:[],filters:{},requestParams:{},pageSize:20,store:{getters:state,actions},storeName:'people',resolvedActions:actions,showError:jest.fn()};
 function Harness({focused}){result=useDefaultTablePagination({...options,isFocused:focused});return null;}
 try{
  await act(async()=>{tree=renderer.create(<Harness focused/>);});expect(actions.getItems).toHaveBeenCalledTimes(1);expect(result.resolvedIsLoading).toBe(false);
  await act(async()=>tree.update(<Harness focused={false}/>));
  await act(async()=>tree.update(<Harness focused/>));
  expect(actions.getItems).toHaveBeenCalledTimes(2);expect(result.resolvedData).toEqual([{id:'restored'}]);
 }finally{act(()=>tree?.unmount());}
});
it('rechecks a cached retained screen on focus while keeping its current page',async()=>{
 const state={items:[],resourceEndpoint:'people'};let result,tree;
 const actions={catalogCache:true,getItems:jest.fn(async query=>{state.items=[{id:1,page:query.page}];return state.items;})};
 const options={autoMode:true,columnsForTable:[],filters:{},requestParams:{},pageSize:20,paginationMode:'pages',resolvedTotalItems:50,store:{getters:state,actions},storeName:'people',resolvedActions:actions};
 function Harness({focused}){result=useDefaultTablePagination({...options,isFocused:focused});return null;}
 try{
  await act(async()=>{tree=renderer.create(<Harness focused/>);});await act(async()=>result.goToPage(2));
  await act(async()=>tree.update(<Harness focused={false}/>));await act(async()=>tree.update(<Harness focused/>));
  expect(actions.getItems).toHaveBeenCalledTimes(3);expect(actions.getItems.mock.calls.at(-1)[0].page).toBe(2);
 }finally{act(()=>tree?.unmount());}
});
