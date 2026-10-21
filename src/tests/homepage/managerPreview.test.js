import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {managerMenu, selectedManagerMenuItem, managerRouteTitle, previewPalette, shouldPreview} from '../../components/manager-preview/model';
import ManagerPreviewProvider, {useManagerPreview} from '../../components/manager-preview/ManagerPreviewProvider';

jest.mock('@controleonline/ui-common/src/api', () => ({api: {fetch: jest.fn()}}));
jest.mock('@appType', () => ({app_type: 'MANAGER'}));
jest.mock('react-native', () => ({Platform: {OS: 'web'}}));
jest.mock('../../components/manager-preview/model', () => ({
  ...jest.requireActual('../../components/manager-preview/model'), managerPreviewEnabled: true,
}));
const mockBase = {buttonBackground: '#7056d4', buttonText: '#ffffff', customBrand: 'preserved', pageBackground: '#abcdef', textPrimary: '#123456', 'bg-dark': '#654321', 'text-headers-dark':'#fedcba'};
let mockColors;
let mockLogged;
let mockGuideCompany;
const mockSetColors = jest.fn(value => {mockColors = value;});
const mockActions = {setColors: mockSetColors};
jest.mock('@store', () => ({useStore: name => name === 'auth'
  ? {getters: {isLogged: mockLogged}} : name === 'people' ? {getters: {currentCompany: mockGuideCompany}} : {getters: {colors: mockColors}, actions: mockActions}}));

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  mockColors = mockBase;
  mockLogged = true;
  mockGuideCompany = {id: 3};
  mockSetColors.mockClear();
  global.localStorage = {getItem: () => 'light', setItem: jest.fn()};
});
afterEach(() => {delete global.localStorage;});

it('keeps registered authorized device routes and parameters without inventing menu access', () => {
  const menus = [{label: 'Configurações', menus: [
    {menuKey: 'devices', label: 'Dispositivos', route: 'DevicesIndex', menuType: 'home', routeParams: {scope: 9}},
    {label: 'Hidden toolbar', route: 'Secret', menuType: 'toolbar'},
    {label: 'Missing screen', route: 'Missing', menuType: 'home'},
  ]}];
  const groups = managerMenu(menus, ['DevicesIndex', 'Secret']);
  expect(groups[0].items).toHaveLength(1);
  expect(groups[0].items[0]).toMatchObject({name: 'DevicesIndex', params: {scope: 9}});
  expect(managerMenu([], ['DevicesIndex'])).toEqual([]);
});

it('keeps sales and purchases distinct when the server assigns both menus to the same route',()=>{
 const sales={name:'OrderHistoryPage',params:{orderTypeFilter:'sale',historyTitle:'Pedidos de venda'}};
 const purchases={name:'OrderHistoryPage',params:{orderTypeFilter:'purchase',historyTitle:'Compras'}};
 expect(selectedManagerMenuItem([sales,purchases],{name:'OrderHistoryPage',params:purchases.params})).toBe(purchases);
 expect(selectedManagerMenuItem([sales,purchases],{name:'OrderHistoryPage',params:sales.params})).toBe(sales);
 expect(selectedManagerMenuItem([sales,purchases],{name:'OrderHistoryPage',params:{orderTypeFilter:'other'}})).toBeUndefined();
 const device={name:'DevicesIndex',params:{scope:9}};
 expect(selectedManagerMenuItem([device],{name:'DevicesIndex'})).toBe(device);
});

it('preserves branding while switching canonical surface and text tokens', () => {
  const light = previewPalette(mockBase, 'light');
  const dark = previewPalette(mockBase, 'dark');
  expect(dark.buttonBackground).toBe(mockBase.buttonBackground);
  expect(dark.customBrand).toBe('preserved');
  expect(dark.pageBackground).not.toBe(light.pageBackground);
  expect(dark.textPrimary).not.toBe(light.textPrimary);
});

it('applies themes without a feedback loop, reapplies domain changes and restores on logout', async () => {
  let context;
  function Probe() { context = useManagerPreview(); return null; }
  let tree;
  await act(async () => { tree = renderer.create(<ManagerPreviewProvider><Probe /></ManagerPreviewProvider>); });
  const firstCalls = mockSetColors.mock.calls.length;
  await act(async () => { tree.update(<ManagerPreviewProvider><Probe /></ManagerPreviewProvider>); });
  expect(mockSetColors.mock.calls.length).toBe(firstCalls);
  await act(async () => { context.toggleMode(); });
  expect(context.mode).toBe('dark');
  expect(localStorage.setItem).toHaveBeenCalledWith('controleonline.manager-preview.mode', 'dark');
  await act(async () => {mockColors = {...mockBase, buttonBackground: '#ffb830'}; tree.update(<ManagerPreviewProvider><Probe /></ManagerPreviewProvider>);});
  expect(mockColors.buttonBackground).toBe('#ffb830');
  expect(mockColors.pageBackground).toBe(previewPalette(mockBase, 'dark').pageBackground);
  await act(async () => {mockLogged = false; tree.update(<ManagerPreviewProvider><Probe /></ManagerPreviewProvider>);});
  expect(mockColors).toEqual({...mockBase, buttonBackground: '#ffb830'});
  await act(async () => {tree.unmount();});
});

