import React, {useLayoutEffect, useState} from 'react';
import renderer, {act} from 'react-test-renderer';
import fs from 'fs';
import path from 'path';
import {transformSync} from '@babel/core';

// Run the real provider; leave external translation bootstrap pending.
const sourcePath = path.join(process.env.CONTROLEONLINE_HOME_MODULES_ROOT ||
  path.resolve(__dirname, '../../../node_modules/@controleonline'),
  'ui-common/src/react/components/DefaultProvider.web.js');
const compile = transformSync(fs.readFileSync(sourcePath, 'utf8'), {
  babelrc: false, configFile: false,
  presets: [['@babel/preset-react', {runtime: 'classic'}]],
  plugins: ['@babel/plugin-transform-modules-commonjs'],
}).code;
const noop = () => {};
const external = new Proxy({__esModule: true, default: noop},
  {get: (target, key) => key in target ? target[key] : noop});
let mockReady;
const stores = {
  theme: {getters: {colors: {}, menus: []}, actions: {}},
  auth: {getters: {isLogged: true, user: {people: 10}}, actions: {}},
  people: {getters: {currentCompany: {id: 1}, mainCompany: {id: 1}, companies: []}, actions: {}},
};
const loadProvider = () => {
  const module = {exports: {}};
  const dependency = name => {
    if (name === 'react') return React;
    if (name === 'react-native') return {View: 'View'};
    if (name === '@store') return {useStore: name => stores[name] || {getters: {}, actions: {}}};
    if (name === '@appType') return {app_type: 'MANAGER'};
    if (name === '@env') return {env: {ZOOM: 70}};
    if (name === '@package') return {__esModule: true, default: {version: 'test'}};
    if (name.endsWith('/publicRoutes')) return {isPublicRoute: name => name === 'SignInPage'};
    if (name.endsWith('/runtimeLanguage')) return {
      buildTranslationBootstrapKey: () => 'language:company', resolveConfiguredLanguage: () => 'pt',
      isTranslationBootstrapReady: ({required}) => !required || mockReady,
    };
    if (name.endsWith('/styles/colors')) return {colors: {}};
    if (name === './DefaultProvider.styles') return {__esModule: true,
      default: {shell: {flex: 1}, translationPending: {opacity: 0, visibility: 'hidden'}}};
    return external;
  };
  new Function('require', 'module', 'exports', compile)(dependency, module, module.exports);
  return module.exports;
};

beforeEach(() => {
  mockReady = false;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  global.localStorage = {getItem: () => '{}'};
});
afterEach(() => {delete global.localStorage;});

it('keeps navigation mounted during login translation bootstrap without a registration loop', () => {
  const {DefaultProvider, useTheme} = loadProvider();
  let mounts = 0;
  let unmounts = 0;
  let tree;
  function Navigator({setRoute}) {
    const register = useTheme().bottomChrome.registerBottomNavigation;
    useLayoutEffect(() => {
      mounts += 1;
      const release = register();
      setRoute('HomePage');
      return () => {unmounts += 1; release(); setRoute('SignInPage');};
    }, [register]);
    return <span>Authenticated screen</span>;
  }
  function App() {
    const [route, setRoute] = useState('SignInPage');
    return <DefaultProvider currentRouteName={route}><Navigator setRoute={setRoute} /></DefaultProvider>;
  }
  expect(() => act(() => {tree = renderer.create(<App />);})).not.toThrow();
  expect(mounts).toBe(1);
  expect(unmounts).toBe(0);
  expect(tree.root.findAllByType('View')[0].props['aria-hidden']).toBe(true);
  expect(tree.root.findAllByType('View')[0].props.pointerEvents).toBe('none');
  expect(tree.root.findAllByType('View')[0].props.style).toContainEqual({opacity: 0, visibility: 'hidden'});
  mockReady = true;
  act(() => tree.update(<App />));
  expect(mounts).toBe(1);
  expect(tree.root.findAllByType('View')[0].props.pointerEvents).toBe('auto');
  expect(tree.root.findAllByType('View')[0].props['aria-hidden']).toBe(false);
  act(() => tree.unmount());
  expect(unmounts).toBe(1);
});
