/**
 * Regression #1101: FTP deploys must not exclude node_modules, otherwise
 * dist/assets/node_modules/**\/*.ttf (icon fonts) never reach the server.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const FILES = ['web-deploy-production-app-lavego.yml'];

// #1687: the shared web export/deploy action (admin, manager, shop, staging, dev) had the same exclude.
const TARGETS = [
  ...FILES.map(name => ['.github/workflows', name]),
  ['.github/actions/web-export-deploy', 'action.yml'],
];

describe('FTP deploys keep icon fonts (#1101, #1687)', () => {
  TARGETS.forEach(([dir, name]) => {
    it(`${dir}/${name} does not exclude node_modules from the upload`, () => {
      const yml = fs.readFileSync(path.join(ROOT, dir, name), 'utf8');
      const active = yml.split('\n').filter(line => !/^\s*#/.test(line));
      expect(active.filter(line => /^\s*\*\*\/node_modules\/\*\*\s*$/.test(line))).toEqual([]);
      expect(active.some(line => /^\s*\*\*\/\.git\*\/\*\*\s*$/.test(line))).toBe(true);
    });
  });
});
