/**
 * Regression: LaveGo web deploy must inject public frontend DOMAIN/MANAGER_APP
 * (app.lave-go.com), not the API host. Related: ControleOnline/app-community#323
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const {spawnSync} = require('child_process');
const YAML = require('yaml');

const ROOT = path.resolve(__dirname, '../../..');

function readWorkflow(name) {
  return fs.readFileSync(path.join(ROOT, '.github/workflows', name), 'utf8');
}

describe('LaveGo deploy workflows — public frontend domain', () => {
  const PUBLIC = 'https://app.lave-go.com';
  const API = 'https://apinew.lave-go.com';

  it('deploy-lave-go.yml configures domain as public app domain (not API host)', () => {
    const yml = readWorkflow('deploy-lave-go.yml');
    // Modern structure: configure job output OR legacy inline env
    const hasPublicDomainOutput = /echo\s+"domain=https:\/\/app\.lave-go\.com"/.test(yml);
    const hasPublicDomainLiteral =
      yml.includes(`DOMAIN: '${PUBLIC}'`) || yml.includes(`DOMAIN: "${PUBLIC}"`);
    expect(hasPublicDomainOutput || hasPublicDomainLiteral).toBe(true);
    expect(yml).not.toMatch(/echo\s+"domain=https:\/\/apinew\.lave-go\.com"/);
    expect(yml).not.toMatch(/DOMAIN:\s*'https:\/\/apinew\.lave-go\.com'/);
    // API remains on apinew
    expect(yml.includes(API) || /apinew\.lave-go\.com/.test(yml)).toBe(true);
  });

  it('current configure outputs pass the public domain to web and native consumers', () => {
    const workflow = YAML.parse(readWorkflow('deploy-lave-go.yml'));
    const configure = workflow.jobs.configure.steps.find(step => step.id === 'set');
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lavego-domain-'));
    const output = path.join(directory, 'outputs');
    try {
      const script = configure.run.replace(/\$\{\{ github\.event\.inputs\.web_only \}\}/g, 'true');
      const result = spawnSync('bash', ['-c', script], {encoding: 'utf8', env: {PATH: process.env.PATH, GITHUB_OUTPUT: output}});
      expect(result.status).toBe(0);
      const values = Object.fromEntries(fs.readFileSync(output, 'utf8').trim().split('\n').map(line => line.split('=')));
      expect(values.domain).toBe(PUBLIC);
      expect(values.api).toBe(API);
      const resolve = value => value.replace(/\$\{\{ needs\.configure\.outputs\.(\w+) \}\}/g, (_, key) => values[key]);
      const web = workflow.jobs.web.steps.find(step => step.uses === './.github/actions/web-export-deploy');
      const native = workflow.jobs.android.steps.find(step => step.uses === './.github/actions/android-build');
      expect(resolve(web.with.domain)).toBe(PUBLIC);
      expect(resolve(web.with.api_entrypoint)).toBe(API);
      expect(resolve(native.with.domain)).toBe(PUBLIC);
      expect(resolve(native.with.manager_app)).toBe(PUBLIC);
    } finally {
      fs.rmSync(directory, {recursive: true, force: true});
    }
  });
});
