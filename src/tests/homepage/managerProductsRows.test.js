const React = require('react');
const renderer = require('react-test-renderer');
const {describe, expect, it, beforeEach} = require('@jest/globals');

global.IS_REACT_ACT_ENVIRONMENT = true;

let mockStores = {};

jest.mock('@store', () => ({
  useStore: jest.fn(name => mockStores[name] || {actions: {}, getters: {}}),
}));

jest.mock('@controleonline/ui-common/src/react/utils/storeColumns', () => ({
  formatStoreColumnLabel: ({fallbackLabel, fieldName}) => fallbackLabel || fieldName,
}));

jest.mock('react-native-vector-icons/Feather', () => {
  const React = require('react');
  return props => React.createElement('icon', props);
});

jest.mock('react-native', () => {
  const React = require('react');
  const createComponent = name => props =>
    React.createElement(name, props, props.children);
  const FlatList = props => {
    const items = Array.isArray(props.data) ? props.data : [];
    return React.createElement(
      'FlatList',
      props,
      items.map((item, index) =>
        props.renderItem ? props.renderItem({item, index}) : null,
      ),
    );
  };
  return {
    FlatList,
    ScrollView: createComponent('ScrollView'),
    Text: createComponent('Text'),
    TouchableOpacity: createComponent('TouchableOpacity'),
    View: createComponent('View'),
    StyleSheet: {create: value => value},
    Platform: {select: value => value.web || value.default},
  };
});

jest.mock('@controleonline/ui-default/src/react/components/filters/DefaultColumnFilter', () => () => null);
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultTable.styles', () => ({
  cell: {},
  actionsCell: {},
  pinnedActionsCell: {},
  stickyActionsCell: {},
  stickyHeaderCell: {},
  stickyIdentityCell: {},
  rowActionsGroup: {},
  headerRow: {},
  headerText: {},
  sortableHeader: {},
  row: {},
  scroll: {},
  content: {},
  tableList: {},
  tableListContent: {},
  filterRow: {},
  filterCell: {},
  iconButton: {},
  horizontalScrollContent: {},
}));
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultTableEmptyState', () => () => null);
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultTableInput', () => {
  const React = require('react');
  return ({column, row}) =>
    React.createElement('cell', {
      field: column?.key || column?.name,
      value: row?.[column?.key || column?.name],
    });
});
jest.mock('@controleonline/ui-default/src/react/components/table/useDefaultTableTheme', () => () => ({
  palette: {background: '#fff', text: '#111', textSecondary: '#666'},
  resolvedAccentColor: '#eee',
  tableBorderColors: {rowBorderColor: '#ddd', headerBorderColor: '#ccc'},
  themeTokens: {},
}));

const DefaultTableRows = require('@controleonline/ui-default/src/react/components/table/DefaultTableRows').default;


beforeEach(()=>{mockStores={};global.t={t:(_s,_k,key)=>key};});
it('renders only the scoped product columns while preserving the full store and original quantity action',()=>{
 const full=[{name:'product',label:'Produto'},{name:'price',label:'Preço'},{name:'technical',label:'Técnico'}];
 const row={id:1147,product:'Água mineral',price:5,technical:'metadata'};
 mockStores.products={getters:{columns:full,items:[row],visibleColumns:{},configs:{
  presentationColumns:[{...full[0],editable:false},{...full[1],editable:false}],
  showRowActions:true,rowActionsComponent:({row})=>React.createElement('quantity',{product:row}),
 }}};
 let tree;renderer.act(()=>{tree=renderer.create(React.createElement(DefaultTableRows,{storeName:'products'}));});
 expect(tree.root.findAllByType('cell').map(n=>n.props.field)).toEqual(['product','price']);
 expect(tree.root.findByType('quantity').props.product).toBe(row);
 expect(mockStores.products.getters.columns).toBe(full);expect(full).toHaveLength(3);
 renderer.act(()=>tree.unmount());
});
it('keeps existing columns in unrelated tables without a presentation override',()=>{
 mockStores.orders={getters:{columns:[{name:'name'}],items:[{id:7,name:'Original'}],configs:{}}};
 let tree;renderer.act(()=>{tree=renderer.create(React.createElement(DefaultTableRows,{storeName:'orders'}));});
 expect(tree.root.findAllByType('cell').map(n=>n.props.field)).toEqual(['name']);renderer.act(()=>tree.unmount());
});
