const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');

it.each([0, 1])('uses the fixture API even when APP_TYPE is unchanged and restores config (exit %s)', status => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'company-smoke-build-'));
  fs.mkdirSync(path.join(root, 'config'));
  fs.mkdirSync(path.join(root, 'output'));
  const config = path.join(root, 'config/env.local.js');
  const original = "module.exports = {env: {APP_TYPE: 'MANAGER', API_ENTRYPOINT: 'https://production.example', API_PLAYWRIGHT: 'https://fixture.example'}};";
  fs.writeFileSync(config, original);
  let compiled;
  const source = fs.readFileSync(path.resolve(__dirname, '../../../scripts/playwright-web-build.cjs'), 'utf8');
  try {
    const run = () => vm.runInNewContext(source, {
      __dirname: path.join(root, 'scripts'),
      path,
      process: {env: {PLAYWRIGHT_APP_TYPE: 'MANAGER', PLAYWRIGHT_WEB_OUTPUT_DIR: 'output'}, platform: 'linux'},
      require: name => name === 'child_process' ? {spawnSync: () => {
        compiled = fs.readFileSync(config, 'utf8');
        if (status === 0) {
          fs.mkdirSync(path.join(root, 'output'), {recursive: true});
          fs.writeFileSync(path.join(root, 'output', 'index.html'), '<!doctype html>');
        }
        return {status};
      }} : require(name),
    });
    if (status) expect(run).toThrow('Expo web export failed');
    else run();
    expect(compiled).toContain('API_ENTRYPOINT: "https://fixture.example"');
    expect(fs.readFileSync(config, 'utf8')).toBe(original);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});
