const fs = require('fs');
const path = require('path');
const packageConfig = require('../package.json');
const root = path.resolve(__dirname, '..');
const mode = process.env.APP_ENV === 'dev' ? 'source' : 'published';
const moduleRoot = path.resolve(root, packageConfig.moduleResolution[mode]);
const packageNames = Object.keys({ ...packageConfig.dependencies, ...packageConfig.devDependencies })
  .filter((name) => /^@controleonline\/ui-[a-z0-9-]+$/i.test(name));
const missing = packageNames.filter((name) =>
  !fs.existsSync(path.join(moduleRoot, name.slice('@controleonline/'.length), 'package.json'))
);

if (missing.length > 0) {
  throw new Error(`${mode} UI modules are missing: ${missing.join(', ')}`);
}

console.log(`${packageNames.length} UI modules resolve from ${moduleRoot} (${mode}).`);
