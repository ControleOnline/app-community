function browserEnvSource(source, appType, apiOrigin) {
  let api;
  try { api = new URL(apiOrigin); } catch { throw new Error('API_PLAYWRIGHT must be an explicit HTTP API URL'); }
  if (!['http:', 'https:'].includes(api.protocol) || api.username || api.password) throw new Error('API_PLAYWRIGHT must be an HTTP API URL without credentials');
  if (!/^[A-Z]+$/.test(appType)) throw new Error('Invalid browser APP_TYPE');
  const values = {
    APP_TYPE: appType,
    API_ENTRYPOINT: api.href.replace(/\/$/, ''),
    SOCKET: `${api.protocol === 'https:' ? 'wss:' : 'ws:'}//${api.host}`,
  };
  let result = source;
  for (const [name, value] of Object.entries(values)) {
    const pattern = new RegExp(`${name}:\\s*(?:resolveAppType\\(\\)|['"][^'"]+['"])`);
    if (!pattern.test(result)) {
      if (name === 'SOCKET') continue;
      throw new Error(`Unable to override browser ${name} in config/env.local.js`);
    }
    result = result.replace(pattern, `${name}: ${JSON.stringify(value)}`);
  }
  return result;
}
module.exports = {browserEnvSource};
