import fs from 'node:fs';
import path from 'node:path';

const patches = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'patches/ui-common-object-theme.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));

test('app type selector overlay keeps the 480px modal in both before and after (#1512)', () => {
  const styles = patches.find(patch => patch.path.endsWith('AppTypeSwitcher.styles.js'));
  for (const source of [styles.before, styles.after]) {
    const panel = /modalPanel: \{([^}]*)\}/.exec(source)?.[1] || '';
    expect(panel).toMatch(/width: 480/);
    expect(panel).toMatch(/maxWidth: '100%'/);
    expect(panel).toMatch(/alignSelf: 'center'/);
  }
});

test('overlay pins follow the ui-common version of the app (#1512)', () => {
  const version = pkg.dependencies['@controleonline/ui-common'];
  const pinned = new Set();
  for (const file of fs.readdirSync(path.join(process.cwd(), 'patches')).filter(name => name.endsWith('.json'))) {
    const walk = (node, owner) => {
      if (Array.isArray(node)) return node.forEach(item => walk(item, owner));
      if (!node || typeof node !== 'object') return;
      const pkgName = node.package || owner;
      if (pkgName === '@controleonline/ui-common' && typeof node.version === 'string') pinned.add(node.version);
      Object.values(node).forEach(value => walk(value, pkgName));
    };
    walk(JSON.parse(fs.readFileSync(path.join(process.cwd(), 'patches', file), 'utf8')), null);
  }
  expect([...pinned]).toEqual([version]);
});
