// Repair the published 1.2.114 catalog syntax without replacing the team's catalog.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const file = path.join(root, 'node_modules/@controleonline/ui-common/src/react/pages/integrationsCatalog.js');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const source = fs.readFileSync(file, 'utf8');
if (hash(source) === 'd85168b273426c696e7d948c795cf487a27893757a4cc8084ee8e28d98395c92') {
  const repaired = source.replace('  },,\n', '  },\n');
  if (hash(repaired) !== '5e07222acf2038709c8bfa08c953041862e601abd0604c314b793b4194cf2573') throw Error('Integration catalog repair mismatch.');
  fs.writeFileSync(file, repaired);
}
