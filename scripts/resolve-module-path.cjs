const path = require('node:path');

function resolveModulePath(projectRoot, packageName, production) {
  if (production) return path.resolve(projectRoot, 'node_modules', ...packageName.split('/'));
  return path.resolve(projectRoot, 'modules', 'controleonline', packageName.replace('@controleonline/', ''));
}

module.exports = { resolveModulePath };
