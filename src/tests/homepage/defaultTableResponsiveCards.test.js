const React=require('react'), renderer=require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT=true;
let mockWidth=390,mockStore;
jest.mock('@store',()=>({useStore:()=>mockStore}));
jest.mock('@controleonline/ui-common/src/react/utils/storeColumns',()=>({formatStoreColumnLabel:()=>''}));
jest.mock('react-native',()=>{
 const React=require('react');
 return {View:p=>React.createElement('View',p,p.children),Text:p=>React.createElement('Text',p,p.children),
 FlatList:function GuardedList(props){const first=React.useRef(props.numColumns);if(first.current!==props.numColumns)throw Error('numColumns changed without remount');return React.createElement('List',{columns:props.numColumns});},
 StyleSheet:{create:v=>v},Platform:{select:v=>v.web},useWindowDimensions:()=>({width:mockWidth,height:844})};
});
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultTableInput',()=>()=>null);
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultTableEmptyState',()=>()=>null);
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultTableRowActions',()=>({__esModule:true,default:()=>null,hasDefaultTableRowActionsComponent:()=>false}));
jest.mock('@controleonline/ui-default/src/react/components/table/useDefaultTableTheme',()=>()=>({palette:{}}));
const Cards=require('@controleonline/ui-default/src/react/components/table/DefaultTableCards').default;
beforeEach(()=>{mockWidth=390;mockStore={getters:{items:[],columns:[],configs:{cardListProps:{}}}};});
it('uses shared 1/2/3 columns at responsive widths',()=>{let tree;renderer.act(()=>{tree=renderer.create(React.createElement(Cards,{storeName:'people'}));});for(const [width,columns] of [[390,1],[800,2],[1280,3],[390,1]]){mockWidth=width;renderer.act(()=>tree.update(React.createElement(Cards,{storeName:'people'})));expect(tree.root.findByType('List').props.columns).toBe(columns);}renderer.act(()=>tree.unmount());});
it('preserves the two-column PDV override on a phone',()=>{mockStore.getters.configs.cardListProps={numColumns:2,key:'pdv'};let tree;renderer.act(()=>{tree=renderer.create(React.createElement(Cards,{storeName:'categories'}));});expect(tree.root.findByType('List').props.columns).toBe(2);renderer.act(()=>tree.unmount());});
it('remounts even when a caller keeps a constant custom key',()=>{mockStore.getters.configs.cardListProps={key:'same-key'};let tree;renderer.act(()=>{tree=renderer.create(React.createElement(Cards,{storeName:'people'}));});mockWidth=1000;renderer.act(()=>tree.update(React.createElement(Cards,{storeName:'people'})));expect(tree.root.findByType('List').props.columns).toBe(2);renderer.act(()=>tree.unmount());});
