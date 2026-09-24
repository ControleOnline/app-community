const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'config', 'module-resolution.json');

function readManifest() {
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

function packagePath(packageName, mode) {
  const manifest = readManifest();
  if (mode === 'development') return path.join(root, manifest.sourceRoot, packageName.replace('@controleonline/', ''));
  return path.join(root, 'node_modules', ...packageName.split('/'));
}

function validateManifest(manifest) {
  const errors = [];
  if (manifest.modes?.development !== 'source' || manifest.modes?.production !== 'published') errors.push('modes must map development to source and production to published');
  if (!manifest.requiredPackages?.length) errors.push('requiredPackages must not be empty');
  for (const packageName of manifest.requiredPackages || []) if (!/^@controleonline\/[a-z0-9-]+$/.test(packageName)) errors.push(`invalid package name: ${packageName}`);
  for (const [packageName, version] of Object.entries(manifest.publishedPackages || {})) {
    if (!manifest.requiredPackages.includes(packageName)) errors.push(`${packageName} is published but not required`);
    if (!/^\d+\.\d+\.\d+$/.test(version)) errors.push(`${packageName} must use an exact semver version, got ${version}`);
  }
  return errors;
}

function validateMode(mode) {
  const manifest = readManifest();
  const errors = validateManifest(manifest);
  if (!['development', 'production'].includes(mode)) {
    errors.push(`unsupported module resolution mode: ${mode}`);
    return errors;
  }
  for (const packageName of manifest.requiredPackages) {
    const resolvedPath = packagePath(packageName, mode);
    if (!fs.existsSync(resolvedPath)) {
      errors.push(`${mode}: missing ${packageName} at ${path.relative(root, resolvedPath)}`);
      continue;
    }
    if (mode === 'production') {
      const packageJsonPath = path.join(resolvedPath, 'package.json');
      if (!fs.existsSync(packageJsonPath)) { errors.push(`production: ${packageName} has no package.json`); continue; }
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const expected = manifest.publishedPackages[packageName];
      if (!expected) errors.push(`production: ${packageName} is not pinned in publishedPackages`);
      else if (packageJson.version !== expected) errors.push(`production: ${packageName} expected ${expected}, found ${packageJson.version}`);
    }
  }
  return errors;
}

if (require.main === module) {
  const modeArg = process.argv.find((arg) => arg.startsWith('--mode='));
  const mode = modeArg ? modeArg.slice('--mode='.length) : process.env.MODULE_RESOLUTION_MODE || 'development';
  const errors = validateMode(mode);
  if (errors.length) {
    console.error(`Module contract failed for ${mode}:`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else console.log(`Module contract passed for ${mode}`);
}

module.exports = { packagePath, readManifest, validateManifest, validateMode };
