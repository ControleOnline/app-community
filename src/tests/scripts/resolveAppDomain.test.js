const fs = require('fs');
const path = require('path');

const {
  APP_DOMAIN_NAMESPACES,
  resolveAppDomain,
} = require('../../../scripts/resolve-app-domain.cjs');

describe('resolveAppDomain', () => {
  it('uses direct app namespaces for production domains', () => {
    expect(resolveAppDomain('CRM', 'master')).toBe('https://crm.controleonline.com');
    expect(resolveAppDomain('pos', 'master')).toBe('https://pos.controleonline.com');
    expect(resolveAppDomain('CHECKOUT', 'master')).toBe('https://checkout.controleonline.com');
  });

  it('keeps non-production domains tied to the selected environment', () => {
    expect(resolveAppDomain('CRM', 'dev')).toBe('https://d.controleonline.com');
    expect(resolveAppDomain('POS', 'staging')).toBe('https://staging.controleonline.com');
  });

  it('has an explicit namespace for every native build app type', () => {
    expect(Object.keys(APP_DOMAIN_NAMESPACES).sort()).toEqual([
      'ADMIN',
      'CHECKOUT',
      'CRM',
      'DELIVERY',
      'MANAGER',
      'MENU',
      'POS',
      'PPC',
      'SERVICE',
      'SHOP',
    ]);
  });

  it('rejects unknown app types instead of producing a package namespace', () => {
    expect(() => resolveAppDomain('com.controleonline.pos', 'master')).toThrow(
      'Unknown APP_TYPE',
    );
  });

  it('keeps production web and Android deploys on app-specific domains', () => {
    const workflowPath = path.resolve(__dirname, '../../../.github/workflows/deploy.yml');
    const workflow = fs.readFileSync(workflowPath, 'utf8');

    expect(workflow).toContain('"app_type":"MANAGER","ftp_product":"manager","app_domain":"https://manager.controleonline.com"');
    expect(workflow).toContain('"app_type":"SHOP","ftp_product":"shop","app_domain":"https://shop.controleonline.com"');
    expect(workflow).toContain('"app_type":"ADMIN","ftp_product":"admin","app_domain":"https://admin.controleonline.com"');
    expect(workflow).toContain('"app_type":"ADMIN","ftp_product":"admin","app_domain":"https://staging.controleonline.com"');
    expect(workflow).toContain('app_domain: https://crm.controleonline.com');
    expect(workflow).toContain('app_domain: https://pos.controleonline.com');
    expect(workflow).toContain('domain: ${{ matrix.app_domain }}');
    expect(workflow).toContain('manager_app: ${{ needs.configure.outputs.manager_domain }}');
  });
});
