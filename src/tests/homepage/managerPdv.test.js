import {ManagementPageTitleContext} from '../../components/manager-preview/ManagementPageTitleContext';
import React from 'react';
import renderer, {act} from 'react-test-renderer';
import ManagerPdvPage from '../../components/manager-preview/ManagerPdvPage';
import OperationalStoreContext from '../../store/OperationalStoreContext';
jest.mock('../../components/single-item/SingleItemOrdersPage',()=> 'SingleItemOrders');
jest.mock('../../components/single-item/SingleItemOperationInfo',()=> 'OperationInfo');
jest.mock('@controleonline/ui-orders/src/react/pages/checkout/AddProductScreen',()=> 'AddProducts');

jest.mock('@controleonline/ui-default/src/react/components/table/DefaultCompactDialog',()=>({children})=>children);
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultToolbarAction',()=>({action})=>require('react').createElement('Pressable',{accessibilityLabel:action.accessibilityLabel,onPress:action.onPress}));
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultModalButton',()=>({renderButton,children})=>{const React=require('react');const [open,setOpen]=React.useState(false);return <>{renderButton({open:()=>setOpen(true)})}{children({isOpen:open,close:()=>setOpen(false)})}</>;});
let mockEnabled = true, mockWidth = 1280, mockLinkedType = 'tab';
let mockAllowedMenus=[];
let mockMenus = [{items: [{name: 'LinkedOrderSettlementPage', params: {context: 'allowed'}}, {name: 'OrderHistoryPage', params: {orderType: 'sale'}}]}];
const mockExperience = {begin: jest.fn()};
jest.mock('react-native', () => ({Pressable: 'Pressable', View: 'View', Text: 'Text', useWindowDimensions: () => ({width: mockWidth})}));
jest.mock('@store', () => ({useStore: name => ({getters: name === 'theme' ? {menus: mockAllowedMenus,colors:{}} : name === 'device_config' ? {item: {configs: {}}} : {currentCompany: {id: 3, configs: {}}}})}));
jest.mock('../../components/manager-preview/model', () => ({get managerPreviewEnabled() {return mockEnabled;}, managerMenu: () => mockMenus}));
jest.mock('../../components/manager-preview/ManagerPreviewProvider', () => ({useManagerPreview: () => ({colors: {}, experience: mockExperience})}));
jest.mock('@controleonline/ui-orders/src/react/pages/PdvPage', () => 'ExistingPdv');
jest.mock('@controleonline/ui-common/src/react/config/deviceConfigBootstrap', () => ({POS_CHECK_ORDER_TYPE_NONE: 'none', resolvePosCheckOrderEntryTypeForShop: () => mockLinkedType}));

beforeEach(() => {global.IS_REACT_ACT_ENVIRONMENT = true; mockAllowedMenus=[]; mockEnabled = true; mockWidth = 1280; mockLinkedType = 'tab'; mockExperience.begin.mockClear();});
const navigation = () => ({navigate: jest.fn(), getState: () => ({routeNames: ['PdvPage', 'LinkedOrderSettlementPage', 'OrderHistoryPage']})});
const mount = props => {let tree; act(() => {tree = renderer.create(<ManagerPdvPage {...props} />);}); return tree;};

it('opens the configured Single Item on orders without duplicate legacy actions',()=>{
 mockAllowedMenus=[{menus:[{route:'OrderHistoryPage'},{route:'PdvPage'}]}];
 const nav={...navigation(),setOptions:jest.fn()};let tree;
 act(()=>{tree=renderer.create(<OperationalStoreContext.Provider value={{pdv:{singleItem:true}}}>
   <ManagerPdvPage navigation={nav} route={{name:'PdvPage'}}/>
 </OperationalStoreContext.Provider>);});
 expect(tree.root.findAllByType('SingleItemOrders')).toHaveLength(1);
 expect(tree.root.findAllByType('ExistingPdv')).toHaveLength(0);
 expect(tree.root.findAllByProps({accessibilityLabel:'Mais opções do PDV'})).toHaveLength(0);
 expect(nav.setOptions).toHaveBeenCalledWith({headerRight:undefined});
 act(()=>tree.update(<OperationalStoreContext.Provider value={{pdv:{singleItem:true}}}>
   <ManagerPdvPage navigation={nav} route={{name:'PdvPage',params:{orderId:70,pdvView:'catalog'}}}/>
 </OperationalStoreContext.Provider>));
 expect(tree.root.findByType('AddProducts').props.route.params).toMatchObject({orderId:70,singleItemMode:true,managerPdv:true,startNewOrder:false});
 act(()=>tree.unmount());
});

