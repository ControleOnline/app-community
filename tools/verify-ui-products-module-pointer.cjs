const fs = require('fs');
const { execFileSync } = require('child_process');

const gitmodules = fs.readFileSync('.gitmodules', 'utf8');

if (!gitmodules.includes('modules/controleonline/ui-products')) {
  throw new Error('ui-products submodule is not registered in .gitmodules');
}

const expectedPointer = '0fccde47316c220d4bf4ebdc48a54c310e2abfba';
const lsTreeOutput = execFileSync(
  'git',
  ['ls-tree', 'HEAD', 'modules/controleonline/ui-products'],
  { encoding: 'utf8' }
).trim();

const match = lsTreeOutput.match(
  /^160000\s+commit\s+([0-9a-f]{40})\tmodules\/controleonline\/ui-products$/
);

if (!match) {
  throw new Error(
    'ui-products submodule pointer could not be read from the parent repository tree'
  );
}

const actualPointer = match[1];

if (actualPointer !== expectedPointer) {
  throw new Error(
    `ui-products submodule HEAD mismatch: expected ${expectedPointer}, got ${actualPointer}`
  );
}

console.log(`ui-products submodule is pinned to ${expectedPointer}`);
