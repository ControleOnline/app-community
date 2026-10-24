import {env as APP_ENV} from '@env';

export const app_type_storage_key = 'app-type';
const admin_app_type_storage_key = 'admin-app-type';

export const app_type_options = Object.freeze([
  'ADMIN',
  'MANAGER',
  'CRM',
  'POS',
  'DELIVERY',
  'PPC',
  'SHOP',
  'SERVICE',
]);

const normalizeAppType = value =>
  String(value || '')
    .trim()
    .toUpperCase();

const canUseLocalStorage = () =>
  typeof globalThis !== 'undefined' &&
  typeof globalThis.localStorage !== 'undefined' &&
  typeof globalThis.localStorage.getItem === 'function' &&
  typeof globalThis.localStorage.setItem === 'function';

export const normalize_app_type = normalizeAppType;

export const is_allowed_app_type = value =>
  app_type_options.includes(normalizeAppType(value));

export const read_app_type = () => {
  if (!canUseLocalStorage()) {
    return '';
  }

  try {
    const storedAppType = normalizeAppType(
      globalThis.localStorage.getItem(app_type_storage_key),
    );

    return is_allowed_app_type(storedAppType) ? storedAppType : '';
  } catch {
    return '';
  }
};

const resetAdminAppEntry = () => {
  if (
    app_type_base === 'ADMIN' &&
    typeof window !== 'undefined' &&
    typeof window.history?.replaceState === 'function'
  ) {
    // Explicit app switches must not reload a route owned by the previous app.
    window.history.replaceState(null, '', '/');
  }
};

export const set_app_type = value => {
  const normalizedAppType = normalizeAppType(value);

  if (!normalizedAppType || !is_allowed_app_type(normalizedAppType)) {
    return false;
  }

  if (!canUseLocalStorage()) {
    return false;
  }

  globalThis.localStorage.setItem(app_type_storage_key, normalizedAppType);
  if (app_type_base === 'ADMIN') {
    globalThis.localStorage.setItem(admin_app_type_storage_key, normalizedAppType);
  }
  resetAdminAppEntry();
  return true;
};

export const clear_app_type = () => {
  if (!canUseLocalStorage()) {
    return false;
  }

  globalThis.localStorage.removeItem(app_type_storage_key);
  globalThis.localStorage.removeItem(admin_app_type_storage_key);
  resetAdminAppEntry();
  return true;
};

/**
 * Derive a bootstrap type from DOMAIN host only when storage is empty.
 * Source of truth is people_domain.app_type via GET /people/company/default.
 */
export const resolve_app_type_from_domain = (domainValue = '') => {
  const host = String(domainValue || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./i, '')
    .toLowerCase();
  if (!host) return '';
  if (host.startsWith('admin.') || ['dev.controleonline.com', 'staging.controleonline.com'].includes(host)) return 'ADMIN';
  if (host.startsWith('checkout.')) return 'CHECKOUT';
  if (host.startsWith('crm.')) return 'CRM';
  if (host.startsWith('delivery.')) return 'DELIVERY';
  if (host.startsWith('menu.')) return 'MENU';
  if (host.startsWith('pos.')) return 'POS';
  if (host.startsWith('ppc.') || host.startsWith('display.')) return 'PPC';
  if (host.startsWith('service.')) return 'SERVICE';
  if (host.startsWith('shop.')) return 'SHOP';
  if (host.startsWith('mkt.')) return 'MKT';
  if (host.startsWith('manager.') || host.startsWith('app.') || host === 'app.controleonline.com') {
    return 'MANAGER';
  }
  return '';
};

export const resolve_base_app_type = (env = APP_ENV) =>
  normalizeAppType(env?.APP_TYPE) || resolve_app_type_from_domain(env?.DOMAIN) || 'MANAGER';

export const resolve_app_type = (env = APP_ENV) => {
  // Admin portals keep their entry point and explicit selector choice. Company
  // bootstrap writes app-type and must not replace the administrator's choice.
  if (resolve_base_app_type(env) === 'ADMIN') {
    try {
      const selected = canUseLocalStorage()
        ? normalizeAppType(globalThis.localStorage.getItem(admin_app_type_storage_key))
        : '';
      return is_allowed_app_type(selected) ? selected : 'ADMIN';
    } catch {
      return 'ADMIN';
    }
  }
  // An explicitly configured application keeps its identity. Only ADMIN offers
  // application switching; company bootstrap must not turn a Manager build into Admin.
  const configuredAppType = normalizeAppType(env?.APP_TYPE);
  if (configuredAppType) return configuredAppType;

  // Domain-driven builds still use people_domain.app_type from company bootstrap.
  const storedAppType = read_app_type();
  if (storedAppType) {
    return storedAppType;
  }

  return resolve_base_app_type(env);
};

export const app_type_base = resolve_base_app_type();
export const app_type = resolve_app_type();
export const is_admin_app_type = value => normalizeAppType(value) === 'ADMIN';
export const is_admin_build = app_type_base === 'ADMIN';