it('uses the modern Manager layout with standard Expo on local and official hosts', () => {
  const valid = {platform: 'web', appType: 'MANAGER', hostname: 'localhost'};
  expect(shouldPreview(valid)).toBe(true);
  for (const patch of [{hostname: 'app.lave-go.com'}, {hostname: ''}, {platform: 'android'}]) {
    expect(shouldPreview({...valid, ...patch})).toBe(true);
  }
  for (const patch of [{platform: 'ios'}, {appType: 'POS'}, {appType: 'PPC'}, {appType: 'ADMIN'}]) {
    expect(shouldPreview({...valid, ...patch})).toBe(false);
  }
});

it('keeps guide observations only in memory and resets them on company changes and logout', async () => {
  let context;
  function Probe() {context = useManagerPreview(); return null;}
  let tree;
  await act(async () => {tree = renderer.create(<ManagerPreviewProvider><Probe /></ManagerPreviewProvider>);});
  await act(async () => {context.setGuideOpen(true); context.recordGuideEvent({type: 'open', route: 'HomePage'});});
  expect(context.guideOpen).toBe(process.env.SHENLONG_TESTS === '1');
  expect(context.guideEvents).toHaveLength(process.env.SHENLONG_TESTS === '1' ? 1 : 0);
  expect(localStorage.setItem).not.toHaveBeenCalled();
  mockGuideCompany = {id: 9};
  await act(async () => tree.update(<ManagerPreviewProvider><Probe /></ManagerPreviewProvider>));
  expect(context.guideOpen).toBe(false);
  expect(context.guideEvents).toEqual([]);
  await act(async () => {context.setGuideOpen(true); context.recordGuideEvent({type: 'open', route: 'DevicesIndex'});});
  mockLogged = false;
  await act(async () => tree.update(<ManagerPreviewProvider><Probe /></ManagerPreviewProvider>));
  expect(context.guideEvents).toEqual([]);
  expect(context.guideOpen).toBe(false);
  await act(async () => tree.unmount());
});

it('uses configured public avatar panel colors without changing the login theme store', async () => {
  mockLogged=false;mockColors={cardBackground:'#abcdef'}; let context;
  function Probe(){context=useManagerPreview();return null;}
  let tree; await act(async()=>{tree=renderer.create(<ManagerPreviewProvider><Probe/></ManagerPreviewProvider>);});
  expect(context.colors.cardBackground).toBe(mockColors.cardBackground);
  expect(context.themeIssues).toContain('buttonBackground');
  expect(mockSetColors).not.toHaveBeenCalled();
  await act(async()=>tree.unmount());
});

it('distinguishes sales and purchase entries without discarding their route parameters',()=>{
 expect(managerRouteTitle('OrderHistoryPage',{orderTypeFilter:'sale'})).toBe('Pedidos de venda');
 expect(managerRouteTitle('OrderHistoryPage',{orderTypeFilter:'purchase'})).toBe('Pedidos de compra');
 expect(managerRouteTitle('EmployeesIndex')).toBe('Colaboradores');
 expect(managerRouteTitle('Unknown')).toBeUndefined();
});

it('defaults standard Android to modern while preserving an explicit legacy choice', () => {
  const native = {platform:'android',appType:'MANAGER'};
  expect(shouldPreview(native)).toBe(true);
  expect(shouldPreview({...native,layout:'legacy',nativeEnabled:'1'})).toBe(false);
  expect(shouldPreview({...native,platform:'ios'})).toBe(false);
  expect(shouldPreview({...native,appType:'POS'})).toBe(false);
});

it('supports explicit official-domain builds and an overriding legacy build',()=>{
 const official={platform:'web',appType:'MANAGER',hostname:'app.lave-go.com',layout:'modern'};
 expect(shouldPreview(official)).toBe(true);
 expect(shouldPreview({...official,layout:'legacy',enabled:'1'})).toBe(false);
 for(const appType of ['ADMIN','POS','SHOP'])expect(shouldPreview({...official,appType})).toBe(false);
 expect(shouldPreview({...official,platform:'android'})).toBe(true);
});
