const {describe, expect, it} = global;

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

  it('has an explicit namespace for every build app type', () => {
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

  it('rejects unknown app types instead of producing a reversed package namespace', () => {
    expect(() => resolveAppDomain('com.controleonline.pos', 'master')).toThrow(
      'Unknown APP_TYPE',
    );
  });
});
