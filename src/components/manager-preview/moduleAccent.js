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

export function moduleAccentBackground(accent, highlighted = false) {
  if (!accent) return undefined;
  const argb = processColor(accent);
  const opacity = ((argb >>> 24) / 255) * (highlighted ? 0.24 : 0.14);
  return `rgba(${(argb >>> 16) & 255}, ${(argb >>> 8) & 255}, ${argb & 255}, ${opacity})`;
}
