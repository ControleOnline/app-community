// Local development adapter; published browser domains keep tenant discovery.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const before = `  if (runtimeHost) return runtimeHost;
  return tryParseHost(configuredDomain);`;
const after = `  // A loopback URL identifies the local server, not the tenant under test.
  const configuredHost = tryParseHost(configuredDomain);
  if (/^(localhost|127\\.0\\.0\\.1|\\[::1\\])(?::\\d+)?$/i.test(runtimeHost) && configuredHost) {
    return configuredHost;
  }
  if (runtimeHost) return runtimeHost;
  return configuredHost;`;
for (const moduleRoot of ['node_modules/@controleonline/ui-common', 'modules/controleonline/ui-common']) {
  const target = path.join(root, moduleRoot, 'src/utils/appDomain.js');
  if (!fs.existsSync(target)) continue;
  const source = fs.readFileSync(target, 'utf8');
  if (source.includes(after)) continue;
  if (source.split(before).length !== 2) throw new Error(`Unexpected app-domain resolver: ${target}`);
  fs.writeFileSync(target, source.replace(before, after));
  console.log(`Applied local app-domain adapter: ${moduleRoot}`);
}
