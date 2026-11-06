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
let mockThemeStatus;
let mockCompany={id:3};
const mockColors = previewPalette({}, 'light');
jest.mock('react-native', () => ({
  Platform: {OS: 'web'}, Image: 'Image', Pressable: 'Pressable', ScrollView: 'ScrollView', Text: 'Text', View: 'View', Modal: 'Modal',
  StyleSheet: {create: x => x, absoluteFill: {}}, useWindowDimensions: () => ({width: mockWidth}),
}));
jest.mock('react-native-safe-area-context', () => ({SafeAreaProvider: 'SafeAreaProvider', useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}), useSafeAreaFrame: () => ({width: mockWidth, height: 800})}));
jest.mock('@react-navigation/native', () => ({useIsFocused: () => mockFocused}));
jest.mock('@appType', () => ({app_type: 'MANAGER', get app_type_base(){return mockBaseAppType;}}));
jest.mock('../../components/manager-preview/ManagerBottomNavigation', () => 'RuntimeToolbar');
jest.mock('../../components/manager-preview/ManagerStartup',()=> 'ManagerStartup');
jest.mock('../../components/HomeIcon', () => 'Icon');
jest.mock('../../components/HomeAvatar', () => 'HomeAvatar');
jest.mock('../../components/manager-preview/ManagerCompanySelector', () => 'ManagerCompanySelector');
jest.mock('@controleonline/ui-common/src/react/components/AppTypeSwitcher', () => 'AppTypeSwitcher');
jest.mock('../../components/manager-preview/ManagerPreviewProvider', () => ({
  useManagerPreview: () => ({themeStatus:mockThemeStatus,bottomBar: mockBottomBar, avatarEnabled:true,colors: mockColors, mode: 'light', toggleMode: mockToggle, setGuideOpen: mockGuide}),
}));
let mockExtraMenus = [];
jest.mock('@store', () => ({useStore: name => ({getters: name === 'theme'
  ? {menus: [{id: 'settings', label: 'Configurações', menus: [{id: 'devices', label: 'Dispositivos', route: 'DevicesIndex', menuType: 'home', icon: 'monitor', routeParams: {source: 'manager'}}, ...mockExtraMenus]}]}
  : {currentCompany:mockCompany,user: {name: 'Usuário local'}}, actions: {logOut: mockLogout}})}));
const navigation = {navigate: mockGo, getState: () => ({routeNames: ['HomePage', 'DevicesIndex', 'ProfilePage']})};
const view = route => <ManagerShell navigation={navigation} route={{name: route || 'HomePage'}}><content /></ManagerShell>;
const TableThemeProbe=()=> <table-theme colors={React.useContext(DefaultTableThemeContext)}/>;
const labeled = (tree, label) => tree.root.findAllByType('Pressable').filter(x => x.props.accessibilityLabel === label);
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  global.window = {addEventListener: jest.fn(), removeEventListener: jest.fn()};
  mockExtraMenus = [];mockThemeStatus=undefined;mockCompany={id:3};
  mockBaseAppType = 'MANAGER'; mockBottomBar = undefined; mockWidth = 1440; mockFocused = true; mockGo.mockClear(); mockToggle.mockClear(); mockGuide.mockClear(); mockLogout.mockClear();
});
afterEach(() => {delete global.window;});

