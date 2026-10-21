const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const names = /compact|Compact|headerLogoProtocol|DefaultCompanyHeaderLogo|useDefaultTableStoreSync|providerEffects|DefaultProviderAuthority|deviceConfigBootstrap|mercadoLivreIntegrationHelpers|DefaultTable\.(group[123]\.)?test\.js|DefaultTable\.defaultAppearance|OrderHistoryPage\.test\.js|DefaultTableCards\.layout|DefaultTableToolbar\.waiter/;
function discover(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? discover(file)
      : /\.test\.[cm]?jsx?$/.test(entry.name) && names.test(entry.name) ? [file] : [];
  });
}
const tests = ['ui-default', 'ui-orders', 'ui-layout', 'ui-common'].flatMap(name =>
  discover(path.join(root, 'node_modules/@controleonline', name, 'src/tests')));
if (!tests.length) throw new Error('No published compact tests found');
const env = {...process.env};
delete env.CONTROLEONLINE_MODULES_ROOT;
// Published modules include both node:test and Jest suites. Each must run in
// its own runner; executing node:test inside Jest reports an empty Jest suite.
const nodeTests = tests.filter(file => /(?:require\(['"]node:test['"]\)|from ['"]node:test['"])/.test(fs.readFileSync(file, 'utf8')));
const jestTests = tests.filter(file => !nodeTests.includes(file));
for (const args of [
  ...(jestTests.length ? [[path.join(root, 'node_modules/jest/bin/jest.js'),
    '--config', path.join(root, 'jest.compact.config.cjs'), '--maxWorkers=2', '--runTestsByPath', ...jestTests]] : []),
  ...(nodeTests.length ? [['--test', '--test-concurrency=1', ...nodeTests]] : []),
]) {
  const result = spawnSync(process.execPath, args, {cwd: root, env, stdio: 'inherit'});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
