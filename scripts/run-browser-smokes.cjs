const path = require('path');
const {spawnSync} = require('child_process');
const groups = require('./browser-smoke-groups.cjs');

const projectRoot = path.resolve(__dirname, '..');
const playwrightConfig = path.join(projectRoot, 'playwright.config.cjs');
const buildScript = path.join(projectRoot, 'scripts/playwright-web-build.cjs');

const groupByName = new Map(
  groups.flatMap(group => [
    [group.name, group],
    [group.appType.toLowerCase(), group],
  ]),
);

const args = process.argv.slice(2);
let selectedGroup = null;
const forwardedArgs = [];

for (const arg of args) {
  if (!selectedGroup && !arg.startsWith('-')) {
    const normalized = String(arg || '').trim().toLowerCase();

    if (normalized === 'all') {
      selectedGroup = 'all';
      continue;
    }

    const resolvedGroup = groupByName.get(normalized);
    if (resolvedGroup) {
      selectedGroup = resolvedGroup.name;
      continue;
    }
  }

  forwardedArgs.push(arg);
}

const resolvedGroups =
  selectedGroup && selectedGroup !== 'all'
    ? [groupByName.get(selectedGroup)]
    : groups;

if (resolvedGroups.some(group => !group)) {
  console.error('Unknown browser smoke group. Use manager, delivery, pos, or all.');
  process.exit(1);
}

const runCommand = (command, commandArgs, env) => {
  const result = spawnSync(command, commandArgs, {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
};

for (const group of resolvedGroups) {
  const outputDir = path.join('.playwright-web', group.name);
  const env = {
    ...process.env,
    PLAYWRIGHT_APP_TYPE: group.appType,
    PLAYWRIGHT_WEB_OUTPUT_DIR: outputDir,
  };

    console.log(`\n=== Building ${group.name} browser export (${group.appType}) ===`);
    runCommand(process.execPath, [buildScript], env);

    console.log(`=== Running ${group.name} browser smoke tests ===`);
    runCommand('npx', [
    'playwright',
    'test',
    '--config',
    playwrightConfig,
    group.testDir,
    ...forwardedArgs,
  ], env);
}
