import React from 'react';
import renderer, {act} from 'react-test-renderer';
import ManagerShell from '../../components/manager-preview/ManagerShell';
import {previewPalette} from '../../components/manager-preview/model';
import {DefaultTableThemeContext} from '@controleonline/ui-default/src/react/components/table/useDefaultTableTheme';

jest.mock('@controleonline/ui-common/src/api',()=>({api:{fetch:jest.fn()}}));
let mockWidth = 1440;
let mockBaseAppType = 'MANAGER';
let mockFocused = true;
const mockGo = jest.fn();
const mockToggle = jest.fn();
const mockGuide = jest.fn();
const mockLogout = jest.fn();
let mockBottomBar;
let mockSidebar;
let mockModuleAccent;
const mockColors = previewPalette({}, 'light');
jest.mock('react-native', () => ({
  processColor:require('../theme-system/nativeMock.cjs').processColor, Platform: {OS: 'web'}, Image: 'Image', Pressable: 'Pressable', ScrollView: 'ScrollView', Text: 'Text', View: 'View', Modal: 'Modal',
  StyleSheet: {create: x => x, absoluteFill: {}}, useWindowDimensions: () => ({width: mockWidth}),
}));
jest.mock('react-native-safe-area-context', () => ({SafeAreaProvider: 'SafeAreaProvider', useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}), useSafeAreaFrame: () => ({width: mockWidth, height: 800})}));
jest.mock('@react-navigation/native', () => ({useIsFocused: () => mockFocused}));
jest.mock('@appType', () => ({app_type: 'MANAGER', get app_type_base(){return mockBaseAppType;}}));
jest.mock('../../components/manager-preview/ManagerBottomNavigation', () => 'RuntimeToolbar');
jest.mock('../../components/HomeIcon', () => 'Icon');
jest.mock('../../components/HomeAvatar', () => 'HomeAvatar');
jest.mock('../../components/manager-preview/ManagerCompanySelector', () => 'ManagerCompanySelector');
jest.mock('@controleonline/ui-common/src/react/components/AppTypeSwitcher', () => 'AppTypeSwitcher');
jest.mock('../../components/manager-preview/ManagerPreviewProvider', () => ({
  useManagerPreview: () => ({bottomBar: mockBottomBar, sidebar: mockSidebar, moduleAccent: mockModuleAccent, moduleAccentPalette: {primary: '#147568'}, avatarEnabled:true,colors: mockColors, mode: 'light', toggleMode: mockToggle, setGuideOpen: mockGuide}),
}));
let mockExtraMenus = [];
jest.mock('@store', () => ({useStore: name => ({getters: name === 'theme'
  ? {menus: [{id: 'settings', label: 'Configurações', color: '$primary', menus: [{id: 'devices', label: 'Dispositivos', route: 'DevicesIndex', menuType: 'home', icon: 'monitor', routeParams: {source: 'manager'}}, ...mockExtraMenus]}]}
  : {user: {name: 'Usuário local'}}, actions: {logOut: mockLogout}})}));
const navigation = {navigate: mockGo, getState: () => ({routeNames: ['HomePage', 'DevicesIndex', 'ProfilePage']})};
const view = (route, params) => <ManagerShell navigation={navigation} route={{name: route || 'HomePage', params}}><content /></ManagerShell>;
const TableThemeProbe=()=> <table-theme colors={React.useContext(DefaultTableThemeContext)}/>;
const labeled = (tree, label) => tree.root.findAllByType('Pressable').filter(x => x.props.accessibilityLabel === label);
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  global.window = {addEventListener: jest.fn(), removeEventListener: jest.fn()};
  mockExtraMenus = [];
  mockBaseAppType = 'MANAGER'; mockBottomBar = undefined; mockSidebar = undefined; mockModuleAccent = undefined; mockWidth = 1440; mockFocused = true; mockGo.mockClear(); mockToggle.mockClear(); mockGuide.mockClear(); mockLogout.mockClear();
});
afterEach(() => {delete global.window;});

it('provides the Manager identity to a shared table on any module route',()=>{
  let tree;
  act(()=>{tree=renderer.create(<ManagerShell navigation={navigation} route={{name:'FinancialHubPage'}}><TableThemeProbe/></ManagerShell>);});
  expect(tree.root.findByType('table-theme').props.colors).toMatchObject({
    compact:true,background:mockColors.cardBackground,primary:mockColors.buttonBackground,
    listItemOddRow:mockColors.tableRowOddBackground,
  });
  act(()=>tree.unmount());
});

