// Validate every source before applying the installed ui-orders corrections.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const writes = [];
for (const entry of require('../patches/single-item.json').files) {
  const moduleRoot = path.join(root, 'node_modules', entry.package);
  if (JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'))).version !== entry.version)
    throw Error(`Review Single Item correction for changed ${entry.package} version.`);
  const target = path.join(moduleRoot, entry.file);
  const current = fs.existsSync(target) ? hash(fs.readFileSync(target)) : null;
  const payload = fs.readFileSync(path.join(root, 'patches', entry.payload));
  if (hash(payload) !== entry.after) throw Error('Single Item payload checksum differs.');
  if (current === entry.after) continue;
  if (current !== entry.before) throw Error(`Unrelated changes in ${target}; no files overwritten.`);
  writes.push({target, payload});
}
for (const {target, payload} of writes) { fs.mkdirSync(path.dirname(target), {recursive:true}); fs.writeFileSync(target, payload); }
console.log(`Single Item corrections verified; ${writes.length} files applied.`);
