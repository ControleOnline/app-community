import React from 'react';
import renderer, {act} from 'react-test-renderer';
import fs from 'fs';
import path from 'path';
import {transformSync} from '@babel/core';

const sourcePath = path.resolve(__dirname, '../../../node_modules/@controleonline/ui-common/src/react/components/DefaultProvider.web.configuration.js');
const code = transformSync(fs.readFileSync(sourcePath, 'utf8'), {babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-modules-commonjs']}).code;
const loadHooks = () => {
  const module = {exports: {}};
  new Function('require', 'module', 'exports', code)(() => React, module, module.exports);
  return module.exports;
};
const deferred = () => {let resolve, reject; const promise = new Promise((yes, no) => {resolve = yes; reject = no;}); return {promise, resolve, reject};};
beforeEach(() => {global.IS_REACT_ACT_ENVIRONMENT = true;});

it('reports menu completion only after the real request resolves, including a genuinely empty result', async () => {
  const {useWebMenus} = loadHooks(); const request = deferred(); const report = jest.fn();
  const props = {isLogged: true, currentCompany: {id: 3}, actions: {setMenus: jest.fn()}, api: {fetch: () => request.promise}, appType: 'ADMIN', normalizeRuntimeMenuResponse: x => x, menuContextKey: 'ADMIN:user:3', setMenuLoad: report};
  function Probe() {useWebMenus(props); return null;}
  let tree; await act(async () => {tree = renderer.create(<Probe />);});
  expect(report).toHaveBeenLastCalledWith({key: props.menuContextKey, status: 'loading'});
  await act(async () => request.resolve([]));
  expect(props.actions.setMenus).toHaveBeenLastCalledWith([]);
  expect(report).toHaveBeenLastCalledWith({key: props.menuContextKey, status: 'ready'});
  act(() => tree.unmount());
});

it('reports a failed request and ignores the result of an obsolete company', async () => {
  const {useWebMenus} = loadHooks(); const first = deferred(), second = deferred(); const report = jest.fn();
  const props = {isLogged: true, currentCompany: {id: 3}, actions: {setMenus: jest.fn()}, api: {fetch: jest.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)}, appType: 'ADMIN', normalizeRuntimeMenuResponse: x => x || [], menuContextKey: 'ADMIN:user:3', setMenuLoad: report};
  function Probe({company}) {useWebMenus({...props, currentCompany: {id: company}, menuContextKey: `ADMIN:user:${company}`}); return null;}
  let tree; await act(async () => {tree = renderer.create(<Probe company={3} />);});
  await act(async () => tree.update(<Probe company={4} />));
  await act(async () => first.resolve(['obsolete']));
  expect(props.actions.setMenus).not.toHaveBeenCalled();
  expect(report).toHaveBeenLastCalledWith({key: 'ADMIN:user:4', status: 'loading'});
  await act(async () => second.reject(new Error('offline')));
  expect(report).toHaveBeenLastCalledWith({key: 'ADMIN:user:4', status: 'error'});
  act(() => tree.unmount());
});

it('treats the endpoint success:false envelope as a load error even with HTTP 200', async () => {
  const {useWebMenus} = loadHooks(); const report = jest.fn();
  const props = {isLogged: true, currentCompany: {id: 3}, actions: {setMenus: jest.fn()},
    api: {fetch: () => Promise.resolve({response: {data: [], success: false, error: 'Company not found'}})},
    appType: 'ADMIN', normalizeRuntimeMenuResponse: () => [], menuContextKey: 'ADMIN:user:3', setMenuLoad: report};
  function Probe() {useWebMenus(props); return null;}
  let tree; await act(async () => {tree = renderer.create(<Probe />);});
  expect(report).toHaveBeenLastCalledWith({key: props.menuContextKey, status: 'error'});
  act(() => tree.unmount());
});

it('discards the previous user request even when the active company stays the same', async () => {
  const {useWebMenus} = loadHooks(); const first = deferred(), second = deferred(); const report = jest.fn();
  const props = {isLogged: true, currentCompany: {id: 3}, actions: {setMenus: jest.fn()},
    api: {fetch: jest.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)},
    appType: 'ADMIN', normalizeRuntimeMenuResponse: x => x, setMenuLoad: report};
  function Probe({user}) {useWebMenus({...props, menuContextKey: `ADMIN:${user}:3`}); return null;}
  let tree; await act(async () => {tree = renderer.create(<Probe user="first" />);});
  await act(async () => tree.update(<Probe user="second" />));
  await act(async () => first.resolve(['old-user-menu']));
  expect(props.actions.setMenus).not.toHaveBeenCalled();
  await act(async () => second.resolve(['current-user-menu']));
  expect(props.actions.setMenus).toHaveBeenCalledTimes(1);
  expect(props.actions.setMenus).toHaveBeenLastCalledWith(['current-user-menu']);
  expect(report).toHaveBeenLastCalledWith({key: 'ADMIN:second:3', status: 'ready'});
  act(() => tree.unmount());
});
