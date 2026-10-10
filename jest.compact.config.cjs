const path = require('node:path');
const base = require('./jest.waiter.config.cjs');
module.exports = {...base, roots: ['ui-orders', 'ui-default', 'ui-layout', 'ui-common']
  .map(name => path.join(__dirname, 'node_modules/@controleonline', name))};
