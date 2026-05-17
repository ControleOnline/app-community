const { execSync } = require('node:child_process');
const assert = require('node:assert/strict');

const expectedPointers = {
  'modules/controleonline/ui-crm': 'eb5bb8cc7eb9c40c71d3bfadb2b0397e35f6bcb5',
  'modules/controleonline/ui-contracts': 'd193cdb7859c8b67b237a66c3bd7aa0be659981a',
};

function readGitlink(path) {
  // Resolve the gitlink SHA directly from the checked-out tree.
  return execSync(`git rev-parse HEAD:${path}`, { encoding: 'utf8' }).trim();
}

for (const [path, expectedSha] of Object.entries(expectedPointers)) {
  const actualSha = readGitlink(path);

  assert.equal(
    actualSha,
    expectedSha,
    `${path} should point to ${expectedSha}, but points to ${actualSha}`,
  );
}

console.log('CRM products shortcuts composition pointers look correct.');