it('keeps company selection in the sidebar and theme switching in the account menu', () => {
  let tree; act(() => {tree = renderer.create(view());});
  act(() => {labeled(tree, 'Dispositivos')[0].props.onPress();});
  expect(mockGo).toHaveBeenCalledWith('DevicesIndex', {source: 'manager'});
  expect(labeled(tree, 'Ativar tema escuro')).toHaveLength(0);
  act(() => labeled(tree, 'Abrir opções do usuário')[0].props.onPress());
  act(() => labeled(tree, 'Usar tema escuro')[0].props.onPress());
  expect(mockToggle).toHaveBeenCalledTimes(1);
  expect(tree.root.findAllByType('ManagerCompanySelector')).toHaveLength(1);
  expect(tree.root.findByProps({testID: 'manager-sidebar'}).findAllByType('ManagerCompanySelector')).toHaveLength(1);
  expect(tree.root.findByProps({testID: 'manager-topbar'}).findAllByType('ManagerCompanySelector')).toHaveLength(0);
  act(() => tree.unmount());
});

it('retains named accessible controls in the compact sidebar', () => {
  mockWidth = 900;
  let tree; act(() => {tree = renderer.create(view('DevicesIndex'));});
  expect(labeled(tree, 'Dispositivos')[0].props.title).toBe('Dispositivos');
  expect(labeled(tree, 'Dispositivos')[0].props.accessibilityState.selected).toBe(true);
  act(() => tree.unmount());
});

it('opens and closes the mobile drawer and closes it after navigation', () => {
  mockWidth = 390;
  let tree; act(() => {tree = renderer.create(view());});
  expect(labeled(tree, 'Dispositivos')).toHaveLength(0);
  act(() => labeled(tree, 'Abrir menu')[0].props.onPress());
  expect(labeled(tree, 'Dispositivos')).toHaveLength(1);
  const drawer=tree.root.findByProps({accessibilityViewIsModal:true});
  expect(drawer.props.style[1]).toMatchObject({zIndex:100,elevation:24});
  expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  const escape = window.addEventListener.mock.calls[0][1];
  act(() => escape({key: 'Escape'}));
  expect(labeled(tree, 'Dispositivos')).toHaveLength(0);
  act(() => labeled(tree, 'Abrir menu')[0].props.onPress());
  act(() => labeled(tree, 'Dispositivos')[0].props.onPress());
  expect(labeled(tree, 'Dispositivos')).toHaveLength(0);
  act(() => tree.unmount());
});

it('keeps the mobile menu gestures without a visible instruction', () => {
  mockWidth = 390;
  let tree;
  act(() => {tree = renderer.create(view());});
  try {
    const menu = tree.root.findByProps({testID:'manager-mobile-menu-toggle'});
    expect(tree.root.findAllByType('Text').some(node => node.props.children ===
      'Segure ☰ para mostrar ou ocultar os atalhos.')).toBe(false);
    act(() => {
      menu.props.onPressIn();
      menu.props.onLongPress();
      menu.props.onPress();
    });
    expect(tree.root.findAllByProps({testID:'manager-mobile-rail'})).toHaveLength(1);
    expect(tree.root.findAllByProps({accessibilityViewIsModal:true})).toHaveLength(0);
  } finally {
    act(() => tree.unmount());
  }
});

it('keeps a single left-aligned themed account control in the sidebar without navigating prematurely', () => {
  let tree; act(() => {tree = renderer.create(view());});
  expect(labeled(tree, 'Abrir opções do usuário')).toHaveLength(1);
  expect(tree.root.findByProps({testID:'manager-topbar'}).findAllByType('HomeAvatar')).toHaveLength(0);
  const control=labeled(tree, 'Abrir opções do usuário')[0];
  expect(control.props.style[0]).toMatchObject({alignItems:'center',justifyContent:'flex-start'});
  expect(control.props.style[1]).toMatchObject({backgroundColor:mockColors.selectBackground,borderColor:mockColors.selectBorder});
  act(() => labeled(tree, 'Abrir opções do usuário')[0].props.onPress());
  expect(mockGo).not.toHaveBeenCalled();
  expect(labeled(tree, 'Meu perfil')).toHaveLength(1);
  act(() => labeled(tree, 'Meu perfil')[0].props.onPress());
  expect(mockGo).toHaveBeenLastCalledWith('ProfilePage', undefined);
  expect(labeled(tree, 'Meu perfil')).toHaveLength(0);
  act(() => labeled(tree, 'Abrir opções do usuário')[0].props.onPress());
  expect(labeled(tree, 'Ajuda do On Manager')).toHaveLength(1);
  act(() => tree.root.findByType('Modal').props.onRequestClose());
  expect(labeled(tree, 'Meu perfil')).toHaveLength(0);
  expect(tree.root.findAllByType('HomeAvatar')).toHaveLength(1);
  act(() => tree.unmount());
});

