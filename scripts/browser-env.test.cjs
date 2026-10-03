const test = require('node:test');
const assert = require('node:assert/strict');
const {browserEnvSource} = require('./browser-env.cjs');
const source = "const env = {APP_TYPE: 'MANAGER', API_ENTRYPOINT: 'https://api.controleonline.com', SOCKET: 'wss://api.controleonline.com', OTHER: 7}; module.exports = {env};";

test('browser export targets the same API origin intercepted by fixtures', () => {
  const result = browserEnvSource(source, 'POS', 'https://s.controleonline.com/');
  assert.match(result, /APP_TYPE: "POS"/);
  assert.match(result, /API_ENTRYPOINT: "https:\/\/s.controleonline.com"/);
  assert.match(result, /SOCKET: "wss:\/\/s.controleonline.com"/);
  assert.match(result, /OTHER: 7/);
});
test('browser environment requires an explicit mock API origin', () => {
  for (const api of ['', 'file:///tmp/mock', 'https://user:password@example.com']) assert.throws(() => browserEnvSource(source, 'POS', api), /API_PLAYWRIGHT/);
});
test('changed environment format fails instead of running against the old API', () => {
  assert.throws(() => browserEnvSource("APP_TYPE: 'MANAGER'", 'POS', 'https://s.controleonline.com'), /API_ENTRYPOINT/);
});
