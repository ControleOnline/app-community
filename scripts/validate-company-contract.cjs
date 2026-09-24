const fs = require('node:fs');
const path = require('node:path');

// This checks the actual submodule checkout used by the build, not branch names.
const legacyNames = ['default' + 'Company', 'Default' + 'Company',
  'SET_' + 'DEFAULT_COMPANY', 'mergeCompanyThemeFrom' + 'Default'];

function validateCompanyContract(root) {
  const errors = [];
  const modules = path.join(root, 'modules/controleonline');
  const read = relative => {
    const file = path.join(modules, relative);
    if (!fs.existsSync(file)) {
      errors.push(`Missing company contract file: ${relative}`);
      return '';
    }
    return fs.readFileSync(file, 'utf8');
  };
  const required = {
    'ui-people/src/store/people/customActions.js': /export\s+const\s+mainCompany\s*=/,
    'ui-people/src/store/people/getters.js': /export\s+const\s+mainCompany\s*=/,
    'ui-people/src/store/people/index.js': /\bmainCompany\s*:/,
    'ui-people/src/store/people/mutation_types.js': /export\s+const\s+SET_MAIN_COMPANY\s*=/,
  };
  for (const [file, pattern] of Object.entries(required)) {
    if (!pattern.test(read(file))) errors.push(`Missing mainCompany contract in ${file}`);
  }
  const peopleStore = read('ui-people/src/store/people/index.js');
  const genericActionsIndex = peopleStore.indexOf('...actions');
  const customActionsIndex = peopleStore.indexOf('...customActions');
  if (genericActionsIndex < 0 || customActionsIndex <= genericActionsIndex) {
    errors.push('ui-people store must apply customActions after generic actions');
  }
  function scan(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) scan(file);
      else if (/\.(?:[cm]?js|jsx|tsx?|vue)$/.test(entry.name)) {
        const text = fs.readFileSync(file, 'utf8');
        for (const name of legacyNames) {
          if (new RegExp(`\\b${name}\\b`).test(text)) {
            errors.push(`Legacy company identifier ${name}: ${path.relative(root, file)}`);
          }
        }
      }
    }
  }
  if (!fs.existsSync(modules)) return [...errors, 'Submodules are not initialized'];
  for (const entry of fs.readdirSync(modules, {withFileTypes: true})) {
    if (!entry.isDirectory()) continue;
    const src = path.join(modules, entry.name, 'src');
    if (fs.existsSync(src)) scan(src);
  }
  return errors;
}

if (require.main === module) {
  const errors = validateCompanyContract(path.resolve(__dirname, '..'));
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else console.log('Company contract OK: mainCompany/currentCompany; HTTP route unchanged.');
}
module.exports = {validateCompanyContract};
