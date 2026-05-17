const fs = require('fs');
const { execFileSync } = require('child_process');

const submodulePath = 'modules/controleonline/ui-contracts';
const expectedPointer = 'f7422babca14d5ac5a6a8132206ba39a42d63490';
const gitmodules = fs.readFileSync('.gitmodules', 'utf8');

if (!gitmodules.includes(submodulePath)) {
  throw new Error('ui-contracts submodule is not registered in .gitmodules');
}

function readRecordedGitlinkPointer() {
  let gitlinkLine = '';

  try {
    gitlinkLine = execFileSync('git', ['ls-tree', 'HEAD', submodulePath], {
      encoding: 'utf8',
    }).trim();
  } catch (error) {
    throw new Error(
      `Unable to read the recorded gitlink for ${submodulePath}: ${error.message}`
    );
  }

  if (!gitlinkLine) {
    throw new Error(`No gitlink found for ${submodulePath}`);
  }

  const match = gitlinkLine.match(/^(\d+)\s+(\w+)\s+([0-9a-f]{40})\t/);

  if (!match) {
    throw new Error(`Invalid gitlink entry for ${submodulePath}: ${gitlinkLine}`);
  }

  const [, mode, type, sha] = match;

  if (mode !== '160000' || type !== 'commit') {
    throw new Error(`Unexpected gitlink metadata for ${submodulePath}: ${gitlinkLine}`);
  }

  return sha;
}

const recordedPointer = readRecordedGitlinkPointer();

if (recordedPointer !== expectedPointer) {
  throw new Error(
    `ui-contracts pointer mismatch: expected ${expectedPointer}, got ${recordedPointer}`
  );
}

console.log(`ui-contracts module pointer matches ${expectedPointer}`);