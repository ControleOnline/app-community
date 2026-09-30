const path = require('node:path');
const {spawnSync} = require('node:child_process');
const appRoot = path.resolve(__dirname, '..');
const moduleRoot = path.resolve(process.env.CONTROLEONLINE_MODULES_ROOT || path.join(appRoot, 'node_modules/@controleonline'));
const tests = {
  'ui-orders': [
    'hooks/posCartSession/activePosOrderContext', 'hooks/posCartSession/usePosDraftOrderStorage',
    'utils/orderRoute', 'pages/checkout/AddProductScreen.categories',
    'pages/orders/sales/OrderItemsTab', 'pages/orders/sales/orderDetailsPaymentBar',
    'pages/orders/sales/productionReturn', 'pages/orders/sales/resolveOrderTopBarButtons',
    'components/BottomCart',
  ],
  'ui-products': [
    'pages/CategoriesPage/pdvEmptyCategoriesRedirect', 'pages/CategoriesPage/waiterCatalogRecovery',
    'pages/customizationOrderContext', 'pages/customizationNavigation',
    'components/ProductItemCustomizationRoute',
  ],
  'ui-default': ['components/table/DefaultTableToolbar.waiter'],
};
const files = Object.entries(tests).flatMap(([name, paths]) => paths.map(file => path.join(moduleRoot, name, `src/tests/react/${file}.test.js`)));
const batches = [
  files,
  [path.join(moduleRoot, 'ui-orders/src/tests/react/pages/orders/OrderHistoryPage.test.js'), '--testNamePattern', 'waiter toolbar'],
];
for (const batch of batches) {
  const result = spawnSync(process.execPath, [require.resolve('jest/bin/jest'), '--config', path.join(appRoot, 'jest.waiter.config.cjs'), '--runInBand', '--runTestsByPath', ...batch, ...process.argv.slice(2)], {cwd: appRoot, stdio: 'inherit'});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

