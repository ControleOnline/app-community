const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const packagePathname = path.join(root, 'package.json');

function readPackageManifest() {
  return JSON.parse(fs.readFileSync(packagePathname, 'utf8'));
}

function requiredPackages(packageManifest = readPackageManifest()) {
  return Object.keys(packageManifest.dependencies || {}).filter((name) => /^@controleonline\/ui-[a-z0-9-]+$/.test(name));
}

function modulePath(packageName, mode) {
  if (mode === 'development') return path.join(root, 'modules', 'controleonline', packageName.replace('@controleonline/', ''));
  return path.join(root, 'node_modules', ...packageName.split('/'));
}

function validatePackageManifest(packageManifest) {
  const errors = [];
  const packages = requiredPackages(packageManifest);
  if (!packages.length) errors.push('package.json dependencies must include at least one @controleonline/ui-* package');
  for (const packageName of packages) {
    const version = packageManifest.dependencies[packageName];
    if (!/^\d+\.\d+\.\d+$/.test(version)) errors.push(`${packageName} must use an exact semver version in dependencies, got ${version}`);
  }
  return errors;
}

function validateMode(mode) {
  const packageManifest = readPackageManifest();
  const packages = requiredPackages(packageManifest);
  const errors = validatePackageManifest(packageManifest);
  if (!['development', 'production'].includes(mode)) {
    errors.push(`unsupported module resolution mode: ${mode}`);
    return errors;
  }
  for (const packageName of packages) {
    const resolvedPath = modulePath(packageName, mode);
    if (!fs.existsSync(resolvedPath)) {
      errors.push(`${mode}: missing ${packageName} at ${path.relative(root, resolvedPath)}`);
      continue;
    }
    if (mode === 'production') {
      const packageJsonPath = path.join(resolvedPath, 'package.json');
      if (!fs.existsSync(packageJsonPath)) { errors.push(`production: ${packageName} has no package.json`); continue; }
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const expected = packageManifest.dependencies[packageName];
      if (packageJson.version !== expected) errors.push(`production: ${packageName} expected ${expected} from package.json, found ${packageJson.version}`);
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

module.exports = { modulePath, readPackageManifest, requiredPackages, validatePackageManifest, validateMode };
