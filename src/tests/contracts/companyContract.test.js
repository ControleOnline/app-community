const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {validateCompanyContract} = require('../../../scripts/validate-company-contract.cjs');
const {afterEach, describe, expect, it} = global;
const roots = [];
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'company-contract-'));
  roots.push(root);
  const dir = path.join(root, 'modules/controleonline/ui-people/src/store/people');
  fs.mkdirSync(dir, {recursive: true});
  const files = {
    'customActions.js': "export const mainCompany = () => fetch('/people/company/default');",
    'getters.js': 'export const mainCompany = state => state.mainCompany;',
    'index.js': 'export default {state: {mainCompany: {}, currentCompany: {}}, actions: {...actions, ...customActions}};',
    'mutation_types.js': "export const SET_MAIN_COMPANY = 'SET_MAIN_COMPANY';",
  };
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), text);
  return {root, dir};
}
afterEach(() => { for (const root of roots.splice(0)) fs.rmSync(root, {recursive: true, force: true}); });
describe('build company contract gate', () => {
  it('accepts the unchanged HTTP route and unrelated Default components', () => {
    const {root, dir} = fixture();
    fs.writeFileSync(path.join(dir, 'other.js'), 'const DefaultTable = {}; const defaultTheme = {};');
    expect(validateCompanyContract(root)).toEqual([]);
  });
  it('rejects the old store before it can be published with new consumers', () => {
    const {root, dir} = fixture();
    fs.writeFileSync(path.join(dir, 'customActions.js'), 'export const default' + 'Company = () => {};');
    expect(validateCompanyContract(root).join('\n')).toContain('Missing mainCompany contract');
  });
  it('rejects obsolete reads in consumers even with the corrected store', () => {
    const {root, dir} = fixture();
    fs.writeFileSync(path.join(dir, 'consumer.js'), 'const company = getters.default' + 'Company;');
    expect(validateCompanyContract(root).join('\n')).toContain('consumer.js');
  });
  it('rejects an uninitialized checkout', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'company-contract-'));
    roots.push(root);
    expect(validateCompanyContract(root).join('\n')).toContain('Submodules are not initialized');
  });
});
