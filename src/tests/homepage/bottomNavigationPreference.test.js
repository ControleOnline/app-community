import React from 'react';
import renderer, {act} from 'react-test-renderer';
import usePreference from '@controleonline/ui-common/src/react/hooks/useBottomNavigationPreference';
jest.mock('react-native', () => ({Platform: {OS: 'web'}}));
global.IS_REACT_ACT_ENVIRONMENT = true;
const render = async (props = {}) => {
  let state, tree;
  function Probe(input) {state = usePreference(input); return null;}
  const input = {enabled: true, principal: '10', appType: 'MANAGER', ...props};
  await act(async () => {tree = renderer.create(<Probe {...input} />);});
  return {get state() {return state;}, tree, update: async next => {
    Object.assign(input, next); await act(async () => tree.update(<Probe {...input} />));
  }};
};
const storage = () => {
  const values = new Map();
  return {getItem: jest.fn(async key => values.get(key) || null),
    setItem: jest.fn(async (key, value) => {values.set(key, value);})};
};

it('hides only for the session, survives route rerenders and restores default on reopening', async () => {
  const disk = storage(), view = await render({storage: disk});
  expect(view.state.visible).toBe(true);
  act(() => view.state.setSessionVisible(false));
  await view.update({}); expect(view.state.visible).toBe(false);
  expect(disk.setItem).not.toHaveBeenCalled();
  act(() => view.tree.unmount());
  const reopened = await render({storage: disk});
  expect(reopened.state.visible).toBe(true);
  act(() => reopened.tree.unmount());
});

it('remembers hiding and showing on this device, isolated by user and app', async () => {
  const disk = storage(), view = await render({storage: disk});
  await act(async () => {expect(await view.state.setRememberedVisible(false)).toBe(true);});
  expect(view.state.visible).toBe(false);
  act(() => view.tree.unmount());
  const reopened = await render({storage: disk}); expect(reopened.state.visible).toBe(false);
  await reopened.update({appType: 'POS'}); expect(reopened.state.visible).toBe(true);
  await reopened.update({appType: 'MANAGER', principal: '20'}); expect(reopened.state.visible).toBe(true);
  await reopened.update({principal: '10'}); expect(reopened.state.visible).toBe(false);
  await act(async () => {await reopened.state.setRememberedVisible(true);});
  expect(reopened.state.visible).toBe(true);
  act(() => reopened.tree.unmount());
});

it('clears session overrides on logout without changing the remembered preference', async () => {
  const view = await render({storage: storage()});
  act(() => view.state.setSessionVisible(false));
  await view.update({enabled: false}); expect(view.state.visible).toBe(false);
  await view.update({enabled: true}); expect(view.state.visible).toBe(true);
  act(() => view.tree.unmount());
});

it('does not flash visible while hydrating or apply the previous user delayed read', async () => {
  let resolveFirst;
  const disk = storage();
  disk.getItem.mockImplementationOnce(() => new Promise(resolve => {resolveFirst = resolve;}));
  const view = await render({storage: disk});
  expect(view.state.ready).toBe(false); expect(view.state.visible).toBe(false);
  await view.update({principal: '20'}); expect(view.state.visible).toBe(true);
  await act(async () => resolveFirst('hidden'));
  expect(view.state.visible).toBe(true);
  act(() => view.tree.unmount());
});

it('reports failed persistence without pretending the preference was saved', async () => {
  const disk = storage(); disk.setItem.mockRejectedValue(new Error('disk unavailable'));
  const view = await render({storage: disk});
  await act(async () => {expect(await view.state.setRememberedVisible(false)).toBe(false);});
  expect(view.state.rememberedVisible).toBe(true);
  expect(view.state.error).toBeTruthy();
  act(() => view.state.setSessionVisible(false)); expect(view.state.visible).toBe(false);
  act(() => view.tree.unmount());
});
