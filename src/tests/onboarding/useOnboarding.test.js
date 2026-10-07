/* global test, expect, jest */
/* eslint no-unused-vars: ["error", {"varsIgnorePattern": "^(React|Setup)$"}] */
import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {useOnboarding} from '../../onboarding/useOnboarding';

jest.mock('react-native', () => ({Dimensions: {}, PixelRatio: {}}));
const context = {api: 'https://api.test', domain: 'https://app.test', appType: 'MANAGER', companyId: 4, userId: 8};
const tick = async () => {for (let i = 0; i < 10; i += 1) await Promise.resolve();};

test('late reads and draft writes cannot cross company changes', async () => {
  let state;
  const releases = [];
  const writes = [];
  const storage = {getItem: async () => null, setItem: async (...args) => writes.push(args)};
  const fetch = () => new Promise(resolve => {releases.push(resolve);});
  const Setup = props => {state = useOnboarding({...props, storage, fetch}); return null;};
  let tree;
  await act(async () => {tree = renderer.create(<Setup context={context} access="manage" />); await tick();});
  await act(async () => {state.update({notes: 'Company four'}); await tick();});
  let refresh;
  act(() => {refresh = state.refresh();});
  await act(async () => {tree.update(<Setup context={{...context, companyId: 9}} access="manage" />); await tick();});
  expect(state.draft.notes).toBe('');
  await act(async () => {releases.forEach(release => release({member: [], totalItems: 0})); await refresh; await tick();});
  // Unresolved reads from the first company must not publish to company nine.
  expect(state.runtime).toBe(null);
  expect(writes.some(([key, value]) => key.endsWith(':9:8') && value.includes('Company four'))).toBe(false);
  tree.unmount();
});

test('denied access does not read API or storage, and preview cannot record reviews', async () => {
  let state;
  const storage = {getItem: jest.fn(async () => null), setItem: jest.fn(async () => {})};
  const fetch = jest.fn(async () => ({member: [], totalItems: 0}));
  const Setup = props => {state = useOnboarding({...props, storage, fetch}); return null;};
  let tree;
  await act(async () => {tree = renderer.create(<Setup context={context} access="denied" />); await tick();});
  await act(async () => {await state.refresh();});
  expect(storage.getItem).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
  await act(async () => {tree.update(<Setup context={context} access="preview" />); await tick();});
  await act(async () => {state.update({reviewed: {device: true}}); await tick();});
  expect(state.draft.reviewed).toEqual({});
  expect(storage.setItem).not.toHaveBeenCalled();
  tree.unmount();
});

test('storage failure keeps the current review in memory and reports that it was not saved', async () => {
  let state;
  const storage = {getItem: async () => null, setItem: async () => {throw new Error('Quota');}};
  const Setup = () => {state = useOnboarding({context, access: 'manage', storage, fetch: async () => ({member: [], totalItems: 0})}); return null;};
  let tree;
  await act(async () => {tree = renderer.create(<Setup />); await tick();});
  await act(async () => {state.update({notes: 'To review'}); await tick();});
  expect(state.draft.notes).toBe('To review');
  expect(state.saveFailed).toBe(true);
  tree.unmount();
});

test('returning to a company before its pending save finishes restores the newest review', async () => {
  let state;
  let release;
  const saved = new Map();
  const storage = {
    getItem: async key => saved.get(key),
    setItem: (key, value) => new Promise(resolve => {release = () => {saved.set(key, value); resolve();};}),
  };
  const Setup = props => {state = useOnboarding({...props, storage, fetch: async () => ({member: [], totalItems: 0})}); return null;};
  let tree;
  await act(async () => {tree = renderer.create(<Setup context={context} access="manage" />); await tick();});
  await act(async () => {state.update({notes: 'Newest company A review'}); await tick();});
  await act(async () => {tree.update(<Setup context={{...context, companyId: 9}} access="manage" />); await tick();});
  await act(async () => {tree.update(<Setup context={context} access="manage" />); await tick();});
  await act(async () => {release(); await tick();});
  expect(state.draft.notes).toBe('Newest company A review');
  act(() => tree.unmount());
});
