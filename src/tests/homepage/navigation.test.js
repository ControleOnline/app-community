import React from 'react';
import renderer, {act} from 'react-test-renderer';
import Navigation from '@controleonline/ui-common/src/react/components/BottomNavigationBar';
import softenStyles from '@controleonline/ui-common/src/react/components/BottomNavigationBar.soft.styles';

const mockColors = {cardBackground: '#ffffff', cardIconBackground: '#7777ff',
  textPrimary: '#203047', textSecondary: '#637287', navigationText: '#000000'};
jest.mock('react-native', () => ({Platform: {OS: 'web'}, StyleSheet: {create: value => value},
  View: 'View', Text: 'Text', Pressable: 'Pressable'}));
jest.mock('react-native-vector-icons/Feather', () => 'Icon');
jest.mock('../../components/HomeIcon', () => 'Icon');
jest.mock('@controleonline/ui-common/src/react/components/DefaultProvider', () => ({
  useTheme: () => ({runtimeFooter: {appVersion: '1.10.56', device: {id: 7},
    colors: {footerText: '#000000', statusConnected: '#00ff00'}}}),
}));
jest.mock('@controleonline/ui-common/src/react/components/RuntimeInfoFooter', () => 'Footer');

beforeEach(() => {global.IS_REACT_ACT_ENVIRONMENT = true;});
const renderNav = appearance => {
  const navigation = {navigate: jest.fn()};
  let tree;
  act(() => {tree = renderer.create(<Navigation appearance={appearance} colors={mockColors}
    activeRouteName="HomePage" navigation={navigation} items={[
      {route: 'HomePage', icon: 'home', label: 'Home'},
      {route: 'OrderHistoryPage', icon: 'box', label: 'Pedidos', routeParams: {orderTypeFilter: 'purchase'}},
      {route: 'ProfilePage', icon: 'user', label: 'Perfil', disabled: true},
    ]} />);});
  return {tree, navigation};
};

it('leaves default styles untouched when the home appearance is absent', () => {
  const legacy = {dock: {borderTopLeftRadius: 24}};
  expect(softenStyles(legacy, mockColors)).toBe(legacy);
  const {tree} = renderNav();
  expect(tree.root.findByProps({testID: 'bottom-navigation'}).props.style.borderTopLeftRadius).toBe(24);
  expect(tree.root.findByType('Footer').props.colors.footerText).toBe('#000000');
  act(() => tree.unmount());
});

it('uses flat separators and soft selection while preserving navigation and restricted items', () => {
  const {tree, navigation} = renderNav('soft');
  const dock = tree.root.findByProps({testID: 'bottom-navigation'}).props.style[1];
  expect(dock).toMatchObject({borderTopWidth: 1, borderWidth: 0, borderTopLeftRadius: 0, boxShadow: 'none'});
  const buttons = tree.root.findAllByType('Pressable');
  expect(buttons[0].props.style({pressed: false})[1].backgroundColor).not.toBe('#ffffff');
  expect(buttons[2].props.disabled).toBe(true);
  act(() => buttons[1].props.onPress());
  expect(navigation.navigate).toHaveBeenCalledWith('OrderHistoryPage', {orderTypeFilter: 'purchase'});
  const footer = tree.root.findByType('Footer').props;
  expect(footer.appearance).toBe('soft');
  expect(footer.colors.statusConnected).toBe('#00ff00');
  expect(footer.colors.footerText).toBe('#637287');
  expect(footer.device.id).toBe(7);
  expect(tree.root.findByProps({testID: 'bottom-navigation-footer-slot'}).props.style[1].borderTopWidth).toBe(1);
  act(() => tree.unmount());
});
