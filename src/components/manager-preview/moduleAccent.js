import {processColor} from 'react-native';

export function resolveModuleAccent(categoryColor, palette = {}) {
  const color = typeof categoryColor === 'string' ? categoryColor.trim() : '';
  const token = /^\$([A-Za-z][\w-]*)$/.exec(color)?.[1];
  const resolved = token && Object.hasOwn(palette, token) ? palette[token] : color;
  if (typeof resolved !== 'string' || !resolved) return undefined;

  // Reject invalid and fully transparent colors so the active indicator stays visible.
  const argb = processColor(resolved);
  return typeof argb === 'number' && (argb >>> 24) > 0 ? resolved : undefined;
}

export function moduleAccentBackground(accent) {
  return accent;
}
