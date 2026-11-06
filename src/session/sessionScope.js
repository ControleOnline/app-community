// Shared by the existing login and transport modules; no credentials are duplicated.
const contextKey = 'controleonline.session.context';
const listeners = new Set();
let version = 0;
let rejection = null;
const emit = () => { version++; listeners.forEach(listener => listener()); };
const storageOrDefault = storage => storage || globalThis.localStorage;
const scopeFor = config => {
  const api = new URL(config.API_ENTRYPOINT || 'http://localhost');
  api.username = ''; api.password = ''; api.hash = ''; api.search = '';
  const runtime = globalThis.location?.host;
  const domain = runtime && !/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(runtime)
    ? runtime.toLowerCase() : new URL(config.DOMAIN || 'http://localhost').host.toLowerCase();
  return `${api.href.replace(/\/$/, '')}|${domain}`;
};
const parse = value => {
  try { return JSON.parse(String(value || '').replace(/^__q_objt\|/, '')); } catch { return null; }
};
function clearSession(storage, rejected = false) {
  storage = storageOrDefault(storage);
  storage?.removeItem('session'); storage?.removeItem(contextKey);
  rejection = rejected ? 'Sua sessão não é válida para esta API. Entre novamente.' : null;
  emit();
}
function readSession(config, storage) {
  storage = storageOrDefault(storage);
  const session = parse(storage?.getItem('session'));
  if (!session) return null;
  if (storage?.getItem(contextKey) !== scopeFor(config)) { clearSession(storage, true); return null; }
  return session;
}
function storeSession(user, config, storage) {
  storage = storageOrDefault(storage);
  if (!user) { clearSession(storage,Boolean(rejection)); return; }
  storage?.setItem(contextKey, scopeFor(config));
  storage?.setItem('session', JSON.stringify(user)); rejection = null; emit();
}
function rejectSession(token, config, storage) {
  const current = readSession(config, storage);
  if (token && (current?.token || current?.api_key) === token) clearSession(storage, true);
}
module.exports = {
  scopeFor, readSession, storeSession, rejectSession,
  sessionVersion: () => version, sessionRejection: () => rejection,
  subscribeSession: listener => { listeners.add(listener); return () => listeners.delete(listener); },
};