it('mobile gesture starts without an empty rail and keeps menu beside back in the header',()=>{
 mockWidth=390;let tree;
 act(()=>{tree=renderer.create(<ManagerShell navigation={{...navigation,canGoBack:()=>true}} route={{name:'DevicesIndex'}}><content/></ManagerShell>);});
 expect(tree.root.findAllByProps({testID:'manager-mobile-rail'})).toHaveLength(0);
 const button=tree.root.findByProps({testID:'manager-mobile-menu-toggle'});
 expect(button.parent.findAllByProps({testID:'manager-header-back'})).toHaveLength(1);
 act(()=>button.props.onPressIn());act(()=>button.props.onPress());
 expect(tree.root.findAllByProps({accessibilityViewIsModal:true})).toHaveLength(1);
 expect(tree.root.findByProps({accessibilityViewIsModal:true}).props.style[2].top).toBe(64);
 act(()=>button.props.onPressIn());act(()=>button.props.onLongPress());
 expect(tree.root.findAllByProps({accessibilityViewIsModal:true})).toHaveLength(0);
 act(()=>tree.unmount());
});
it('mobile gesture toggles icons on long press without opening the full drawer on release',()=>{
 mockWidth=390;let tree;act(()=>{tree=renderer.create(view());});
 const button=()=>tree.root.findByProps({testID:'manager-mobile-menu-toggle'});
 act(()=>button().props.onPressIn());act(()=>button().props.onLongPress());act(()=>button().props.onPress());
 const rail=tree.root.findByProps({testID:'manager-mobile-rail'});
 expect(rail.findAllByType('Text')).toHaveLength(0);
 expect(rail.findAllByType('Pressable').some(node=>node.props.accessibilityLabel==='Dispositivos')).toBe(true);
 expect(tree.root.findAllByProps({accessibilityViewIsModal:true})).toHaveLength(0);
 act(()=>button().props.onPressIn());act(()=>button().props.onLongPress());act(()=>button().props.onPress());
 expect(tree.root.findAllByProps({testID:'manager-mobile-rail'})).toHaveLength(0);
 act(()=>button().props.onPressIn());act(()=>button().props.onPress());
 expect(tree.root.findAllByProps({accessibilityViewIsModal:true})).toHaveLength(1);
 act(()=>tree.unmount());
});

it('holds the shell until its real theme is ready and keeps a retry on failure',()=>{
 mockThemeStatus='loading';let tree;act(()=>{tree=renderer.create(view());});
 expect(tree.root.findByProps({testID:'manager-shell-presentation'}).props.style[2]).toEqual({display:'none'});
 expect(tree.root.findByType('ManagerStartup').props.message).toContain('aparência');
 mockThemeStatus='error';act(()=>tree.update(view()));
 expect(tree.root.findByType('ManagerStartup').props.busy).toBe(false);
 expect(typeof tree.root.findByType('ManagerStartup').props.onRetry).toBe('function');
 mockThemeStatus='ready';act(()=>tree.update(view()));expect(tree.root.findByProps({testID:'manager-shell-presentation'}).props.style[2]).toBe(false);
 act(()=>tree.unmount());
});
it('keeps canonical company recovery available instead of painting placeholder cards',()=>{
 mockThemeStatus='ready';mockCompany={};let tree;act(()=>{tree=renderer.create(view());});
 const startup=tree.root.findByType('ManagerStartup');expect(startup.props.message).toContain('empresa');expect(startup.props.busy).toBe(false);expect(typeof startup.props.onRetry).toBe('function');
 expect(tree.root.findByProps({testID:'manager-shell-presentation'}).props.style[2]).toEqual({display:'none'});act(()=>tree.unmount());
});

it('preserves mounted module state while the theme refreshes',()=>{
 let mounted=0,unmounted=0;
 function Module(){React.useEffect(()=>{mounted++;return()=>unmounted++;},[]);return <module-state/>;}
 const screen=()=> <ManagerShell navigation={navigation} route={{name:'DevicesIndex'}}><Module/></ManagerShell>;
 mockThemeStatus='ready';let tree;act(()=>{tree=renderer.create(screen());});
 mockThemeStatus='loading';act(()=>tree.update(screen()));expect(mounted).toBe(1);expect(unmounted).toBe(0);
 mockThemeStatus='ready';act(()=>tree.update(screen()));expect(mounted).toBe(1);expect(unmounted).toBe(0);
 act(()=>tree.unmount());expect(unmounted).toBe(1);
});
