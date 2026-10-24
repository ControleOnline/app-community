import fs from 'fs';
import path from 'path';
import {transformSync} from '@babel/core';
import {it, expect} from '@jest/globals';

const filename = path.resolve(__dirname, '../../appType.js');
const code = transformSync(fs.readFileSync(filename, 'utf8'), {
  filename, babelrc: false, configFile: false,
  presets: [require.resolve('@babel/preset-env')],
}).code;

function runtime({base = 'ADMIN', browser = true, storage = true} = {}) {
  let address = new URL('http://localhost:8081/pdv-page?orderId=123#cart');
  const values = new Map([
    ['app-type', 'MANAGER'], ['admin-app-type', 'MANAGER'],
    ['device', 'synthetic-device'], ['session', 'synthetic-session'],
  ]);
  const currentWindow = browser ? {
    get location() {return address;},
    history: {
      state: {staleRoute: 'PdvPage'},
      replaceState(state, title, next) {this.state = state; address = new URL(next, address);},
    },
  } : undefined;
  const context = {
    window: currentWindow,
    ...(storage ? {localStorage: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: key => values.delete(key),
    }} : {}),
  };
  const module = {exports: {}};
  new Function('require', 'module', 'exports', 'globalThis', 'window', code)(
    name => {
      if (name === '@env') return {env: {APP_TYPE: base}};
      throw new Error(`Unexpected dependency ${name}`);
    }, module, module.exports, context, currentWindow,
  );
  return {api: module.exports, values, currentWindow, address: () => address.href};
}

it.each(['POS', 'MANAGER', 'PPC', 'SHOP', 'DELIVERY', 'CRM', 'SERVICE'])(
  'starts an explicit ADMIN switch to %s at the app entry without stale route parameters', selected => {
    const {api, values, currentWindow, address} = runtime();
    expect(api.set_app_type(selected)).toBe(true);
    expect(address()).toBe('http://localhost:8081/');
    expect(currentWindow.history.state).toBeNull();
    expect(api.resolve_app_type({APP_TYPE: 'ADMIN'})).toBe(selected);
    expect(values.get('device')).toBe('synthetic-device');
    expect(values.get('session')).toBe('synthetic-session');
  },
);

it('returns to the ADMIN entry without carrying a POS route or changing the session/device', () => {
  const {api, values, address} = runtime();
  expect(api.clear_app_type()).toBe(true);
  expect(address()).toBe('http://localhost:8081/');
  expect(api.resolve_app_type({APP_TYPE: 'ADMIN'})).toBe('ADMIN');
  expect(values.has('app-type')).toBe(false);
  expect(values.has('admin-app-type')).toBe(false);
  expect(values.get('device')).toBe('synthetic-device');
  expect(values.get('session')).toBe('synthetic-session');
});

it('preserves a deep link during ordinary bootstrap and application resolution', () => {
  const {api, address} = runtime();
  expect(api.app_type).toBe('MANAGER');
  expect(api.resolve_app_type({APP_TYPE: 'ADMIN'})).toBe('MANAGER');
  expect(address()).toBe('http://localhost:8081/pdv-page?orderId=123#cart');
});

it('does not change browser navigation for a fixed POS build', () => {
  const {api, address} = runtime({base: 'POS'});
  api.set_app_type('MANAGER');
  api.clear_app_type();
  expect(api.resolve_app_type({APP_TYPE: 'POS'})).toBe('POS');
  expect(address()).toBe('http://localhost:8081/pdv-page?orderId=123#cart');
});

it('does not navigate for rejected application types or unavailable storage', () => {
  const invalid = runtime();
  expect(invalid.api.set_app_type('UNKNOWN')).toBe(false);
  expect(invalid.address()).toBe('http://localhost:8081/pdv-page?orderId=123#cart');
  const missing = runtime({storage: false});
  expect(missing.api.set_app_type('POS')).toBe(false);
  expect(missing.api.clear_app_type()).toBe(false);
  expect(missing.address()).toBe('http://localhost:8081/pdv-page?orderId=123#cart');
});

it('keeps native application selection safe without browser navigation primitives', () => {
  const {api, values} = runtime({browser: false});
  expect(api.set_app_type('POS')).toBe(true);
  expect(values.get('admin-app-type')).toBe('POS');
  expect(api.clear_app_type()).toBe(true);
});
