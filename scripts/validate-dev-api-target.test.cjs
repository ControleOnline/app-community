const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const script = path.join(__dirname, 'validate-dev-api-target.cjs');
function run(api, socket, domain = 'https://dev.controleonline.com') {
  return spawnSync(process.execPath, [script], {encoding: 'utf8', env: {...process.env, DEPLOY_DOMAIN: domain, DEPLOY_API: api, DEPLOY_SOCKET: socket}});
}
test('dev exports accept the canonical API and WebSocket', () => {
  assert.equal(run('https://dd.controleonline.com', 'wss://dd.controleonline.com').status, 0);
});
test('the old hosting API is rejected before publication', () => {
  const result = run('https://d.controleonline.com', 'wss://dd.controleonline.com');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Dev export requires dd/);
});
test('the old WebSocket and missing configuration are rejected', () => {
  assert.notEqual(run('https://dd.controleonline.com', 'wss://d.controleonline.com').status, 0);
  assert.notEqual(run('', '').status, 0);
});
test('staging and production retain their own endpoint policy', () => {
  assert.equal(run('https://s.controleonline.com', 'wss://s.controleonline.com', 'https://staging.controleonline.com').status, 0);
  assert.equal(run('https://api.controleonline.com', 'wss://api.controleonline.com', 'https://admin.controleonline.com').status, 0);
});
test('the actual export action invokes the guard before generating config', () => {
  const action = fs.readFileSync(path.join(__dirname, '../.github/actions/web-export-deploy/action.yml'), 'utf8');
  const guard = action.indexOf('node scripts/validate-dev-api-target.cjs');
  assert.ok(guard >= 0 && guard < action.indexOf('name: Creating Config'));
  assert.match(action, /DEPLOY_API: \$\{\{ inputs\.api_entrypoint \}\}/);
  assert.match(action, /DEPLOY_SOCKET: \$\{\{ inputs\.socket \}\}/);
  assert.match(action, /DEPLOY_DOMAIN: \$\{\{ inputs\.domain \}\}/);
});
