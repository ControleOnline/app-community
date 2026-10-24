// Local, reversible overlay for the published bootstrap. Validate all files before writing.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const changes = [];
for (const file of require('../patches/admin-bootstrap.json').files) {
  const moduleRoot = path.join(root, 'node_modules', file.package);
  if (JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'))).version !== file.version)
    throw Error(`Review ADMIN bootstrap overlay: ${file.package} version changed.`);
  const target = path.join(moduleRoot, file.file);
  let bytes = fs.readFileSync(target);
  if (hash(bytes) === file.after) continue;
  const previous = file.previous?.find(item => item.after === hash(bytes));
  if (previous) {
    let source = bytes.toString();
    for (const [before, after] of [...previous.replacements].reverse()) {
      if (source.split(after).length !== 2) throw Error('Previous bootstrap overlay changed; no files overwritten.');
      source = source.replace(after, before);
    }
    bytes = Buffer.from(source);
    if (hash(bytes) !== file.before) throw Error('Previous bootstrap base checksum mismatch; no files overwritten.');
  }
  if (hash(bytes) !== file.before) {
    const prerequisite = require('../patches/manager-package-reconciliation.json').files.find(item =>
      item.package === file.package && item.file === file.file && item.version === file.version && item.after === file.before);
    if (!prerequisite || hash(bytes) !== prerequisite.before)
      throw Error(`Unrelated changes in ${file.package}/${file.file}; no files overwritten.`);
    bytes = fs.readFileSync(path.join(root, 'patches', prerequisite.payload));
    if (hash(bytes) !== file.before) throw Error('Bootstrap prerequisite checksum mismatch; no files overwritten.');
  }
  let source = bytes.toString();
  for (const [before, after] of file.replacements) {
    if (source.split(before).length !== 2) throw Error('Bootstrap patch anchor changed; no files overwritten.');
    source = source.replace(before, after);
  }
  if (hash(source) !== file.after) throw Error('Bootstrap overlay checksum mismatch; no files overwritten.');
  changes.push({target, source});
}
for (const {target, source} of changes) fs.writeFileSync(target, source);
