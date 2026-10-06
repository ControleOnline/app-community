const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const YAML = require('yaml');

// npm 10 can report "Exit handler never called" yet exit zero with no Expo.
// Exercise the actual composite action shell with that incomplete install.
for (const [action, stepName] of [
  ['android-build', 'Install dependencies'],
  ['lg-webos-build', 'Install & export web'],
]) {
  test(`${action} rejects an incomplete installation before npx can fetch a different Expo SDK`, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'native-install-'));
    try {
      const bin = path.join(root, 'bin');
      fs.mkdirSync(bin);
      fs.writeFileSync(path.join(bin, 'npm'), '#!/bin/sh\nexit 0\n', { mode: 0o755 });
      fs.writeFileSync(path.join(bin, 'npx'), '#!/bin/sh\ntouch unexpected-expo-fetch\nexit 0\n', { mode: 0o755 });
      const file = path.resolve(__dirname, '..', '.github', 'actions', action, 'action.yml');
      const script = YAML.parse(fs.readFileSync(file, 'utf8')).runs.steps.find(s => s.name === stepName).run;
      const result = spawnSync('/bin/bash', ['--noprofile', '--norc', '-e', '-o', 'pipefail', '-c', script], {
        cwd: root, env: { ...process.env, PATH: `${bin}:${process.env.PATH}` }, encoding: 'utf8',
      });
      assert.notEqual(result.status, 0, 'An incomplete install must fail the action');
      assert.equal(fs.existsSync(path.join(root, 'unexpected-expo-fetch')), false,
        'Do not fetch or run an unreviewed Expo SDK after an incomplete install');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
}

for (const signRelease of ['false', 'true']) {
  test(`Android validation applies production signing only when requested (${signRelease})`, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'native-signing-'));
    try {
      fs.mkdirSync(path.join(root, 'android'));
      fs.writeFileSync(path.join(root, 'android', 'gradlew'), '#!/bin/sh\nprintf "%s\\n" "$@" > ../gradle-args\n', { mode: 0o755 });
      const file = path.resolve(__dirname, '..', '.github', 'actions', 'android-build', 'action.yml');
      let script = YAML.parse(fs.readFileSync(file, 'utf8')).runs.steps.find(s => s.name === 'Gradle build').run;
      script = script.replace(/\$\{\{ inputs\.build_(?:aab|apk) \}\}/g, 'true')
        .replace(/\$\{\{ inputs\.sign_release \}\}/g, signRelease);
      const result = spawnSync('/bin/bash', ['-e', '-o', 'pipefail', '-c', script], { cwd: root, encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      const args = fs.readFileSync(path.join(root, 'gradle-args'), 'utf8').trim().split('\n');
      assert.ok(args.includes('bundleRelease') && args.includes('assembleRelease'));
      assert.equal(args.includes('--init-script'), signRelease === 'true');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
}
