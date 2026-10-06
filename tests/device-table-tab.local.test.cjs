const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');

const packageRoot = path.resolve(process.env.CONTROLEONLINE_MODULES_ROOT || path.join(__dirname, '../node_modules/@controleonline'));
function load(relativePath, dependencies = {}) {
  const exports = {};
  const filename = path.join(packageRoot, relativePath);
  const {code} = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    filename, babelrc: false, configFile: false,
    presets: [require.resolve('@babel/preset-env'), require.resolve('@babel/preset-react')],
  });
  vm.runInNewContext(code, {
    exports, global: {}, console,
    require: id => {
      if (!Object.hasOwn(dependencies, id) && id === './deviceConfigValues') return load('ui-common/src/react/config/deviceConfigValues.js', dependencies);
      assert.ok(Object.hasOwn(dependencies, id), `Unmocked dependency: ${id}`);
      return dependencies[id];
    },
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
const combined = {'check-order-type': 'table-tab'};

test('combined mode survives JSON persistence and exposes both concrete order types', () => {
  assert.equal(config.resolvePosCheckOrderTypeForShop(JSON.stringify(combined), {}), 'table-tab');
  assert.equal(JSON.stringify(config.resolvePosCheckOrderTypesForShop(combined, {})), '["table","tab"]');
  assert.equal(config.resolvePosCheckOrderEntryTypeForShop(combined, {}), 'table');
});

test('legacy types and stamp eligibility retain their behavior', () => {
  for (const type of ['none', 'tab', 'table', 'stamp']) {
    const configs = {'check-order-type': type};
    assert.equal(config.resolvePosCheckOrderTypeForShop(configs, {}), type);
    assert.equal(config.resolvePosCheckOrderEntryTypeForShop(configs, {}), type);
  }
  assert.equal(config.resolvePosCheckOrderTypeForShop(
    {'check-order-type': 'stamp'}, {'loyalty-coupons-enabled': '0'},
  ), 'none');
  assert.equal(config.resolvePosCheckOrderTypeForShop(combined, {'loyalty-coupons-enabled': '0'}), 'table-tab');
  assert.equal(config.resolvePosCheckOrderType({'check-order-type': 'unknown'}), 'none');
});

test('Manager selection saves combined mode without escalating existing-only', () => {
  const groups = [], saved = [], selected = [];
  const component = load('ui-common/src/react/pages/Devices/detail/DeviceDetailPdvConfigSection.js', {
    react: {createElement: () => null},
    'react-native': {},
    '@react-native-picker/picker': {Picker: {Item: 'Item'}},
    'react-native-vector-icons/Feather': {},
    '../../DeviceDetailPage.styles': {},
    '@controleonline/ui-common/src/react/config/deviceConfigBootstrap': config,
    '@controleonline/ui-common/src/react/utils/paymentDevices': {normalizeEntityId: value => value},
    './deviceDetailHelpers': {getProductShowcaseLabel: () => ''},
    './deviceDetailConstants': {tt: () => ''},
  }).default;
  component({
    themeColors: {}, brandColors: {}, palette: {}, productShowcases: [],
    posOperationMode: 'waiter', checkOrderType: 'tab',
    checkOrderManagementMode: 'existing-only', loyaltyCouponsEnabled: false,
    renderHelpButton: () => null, renderSwitchRow: () => null,
    renderOptionButtons: args => {groups.push(args); return null;},
    setCheckOrderType: value => selected.push(value),
    setCheckOrderManagementMode: () => assert.fail('Must preserve existing-only'),
    savePosOperationMode: payload => saved.push(payload),
  });
  const group = groups.find(item => item.options.some(option => option.value === 'table-tab'));
  assert.ok(group);
  group.onChange('table-tab');
  assert.deepEqual(selected, ['table-tab']);
  assert.equal(saved[0].checkOrderType, 'table-tab');
  assert.equal(saved[0].checkOrderManagementMode, 'existing-only');
});

test('combined mode retains the existing linked-order creation gate', async () => {
  const context = load('ui-orders/src/react/utils/linkedOrderContext.js');
  const linked = load('ui-orders/src/react/hooks/posCartSession/linkedOrders.js', {
    '@controleonline/ui-orders/src/react/utils/linkedOrderContext': context,
    '@controleonline/ui-orders/src/react/utils/posCartHelpers': {
      DRAFT_SALE_ORDER_TYPE: 'cart', normalizeId: context.normalizeEntityId,
    },
    './status': {},
  });
  let saves = 0;
  const args = {
    companyId: 3, externalCode: '12',
    linkedOrderType: config.resolvePosCheckOrderEntryTypeForShop(combined, {}),
    cartActions: {getItems: async () => []},
    ordersActions: {save: async payload => {saves++; return payload;}},
    buildOrderPayload: (_status, _people, _parent, orderType) => ({orderType}),
  };
  assert.equal(await linked.ensureSettlementOrder({
    ...args, canManageLinkedOrders: config.canManagePosCheckOrders({...combined, 'check-order-management-mode': 'existing-only'}),
  }), null);
  assert.equal(saves, 0);
  const order = await linked.ensureSettlementOrder({
    ...args, canManageLinkedOrders: config.canManagePosCheckOrders({...combined, 'check-order-management-mode': 'manage'}),
  });
  assert.equal(order.orderType, 'table');
  assert.equal(saves, 1);
});