it('reuses guide, appearance and logout actions from the account menu', () => {
  let tree; act(() => {tree = renderer.create(view());});
  const open = () => act(() => labeled(tree, 'Abrir opções do usuário')[0].props.onPress());
  open(); act(() => labeled(tree, 'Ajuda do On Manager')[0].props.onPress());
  expect(mockGuide).toHaveBeenCalledWith(true);
  open(); act(() => labeled(tree, 'Usar tema escuro')[0].props.onPress());
  expect(mockToggle).toHaveBeenCalledTimes(1);
  expect(mockLogout).not.toHaveBeenCalled();
  open(); act(() => labeled(tree, 'Sair da conta')[0].props.onPress());
  expect(mockLogout).toHaveBeenCalledTimes(1);
  act(() => tree.unmount());
});

it('offers a direct branded home control on mobile and names the drawer destination Início', () => {
  mockWidth = 360;
  let tree; act(() => {tree = renderer.create(view('DevicesIndex'));});
  act(() => labeled(tree, 'Ir para o início')[0].props.onPress());
  expect(mockGo).toHaveBeenLastCalledWith('HomePage', undefined);
  act(() => labeled(tree, 'Abrir menu')[0].props.onPress());
  expect(labeled(tree, 'Início')).toHaveLength(1);
  act(() => labeled(tree, 'Início')[0].props.onPress());
  expect(mockGo).toHaveBeenLastCalledWith('HomePage', undefined);
  expect(labeled(tree, 'Dispositivos')).toHaveLength(0);
  act(() => tree.unmount());
});

it('mounts one inline toolbar only for the focused mobile screen and exposes both visibility choices', async () => {
  mockWidth = 390;
  mockBottomBar = {ready: true, visible: true, rememberedVisible: true,
    setSessionVisible: jest.fn(), setRememberedVisible: jest.fn(async () => true)};
  let tree; act(() => {tree = renderer.create(view('DevicesIndex'));});
  expect(tree.root.findAllByType('RuntimeToolbar')).toHaveLength(1);
  act(() => labeled(tree, 'Abrir menu')[0].props.onPress());
  act(() => labeled(tree, 'Abrir opções do usuário')[0].props.onPress());
  act(() => labeled(tree, 'Ocultar nesta sessão')[0].props.onPress());
  expect(mockBottomBar.setSessionVisible).toHaveBeenCalledWith(false);
  mockBottomBar = {...mockBottomBar, visible: false};
  act(() => tree.update(view('DevicesIndex')));
  expect(tree.root.findAllByType('RuntimeToolbar')).toHaveLength(0);
  act(() => labeled(tree, 'Abrir menu')[0].props.onPress());
  act(() => labeled(tree, 'Abrir opções do usuário')[0].props.onPress());
  expect(labeled(tree, 'Mostrar nesta sessão')).toHaveLength(1);
  await act(async () => labeled(tree, 'Manter oculta neste aparelho')[0].props.onPress());
  expect(mockBottomBar.setRememberedVisible).toHaveBeenCalledWith(false);
  mockBottomBar = {...mockBottomBar, visible: true}; mockFocused = false;
  act(() => tree.update(view('DevicesIndex')));
  expect(tree.root.findAllByType('RuntimeToolbar')).toHaveLength(0);
  act(() => tree.unmount());
});


it('keeps a fresh internal catalog reset signal when reselecting the focused PDV', () => {
  mockExtraMenus = [{id: 'pdv', label: 'PDV', route: 'PdvPage', menuType: 'home', routeParams: {orderId: '70'}}];
  const pdvNavigation = {...navigation, getState: () => ({routeNames: ['HomePage', 'PdvPage']})};
  let tree;
  act(() => {tree = renderer.create(<ManagerShell navigation={pdvNavigation} route={{name: 'PdvPage'}} />);});
  act(() => labeled(tree, 'PDV')[0].props.onPress());
  act(() => labeled(tree, 'PDV')[0].props.onPress());
  const [first, second] = mockGo.mock.calls;
  expect(first).toEqual(['PdvPage', {orderId: '70', catalogResetKey: expect.stringMatching(/^menu:/)}]);
  expect(second[1].orderId).toBe('70');
  expect(second[1].catalogResetKey).not.toBe(first[1].catalogResetKey);
  act(() => tree.unmount());
});

it('keeps selection inside the mobile drawer and home in the header', () => {
  mockWidth = 400;
  let tree; act(() => {tree = renderer.create(view());});
  expect(tree.root.findAllByType('ManagerCompanySelector')).toHaveLength(0);
  expect(labeled(tree, 'Ir para o início')).toHaveLength(1);
  act(() => labeled(tree, 'Abrir menu')[0].props.onPress());
  expect(tree.root.findByProps({testID:'manager-sidebar'}).findAllByType('ManagerCompanySelector')).toHaveLength(1);
  act(() => tree.unmount());
});

