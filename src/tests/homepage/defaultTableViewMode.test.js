import React from 'react';
import renderer,{act} from 'react-test-renderer';
import Table from '@controleonline/ui-default/src/react/components/table/DefaultTable';

let mockWidth=390,mockStore;
const mockPersist=jest.fn();
jest.mock('react-native',()=>({useWindowDimensions:()=>({width:mockWidth})}));
jest.mock('@react-navigation/native',()=>({NavigationRouteContext:require('react').createContext({name:'PdvPage'}),useIsFocused:()=>true}));
jest.mock('@store',()=>({useStore:name=>name==='people'?{getters:{currentCompany:{id:3}}}:mockStore}));
jest.mock('@controleonline/ui-common/src/react/components/MessageService',()=>({useMessage:()=>({})}));
jest.mock('@controleonline/ui-default/src/react/components/inputs/defaultInputUtils',()=>({normalizeText:v=>String(v??'').trim()}));
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultTable.utils',()=>({DEFAULT_COMPACT_BREAKPOINT:768,isObject:v=>v!==null&&typeof v==='object',stableSerialize:v=>JSON.stringify(v)}));
jest.mock('@controleonline/ui-default/src/react/components/table/useDefaultTableTheme',()=>()=>({tableBorderColors:{},themeColors:{}}));
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultTableView',()=> 'TableView');
jest.mock('@controleonline/ui-default/src/react/components/table/useDefaultTableCreateForm',()=>()=>({}));
jest.mock('@controleonline/ui-default/src/react/components/table/useDefaultTableSorting',()=>({useDefaultTableSortState:()=>({}),useDefaultTableSortedData:({resolvedData})=>resolvedData}));
jest.mock('@controleonline/ui-default/src/react/components/table/useDefaultTablePagination',()=>({useDefaultTablePagination:({data})=>({resolvedData:data,currentPage:1,pageSizeNumber:10,paginateData:items=>items})}));
jest.mock('@controleonline/ui-default/src/react/utils/tableVisibleColumnsPreferences',()=>({
 resolveDefaultTablePreferenceScope:()=>({companyKey:'3',storeKey:'categories',routeKey:'PdvPage'}),
 resolveStoredTableViewModePreference:()=> 'table',persistTableViewModePreference:(...args)=>mockPersist(...args),
 resolveStoredTableFiltersPreference:()=>null,resolveStoredVisibleColumnsPreference:()=>null,
}));

beforeEach(()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;mockWidth=390;mockPersist.mockClear();
 mockStore={getters:{configs:{viewMode:'table'},columns:[],items:[]},actions:{}};
 mockStore.actions.setConfigs=value=>{mockStore.getters.configs=value;};
});

it('keeps a controlled catalog in cards across resize and restores the saved table preference for normal lists',()=>{
 let tree;
 act(()=>{tree=renderer.create(<Table storeName="categories" data={[]} viewMode="cards"/>);});
 expect(mockStore.getters.configs).toMatchObject({effectiveViewMode:'cards',viewMode:'table'});
 mockWidth=1200;
 act(()=>tree.update(<Table storeName="categories" data={[]} viewMode="cards"/>));
 expect(mockStore.getters.configs.effectiveViewMode).toBe('cards');
 act(()=>tree.unmount());
 act(()=>{tree=renderer.create(<Table storeName="categories" data={[]}/>);});
 expect(mockStore.getters.configs.effectiveViewMode).toBe('table');
 expect(mockPersist).not.toHaveBeenCalled();
 act(()=>tree.unmount());
});

it('keeps the saved mode available when the caller releases control on the same table',()=>{
 let tree;
 act(()=>{tree=renderer.create(<Table storeName="categories" data={[]} viewMode="cards"/>);});
 act(()=>tree.update(<Table storeName="categories" data={[]}/>));
 expect(mockStore.getters.configs.effectiveViewMode).toBe('table');
 expect(mockPersist).not.toHaveBeenCalled();
 act(()=>tree.unmount());
});
