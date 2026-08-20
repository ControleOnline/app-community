/**
 * Regression: LaveGo web deploy must inject public frontend DOMAIN/MANAGER_APP
 * (app.lave-go.com), not the API host. Related: ControleOnline/app-community#323
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');

function readWorkflow(name) {
  return fs.readFileSync(path.join(ROOT, '.github/workflows', name), 'utf8');
}

describe('LaveGo deploy workflows — public frontend domain', () => {
  const PUBLIC = 'https://app.lave-go.com';
  const API = 'https://apinew.lave-go.com';

  it('deploy-lave-go.yml injects DOMAIN and MANAGER_APP as public app domain', () => {
    const yml = readWorkflow('deploy-lave-go.yml');
    expect(yml).toContain(`DOMAIN: '${PUBLIC}'`);
    expect(yml).toContain(`MANAGER_APP: '${PUBLIC}'`);
    expect(yml).toContain(`API_ENTRYPOINT: '${API}'`);
    // Must not set DOMAIN to the API host
    expect(yml).not.toMatch(/DOMAIN:\s*'https:\/\/apinew\.lave-go\.com'/);
  });

  it('deploy-lave-go-testar.yml configure domain output is public app domain', () => {
    const yml = readWorkflow('deploy-lave-go-testar.yml');
    expect(yml).toMatch(/echo\s+"domain=https:\/\/app\.lave-go\.com"/);
    expect(yml).not.toMatch(/echo\s+"domain=https:\/\/apinew\.lave-go\.com"/);
    expect(yml).toMatch(/echo\s+"api=https:\/\/apinew\.lave-go\.com"/);
  });
});
