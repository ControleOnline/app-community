const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
function run(t, {bridge, submodule} = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wiki-reference-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  fs.mkdirSync(path.join(root, 'scripts'));
  fs.mkdirSync(path.join(root, 'docs'));
  for (const file of ['validate-smoke-flow-catalog', 'browser-smoke-flows', 'browser-smoke-groups']) {
    fs.copyFileSync(path.join(__dirname, `${file}.cjs`), path.join(root, `scripts/${file}.cjs`));
  }
  if (bridge !== undefined) fs.writeFileSync(path.join(root, 'docs/wiki.md'), bridge);
  if (submodule !== undefined) fs.writeFileSync(path.join(root, '.gitmodules'), submodule);
  return spawnSync(process.execPath, [path.join(root, 'scripts/validate-smoke-flow-catalog.cjs')], {encoding: 'utf8'});
}
test('canonical wiki bridge validates all business flows without submodules', t => {
  const result = run(t, {bridge: 'https://github.com/ControleOnline/app-community/wiki\n'});
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Validated 11 browser smoke flows/);
});
test('a different wiki is rejected even when the legacy submodule is valid', t => {
  const result = run(t, {bridge: 'https://github.com/ControleOnline/ui-products/wiki', submodule: '[submodule "docs/wiki"]\npath = docs/wiki\nurl = https://github.com/ControleOnline/app-community.wiki.git\n'});
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /must reference the canonical/);
});
test('legacy canonical submodule remains supported', t => {
  assert.equal(run(t, {submodule: '[submodule "docs/wiki"]\npath = docs/wiki\nurl = https://github.com/ControleOnline/app-community.wiki.git\n'}).status, 0);
});
test('missing documentation reference remains a failure', t => {
  assert.notEqual(run(t).status, 0);
});
