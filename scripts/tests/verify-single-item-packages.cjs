// Release check: installed stable packages and consumer adapters must agree.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const manifest = require('../../package.json');
for (const entry of require('../../patches/single-item.json').files) {
  assert.match(entry.version, /^\d+\.\d+\.\d+$/);
  assert.equal(manifest.dependencies[entry.package], entry.version);
  const moduleRoot = path.join(root, 'node_modules', entry.package);
  assert.equal(JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'))).version, entry.version);
  assert.equal(hash(fs.readFileSync(path.join(moduleRoot, entry.file))), entry.after);
}
const checkout = fs.readFileSync(path.join(root, 'node_modules/@controleonline/ui-orders/src/react/pages/checkout/Checkout.js'), 'utf8');
assert(!checkout.includes('@controleonline/../../src/components/single-item/CompanySwitchContext'));
assert(fs.existsSync(path.join(root, 'node_modules/@controleonline/ui-orders/src/react/contexts/CompanySwitchContext.js')));
console.log('Single Item published package and adapter contracts passed.');
