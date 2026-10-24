// Local shared-module overlay: validate every version/hash before any write.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const {files} = require('../patches/bottom-navigation.json');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const changes = [];
for (const file of files) {
  const moduleRoot = path.join(root, 'node_modules', file.package);
  if (JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'))).version !== file.version)
    throw Error(`${file.package} version changed; review the shared navigation overlay.`);
  const target = path.join(moduleRoot, file.file);
  const current = fs.existsSync(target) ? hash(fs.readFileSync(target)) : null;
  const payload = fs.readFileSync(path.join(root, 'patches', file.payload));
  if (hash(payload) !== file.after) throw Error('Navigation payload hash mismatch; nothing was written.');
  if (current === file.after) continue;
  if (current !== file.before && !file.previousAfter?.includes(current)) throw Error('Navigation has unrelated changes; nothing was overwritten.');
  changes.push({target, payload});
}
for (const {target, payload} of changes) {
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, payload);
}
