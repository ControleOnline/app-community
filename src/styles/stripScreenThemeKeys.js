/**
 * Remove per-screen color overrides (screen_* / q-screen_*) from a theme colors object.
 * Theme colors must stay global tokens only — never route/screen-specific.
 */
export function isScreenThemeKey(key) {
  return typeof key === 'string' && (key.startsWith('screen_') || key.startsWith('q-screen_'));
}

export function stripScreenThemeKeys(colors = {}) {
  if (!colors || typeof colors !== 'object' || Array.isArray(colors)) return {};
  return Object.fromEntries(
    Object.entries(colors).filter(([key]) => !isScreenThemeKey(key)),
  );
}

export function countScreenThemeKeys(colors = {}) {
  if (!colors || typeof colors !== 'object') return 0;
  return Object.keys(colors).filter(isScreenThemeKey).length;
}
