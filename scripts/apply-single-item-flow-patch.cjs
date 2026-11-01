// Local consumer corrections, pinned to the reviewed package sources.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function applySingleItemFlow(root = path.resolve(__dirname, '..')) {
  const writes = [];
  const {files} = JSON.parse(fs.readFileSync(path.join(root, 'patches/single-item-flow.json')));
  for (const source of files) {
    const entry = {...source};
    const moduleRoot = path.join(root, 'node_modules', entry.package);
    const version = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'))).version;
    if (version !== entry.version) {
      const variant = source.variants?.[version];
      if (!variant) throw Error(`Review Single Item flow for ${entry.package} ${version}.`);
      Object.assign(entry, variant);
    }
    const target = path.join(moduleRoot, entry.file);
    const payload = fs.readFileSync(path.join(root, 'patches', entry.payload));
    if (hash(payload) !== entry.after) throw Error(`Single Item flow payload changed: ${entry.payload}`);
    const current = hash(fs.readFileSync(target));
    if (current === entry.after) continue;
    if (current !== entry.before) throw Error(`Unrelated installed changes: ${entry.file}`);
    writes.push({target, payload});
  }
  // Validate all files first, so an unexpected dependency cannot cause a partial update.
  for (const {target, payload} of writes) fs.writeFileSync(target, payload);
  return writes.length;
}
module.exports = {applySingleItemFlow};
if (require.main === module) console.log(`Single Item flow: ${applySingleItemFlow()} files applied.`);
