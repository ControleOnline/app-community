/**
 * #1108: app-lavego workflow publishes ADMIN + SHOP by default (no POS),
 * supports target=ADMIN, builds ADMIN with APP_TYPE ADMIN, and the legacy
 * admin workflow is gone.
 */
const fs = require('fs');
const path = require('path');

const WF = path.resolve(__dirname, '../../../.github/workflows');
const yml = fs.readFileSync(path.join(WF, 'web-deploy-production-app-lavego.yml'), 'utf8');
const active = yml.split('\n').filter(l => !/^\s*#/.test(l)).join('\n');

describe('web-deploy-production-app-lavego targets (#1108)', () => {
  it('has no POS destination', () => {
    expect(active).not.toMatch(/POSLAVEGO|deploy_pos|DEPLOY_POS|POS\+SHOP/);
  });

  it('offers ADMIN+SHOP (default), APP, ADMIN and ALL', () => {
    expect(active).toMatch(/options: \[ADMIN\+SHOP, APP, ADMIN, ALL\]/);
    expect(active).toMatch(/default: ADMIN\+SHOP/);
  });

  it('push and default publish ADMIN+SHOP; APP only manual', () => {
    expect(active).toMatch(/if \[ "\$EVENT" = "push" \]; then\s+DEPLOY_ADMIN=true; DEPLOY_SHOP=true/);
    expect(active).toMatch(/\*\)\s+DEPLOY_ADMIN=true; DEPLOY_SHOP=true/);
    expect(active).toMatch(/ADMIN\) DEPLOY_ADMIN=true ;;/);
    expect(active).toMatch(/ALL\)\s+DEPLOY_APP=true; DEPLOY_ADMIN=true; DEPLOY_SHOP=true/);
    expect(active).toMatch(/APP\)\s+DEPLOY_APP=true ;;/);
  });

  it('builds ADMIN separately with APP_TYPE ADMIN and uploads dist-admin', () => {
    expect(active).toMatch(/APP_TYPE: 'ADMIN'/);
    expect(active).toMatch(/--output-dir dist-admin/);
    expect(active).toMatch(/FTPHOST_ADMINLAVEGO[\s\S]*local-dir: \.\/dist-admin\//);
  });

  it('legacy admin workflow was removed', () => {
    expect(fs.existsSync(path.join(WF, 'web-deploy-production-admin-lavego.yml'))).toBe(false);
  });
});
