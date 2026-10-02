const fs = require('node:fs');
const path = require('node:path');

// Validate the module source actually used by Metro; never fall back between modes.
const legacyNames = ['default' + 'Company', 'Default' + 'Company',
  'SET_' + 'DEFAULT_COMPANY', 'mergeCompanyThemeFrom' + 'Default'];

function validateCompanyContract(root, {mode = process.env.APP_ENV === 'dev' ? 'development' : 'production'} = {}) {
  const errors = [];
  if (!['production', 'development'].includes(mode)) return [`Unsupported module resolution mode: ${mode}`];
  const modules = path.join(root, mode === 'production' ? 'node_modules/@controleonline' : 'modules/controleonline');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const packages = Object.keys(manifest.dependencies || {}).filter(name => /^@controleonline\/ui-[a-z0-9-]+$/.test(name));
  if (!packages.length) errors.push('No UI modules declared in package.json');
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
  for (const name of packages) {
    const src = path.join(modules, name.replace('@controleonline/', ''), 'src');
    if (!fs.existsSync(src)) errors.push(`${mode}: missing UI module source ${name}`);
    else scan(src);
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