it.each([1440,900])('keeps desktop navigation beside the menu at width %s without a second breadcrumb row', width=>{
 mockWidth=width;let tree;act(()=>{tree=renderer.create(view('DevicesIndex'));});
 const topbar=tree.root.findByProps({testID:'manager-topbar'});
 const breadcrumb=tree.root.findByProps({testID:'manager-breadcrumb'});
 expect(topbar.findAllByProps({testID:'manager-breadcrumb'})).toHaveLength(1);
 expect(breadcrumb.parent).toBe(labeled(tree,'Alternar menu compacto')[0].parent);
 act(()=>tree.unmount());
});
it('keeps the mobile header free of desktop breadcrumbs',()=>{
 mockWidth=400;let tree;act(()=>{tree=renderer.create(view());});
 expect(tree.root.findAllByProps({testID:'manager-breadcrumb'})).toHaveLength(0);
 act(()=>tree.unmount());
});

it.each([320,390,760])('keeps the ADMIN selector in the same mobile topbar at width %i',width=>{
 mockWidth=width;mockBaseAppType='ADMIN';let tree;act(()=>{tree=renderer.create(view());});
 const selectors=tree.root.findAllByType('AppTypeSwitcher');expect(selectors).toHaveLength(1);
 expect(tree.root.findByProps({testID:'manager-topbar'}).findAllByType('AppTypeSwitcher')).toHaveLength(1);
 expect(selectors[0].props.compact).toBe(true);act(()=>tree.unmount());
});

it.each([1440,393])('keeps account recovery accessible with the sidebar hidden at %ipx', width => {
  mockWidth=width;
  const setVisible=jest.fn();
  mockSidebar={ready:true,visible:false,setRememberedVisible:setVisible};
  let tree;act(()=>{tree=renderer.create(view());});
  expect(tree.root.findAllByProps({testID:'manager-sidebar'})).toHaveLength(0);
  expect(labeled(tree,'Abrir menu')).toHaveLength(0);
  act(()=>labeled(tree,'Abrir opções do usuário')[0].props.onPress());
  act(()=>labeled(tree,'Mostrar menu lateral')[0].props.onPress());
  expect(setVisible).toHaveBeenCalledWith(true);
  act(()=>tree.unmount());
});

it.each([
  ['MANAGER', 36, 0, 50],
  ['ADMIN', 36, 104, 118],
])('anchors the mobile company to the header center in %s', (appType, left, right, inset) => {
  mockWidth = 393;
  mockBaseAppType = appType;
  let tree; act(() => {tree = renderer.create(view());});
  const slot = tree.root.findByProps({testID:'manager-header-company'});
  expect(slot.props.style[1]).toMatchObject({position:'absolute'});
  expect(slot.props.style[2].left).toBe(slot.props.style[2].right);
  const sides = tree.root.findByProps({testID:'manager-topbar'}).children.filter(child => child.props.onLayout);
  act(() => {
    sides[0].props.onLayout({nativeEvent:{layout:{width:left}}});
    sides[1].props.onLayout({nativeEvent:{layout:{width:right}}});
  });
  expect(slot.props.style[2]).toEqual({left:inset,right:inset});
  act(() => tree.unmount());
});

it('uses category colors on sidebar items before and after navigation', () => {
  mockModuleAccent = {value:true};
  let tree; act(() => {tree = renderer.create(view());});
  const devices = labeled(tree, 'Dispositivos')[0];
  const inactive = labeled(tree, 'Início')[0];
  expect(devices.props.style({})[1].backgroundColor).toBe('rgba(20, 117, 104, 0.14)');
  expect(devices.props.style({hovered:true})[1].backgroundColor).toBe('rgba(20, 117, 104, 0.24)');
  expect(devices.findByType('Icon').props.color).toBe('#147568');
  expect(inactive.findByType('Icon').props.color).toBe(mockColors.navigationActiveIcon);
  act(() => tree.update(view('DevicesIndex', {source:'manager'})));
  expect(devices.props.style({})[1]).toMatchObject({
    backgroundColor:'rgba(20, 117, 104, 0.24)',borderLeftColor:'#147568',
  });
  mockModuleAccent = {value:false};
  act(() => tree.update(view('DevicesIndex', {source:'manager'})));
  expect(devices.findByType('Icon').props.color).toBe(mockColors.navigationActiveIcon);
  expect(devices.props.style({})[1].backgroundColor).toBe(mockColors.navigationActiveBackground);
  act(() => tree.unmount());
});
