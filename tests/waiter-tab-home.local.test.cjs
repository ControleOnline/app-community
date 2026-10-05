const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');
const React = require('react');
const renderer = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
const root = path.resolve(process.env.CONTROLEONLINE_MODULES_ROOT || path.join(__dirname, '../node_modules/@controleonline'));
function load(file, deps = {}) {
  const exports = {};
  const filename = path.join(root, file);
  const {code} = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    filename, babelrc: false, configFile: false, presets: [require.resolve('@babel/preset-env'), require.resolve('@babel/preset-react')],
  });
  vm.runInNewContext(code, {exports, global: {}, console, AbortController,
    require: id => {if (!Object.hasOwn(deps, id) && id === './deviceConfigValues') return load('ui-common/src/react/config/deviceConfigValues.js', deps); assert.ok(Object.hasOwn(deps, id), `Unexpected dependency: ${id}`); return deps[id];},
  });
  return exports;
}
const config = load('ui-common/src/react/config/deviceConfigBootstrap.js', {
  '@controleonline/ui-common/src/react/utils/screenMetrics.js': {},
  '@controleonline/ui-common/src/react/utils/shopConfig.js': {
    normalizeBooleanConfig: value => value === true || value === '1',
    SHOP_LOYALTY_COUPONS_ENABLED_CONFIG_KEY: 'loyalty-coupons-enabled',
  },
});
const context = load('ui-orders/src/react/utils/linkedOrderContext.js');
const linked = load('ui-orders/src/react/hooks/posCartSession/linkedOrders.js', {
  '@controleonline/ui-orders/src/react/utils/linkedOrderContext': context,
  '@controleonline/ui-orders/src/react/utils/posCartHelpers': {}, './status': {},
});
const routes = load('ui-orders/src/react/utils/orderRoute.js', {
  '@controleonline/ui-orders/src/utils/orderState': {normalizeEntityId: context.normalizeEntityId},
});
const activeContext = load('ui-orders/src/react/hooks/posCartSession/activePosOrderContext.js');
const status = load('ui-orders/src/react/hooks/posCartSession/status.js', {
  '@controleonline/ui-common/src/api': {},
  '@controleonline/ui-orders/src/react/utils/linkedOrderContext': context,
  '@controleonline/ui-orders/src/react/utils/posCartHelpers': {
    normalizeStatusKey: value => String(value || '').toLowerCase(),
    DRAFT_SALE_ORDER_TYPE: 'cart', LINKED_SALE_ORDER_TYPE: 'sale',
  },
});
const actions = load('ui-orders/src/react/pages/home/waiterTabHomeActions.js', {
  '@controleonline/ui-common/src/react/config/deviceConfigBootstrap': config,
  '../../hooks/posCartSession/linkedOrders': linked,
  '../../utils/linkedOrderContext': context, '../../utils/orderRoute': routes,
  '../../hooks/posCartSession/activePosOrderContext': activeContext,
  '../../hooks/posCartSession/status': status,
});
const configs = {'pos-operation-mode': 'waiter', 'check-order-type': 'tab', 'check-order-management-mode': 'manage'};
function fixture(extra = {}) {
  const calls = [], ensureCalls = [];
  const parent = {id: 51, externalCode: '51', orderType: 'tab'};
  return {
    calls, ensureCalls,
    args: {action: 'consult', companyId: 3, externalCode: '51', configs,
      cartActions: {getItems: async query => {calls.push(query); return [parent];}},
      ensureActiveOrder: async (_people, options) => {ensureCalls.push(options); return {id: 900};},
      ...extra,
    },
  };
}

test('home is confined to POS + waiter + tab', () => {
  assert.equal(actions.isWaiterTabHome('POS', configs), true);
  for (const mode of ['counter', 'cashier', 'totem', 'single-item']) {
    assert.equal(actions.isWaiterTabHome('POS', {...configs, 'pos-operation-mode': mode}), false);
  }
  for (const type of ['none', 'table', 'table-tab', 'stamp']) {
    assert.equal(actions.isWaiterTabHome('POS', {...configs, 'check-order-type': type}), false);
  }
  assert.equal(actions.isWaiterTabHome('MANAGER', configs), false);
});

test('consult selects the exact existing tab in Settlement without materializing a cart', async () => {
  const {args, calls, ensureCalls} = fixture();
  const destination = await actions.resolveWaiterTabDestination(args);
  assert.equal(destination.screen, 'LinkedOrderSettlementPage');
  assert.equal(destination.params.rootOrderId, 51);
  assert.equal(destination.params.orderType, 'tab');
  assert.equal(destination.params.showBottomCart, false);
  assert.equal(calls[0].provider, '/people/3');
  assert.equal(calls[0].externalCode, '51');
  assert.equal(calls[0].orderType, 'tab');
  assert.equal(ensureCalls.length, 0);
});

test('missing tab cannot be created by consultation or existing-only launch', async () => {
  for (const action of ['consult', 'charge', 'launch']) {
    const {args, ensureCalls} = fixture({action,
      configs: {...configs, 'check-order-management-mode': 'existing-only', 'pos-local-charge-enabled': '1'},
      cartActions: {getItems: async () => []},
    });
    await assert.rejects(actions.resolveWaiterTabDestination(args), /ainda não está aberta.*caixa/);
    assert.equal(ensureCalls.length, 0);
  }
});

