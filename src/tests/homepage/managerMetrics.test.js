import React from 'react';
import renderer, {act} from 'react-test-renderer';
import ManagerOverview from '../../components/manager-preview/ManagerOverview';
let mockCompany = {id: 9, alias: 'GYROS'};
let mockHistory;
const mockProducts = {getPurchasingSuggestion: jest.fn(async () => [{product_id: 1}])};
const mockPeople = {read: jest.fn(async () => ({totalItems: 648}))};
const mockStoreRead = jest.fn();
jest.mock('@controleonline/ui-common/src/api', () => ({api: {fetch: (uri, options) => uri === 'orders' ? mockOrders.read({query: options.params}) : mockPeople.read(options.params)}}));
const mockOrders = {read: jest.fn(async args => mockHistory(args))};
const mockMenus = [{label: 'Operação', menus: [
  {route: 'OrderHistoryPage', label: 'Pedidos', menuType: 'home'},
  {route: 'Inventory', label: 'Estoque', menuType: 'home'},
  {route: 'ClientsIndex', label: 'Clientes', menuType: 'home'},
  {route: 'IncomeStatement', label: 'Resultados', menuType: 'home'},
]}];
jest.mock('react-native', () => ({Platform: {OS: 'web'}, Pressable: 'Pressable', ScrollView: 'ScrollView',
  Text: 'Text', View: 'View', StyleSheet: {create: x => x}, useWindowDimensions: () => ({width: 1600})}));
jest.mock('@react-navigation/native', () => ({useIsFocused: () => true}));
jest.mock('@appType', () => ({app_type: 'MANAGER'}));
jest.mock('../../components/HomeIcon', () => 'Icon');
jest.mock('../../components/manager-preview/ManagerOrdersTrend', () => 'TrendCard');
jest.mock('../../components/manager-preview/ManagerPreviewProvider', () => ({useManagerPreview: () => ({colors: {}})}));
jest.mock('@store', () => ({useStore: name => ({
  getters: name === 'people' ? {currentCompany: mockCompany, totalItems: 648} : name === 'theme' ? {menus: mockMenus} : {},
  actions: name === 'products' ? mockProducts : {getItems: mockStoreRead, fetchHistoryPage: mockStoreRead},
})}));
const navigation = {getState: () => ({routeNames: ['OrderHistoryPage', 'Inventory', 'ClientsIndex', 'IncomeStatement']}), navigate: jest.fn()};
const screen = () => <ManagerOverview navigation={navigation} />;
const choose = (tree, label) => tree.root.findAllByType('Pressable').find(node => node.props.accessibilityLabel === label).props.onPress();
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  mockCompany = {id: 9, alias: 'GYROS'};
  mockOrders.read.mockClear(); mockProducts.getPurchasingSuggestion.mockClear();
  mockHistory = async ({query}) => ({totalItems: query['status.realStatus'] === 'open' ? 4 : query.orderType === 'sale' ? 1079 : 1199,
    summary: {sales: {totals: {revenue: 3210, orders: 123, averageTicket: 26.09}}}});
});

it('uses company-scoped API totals without querying the removed stock card', async () => {
  let tree; await act(async () => {tree = renderer.create(screen());});
  const queries = mockOrders.read.mock.calls.map(([arg]) => arg.query);
  expect(queries).toHaveLength(3);
  expect(queries.every(query => query.provider === '/people/9')).toBe(true);
  expect(queries[0].orderType).toBe('sale');
  expect(queries[1].orderType).toBeUndefined();
  expect(queries[0]).toMatchObject({summary: 'sales', itemsPerPage: 1});
  expect(queries[0]['orderDate[after]']).toMatch(/00:00:00$/);
  expect(queries[2]['orderDate[after]']).toBeUndefined();
  expect(mockPeople.read).toHaveBeenCalledWith({'link.company': '/people/9', 'link.linkType': 'client', itemsPerPage: 1, page: 1});
  expect(mockProducts.getPurchasingSuggestion).not.toHaveBeenCalled();
  expect(mockStoreRead).not.toHaveBeenCalled();
  const values = tree.root.findAllByType('Text').map(x => x.props.children);
  expect(values).toContain('1.199'); expect(values).toContain('4'); expect(values).toContain('648');
  expect(values).not.toContain('Alertas de estoque');
  await act(async () => tree.unmount());
});

