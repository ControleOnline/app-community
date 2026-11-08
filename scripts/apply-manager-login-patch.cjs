// Local additive adapter until the optional identifier props can be versioned upstream.
// Defaults in ui-login stay unchanged for the baseline and other applications.
const fs = require('node:fs');
const path = require('node:path');
const patch = require('../patches/ui-login-identifier.json');
const root = path.resolve(__dirname, '..');
const roots = [path.join(root,'node_modules/@controleonline/ui-login'), path.join(root,'modules/controleonline/ui-login')];
for (const moduleRoot of roots) {
  const target = path.join(moduleRoot, patch.file);
  if (!fs.existsSync(target)) continue;
  let source = fs.readFileSync(target,'utf8');
  for (const [before, after, previous] of patch.replacements) {
    if (source.includes(after)) continue;
    const from = previous && source.includes(previous) ? previous : before;
    if (source.split(from).length !== 2) throw new Error(`ui-login changed: cannot safely apply local identifier adapter at ${target}`);
    source = source.replace(from,after);
  }
  fs.writeFileSync(target,source);
}