test('manage launch delegates opening and cart creation to the existing session', async () => {
  const {args, ensureCalls} = fixture({action: 'launch', cartActions: {getItems: async () => []}});
  const destination = await actions.resolveWaiterTabDestination(args);
  assert.equal(ensureCalls.length, 1);
  assert.equal(ensureCalls[0].forceNew, true);
  assert.equal(ensureCalls[0].linkedOrderInput.externalCode, '51');
  assert.equal(ensureCalls[0].linkedOrderInput.settlementOrder, null);
  assert.equal(destination.screen, 'PdvPage');
  assert.equal(destination.params.id, 900);
  assert.equal(destination.params.resumeExistingOrder, true);
  assert.equal(destination.params.catalogResetKey, 'launch:900');
  assert.equal(destination.params.interactionMode, 'pdv');
  assert.ok(Object.values(destination.params).every(value => typeof value !== 'object'));
});

test('existing-only launch can add items to an open tab', async () => {
  const {args, ensureCalls} = fixture({action: 'launch', configs: {...configs, 'check-order-management-mode': 'existing-only'}});
  await actions.resolveWaiterTabDestination(args);
  assert.equal(ensureCalls[0].linkedOrderInput.settlementOrder.id, 51);
});

test('charge is independently gated and opens summary without immediate checkout or closing', async () => {
  const blocked = fixture({action: 'charge'});
  await assert.rejects(actions.resolveWaiterTabDestination(blocked.args), /não está autorizado/);
  assert.equal(blocked.calls.length, 0);
  const enabled = fixture({action: 'charge', configs: {...configs, 'pos-local-charge-enabled': '1'}});
  const destination = await actions.resolveWaiterTabDestination(enabled.args);
  assert.equal(destination.screen, 'LinkedOrderSettlementPage');
  assert.equal(enabled.ensureCalls.length, 0);
});

test('empty input and a canceled lookup cannot create or navigate', async () => {
  const empty = fixture({externalCode: ''});
  await assert.rejects(actions.resolveWaiterTabDestination(empty.args), /Digite/);
  assert.equal(empty.calls.length, 0);
  const controller = new AbortController(); controller.abort();
  const canceled = fixture({action: 'launch', signal: controller.signal});
  assert.equal(await actions.resolveWaiterTabDestination(canceled.args), null);
  assert.equal(canceled.ensureCalls.length, 0);
});

test('names and alphanumeric identifiers stay intact in all three actions', async () => {
  for (const externalCode of ['Jorge', 'José da Silva', 'A-51', 'Identificação maior que doze caracteres']) {
    for (const action of ['launch', 'consult', 'charge']) {
      const queries = [];
      const {args, ensureCalls} = fixture({action, externalCode: `  ${externalCode}  `,
        configs: {...configs, 'pos-local-charge-enabled': '1'},
        cartActions: {getItems: async query => {
          queries.push(query);
          return [{id: 51, externalCode, orderType: 'tab'}];
        }},
      });
      const destination = await actions.resolveWaiterTabDestination(args);
      assert.equal(queries[0].externalCode, externalCode);
      if (action === 'launch') {
        assert.equal(ensureCalls[0].linkedOrderInput.externalCode, externalCode);
        assert.equal(destination.screen, 'PdvPage');
      } else {
        assert.equal(destination.params.rootOrderId, 51);
        assert.equal(ensureCalls.length, 0);
      }
    }
  }
});

