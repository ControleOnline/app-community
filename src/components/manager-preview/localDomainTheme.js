import {env} from '@env';
import profiles from '../../../docs/themes/domain-profiles.json';

// Explicit domain profiles own palettes; they are never missing-token fallbacks.
// Switching the configured domain disables this local data source.
export function localDomainThemeEnabled(location = typeof window === 'undefined' ? null : window.location, domain = env.DOMAIN) {
  if (!location || !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) return false;
  let host;
  try { host = new URL(domain).hostname; } catch { return false; }
  if (host !== 'app.lave-go.com') return false;
  return true;
}

// Approved Manager palette for local app + domain + API, independent of URL parameters.
export function localManagerThemeEnabled(location = typeof window === 'undefined' ? null : window.location, config = env) {
  const loopback = host => ['localhost', '127.0.0.1', '[::1]'].includes(host);
  if (!location || !loopback(location.hostname)) return false;
  try {
    return loopback(new URL(config.DOMAIN).hostname) && loopback(new URL(config.API_ENTRYPOINT).hostname);
  } catch { return false; }
}

export function domainProfile(config = env, location = typeof window === 'undefined' ? null : window.location) {
  try {
    const host = new URL(config.DOMAIN).hostname;
    const api = new URL(config.API_ENTRYPOINT).hostname;
    // On published web pages the actual domain must also match the build configuration.
    if (location && !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) && location.hostname !== host) return null;
    return profiles.profiles.find(profile => profile.domain === host && profile.api === api) || null;
  } catch { return null; }
}

// Retained for compatibility with older preview callers; runtime colors come from the API.
export function localDomainTheme() { return null; }
