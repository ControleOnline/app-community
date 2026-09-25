const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { modulePath, readPackageManifest, requiredPackages, validatePackageManifest } = require('./validate-module-contract.cjs');

test('package.json is the single source of exact UI module versions', () => {
  const packageManifest = readPackageManifest();
  const packages = requiredPackages(packageManifest);
  assert.deepEqual(validatePackageManifest(packageManifest), []);
  assert.equal(packages.length, 27);
  for (const packageName of packages) assert.match(packageManifest.dependencies[packageName], /^\d+\.\d+\.\d+$/);
});

test('production cannot silently fall back to source modules', () => {
  const root = path.resolve(__dirname, '..');
  const name = '@controleonline/ui-common';
  assert.equal(modulePath(name, 'development'), path.join(root, 'modules', 'controleonline', 'ui-common'));
  assert.equal(modulePath(name, 'production'), path.join(root, 'node_modules', '@controleonline', 'ui-common'));
});
