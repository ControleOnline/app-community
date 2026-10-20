/* global jest, beforeEach, it, expect */
import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {useDefaultTablePagination} from '@controleonline/ui-default/src/react/components/table/useDefaultTablePagination';
import DefaultTable from '@controleonline/ui-default/src/react/components/table/DefaultTable';

let mockStore;
jest.mock('react-native', () => ({useWindowDimensions: () => ({width: 1200}), Platform: {select: value => value.web}, StyleSheet: {create: value => value}}));
jest.mock('@react-navigation/native', () => ({NavigationRouteContext: require('react').createContext({name: 'Review'}), useIsFocused: () => true}));
jest.mock('@store', () => ({useStore: name => name === 'people' ? {getters: {currentCompany: {id: 7}}} : mockStore}));
jest.mock('@controleonline/ui-common/src/react/components/MessageService', () => ({useMessage: () => ({})}));
jest.mock('@controleonline/ui-default/src/react/components/table/useDefaultTableTheme', () => () => ({tableBorderColors: {}, themeColors: {}}));
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultTableView', () => 'TableView');
jest.mock('@controleonline/ui-default/src/react/components/table/useDefaultTableCreateForm', () => () => ({}));
const rows = Array.from({length: 1073}, (_, index) => ({id: index + 1}));
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  mockStore = {getters: {configs: {}, columns: [], items: [], totalItems: 0}, actions: {}};
  mockStore.actions.setConfigs = value => {mockStore.getters.configs = value;};
  mockStore.actions.setTotalItems = value => {mockStore.getters.totalItems = value;};
});
it('mounts only the requested controlled page and reaches the final records without a remote read', async () => {
  let result, tree;
  const getItems = jest.fn();
  function Probe({data = rows}) {
    result = useDefaultTablePagination({autoMode: false, data, columnsForTable: [], filters: {},
      requestParams: {}, pageSize: 20, paginationMode: 'pages', resolvedTotalItems: data.length,
      resolvedActions: {getItems}, store: mockStore, storeName: 'translate'});
    const visible = result.paginateData ? result.paginateData(data) : data;
    return React.createElement('rows', null, visible.map(item => React.createElement('row', {key: item.id, id: item.id})));
  }
  try {
    await act(async () => {tree = renderer.create(React.createElement(Probe));});
    expect(tree.root.findAllByType('row')).toHaveLength(20);
    await act(async () => result.goToPage(2));
    expect(tree.root.findAllByType('row').map(row => row.props.id)).toEqual(Array.from({length: 20}, (_, index) => index + 21));
    await act(async () => result.goToPage(54));
    expect(tree.root.findAllByType('row')).toHaveLength(13);
    expect(tree.root.findAllByType('row').at(-1).props.id).toBe(1073);
    await act(async () => result.goToPage(55));
    expect(result.currentPage).toBe(54);
    await act(async () => tree.update(React.createElement(Probe, {data: [{id: 'filtered'}]})));
    expect(result.currentPage).toBe(1);
    expect(tree.root.findByType('row').props.id).toBe('filtered');
    expect(getItems).not.toHaveBeenCalled();
  } finally {if (tree) act(() => tree.unmount());}
});
it('publishes the controlled total and paginates after sorting the complete dataset', async () => {
  let tree;
  try {
    await act(async () => {tree = renderer.create(React.createElement(DefaultTable, {
      storeName: 'translate', data: rows, totalItems: 1073, pageSize: 20, paginationMode: 'pages',
      columns: [{name: 'id', sortable: true}], sort: {field: 'id', direction: 'desc'},
    }));});
    expect(mockStore.getters.totalItems).toBe(1073);
    expect(mockStore.getters.configs.sortedData).toHaveLength(20);
    expect(mockStore.getters.configs.sortedData[0].id).toBe(1073);
    await act(async () => mockStore.getters.configs.onPageChange(2));
    expect(mockStore.getters.configs.sortedData[0].id).toBe(1053);
    expect(mockStore.getters.items).toHaveLength(1073);
  } finally {if (tree) act(() => tree.unmount());}
});
it('keeps the published pager callback usable after asynchronous controlled data and store renders', async () => {
 let tree;
 const props={storeName:'translate',pageSize:20,paginationMode:'pages',columns:[{name:'id'}]};
 try {
  await act(async()=>{tree=renderer.create(<DefaultTable {...props} data={[]} totalItems={0}/>);});
  await act(async()=>{tree.update(<DefaultTable {...props} data={rows.map(row=>({...row}))} totalItems={rows.length}/>);});
  await act(async()=>{tree.update(<DefaultTable {...props} data={rows.map(row=>({...row}))} totalItems={rows.length}/>);});
  await act(async()=>mockStore.getters.configs.onPageChange(2));
  expect(mockStore.getters.configs.currentPage).toBe(2);
  expect(mockStore.getters.configs.sortedData[0].id).toBe(21);
 } finally {act(()=>tree?.unmount());}
});