test('rendered pinpad edits the number and hides charging when not authorized', async () => {
  const stores = {
    people: {getters: {currentCompany: {id: 3}, mainCompany: {configs: {}}}},
    device_config: {getters: {item: {configs}}}, device: {getters: {item: {id: 'web-10'}}},
    theme: {getters: {colors: {primary: '#4444ff'}}}, cart: {actions: {}},
  };
  const Home = load('ui-orders/src/react/pages/home/WaiterTabHome.js', {
    react: React,
    'react-native': {ActivityIndicator: 'Spinner', ScrollView: 'Scroll', Text: 'Text', TextInput: 'Input', TouchableOpacity: 'Button', View: 'View'},
    'react-native-vector-icons/Feather': 'Icon', '@store': {useStore: name => stores[name]},
    '@controleonline/ui-default/src/react/components/help/DefaultTooltip': 'Tooltip',
    '@controleonline/ui-common/src/react/config/deviceConfigBootstrap': config,
    '@controleonline/../../src/styles/branding': {resolveThemePalette: value => value},
    '../../hooks/usePosCartSession': () => ({ensureActiveOrder: async () => ({id: 900})}),
    './waiterTabHomeActions': actions, './WaiterTabHome.styles': () => ({}),
  }).default;
  let tree;
  await renderer.act(async () => {tree = renderer.create(React.createElement(Home, {navigation: {}, operationInfo: [{label: 'Vínculo', value: 'Comanda'}]}));});
  const button = label => tree.root.findByProps({accessibilityLabel: label});
  assert.equal(button('Lançar itens').props.disabled, true);
  assert.equal(tree.root.findAllByProps({accessibilityLabel: 'Cobrar / fechar comanda'}).length, 0);
  await renderer.act(async () => button('5').props.onPress());
  await renderer.act(async () => button('1').props.onPress());
  assert.equal(button('Identificação da comanda').props.value, '51');
  assert.equal(button('Lançar itens').props.disabled, false);
  await renderer.act(async () => button('Apagar último dígito').props.onPress());
  assert.equal(button('Identificação da comanda').props.value, '5');
  await renderer.act(async () => button('Limpar identificação').props.onPress());
  assert.equal(button('Identificação da comanda').props.value, '');
  await renderer.act(async () => button('Digitar nome ou código').props.onPress());
  assert.equal(button('Identificação da comanda').props.keyboardType, 'default');
  assert.equal(button('Identificação da comanda').props.inputMode, 'text');
  assert.equal(tree.root.findAllByProps({accessibilityLabel: '5'}).length, 0);
  await renderer.act(async () => button('Identificação da comanda').props.onChangeText('José da Silva / A-51'));
  assert.equal(button('Identificação da comanda').props.value, 'José da Silva / A-51');
  assert.equal(button('Lançar itens').props.disabled, false);
  await renderer.act(async () => button('Usar teclado numérico').props.onPress());
  assert.equal(button('Identificação da comanda').props.value, 'José da Silva / A-51');
  assert.equal(button('Identificação da comanda').props.keyboardType, 'number-pad');
  assert.equal(tree.root.findAllByProps({accessibilityLabel: '5'}).length, 1);
  await renderer.act(async () => button('Identificação da comanda').props.onChangeText('   '));
  assert.equal(button('Lançar itens').props.disabled, true);
  stores.device_config.getters.item = {configs: {...configs, 'pos-local-charge-enabled': '1'}};
  await renderer.act(async () => tree.update(React.createElement(Home, {navigation: {}, operationInfo: []})));
  assert.equal(tree.root.findAllByProps({accessibilityLabel: 'Cobrar / fechar comanda'}).length, 1);
  await renderer.act(async () => tree.unmount());
});

const newCart = {id: 901, app: 'POS', orderType: 'cart', mainOrderId: 51,
  price: 0, status: {status: 'open', realStatus: 'open'}, orderProducts: []};
test('new empty cart acknowledgment is reused once within its company, device and order', async () => {
  activeContext.clearActivePosOrderContexts();
  const {args} = fixture({action: 'launch', deviceId: 403, ensureActiveOrder: async () => newCart});
  const destination = await actions.resolveWaiterTabDestination(args);
  assert.equal(destination.params.resumeExistingOrder, true);
  for (const scope of [{companyId: 4, deviceId: 403, orderId: 901}, {companyId: 3, deviceId: 404, orderId: 901}, {companyId: 3, deviceId: 403, orderId: 902}]) {
    assert.equal(activeContext.consumeConfirmedPosOrderContext(scope), null);
  }
  const scope = {companyId: 3, deviceId: 403, orderId: 901};
  const confirmed = activeContext.consumeConfirmedPosOrderContext(scope);
  assert.equal(confirmed.price, 0);
  assert.equal(confirmed.orderProducts.length, 0);
  assert.equal(activeContext.consumeConfirmedPosOrderContext(scope), null);
});
test('incomplete, nonempty, mismatched or invalid creation keeps the server refresh', async () => {
  for (const change of [{orderProducts: undefined}, {orderProducts: [{id: 9}]}, {mainOrderId: 52},
    {status: '/statuses/1'}, {app: 'SHOP'}, {price: undefined}, {price: null}, {price: 5}, {orderType: 'tab'}]) {
    activeContext.clearActivePosOrderContexts();
    const {args} = fixture({action: 'launch', deviceId: 403, ensureActiveOrder: async () => ({...newCart, ...change})});
    assert.equal((await actions.resolveWaiterTabDestination(args)).screen, 'PdvPage');
    assert.equal(activeContext.consumeConfirmedPosOrderContext({companyId: 3, deviceId: 403, orderId: 901}), null);
  }
});
test('consultation and charging never create a confirmed-cart receipt', async () => {
  for (const action of ['consult', 'charge']) {
    activeContext.clearActivePosOrderContexts();
    const {args} = fixture({action, deviceId: 403, configs: {...configs, 'pos-local-charge-enabled': true}});
    await actions.resolveWaiterTabDestination(args);
    assert.equal(activeContext.getActivePosOrderContext({companyId: 3, deviceId: 403}), null);
  }
});

test('each new launch clears the catalog view with its own order key', async () => {
  const {args} = fixture({action: 'launch', ensureActiveOrder: async () => ({id: 902})});
  const first = await actions.resolveWaiterTabDestination(args);
  const second = await actions.resolveWaiterTabDestination({...args, ensureActiveOrder: async () => ({id: 903})});
  assert.equal(first.params.catalogResetKey, 'launch:902');
  assert.equal(second.params.catalogResetKey, 'launch:903');
});
