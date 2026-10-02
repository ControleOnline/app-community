const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {browserModulePath} = require('./browser-module-paths.cjs');
const root = path.resolve('/app');
const source = path.join(root, 'modules/controleonline/ui-tests/src/tests/helpers/smokeEvidence.js');

test('browser fixture imports use the same installed npm packages as the app', () => {
  assert.equal(browserModulePath(root, source, true), path.join(root, 'node_modules/@controleonline/ui-tests/src/tests/helpers/smokeEvidence.js'));
});
test('explicit development keeps source imports', () => {
  assert.equal(browserModulePath(root, source, false), source);
});
test('browser adapter does not redirect app files or other workspaces', () => {
  for (const file of ['/app/src/tests/browser/apiOrigin.js', '/else/modules/controleonline/ui-tests/test.js', '/app/modules/controleonline-other/test.js']) assert.equal(browserModulePath(root, file, true), file);
});
