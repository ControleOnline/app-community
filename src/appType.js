import {env as APP_ENV} from '@env';

export const app_type_storage_key = 'app-type';

export const app_type_options = Object.freeze([
  'ADMIN',
  'MANAGER',
  'CRM',
  'POS',
  'DELIVERY',
  'PPC',
  'SHOP',
  'SERVICE',
  'MKT',
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

export const set_app_type = value => {
  const normalizedAppType = normalizeAppType(value);

  if (!normalizedAppType || !is_allowed_app_type(normalizedAppType)) {
    return false;
  }

  if (!canUseLocalStorage()) {
    return false;
  }

  globalThis.localStorage.setItem(app_type_storage_key, normalizedAppType);
  return true;
};

export const clear_app_type = () => {
  if (!canUseLocalStorage()) {
    return false;
  }

  globalThis.localStorage.removeItem(app_type_storage_key);
  return true;
};

export const resolve_base_app_type = (env = APP_ENV) =>
  normalizeAppType(env?.APP_TYPE) || 'MANAGER';

export const resolve_app_type = (env = APP_ENV) => {
  const baseAppType = resolve_base_app_type(env);

  if (baseAppType !== 'ADMIN') {
    return baseAppType;
  }

  return read_app_type() || baseAppType;
};

export const app_type_base = resolve_base_app_type();
export const app_type = resolve_app_type();
export const is_admin_app_type = value => normalizeAppType(value) === 'ADMIN';
export const is_admin_build = app_type_base === 'ADMIN';
