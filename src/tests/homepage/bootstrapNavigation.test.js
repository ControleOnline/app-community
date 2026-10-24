import React, {useLayoutEffect, useState} from 'react';
import renderer, {act} from 'react-test-renderer';
import fs from 'fs';
import path from 'path';
import {transformSync} from '@babel/core';
import {adminBootstrapState} from '../../components/bootstrap/adminBootstrapState';

// Run the real provider; leave external translation bootstrap pending.
const sourcePath = path.join(process.env.CONTROLEONLINE_HOME_MODULES_ROOT ||
  path.resolve(__dirname, '../../../node_modules/@controleonline'),
  'ui-common/src/react/components/DefaultProvider.web.js');
const compile = transformSync(fs.readFileSync(sourcePath, 'utf8'), {
  babelrc: false, configFile: false,
  presets: [['@babel/preset-react', {runtime: 'classic'}]],
  plugins: ['@babel/plugin-transform-modules-commonjs'],
}).code;
const hookSource = fs.readFileSync(path.join(path.dirname(sourcePath), 'DefaultProvider.web.configuration.js'), 'utf8');
const hookCode = transformSync(hookSource, {babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-modules-commonjs']}).code;
const noop = () => {};
const external = new Proxy({__esModule: true, default: noop},
  {get: (target, key) => key in target ? target[key] : noop});
let mockReady;
const stores = {
  theme: {getters: {colors: {}, menus: []}, actions: {}},
  auth: {getters: {isLogged: true, user: {people: 10}}, actions: {}},
  people: {getters: {currentCompany: {id: 1}, mainCompany: {id: 1}, companies: []}, actions: {}},
};
const loadProvider = ({appType = 'MANAGER', api, menuHook, refreshRuntime} = {}) => {
  const module = {exports: {}};
  const dependency = name => {
    if (name === 'react') return React;
    if (name === 'react-refresh/runtime') return refreshRuntime;
    if (name === 'react-native') return {View: 'View'};
    if (name === '@store') return {useStore: name => stores[name] || {getters: {}, actions: {}}};
    if (name === '@appType') return {app_type: appType};
    if (name.endsWith('/adminBootstrapState')) return {adminBootstrapState};
    if (name === '@controleonline/ui-common/src/api' && api) return {api};
    if (name === './DefaultProvider.web.configuration' && menuHook) return new Proxy({useWebMenus: menuHook}, {get: (value, key) => value[key] || noop});
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

it('forces a fresh provider on development updates instead of reusing an obsolete hook sequence', () => {
  const refreshRuntime = jest.requireActual('react-refresh/runtime');
  const previousDev = global.__DEV__;
  try {
    global.__DEV__ = false;
    const untrackedBefore = loadProvider().DefaultProvider;
    refreshRuntime.register(untrackedBefore, 'bootstrap-without-signature');
    const untrackedAfter = loadProvider().DefaultProvider;
    refreshRuntime.register(untrackedAfter, 'bootstrap-without-signature');
    expect(refreshRuntime.performReactRefresh().updatedFamilies.has(
      refreshRuntime.getFamilyByType(untrackedAfter),
    )).toBe(true);
    global.__DEV__ = true;
    const before = loadProvider({refreshRuntime}).DefaultProvider;
    refreshRuntime.register(before, 'bootstrap-refresh-regression');
    const after = loadProvider({refreshRuntime}).DefaultProvider;
    refreshRuntime.register(after, 'bootstrap-refresh-regression');
    const update = refreshRuntime.performReactRefresh();
    const family = refreshRuntime.getFamilyByType(after);
    expect(update.staleFamilies.has(family)).toBe(true);
    expect(update.updatedFamilies.has(family)).toBe(false);
  } finally {
    if (previousDev === undefined) delete global.__DEV__;
    else global.__DEV__ = previousDev;
  }
});

it('keeps navigation mounted during translation bootstrap in apps without the managed menu barrier', () => {
  const {DefaultProvider, useTheme} = loadProvider({appType: 'CRM'});
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


it.each(['ADMIN', 'MANAGER', 'POS'])('keeps %s covered until session, company, menus and translations are ready without remounting navigation', async appType => {
  const hookModule = {exports: {}};
  new Function('require', 'module', 'exports', hookCode)(() => React, hookModule, hookModule.exports);
  const resolveMenus = [];
  const api = {fetch: jest.fn(() => new Promise(resolve => {resolveMenus.push(resolve);} ))};
  const actions = {setMenus: jest.fn()}; stores.theme.actions = actions;
  const oldAuth = stores.auth.getters, oldPeople = stores.people.getters;
  stores.auth.getters = {isLogged: false, sessionChecked: false};
  stores.people.getters = {currentCompany: {}, mainCompany: {}, companies: []};
  const onReady = jest.fn(); let mounts = 0, unmounts = 0, tree;
  const {DefaultProvider} = loadProvider({appType, api, menuHook: hookModule.exports.useWebMenus});
  function Navigator() {useLayoutEffect(() => {mounts++; return () => {unmounts++;};}, []); return <span>Real navigation remains mounted</span>;}
  const view = () => <DefaultProvider currentRouteName="HomePage" onBootstrapReady={onReady}><Navigator /></DefaultProvider>;
  try {
    await act(async () => {tree = renderer.create(view());});
    expect(onReady).toHaveBeenLastCalledWith(false, '');
    expect(api.fetch).not.toHaveBeenCalled();
    stores.auth.getters = {isLogged: true, sessionChecked: true, user: {id: 10}};
    await act(async () => tree.update(view()));
    expect(onReady).toHaveBeenLastCalledWith(false, '');
    stores.people.getters = {...stores.people.getters, currentCompany: {id: 3}, mainCompany: {id: 3}};
    await act(async () => tree.update(view()));
    expect(api.fetch).toHaveBeenCalledTimes(2);
    expect(onReady).toHaveBeenLastCalledWith(false, '');
    await act(async () => {resolveMenus.forEach(resolve => resolve({modules: {}}));});
    expect(onReady).toHaveBeenLastCalledWith(false, '');
    mockReady = true;
    await act(async () => tree.update(view()));
    expect(onReady).toHaveBeenLastCalledWith(true, '');
    expect(mounts).toBe(1); expect(unmounts).toBe(0);
    act(() => tree.unmount());
  } finally {stores.auth.getters = oldAuth; stores.people.getters = oldPeople; stores.theme.actions = {};}
});
