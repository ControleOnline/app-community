// Temporary local dependency patch until ui-common publishes the object-token API.
const fs = require('node:fs');
const path = require('node:path');
const patches = require('../patches/ui-common-object-theme.json');
const root = path.resolve(__dirname, '..');
for (const packageRoot of ['node_modules/@controleonline/ui-common', 'modules/controleonline/ui-common']) {
  const changes = patches.map(patch => ({...patch, target:path.join(root,packageRoot,patch.path)}))
    .filter(patch => fs.existsSync(patch.target));
  for (const patch of changes) {
    const source = fs.readFileSync(patch.target,'utf8');
    if (source !== patch.before && source !== patch.after) throw new Error(`Object theme patch needs review: ${patch.target}`);
  }
  for (const patch of changes) {
    if (fs.readFileSync(patch.target,'utf8') === patch.before) fs.writeFileSync(patch.target,patch.after);
  }
}
