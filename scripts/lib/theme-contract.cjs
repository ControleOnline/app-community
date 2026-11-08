const fs = require('node:fs');
const path = require('node:path');

function parseThemeMap(markdown) {
  const groups = [];
  const names = new Set();
  const variants = {};
  const legacyKeys = {};
  let group = null;
  for (const line of markdown.split(/\r?\n/)) {
    const heading = /^### ([^#].*)$/.exec(line);
    if (heading) { group = {label: heading[1].trim(), tokens: []}; groups.push(group); }
    const field = /^- `([a-z][a-zA-Z0-9]*)`(?:\s*<!-- (.*?) -->)?\s*$/.exec(line);
    if (!field) continue;
    if (!group) throw new Error('Theme token without a group.');
    if (names.has(field[1])) throw new Error(`Duplicate theme token: ${field[1]}`);
    names.add(field[1]); group.tokens.push(field[1]);
    if(field[2]){
      const metadata=Object.fromEntries(field[2].split(';').map(part=>part.trim().split(/:\s(.+)/).slice(0,2)));
      if (Object.keys(metadata).length === 1 && /^[a-z][a-z0-9-]*$/.test(metadata.legacy || '')) {
        legacyKeys[field[1]] = metadata.legacy;
        continue;
      }
      if(!['base','variant','label','usage'].every(key=>metadata[key]?.trim()))throw new Error(`Incomplete theme variation: ${field[1]}`);
      variants[field[1]]=metadata;
    }
  }
  const populated = groups.filter(item => item.tokens.length);
  if (!populated.length) throw new Error('The theme map contains no object tokens.');
  for(const [token,entry] of Object.entries(variants))if(!names.has(entry.base) || variants[entry.base])throw new Error(`Invalid theme variation base: ${token}`);
  return {groups: populated, names: [...names], variants, legacyKeys};
}

function generateThemeContract(root = path.resolve(__dirname, '../..')) {
  const contract = parseThemeMap(fs.readFileSync(path.join(root, 'docs/themes/themes-map.md'), 'utf8'));
  // Consumption is derived from source; the allowed vocabulary is owned by Markdown.
  const consumed = new Set();
  const directory = path.join(root, 'src/components/manager-preview');
  for (const name of fs.readdirSync(directory).filter(name => name.endsWith('.js'))) {
    const source = fs.readFileSync(path.join(directory, name), 'utf8');
    for (const match of source.matchAll(/\b(?:c|colors|palette)\.([a-zA-Z][a-zA-Z0-9]*)/g)) {
      if (contract.names.includes(match[1])) consumed.add(match[1]);
    }
  }
  contract.managerTokens = [...consumed].sort();
  const output = '// Generated from docs/themes/themes-map.md. Do not edit by hand.\nmodule.exports = '
    + JSON.stringify(contract, null, 2) + ';\n';
  const target = path.join(root, 'src/styles/themeContract.generated.js');
  if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== output) fs.writeFileSync(target, output);
  return contract;
}
module.exports = {parseThemeMap, generateThemeContract};
