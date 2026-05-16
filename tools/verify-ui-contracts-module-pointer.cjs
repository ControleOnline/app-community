const fs = require('fs');
const { execFileSync } = require('child_process');

const submodulePath = 'modules/controleonline/ui-contracts';
const gitmodules = fs.readFileSync('.gitmodules', 'utf8');

if (!gitmodules.includes(submodulePath)) {
  throw new Error('ui-contracts submodule is not registered in .gitmodules');
}

const gitlinkLine = execFileSync(
  'git',
  ['ls-tree', 'HEAD', submodulePath],
  { encoding: 'utf8' }
).trim();

if (!gitlinkLine) {
  throw new Error(`No gitlink found for ${submodulePath}`);
}

const expectedPointer = gitlinkLine.split(/\s+/)[2];

const actualPointer = execFileSync(
  'git',
  ['-C', submodulePath, 'rev-parse', 'HEAD'],
  { encoding: 'utf8' }
).trim();

if (actualPointer !== expectedPointer) {
  throw new Error(
    `ui-contracts submodule HEAD mismatch: expected ${expectedPointer}, got ${actualPointer}`
  );
}

console.log(`ui-contracts submodule is pinned to ${expectedPointer}`);