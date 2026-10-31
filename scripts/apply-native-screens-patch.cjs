// Local backport of upstream UI dispatch; preserve unknown dependency changes.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const patch = require('../patches/native-screens-ui-thread.json');
const moduleRoot = path.join(root, 'node_modules', patch.package);
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
if (JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'))).version !== patch.version) {
  throw Error('react-native-screens version changed; review the native UI dispatch backport.');
}
const target = path.join(moduleRoot, patch.file);
const payload = fs.readFileSync(path.join(root, 'patches', patch.payload));
const current = hash(fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n'));
if (hash(payload) !== patch.after) {
  console.warn('Native screens payload hash mismatch; nothing was written.');
} else if (current !== patch.after) {
  if (current !== patch.before) {
    console.warn('Native screens has unrelated changes; nothing was overwritten.');
  } else {
    fs.writeFileSync(target, payload);
  }
}
