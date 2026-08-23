module.exports = [
  {
    name: 'manager',
    appType: 'MANAGER',
    testPaths: [
      'modules/controleonline/ui-login/src/tests/browser/manager',
      'modules/controleonline/ui-common/src/tests/browser/manager',
      'modules/controleonline/ui-manager/src/tests/browser/manager',
      'modules/controleonline/ui-crm/src/tests/browser/manager',
      'modules/controleonline/ui-customers/src/tests/browser/manager',
      'modules/controleonline/ui-products/src/tests/browser/manager',
      'modules/controleonline/ui-shop/src/tests/browser/manager',
      'modules/controleonline/ui-translate/src/tests/browser/manager',
    ],
  },
  {
    name: 'admin',
    appType: 'ADMIN',
    testPaths: [
      'modules/controleonline/ui-manager/src/tests/browser/admin',
      'modules/controleonline/ui-employee/src/tests/browser/admin',
      'modules/controleonline/ui-tests/src/tests/browser/admin',
    ],
  },
  {
    name: 'delivery',
    appType: 'DELIVERY',
    testPaths: ['modules/controleonline/ui-logistic/src/tests/browser/delivery'],
  },
  {
    name: 'pos',
    appType: 'POS',
    testPaths: ['modules/controleonline/ui-orders/src/tests/browser/pos'],
  },
];
