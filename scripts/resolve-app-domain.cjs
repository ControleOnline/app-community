const APP_DOMAIN_NAMESPACES = Object.freeze({
  ADMIN: 'admin',
  CHECKOUT: 'checkout',
  CRM: 'crm',
  DELIVERY: 'delivery',
  MANAGER: 'manager',
  MENU: 'menu',
  POS: 'pos',
  PPC: 'ppc',
  SERVICE: 'service',
  SHOP: 'shop',
});

const ENVIRONMENT_DOMAINS = Object.freeze({
  dev: 'https://d.controleonline.com',
  staging: 'https://staging.controleonline.com',
});

const normalizeAppType = value =>
  String(value || '')
    .trim()
    .toUpperCase();

const normalizeEnvironment = value =>
  String(value || 'master')
    .trim()
    .toLowerCase();

const resolveAppDomain = (appType, environment = 'master') => {
  const normalizedEnvironment = normalizeEnvironment(environment);

  if (Object.prototype.hasOwnProperty.call(ENVIRONMENT_DOMAINS, normalizedEnvironment)) {
    return ENVIRONMENT_DOMAINS[normalizedEnvironment];
  }

  const normalizedAppType = normalizeAppType(appType);
  const namespace = APP_DOMAIN_NAMESPACES[normalizedAppType];

  if (!namespace) {
    throw new Error(`Unknown APP_TYPE for domain namespace: ${appType}`);
  }

  return `https://${namespace}.controleonline.com`;
};

if (require.main === module) {
  const [appType, environment] = process.argv.slice(2);

  try {
    process.stdout.write(`${resolveAppDomain(appType, environment)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}

module.exports = {
  APP_DOMAIN_NAMESPACES,
  ENVIRONMENT_DOMAINS,
  resolveAppDomain,
};
