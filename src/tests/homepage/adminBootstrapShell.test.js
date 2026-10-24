import React, {useEffect, useImperativeHandle, useLayoutEffect} from 'react';
import renderer, {act} from 'react-test-renderer';
import fs from 'fs';
import path from 'path';
import {transformSync} from '@babel/core';
import AdminBootstrapLoading from '../../components/bootstrap/AdminBootstrapLoading';

jest.mock('react-native', () => ({ActivityIndicator: 'ActivityIndicator', Pressable: 'Pressable', Text: 'Text', View: 'View', StyleSheet: {create: x => x}}));
jest.mock('@store', () => ({useStore: () => ({getters: {colors: {pageBackground: '#f5f5f5', textPrimary: '#123'}}})}));
const noop = () => {};
let ready, error, mounts, unmounts;
const source = fs.readFileSync(path.resolve(__dirname, '../../../node_modules/@controleonline/ui-layout/src/react/App.js'), 'utf8');
const code = transformSync(source, {babelrc: false, configFile: false, presets: [['@babel/preset-react', {runtime: 'classic'}]], plugins: ['@babel/plugin-transform-modules-commonjs']}).code;
const loadApp = (appType = 'ADMIN') => {
  const module = {exports: {}};
  const Pass = ({children}) => children;
  const Navigator = React.forwardRef(({children, onReady}, ref) => {
    useImperativeHandle(ref, () => ({getCurrentRoute: () => ({name: 'HomePage'})}), []);
    useEffect(() => {onReady();}, []);
    return children;
  });
  function Provider({children, onBootstrapReady}) {
    useEffect(() => {onBootstrapReady(ready, error);}, [onBootstrapReady, ready, error]);
    return children;
  }
  function Routes() {useLayoutEffect(() => {mounts++; return () => {unmounts++;};}, []); return <routes />;}
  const external = new Proxy({__esModule: true, default: Pass}, {get: (target, key) => key in target ? target[key] : noop});
  const dependency = name => {
    if (name === 'react') return React;
    if (name === 'react-native') return {Platform: {OS: 'web'}, View: 'View', StatusBar: 'StatusBar'};
    if (name.endsWith('/AdminBootstrapLoading')) return {__esModule: true, default: AdminBootstrapLoading};
    if (name === '@appType') return {app_type: appType};
    if (name === '@react-navigation/native') return {NavigationContainer: Navigator};
    if (name.endsWith('/src/routers')) return {__esModule: true, default: Routes, linking: {}};
    if (name.endsWith('/DefaultProvider')) return {DefaultProvider: Provider};
    if (name.endsWith('/CheckLogin')) return {__esModule: true, default: () => null};
    if (name === 'react-native-paper') return {PaperProvider: Pass};
    if (name.endsWith('/MessageService')) return {MessageProvider: Pass};
    if (name === 'react-native-gesture-handler') return {GestureHandlerRootView: Pass};
    if (name.endsWith('/toastConfig')) return {TOAST_PROVIDER_KEYS: {ROOT: 'root', MODAL: 'modal', PERSIST: 'persist'}};
    if (name === '@backpackapp-io/react-native-toast') return {Toasts: () => null, toast: {dismiss: noop}};
    return external;
  };
  new Function('require', 'module', 'exports', code)(dependency, module, module.exports);
  return module.exports.default;
};
beforeEach(() => {global.IS_REACT_ACT_ENVIRONMENT = true; ready = false; error = ''; mounts = 0; unmounts = 0;});

it.each(['ADMIN', 'MANAGER', 'POS'])('keeps one loading surface in %s until context is ready without remounting navigation', async appType => {
  const App = loadApp(appType); let tree;
  await act(async () => {tree = renderer.create(<App />);});
  expect(tree.root.findAllByType('ActivityIndicator')).toHaveLength(1);
  expect(tree.root.findByProps({accessibilityLabel: 'Carregando aplicativo'}).props.style).toContainEqual({backgroundColor: '#f5f5f5'});
  ready = true;
  await act(async () => tree.update(<App />));
  expect(tree.root.findAllByType(AdminBootstrapLoading)).toHaveLength(0);
  expect(mounts).toBe(1); expect(unmounts).toBe(0);
  ready = false; error = 'Não foi possível carregar os menus.';
  await act(async () => tree.update(<App />));
  expect(tree.root.findAllByType('ActivityIndicator')).toHaveLength(0);
  expect(tree.root.findAllByProps({accessibilityRole: 'alert'})).toHaveLength(1);
  expect(tree.root.findByProps({accessibilityLabel: 'Tentar novamente'})).toBeTruthy();
  expect(mounts).toBe(1); expect(unmounts).toBe(0);
  act(() => tree.unmount());
});
