const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {validateCompanyContract} = require('./validate-company-contract.cjs');

function fixture(t, mode = 'production') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'company-contract-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({dependencies: {'@controleonline/ui-people': '1.0.1', '@controleonline/ui-orders': '1.0.1'}}));
  const modules = path.join(root, mode === 'production' ? 'node_modules/@controleonline' : 'modules/controleonline');
  const store = path.join(modules, 'ui-people/src/store/people');
  fs.mkdirSync(store, {recursive: true});
  for (const [file, text] of Object.entries({'customActions.js': 'export const mainCompany = () => {};', 'getters.js': 'export const mainCompany = () => {};', 'index.js': 'export default {mainCompany: {}};', 'mutation_types.js': 'export const SET_MAIN_COMPANY = 1;'})) fs.writeFileSync(path.join(store, file), text);
  fs.mkdirSync(path.join(modules, 'ui-orders/src'), {recursive: true});
  return {root, modules};
}

test('production validates the installed npm modules without source submodules', t => {
  const {root} = fixture(t);
  assert.deepEqual(validateCompanyContract(root, {mode: 'production'}), []);
});
test('development explicitly validates source modules', t => {
  const {root} = fixture(t, 'development');
  assert.deepEqual(validateCompanyContract(root, {mode: 'development'}), []);
});
test('production cannot fall back to a clean source when a published module is missing', t => {
  const {root} = fixture(t, 'development');
  assert.match(validateCompanyContract(root, {mode: 'production'}).join('\n'), /missing.*ui-people/i);
});
test('legacy identifiers in installed production code still fail the contract', t => {
  const {root, modules} = fixture(t);
  fs.writeFileSync(path.join(modules, 'ui-orders/src/screen.js'), 'const default' + 'Company = 1;');
  assert.match(validateCompanyContract(root, {mode: 'production'}).join('\n'), /Legacy company identifier/);
});