it('refetches on period and company changes, and removes both date limits for all time', async () => {
  let tree; await act(async () => {tree = renderer.create(screen());});
  await act(async () => choose(tree, 'Últimos 7 dias'));
  expect(mockOrders.read.mock.calls[3][0].query['orderDate[after]']).toBeDefined();
  await act(async () => choose(tree, 'Todo o período'));
  const allQuery = mockOrders.read.mock.calls[6][0].query;
  expect(allQuery['orderDate[after]']).toBeUndefined();
  expect(allQuery['orderDate[before]']).toBeUndefined();
  mockCompany = {id: 12};
  await act(async () => {tree.update(screen());});
  expect(mockOrders.read.mock.calls.at(-2)[0].query.provider).toBe('/people/12');
  expect(mockPeople.read).toHaveBeenLastCalledWith({'link.company': '/people/12', 'link.linkType': 'client', itemsPerPage: 1, page: 1});
  await act(async () => tree.unmount());
});

it('ignores late responses from a previously selected company', async () => {
  const pending = [];
  mockHistory = () => new Promise(resolve => pending.push(resolve));
  let tree; await act(async () => {tree = renderer.create(screen());});
  mockCompany = {id: 12};
  await act(async () => {tree.update(screen());});
  await act(async () => {pending[0]({totalItems: 999, summary: {}}); pending[1]({totalItems: 999}); pending[2]({totalItems: 999});});
  expect(tree.root.findAllByType('Text').map(x => x.props.children)).not.toContain('999');
  await act(async () => tree.unmount());
});

it('shows request errors instead of misleading zero values', async () => {
  mockHistory = async () => {throw new Error('network unavailable');};
  let tree; await act(async () => {tree = renderer.create(screen());});
  const text = tree.root.findAllByType('Text').map(x => x.props.children);
  expect(text).toContain('Não foi possível carregar os pedidos.');
  expect(text).toContain('Não foi possível carregar os pedidos abertos.');
  expect(text).not.toContain('0');
  await act(async () => tree.unmount());
});

it('uses the existing destinations for clients, orders, sales and results', async () => {
  let tree; await act(async () => {tree = renderer.create(screen());});
  await act(async () => choose(tree, 'Abrir Pedidos hoje'));
  expect(navigation.navigate).toHaveBeenLastCalledWith('OrderHistoryPage', {});
  await act(async () => choose(tree, 'Abrir Vendas concluídas hoje'));
  expect(navigation.navigate).toHaveBeenLastCalledWith('OrderHistoryPage', {});
  await act(async () => choose(tree, 'Abrir Clientes'));
  expect(navigation.navigate).toHaveBeenLastCalledWith('ClientsIndex', {});
  await act(async () => choose(tree, 'Resultados'));
  expect(navigation.navigate).toHaveBeenLastCalledWith('IncomeStatement', {});
  expect(tree.root.findAllByType('Text').map(x => x.props.children)).toContain('648');
  await act(async () => tree.unmount());
});

it('renders the complete API series for the selected period, including all time', async () => {
  const daily = [{key: '2026-10-14', label: '14/10', orders: 3}];
  const monthly = Array.from({length: 14}, (_, i) => ({key: String(i), label: String(i), orders: i + 1}));
  mockHistory = async () => ({totalItems: 1199, summary: {sales: {sales: {
    totals: {revenue: 3210, orders: 123, averageTicket: 26.09}, daily, monthly,
  }}}});
  let tree; await act(async () => {tree = renderer.create(screen());});
  expect(tree.root.findByType('TrendCard').props.items).toEqual(daily);
  await act(async () => choose(tree, 'Todo o período'));
  const chart = tree.root.findByType('TrendCard');
  expect(chart.props.items).toEqual(monthly);
  expect(chart.props.items).toHaveLength(14);
  await act(async () => tree.unmount());
});

it('distinguishes an empty series from a missing API series', async () => {
  mockHistory = async () => ({totalItems: 0, summary: {sales: {totals: {revenue: 0, orders: 0, averageTicket: 0}, daily: []}}});
  let tree; await act(async () => {tree = renderer.create(screen());});
  expect(tree.root.findAllByType('Text').map(x => x.props.children)).toContain('Nenhuma venda concluída no período.');
  await act(async () => choose(tree, 'Todo o período'));
  expect(tree.root.findAllByType('Text').map(x => x.props.children)).toContain('A API não retornou a série do período.');
  await act(async () => tree.unmount());
});
