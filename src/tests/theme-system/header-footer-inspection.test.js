import React from 'react';
import renderer, {act} from 'react-test-renderer';
import HeaderAppTypeSwitcher from '../../components/HeaderAppTypeSwitcher';
import ManagerRuntimeFooter from '../../components/manager-preview/ManagerRuntimeFooter';
import {initializeGlobalChromeColors} from '../../styles/globalChromeTheme';
import {resolveManagerTheme} from '../../styles/managerTheme';
import {attachThemeInspector} from '../../components/theme-editor/themeInspector';

jest.mock('react-native', () => ({...jest.requireActual('./nativeMock.cjs'), TouchableOpacity: 'TouchableOpacity'}));
jest.mock('react-native-vector-icons/Feather', () => 'Icon');
jest.mock('@appType', () => ({app_type: 'MANAGER', app_type_base: 'ADMIN', app_type_options: ['ADMIN', 'MANAGER'],
  normalize_app_type: value => value, clear_app_type: jest.fn(), set_app_type: jest.fn()}));
jest.mock('../../components/manager-preview/model', () => ({managerPreviewEnabled: true}));
jest.mock('../../../node_modules/@controleonline/ui-common/src/react/components/RuntimeInfoFooter', () => 'RuntimeInfoFooter');

test('header selector exposes dedicated theme references without changing selection actions', () => {
  let tree;
  act(() => {tree = renderer.create(<HeaderAppTypeSwitcher />);});
  const button = tree.root.findByProps({accessibilityLabel: 'Selecionar tipo de app'});
  expect(JSON.stringify(button.props.style)).toContain('var(--co-theme-headerAppTypeBackground)');
  expect(tree.root.findByProps({name: 'chevron-down'}).props.color).toBe('var(--co-theme-headerAppTypeIcon)');
  act(() => button.props.onPress());
  expect(tree.root.findByProps({accessibilityLabel: 'Fechar seletor'})).toBeTruthy();
  act(() => tree.unmount());
});

test('new permanent-area tokens inherit existing same-mode theme values', () => {
  const raw = initializeGlobalChromeColors({'selectBackground-light': 'white', 'selectBackground-dark': 'black',
    'footerText-light': 'navy', 'footerText-dark': 'white'});
  expect(resolveManagerTheme(raw, 'light').headerAppTypeBackground).toBe('white');
  expect(resolveManagerTheme(raw, 'dark').headerAppTypeBackground).toBe('black');
  expect(resolveManagerTheme(raw, 'light').footerCompanyText).toBe('navy');
  expect(resolveManagerTheme(raw, 'dark').footerCompanyText).toBe('white');
});

test('footer preserves its other colors and behavior while identifying its text token', () => {
  let tree;
  act(() => {tree = renderer.create(<ManagerRuntimeFooter colors={{footerBackground: 'navy'}} showDebugInfo />);});
  expect(tree.root.findByType('RuntimeInfoFooter').props).toMatchObject({showDebugInfo: true, appearance: 'soft',
    colors: {footerBackground: 'navy', footerText: 'var(--co-theme-footerCompanyText)'}});
  act(() => tree.unmount());
});

test('footer pointer targeting exists only in the removable inspection stylesheet', () => {
  const style = {remove: jest.fn()};
  const document = {createElement: () => style, head: {appendChild: jest.fn()},
    addEventListener: jest.fn(), removeEventListener: jest.fn()};
  const cleanup = attachThemeInspector(document, jest.fn(), jest.fn());
  expect(style.textContent).toContain('[data-testid="runtime-info-footer"] * { pointer-events: auto !important; }');
  cleanup();
  expect(style.remove).toHaveBeenCalledTimes(1);
});
