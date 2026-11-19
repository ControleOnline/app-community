import React from 'react';
import renderer, {act} from 'react-test-renderer';
import useManagerPreference from '../../components/manager-preview/useManagerPreference';
import {moduleColor, moduleColorSource, resolveModuleAccent} from '../../components/manager-preview/moduleAccent';

jest.mock('../../components/HomeIcon', () => 'Icon');

const colors = {primary:'#147568',navigationActiveBorder:'#123456',navigationActiveIcon:'#456789'};
test('uses the active palette for a reference and leaves literal category colors intact', () => {
  expect(resolveModuleAccent('$primary', colors)).toBe('#147568');
  expect(resolveModuleAccent('#757575', colors)).toBe('#757575');
  expect(resolveModuleAccent('$missing', colors)).toBeUndefined();
  expect(resolveModuleAccent('var(--unknown)', colors)).toBeUndefined();
  expect(resolveModuleAccent('#0000', colors)).toBeUndefined();
  expect(resolveModuleAccent('rgba(0,0,0,0)', colors)).toBeUndefined();
  expect(resolveModuleAccent('rgb(1..2, 0, 0)', colors)).toBeUndefined();
});

test('remembers the accent only for the same preference key', async () => {
  const previousStorage = global.localStorage;
  const saved = new Map();
  global.localStorage = {getItem:key=>saved.get(key),setItem:(key,value)=>saved.set(key,value)};
  function Probe({scope}) {return <preference value={useManagerPreference(scope)} />;}
  let tree;
  try {
    await act(async () => {tree = renderer.create(<Probe scope="domain-a/account-a" />);});
    const preference = () => tree.root.findByType('preference').props.value;
    expect(preference().value).toBe(false);
    await act(async () => preference().setValue(true));
    await act(async () => tree.update(<Probe scope="domain-b/account-a" />));
    expect(preference().value).toBe(false);
    await act(async () => tree.update(<Probe scope="domain-a/account-a" />));
    expect(preference().value).toBe(true);
  } finally {
    if (tree) await act(async () => tree.unmount());
    global.localStorage = previousStorage;
  }
});

test('module colors come from the new columns, then the legacy ones, and never from the theme', () => {
  const palette = {primary: '#147568'};
  const record = {routeCardText: '$primary', textColor: '#111111', color: '#222222'};
  expect(moduleColor(record, ['routeCardText', 'textColor'], palette)).toEqual({value: '#147568', field: 'routeCardText', reference: '$primary'});
  expect(moduleColor({textColor: '#111111'}, ['routeCardText', 'textColor'], palette).field).toBe('textColor');
  expect(moduleColor({routeCardText: 'invalid', textColor: '#111111'}, ['routeCardText', 'textColor'], palette).value).toBe('#111111');
  expect(moduleColor({}, ['routeCardText', 'textColor'], palette)).toEqual({});
  expect(moduleColor({color: 'rgba(0,0,0,0)'}, ['color'], palette, {accent: true})).toEqual({});
  const color = moduleColor({textColor: '#111111'}, ['routeCardText', 'textColor'], palette);
  expect(moduleColorSource('routes', color, 'Page', 'color')).toContain('"source":"routes.text_color"');
  expect(moduleColorSource('routes', moduleColor({routeCardText: '#000000'}, ['routeCardText']), 'Page')).toContain('"source":"routes.routeCardText"');
  expect(moduleColorSource('routes', {}, 'Page')).toBeUndefined();
});
