const fs = require('fs');
const path = require('path');
const os = require('os');
const yaml = require('yaml');
const {execFileSync} = require('child_process');

const workflow = yaml.parse(fs.readFileSync(path.resolve(__dirname, '../../../.github/workflows/deploy.yml'), 'utf8'));
const configure = workflow.jobs.configure.steps.find(step => step.id === 'set').run;
const web = workflow.jobs.web.steps.find(step => step.uses === './.github/actions/web-export-deploy');

// Evaluate only the variable/default expressions used by this workflow input.
const domainFor = (input, context) => input.replace(/^\$\{\{\s*|\s*\}\}$/g, '')
  .split('||').map(part => context[part.trim()]).find(Boolean);

describe('web deployment preserves each site domain (#1156)', () => {
  test.each([
    ['dev', ['dev']],
    ['staging', ['staging']],
    ['master', ['manager', 'shop', 'admin', 'mkt']],
  ])('%s passes its own public domain to every build', (environment, sites) => {
    // Run the actual configure step with an isolated Actions output file.
    const script = configure.replace('${{ github.event.inputs.environment || github.ref_name }}', environment);
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'co-deploy-domain-'));
    let output;
    try {
      const file = path.join(directory, 'output');
      execFileSync('bash', ['-c', script], {env: {...process.env, GITHUB_OUTPUT: file}, encoding: 'utf8'});
      output = fs.readFileSync(file, 'utf8');
    } finally {fs.rmSync(directory, {recursive: true, force: true});}
    const outputs = Object.fromEntries(output.split('\n').filter(line => line.includes('=')).map(line => {
      const separator = line.indexOf('='); return [line.slice(0, separator), line.slice(separator + 1)];
    }));
    const matrix = JSON.parse(outputs.web_matrix).include;
    expect(matrix.map(entry => new URL(entry.app_domain).hostname.split('.')[0])).toEqual(sites);
    for (const entry of matrix) {
      expect(domainFor(web.with.domain, {
        'needs.configure.outputs.domain': outputs.domain,
        'matrix.app_domain': entry.app_domain,
      })).toBe(entry.app_domain);
    }
  });

  test('keeps domain-driven app selection and independent native domains', () => {
    expect(web.with.app_type).toBe('');
    const native = workflow.jobs.android.steps.find(step => step.uses === './.github/actions/android-build');
    expect(native.with.domain).toBe('${{ matrix.app_domain }}');
    expect(native.with.app_type).toBe('');
    expect(web.with.api_entrypoint).toBe('${{ needs.configure.outputs.api }}');
    expect(web.with.socket).toBe('${{ needs.configure.outputs.socket }}');
  });
});
