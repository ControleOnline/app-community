/**
 * Regression #1101: FTP deploys must not exclude node_modules, otherwise
 * dist/assets/node_modules/**\/*.ttf (icon fonts) never reach the server.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const FILES = ['web-deploy-production-app-lavego.yml'];

describe('Lave-Go FTP deploy keeps icon fonts (#1101)', () => {
  FILES.forEach(name => {
    it(`${name} does not exclude node_modules from the upload`, () => {
      const yml = fs.readFileSync(path.join(ROOT, '.github/workflows', name), 'utf8');
      const active = yml.split('\n').filter(line => !/^\s*#/.test(line));
      expect(active.filter(line => /^\s*\*\*\/node_modules\/\*\*\s*$/.test(line))).toEqual([]);
      expect(active.some(line => /^\s*\*\*\/\.git\*\/\*\*\s*$/.test(line))).toBe(true);
    });
  });
});
