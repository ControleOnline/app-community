const fs = require('fs');
const { execFileSync } = require('child_process');

const gitmodules = fs.readFileSync('.gitmodules', 'utf8');

if (!gitmodules.includes('modules/controleonline/ui-contracts')) {
  throw new Error('ui-contracts submodule is not registered in .gitmodules');
}

const expectedPointer = 'f7422babca14d5ac5a6a8132206ba39a42d63490';
const gitlinkLine = execFileSync(
  'git',
  ['-C', 'modules/controleonline/ui-contracts', 'rev-parse', 'HEAD'],
  { encoding: 'utf8' }
).trim();

if (gitlinkLine !== expectedPointer) {
  throw new Error(
    `ui-contracts submodule HEAD mismatch: expected ${expectedPointer}, got ${gitlinkLine}`
  );
}

console.log(`ui-contracts submodule is pinned to ${expectedPointer}`);
