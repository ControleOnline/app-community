const test = require('node:test');
const assert = require('node:assert/strict');
const { readManifest, validateManifest } = require('./validate-module-contract.cjs');

test('module manifest uses exact versions and contains only required packages', () => {
  const manifest = readManifest();
  assert.deepEqual(validateManifest(manifest), []);
  for (const version of Object.values(manifest.publishedPackages)) assert.match(version, /^\d+\.\d+\.\d+$/);
});

test('production cannot silently fall back to source modules', () => {
  const manifest = readManifest();
  assert.equal(manifest.modes.production, 'published');
  assert.equal(manifest.modes.development, 'source');
});
