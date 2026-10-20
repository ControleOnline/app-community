const React = require('react');
const renderer = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
let mockStore;
jest.mock('@store', () => ({useStore: () => mockStore}));
jest.mock('@controleonline/ui-common/src/react/utils/storeColumns', () => ({formatStoreColumnLabel: () => ''}));
jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: props => React.createElement('View', props, props.children),
    Text: props => React.createElement('Text', props, props.children),
    FlatList: props => React.createElement('List', {}, props.data.map((item, index) => props.renderItem({item, index}))),
    StyleSheet: {create: value => value},
    Platform: {select: value => value.web},
    useWindowDimensions: () => ({width:390,height:844}),
  };
});
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultTableInput', () => () => null);
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultTableEmptyState', () => () => null);
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultTableRowActions', () => ({__esModule: true, default: () => null, hasDefaultTableRowActionsComponent: () => false}));
jest.mock('@controleonline/ui-default/src/react/components/table/useDefaultTableTheme', () => () => ({palette: {}}));
const Cards = require('@controleonline/ui-default/src/react/components/table/DefaultTableCards').default;

const {groupCategoryCards}=require('../../components/manager-preview/categoryHierarchy');
it('groups the actual card list only, preserving canonical category store items',()=>{
 const child={id:281,name:'Águas',parent:'/categories/276'},parent={id:276,name:'Bebidas'},rows=[child,parent];
 mockStore={getters:{columns:[],items:rows,configs:{showRowActions:false,cardListProps:{numColumns:2,transformData:groupCategoryCards},renderCard:({item})=>React.createElement('Group',{node:item.__pdvCategoryNode})}}};
 let tree;renderer.act(()=>{tree=renderer.create(React.createElement(Cards,{storeName:'categories'}));});
 const groups=tree.root.findAllByType('Group');expect(groups).toHaveLength(1);
 expect(groups[0].props.node.category).toBe(parent);expect(groups[0].props.node.children[0].category).toBe(child);
 expect(mockStore.getters.items).toBe(rows);expect(rows).toHaveLength(2);
 renderer.act(()=>tree.unmount());
});
it('keeps the untransformed list for consumers without category grouping',()=>{
 mockStore={getters:{columns:[],items:[{id:1},{id:2}],configs:{renderCard:({item})=>React.createElement('Card',{id:item.id})}}};
 let tree;renderer.act(()=>{tree=renderer.create(React.createElement(Cards,{storeName:'people'}));});
 expect(tree.root.findAllByType('Card').map(card=>card.props.id)).toEqual([1,2]);renderer.act(()=>tree.unmount());
});
