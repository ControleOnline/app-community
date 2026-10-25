// Keep the local header experiment reproducible without overwriting other edits.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const patch = require('../patches/manager-header.json');
const root = path.resolve(__dirname, '..', 'node_modules', patch.package);
const target = path.join(root, patch.file);
const hash = source => crypto.createHash('sha256').update(source).digest('hex');
let source = fs.readFileSync(target, 'utf8');
if (JSON.parse(fs.readFileSync(path.join(root, 'package.json'))).version !== patch.version)
  throw Error('Review company header patch: package version changed.');
const downstream = require('../patches/single-item.json').files.find(e => e.package === patch.package && e.file === patch.file && e.before === patch.after);
if (hash(source) !== patch.after && !(downstream && hash(source) === downstream.after)) {
  if (hash(source) !== patch.before) throw Error('Company selector has unrelated changes; nothing overwritten.');
  for (const [before, after] of patch.replacements) {
    if (source.split(before).length !== 2) throw Error('Company header patch anchor changed.');
    source = source.replace(before, after);
  }
  if (hash(source) !== patch.after) throw Error('Company header patch checksum mismatch.');
  fs.writeFileSync(target, source);
}
