import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import {execFileSync} from 'child_process';
const root = path.resolve(__dirname, '../../..');
const manifest = require('../../../patches/admin-bootstrap.json');
const reconciliation = require('../../../patches/manager-package-reconciliation.json');
const hash = x => crypto.createHash('sha256').update(x).digest('hex');
const original = file => {
  let text = fs.readFileSync(path.join(root, 'node_modules', file.package, file.file), 'utf8');
  for (const [before, after] of [...file.replacements].reverse()) text = text.replace(after, before);
  expect(hash(text)).toBe(file.before);
  return text;
};
const fixture = () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'co-bootstrap-patch-'));
  fs.mkdirSync(path.join(folder, 'scripts')); fs.mkdirSync(path.join(folder, 'patches'));
  fs.copyFileSync(path.join(root, 'scripts/apply-admin-bootstrap-patch.cjs'), path.join(folder, 'scripts/apply.cjs'));
  fs.writeFileSync(path.join(folder, 'patches/admin-bootstrap.json'), JSON.stringify(manifest));
  fs.writeFileSync(path.join(folder, 'patches/manager-package-reconciliation.json'), JSON.stringify(reconciliation));
  for (const file of manifest.files) {
    const moduleRoot = path.join(folder, 'node_modules', file.package);
    const target = path.join(moduleRoot, file.file);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(path.join(moduleRoot, 'package.json'), JSON.stringify({version: file.version}));
    fs.writeFileSync(target, original(file));
  }
  return folder;
};

it('applies the exact overlay and is idempotent on a fresh audited composition', () => {
  const folder = fixture();
  try {
    for (let run = 0; run < 2; run++) {
      execFileSync(process.execPath, [path.join(folder, 'scripts/apply.cjs')]);
      for (const file of manifest.files) expect(hash(fs.readFileSync(path.join(folder, 'node_modules', file.package, file.file)))).toBe(file.after);
    }
  } finally {fs.rmSync(folder, {recursive: true, force: true});}
});
it('refuses unrelated changes before writing any file', () => {
  const folder = fixture(); const file = manifest.files[manifest.files.length - 1];
  const target = path.join(folder, 'node_modules', file.package, file.file);
  fs.appendFileSync(target, '\n// unrelated local work\n');
  try {
    expect(() => execFileSync(process.execPath, [path.join(folder, 'scripts/apply.cjs')], {stdio: 'pipe'})).toThrow();
    const first = manifest.files[0];
    expect(hash(fs.readFileSync(path.join(folder, 'node_modules', first.package, first.file)))).toBe(first.before);
    expect(fs.readFileSync(target, 'utf8')).toContain('unrelated local work');
  } finally {fs.rmSync(folder, {recursive: true, force: true});}
});