it('hosts the existing checkout surface without changing route params, mode or engine', () => {
  const nav = navigation(), route = {name: 'PdvPage', params: {orderId: '17', interactionMode: 'pdv', opaque: 'preserved'}};
  const tree = mount({navigation: nav, route});
  expect(tree.root.findByType('ExistingPdv').props).toMatchObject({navigation: nav, route});
  expect(nav.navigate).not.toHaveBeenCalled();
  expect(tree.root.findByProps({accessibilityLabel: 'Mesas e comandas'})).toBeTruthy();
  act(() => tree.unmount());
});

it('uses allowed settlement route params and canonical linked type; history stays in pdv context', () => {
  const nav = navigation(), tree = mount({navigation: nav, route: {name: 'PdvPage'}});
  act(() => tree.root.findByProps({accessibilityLabel: 'Mesas e comandas'}).props.onPress());
  expect(nav.navigate).toHaveBeenLastCalledWith('LinkedOrderSettlementPage', {context: 'allowed', orderType: 'tab'});
  expect(mockExperience.begin).toHaveBeenLastCalledWith('LinkedOrderSettlementPage', 'click');
  act(() => tree.root.findByProps({accessibilityLabel: 'Histórico de pedidos'}).props.onPress());
  expect(nav.navigate).toHaveBeenLastCalledWith('OrderHistoryPage', {orderType: 'sale', interactionMode: 'pdv', showBottomToolBar: true});
  act(() => tree.unmount());
});

it('does not expose unpermitted shortcuts or invent a linked type', () => {
  const previousMenus = mockMenus; mockMenus = []; mockLinkedType = 'none';
  const tree = mount({navigation: navigation(), route: {name: 'PdvPage'}});
  expect(tree.root.findAllByType('Pressable')).toHaveLength(0);
  act(() => tree.unmount()); mockMenus = previousMenus;
});

it('uses table configuration without inventing waiter mode, and leaves none to the module', () => {
  mockWidth = 360; mockLinkedType = 'table';
  const nav = navigation(), tree = mount({navigation: nav, route: {name: 'PdvPage'}});
  act(()=>tree.root.findByProps({accessibilityLabel:'Mais opções do PDV'}).props.onPress());
  const button = tree.root.findByProps({accessibilityLabel: 'Mesas e comandas'});
  expect(button.props.style.minHeight).toBe(44);
  act(() => button.props.onPress());
  expect(nav.navigate).toHaveBeenLastCalledWith('LinkedOrderSettlementPage', {context: 'allowed', orderType: 'table'});
  act(() => tree.unmount());
  mockLinkedType = 'none'; const fallback = mount({navigation: nav, route: {name: 'PdvPage'}});
  act(()=>fallback.root.findByProps({accessibilityLabel:'Mais opções do PDV'}).props.onPress());
  act(() => fallback.root.findByProps({accessibilityLabel: 'Mesas e comandas'}).props.onPress());
  expect(nav.navigate).toHaveBeenLastCalledWith('LinkedOrderSettlementPage', {context: 'allowed'});
  act(() => fallback.unmount());
});

it('keeps the original page unchanged outside the local preview', () => {
  mockEnabled = false; const nav = navigation(), route = {name: 'PdvPage'};
  const tree = mount({navigation: nav, route});
  expect(tree.root.findAllByType('Pressable')).toHaveLength(0);
  expect(tree.root.findByType('ExistingPdv').props.route).toBe(route);
  act(() => tree.unmount());
});

it('keeps mobile actions available when the shell owns the heading',()=>{
 mockWidth=393;const route={name:'PdvPage',params:{orderId:'17'}};let tree;
 act(()=>{tree=renderer.create(<ManagementPageTitleContext.Provider value><ManagerPdvPage navigation={navigation()} route={route}/></ManagementPageTitleContext.Provider>);});
 expect(tree.root.findAllByProps({accessibilityRole:'header'})).toHaveLength(0);
 expect(tree.root.findByProps({accessibilityLabel:'Mais opções do PDV'})).toBeTruthy();
 expect(tree.root.findByType('ExistingPdv').props.route).toBe(route);
 act(()=>tree.unmount());
});

it('omits only the PDV heading under the shared title while retaining its actions',()=>{
 const nav=navigation(),route={name:'PdvPage'};let tree;
 act(()=>{tree=renderer.create(<ManagementPageTitleContext.Provider value><ManagerPdvPage navigation={nav} route={route}/></ManagementPageTitleContext.Provider>);});
 expect(tree.root.findAllByProps({accessibilityRole:'header'})).toHaveLength(0);
 expect(tree.root.findByType('ExistingPdv').props.route).toBe(route);
 act(()=>tree.root.findByProps({accessibilityLabel:'Mesas e comandas'}).props.onPress());
 expect(nav.navigate).toHaveBeenCalledWith('LinkedOrderSettlementPage',{context:'allowed',orderType:'tab'});
 act(()=>tree.unmount());
});
