const base = require('./jest.waiter.config.cjs');
module.exports = {
  ...base,
  roots: ['<rootDir>/node_modules/@controleonline/ui-people'],
  testMatch: ['**/mainCompany.test.js', '**/people.customActions.test.js', '**/currentCompanySelection.test.js'],
};
