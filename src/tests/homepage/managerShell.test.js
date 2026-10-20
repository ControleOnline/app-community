import React from 'react';
import renderer, {act} from 'react-test-renderer';
import ManagerShell from '../../components/manager-preview/ManagerShell';
import {previewPalette} from '../../components/manager-preview/model';
import {DefaultTableThemeContext} from '@controleonline/ui-default/src/react/components/table/useDefaultTableTheme';

jest.mock('@controleonline/ui-common/src/api',()=>({api:{fetch:jest.fn()}}));
let mockWidth = 1440;
let mockFocused = true;
const mockGo = jest.fn();
const mockToggle = jest.fn();
const mockGuide = jest.fn();
const mockLogout = jest.fn();
let mockBottomBar;
const mockColors = previewPalette({}, 'light');
jest.mock('react-native', () => ({
  Platform: {OS: 'web'}, Image: 'Image', Pressable: 'Pressable', ScrollView: 'ScrollView', Text: 'Text', View: 'View', Modal: 'Modal',
  StyleSheet: {create: x => x, absoluteFill: {}}, useWindowDimensions: () => ({width: mockWidth}),
}));
jest.mock('react-native-safe-area-context', () => ({SafeAreaProvider: 'SafeAreaProvider', useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}), useSafeAreaFrame: () => ({width: mockWidth, height: 800})}));
jest.mock('@react-navigation/native', () => ({useIsFocused: () => mockFocused}));
jest.mock('@appType', () => ({app_type: 'MANAGER', app_type_base: 'MANAGER'}));
jest.mock('../../components/manager-preview/ManagerBottomNavigation', () => 'RuntimeToolbar');
jest.mock('../../components/HomeIcon', () => 'Icon');
jest.mock('../../components/HomeAvatar', () => 'HomeAvatar');
jest.mock('@controleonline/ui-manager/src/react/components/CompanyFilter', () => 'CompanyFilter');
jest.mock('@controleonline/ui-common/src/react/components/AppTypeSwitcher', () => 'AppTypeSwitcher');
jest.mock('../../components/manager-preview/ManagerPreviewProvider', () => ({
  useManagerPreview: () => ({bottomBar: mockBottomBar, avatarEnabled:true,colors: mockColors, mode: 'light', toggleMode: mockToggle, setGuideOpen: mockGuide}),
}));
jest.mock('@store', () => ({useStore: name => ({getters: name === 'theme'
  ? {menus: [{id: 'settings', label: 'Configurações', menus: [{id: 'devices', label: 'Dispositivos', route: 'DevicesIndex', menuType: 'home', icon: 'monitor', routeParams: {source: 'manager'}}]}]}
  : {user: {name: 'Usuário local'}}, actions: {logOut: mockLogout}})}));
const navigation = {navigate: mockGo, getState: () => ({routeNames: ['HomePage', 'DevicesIndex', 'ProfilePage']})};
const view = route => <ManagerShell navigation={navigation} route={{name: route || 'HomePage'}}><content /></ManagerShell>;
const TableThemeProbe=()=> <table-theme colors={React.useContext(DefaultTableThemeContext)}/>;
const labeled = (tree, label) => tree.root.findAllByType('Pressable').filter(x => x.props.accessibilityLabel === label);
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  global.window = {addEventListener: jest.fn(), removeEventListener: jest.fn()};
  mockBottomBar = undefined; mockWidth = 1440; mockFocused = true; mockGo.mockClear(); mockToggle.mockClear(); mockGuide.mockClear(); mockLogout.mockClear();
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

it('navigates to the actual devices route with its parameters and exposes the theme control', () => {
  let tree; act(() => {tree = renderer.create(view());});
  act(() => {labeled(tree, 'Dispositivos')[0].props.onPress();});
  expect(mockGo).toHaveBeenCalledWith('DevicesIndex', {source: 'manager'});
  act(() => {labeled(tree, 'Ativar tema escuro')[0].props.onPress();});
  expect(mockToggle).toHaveBeenCalledTimes(1);
  expect(tree.root.findAllByType('CompanyFilter')).toHaveLength(1);
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

it('opens the same account options from either avatar without navigating prematurely', () => {
  let tree; act(() => {tree = renderer.create(view());});
  act(() => labeled(tree, 'Abrir opções do usuário')[0].props.onPress());
  expect(mockGo).not.toHaveBeenCalled();
  expect(labeled(tree, 'Meu perfil')).toHaveLength(1);
  act(() => labeled(tree, 'Meu perfil')[0].props.onPress());
  expect(mockGo).toHaveBeenLastCalledWith('ProfilePage', undefined);
  expect(labeled(tree, 'Meu perfil')).toHaveLength(0);
  act(() => labeled(tree, 'Abrir opções do usuário')[1].props.onPress());
  expect(labeled(tree, 'Ajuda do On Manager')).toHaveLength(1);
  act(() => tree.root.findByType('Modal').props.onRequestClose());
  expect(labeled(tree, 'Meu perfil')).toHaveLength(0);
  expect(tree.root.findAllByType('HomeAvatar')).toHaveLength(2);
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
  act(() => labeled(tree, 'Ir para o início do On Manager')[0].props.onPress());
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
  act(() => labeled(tree, 'Abrir opções do usuário')[0].props.onPress());
  act(() => labeled(tree, 'Ocultar nesta sessão')[0].props.onPress());
  expect(mockBottomBar.setSessionVisible).toHaveBeenCalledWith(false);
  mockBottomBar = {...mockBottomBar, visible: false};
  act(() => tree.update(view('DevicesIndex')));
  expect(tree.root.findAllByType('RuntimeToolbar')).toHaveLength(0);
  act(() => labeled(tree, 'Abrir opções do usuário')[0].props.onPress());
  expect(labeled(tree, 'Mostrar nesta sessão')).toHaveLength(1);
  await act(async () => labeled(tree, 'Manter oculta neste aparelho')[0].props.onPress());
  expect(mockBottomBar.setRememberedVisible).toHaveBeenCalledWith(false);
  mockBottomBar = {...mockBottomBar, visible: true}; mockFocused = false;
  act(() => tree.update(view('DevicesIndex')));
  expect(tree.root.findAllByType('RuntimeToolbar')).toHaveLength(0);
  act(() => tree.unmount());
});
