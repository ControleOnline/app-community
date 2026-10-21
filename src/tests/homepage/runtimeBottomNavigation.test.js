import React from 'react';
import renderer, {act} from 'react-test-renderer';
import RuntimeBar from '@controleonline/ui-common/src/react/components/RuntimeBottomNavigationBar';
const mockFetch = jest.fn();
let mockCompany;
const mockBarRenders = [];
jest.mock('@appType', () => ({app_type: 'MANAGER'}));
jest.mock('@store', () => ({useStore: name => ({getters: name === 'people' ? {currentCompany: mockCompany} : {colors: {}}})}));
jest.mock('@controleonline/ui-common/src/api', () => ({api: {fetch: (...args) => mockFetch(...args)}}));
jest.mock('@react-navigation/native', () => ({useNavigationState: select => select({index: 0, routes: [{name: 'PdvPage'}]})}));
jest.mock('@controleonline/ui-common/src/react/components/BottomNavigationBar', () => {
  const React = require('react');
  return props => {mockBarRenders.push({company: mockCompany.id, routes: props.items.map(item => item.route)}); return React.createElement('Bar', props);};
});
const response = routes => ({modules: {tools: {menus: routes.map((route, i) => ({route, menuKey: route, label: route, menuType: 'toolbar', sortOrder: i}))}}});
beforeEach(() => {global.IS_REACT_ACT_ENVIRONMENT = true; mockCompany = {id: 3}; mockFetch.mockReset(); mockBarRenders.length = 0;});

it('renders only the configured role-aware toolbar, including a profile-only POS-shaped result', async () => {
  mockFetch.mockResolvedValue(response(['ProfilePage']));
  let tree; await act(async () => {tree = renderer.create(<RuntimeBar presetKey="managerToolbar" placement="inline" />);});
  expect(mockFetch).toHaveBeenCalledWith('menus-people', {params: {myCompany: 3, appType: 'MANAGER', menuType: 'toolbar'}});
  const bar = tree.root.findByType('Bar');
  expect(bar.props.items.map(item => item.route)).toEqual(['ProfilePage']);
  expect(bar.props.appearance).toBe('soft'); expect(bar.props.placement).toBe('inline');
  expect(bar.props.activeRouteName).toBe('PdvPage');
  act(() => tree.unmount());
});

it('uses only safe Home/Profile fallback on API failure, never the business preset', async () => {
  mockFetch.mockRejectedValue(new Error('network unavailable'));
  let tree; await act(async () => {tree = renderer.create(<RuntimeBar presetKey="managerToolbar" />);});
  expect(tree.root.findByType('Bar').props.items.map(item => item.route)).toEqual(['HomePage', 'ProfilePage']);
  act(() => tree.unmount());
});

it('leaves no empty dock when all configured routes are unavailable', async () => {
  mockFetch.mockResolvedValue(response(['UnavailableRoute']));
  let tree; await act(async () => {tree = renderer.create(<RuntimeBar itemFilter={() => false} />);});
  expect(tree.root.findAllByType('Bar')).toHaveLength(0);
  act(() => tree.unmount());
});

it('removes old company items immediately and ignores a delayed response from that company', async () => {
  let resolveOld, resolveNew;
  mockFetch.mockImplementationOnce(() => new Promise(resolve => {resolveOld = resolve;}));
  let tree; await act(async () => {tree = renderer.create(<RuntimeBar />);});
  mockFetch.mockImplementationOnce(() => new Promise(resolve => {resolveNew = resolve;}));
  mockCompany = {id: 9};
  await act(async () => tree.update(<RuntimeBar />));
  await act(async () => resolveOld(response(['ClientsIndex'])));
  expect(tree.root.findAllByType('Bar')).toHaveLength(0);
  await act(async () => resolveNew(response(['ProfilePage'])));
  expect(tree.root.findByType('Bar').props.items.map(item => item.route)).toEqual(['ProfilePage']);
  act(() => tree.unmount());
});

it('never presents the previous company menu while the next company is loading', async () => {
  mockFetch.mockResolvedValueOnce(response(['ClientsIndex']));
  let tree; await act(async () => {tree = renderer.create(<RuntimeBar />);});
  let resolveNext;
  mockFetch.mockImplementationOnce(() => new Promise(resolve => {resolveNext = resolve;}));
  mockCompany = {id: 9};
  await act(async () => tree.update(<RuntimeBar />));
  expect(mockBarRenders.filter(render => render.company === 9).some(render => render.routes.includes('ClientsIndex'))).toBe(false);
  await act(async () => resolveNext(response(['ProfilePage'])));
  act(() => tree.unmount());
});
