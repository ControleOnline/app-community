const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { resolveModulePath } = require('./resolve-module-path.cjs');

const root = path.resolve(__dirname, '..');
const packageName = '@controleonline/ui-accounting';

test('development resolves accounting from the workspace source module', () => {
  assert.equal(
    resolveModulePath(root, packageName, false),
    path.join(root, 'modules', 'controleonline', 'ui-accounting'),
  );
});

test('production resolves accounting only from the installed package', () => {
  assert.equal(
    resolveModulePath(root, packageName, true),
    path.join(root, 'node_modules', '@controleonline', 'ui-accounting'),
  );
});
