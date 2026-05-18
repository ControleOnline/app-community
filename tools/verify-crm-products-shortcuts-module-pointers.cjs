const { execSync } = require('node:child_process');
const assert = require('node:assert/strict');

const expectedPointers = {
  'modules/controleonline/ui-crm': 'e3e7069e7d7518eaa592961d47179d2040a2e60b',
  'modules/controleonline/ui-contracts': '21b6feee935d5b02717e6667db29fd6feffb0759',
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
