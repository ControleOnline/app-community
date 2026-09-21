const fs = require('fs');
const path = require('path');
const {spawnSync} = require('child_process');

const workflow = fs.readFileSync(
  path.resolve(__dirname, '../../../.github/workflows/integration-source-gate.yml'),
  'utf8',
);
const sourcePolicy = workflow.split('        run: |\n')[1]
  .split('\n      - uses:')[0]
  .split('\n').map(line => line.replace(/^          /, '')).join('\n');

describe('integration source policy', () => {
  test.each([
    ['dev', 'task-835', 0],
    ['dev', 'hotfix-835-staging', 1],
    ['staging', 'hotfix-835-staging', 0],
    ['staging', 'hotfix-0-staging', 1],
    ['staging', 'hotfix-835-staging-extra', 1],
    ['staging', 'dev', 1],
    ['staging', 'task-835', 1],
    ['staging', 'rc/1.10.28-rc.1', 0],
    ['master', 'hotfix-835-staging', 1],
    ['master', 'task-835', 1],
    ['master', 'rc/1.10.28-rc.1', 0],
  ])('%s accepts/rejects %s with exit %i', (base, head, exit) => {
    const result = spawnSync('bash', ['-c', sourcePolicy], {
      env: {...process.env, HEAD_REF: head, BASE_REF: base},
      encoding: 'utf8',
    });
    expect(result.status).toBe(exit);
  });

  test('retains manifest validation outside staging hotfixes', () => {
    const condition = "if: github.base_ref != 'dev' && !(github.base_ref == 'staging' && startsWith(github.head_ref, 'hotfix-'))";
    expect(workflow.split(condition)).toHaveLength(3);
    expect(workflow).toContain("if (m.frozen !== true) throw new Error('manifest is not frozen')");
  });
});
