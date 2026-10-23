import React from 'react';
import renderer, {act} from 'react-test-renderer';
import CheckoutContent from '@controleonline/ui-orders/src/react/pages/checkout/AddProductScreen';

global.IS_REACT_ACT_ENVIRONMENT = true;
let mockSession, mockStores;
jest.mock('react-native', () => ({ActivityIndicator: 'Spinner', Text: 'Text', TouchableOpacity: 'Button', View: 'View'}));
jest.mock('@appType', () => ({app_type: 'MANAGER'}));
jest.mock('@store', () => ({useStore: name => mockStores[name]}));
jest.mock('@react-navigation/native', () => ({useRoute: () => ({}), useIsFocused: () => true,
  useFocusEffect: callback => require('react').useEffect(callback, [callback])}));
jest.mock('@controleonline/ui-products/src/react/hooks/useCachedCatalogActions', () => ({__esModule: true, default: store => store.actions}));
jest.mock('@controleonline/ui-common/src/react/components/MessageService', () => ({useMessage: () => ({})}));
jest.mock('@controleonline/ui-common/src/react/config/deviceConfigBootstrap', () => ({
  POS_OPERATION_MODE_WAITER: 'waiter', resolvePosOperationMode: () => 'counter',
  isPosCashRegisterClosed: () => false, isPosTotemMode: () => false,
  isPosSingleItemMode: () => false, shouldUsePosCashRegisterLifecycle: () => false}));
jest.mock('@controleonline/ui-orders/src/react/hooks/usePosCartSession', () => ({__esModule: true,
  default: () => mockSession, isLinkedOrderCodeRequiredError: () => false, isPosOrderCreationCancelledError: () => false}));
jest.mock('@controleonline/ui-orders/src/react/hooks/posCartSession/activePosOrderContext', () => ({setActivePosOrderContext: jest.fn()}));
jest.mock('@controleonline/ui-orders/src/react/components/LinkedOrderEntrySheet', () => () => null);
jest.mock('@controleonline/ui-products/src/react/pages/Categories', () => 'Catalog');
jest.mock('@controleonline/ui-products/src/react/pages/Products', () => 'Catalog');

let tree, navigation;
const open = async params => {
  await act(async () => {tree = renderer.create(<CheckoutContent navigation={navigation} route={{name: 'PdvPage', params: {showBottomToolBar: true, ...params}}} />);});
};
beforeEach(() => {
  navigation = {setParams: jest.fn(), addListener: jest.fn()};
  mockSession = {activeOrder: null, usesLinkedCheckOrders: false,
    loadStoredDraftOrder: jest.fn().mockResolvedValue({id: 72986}),
    ensureActiveOrder: jest.fn().mockResolvedValue({id: 900}),
    refreshActiveOrder: jest.fn().mockResolvedValue({id: 800})};
  mockStores = {orders: {actions: {initQueue: jest.fn(), syncOrder: jest.fn()}},
    people: {getters: {currentCompany: {id: 1}}}, device: {getters: {item: {id: 9}}},
    device_config: {getters: {item: {configs: {}}}},
    categories: {getters: {items: []}, actions: {getItems: jest.fn().mockResolvedValue([])}}};
});
afterEach(async () => {if (tree) await act(async () => tree.unmount()); tree = null;});

test('first menu entry keeps the recovered draft internal, with the same clean route as a repeated entry', async () => {
  await open({interactionMode: 'pdv', catalogResetKey: 'menu:first'});
  expect(mockSession.loadStoredDraftOrder).toHaveBeenCalledTimes(1);
  expect(navigation.setParams).not.toHaveBeenCalled();
  expect(tree.root.findByType('Catalog').props.activeOrderId).toBe('72986');
  expect(tree.root.findByType('Catalog').props.route.params.orderId).toBe('72986');
  expect(mockSession.ensureActiveOrder).not.toHaveBeenCalled();
  mockSession.activeOrder = {id: 72986};
  await act(async () => tree.update(<CheckoutContent navigation={navigation} route={{name: 'PdvPage', params: {showBottomToolBar: true, catalogResetKey: 'menu:second'}}} />));
  expect(navigation.setParams).not.toHaveBeenCalled();
  expect(tree.root.findByType('Catalog').props.activeOrderId).toBe(72986);
});

test('explicit order links remain available to the catalog', async () => {
  mockSession.loadStoredDraftOrder.mockResolvedValue(null);
  await open({orderId: '700'});
  expect(tree.root.findByType('Catalog').props.route.params.orderId).toBe('700');
});

test('explicit resume still loads and exposes the requested order', async () => {
  await open({resumeExistingOrder: true, id: '800'});
  expect(mockSession.refreshActiveOrder).toHaveBeenCalledWith('800');
  expect(navigation.setParams).toHaveBeenCalledWith({orderId: '800'});
  expect(mockSession.loadStoredDraftOrder).not.toHaveBeenCalled();
});

test('explicit new order still persists its ID and consumes the start flag', async () => {
  await open({startNewOrder: true});
  expect(mockSession.ensureActiveOrder).toHaveBeenCalledWith(undefined, expect.objectContaining({forceNew: true}));
  expect(navigation.setParams).toHaveBeenCalledWith({orderId: '900', startNewOrder: false});
});

test('entry without a saved draft does not create an ordinary counter order', async () => {
  mockSession.loadStoredDraftOrder.mockResolvedValue(null);
  await open({});
  expect(navigation.setParams).not.toHaveBeenCalled();
  expect(mockSession.ensureActiveOrder).not.toHaveBeenCalled();
});

test('linked check startup retains its existing order initialization', async () => {
  mockSession.usesLinkedCheckOrders = true;
  mockSession.loadStoredDraftOrder.mockResolvedValue(null);
  await open({});
  expect(mockSession.ensureActiveOrder).toHaveBeenCalledTimes(1);
  expect(navigation.setParams).toHaveBeenCalledWith({orderId: '900'});
});
