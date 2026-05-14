import {colors as defaultColors} from './colors';

const CSS_VAR_FALLBACK_HEX_REGEX =
  /^var\([^,]+,\s*(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6})\s*\)$/;
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const normalizeHex = value => {
  if (typeof value !== 'string') {
    return null;
  }

  const raw = value.trim().replace(/;$/, '');
  const cssVarFallbackMatch = raw.match(CSS_VAR_FALLBACK_HEX_REGEX);
  const color = cssVarFallbackMatch?.[1] || raw;

  if (!HEX_COLOR_REGEX.test(color)) {
    return null;
  }

  if (color.length === 4) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }

  return color;
};

export const withOpacity = (hexColor, opacity = 1) => {
  const normalized = normalizeHex(hexColor);
  if (!normalized) {
    return hexColor;
  }

  const clamped = Math.max(0, Math.min(1, opacity));
  const intValue = parseInt(normalized.slice(1), 16);
  const r = (intValue >> 16) & 255;
  const g = (intValue >> 8) & 255;
  const b = intValue & 255;

  return `rgba(${r}, ${g}, ${b}, ${clamped})`;
};

export const resolveThemePalette = (
  themeColors = {},
  fallback = defaultColors,
) => {
  const normalizedFallback = Object.keys(fallback || {}).reduce(
    (palette, key) => ({
      ...palette,
      [key]: normalizeHex(fallback[key]) || fallback[key],
    }),
    {},
  );

  const firstThemeColor = (...keys) => {
    for (const key of keys) {
      const value = normalizeHex(themeColors[key]);
      if (value) {
        return value;
      }
    }
    return null;
  };

  const primary =
    firstThemeColor(
      'primary',
      'q-primary',
      'btn-primary',
      'q-btn-primary',
      'header-primary',
      'q-header-primary',
    ) || normalizedFallback.primary;

  const secondary =
    firstThemeColor('secondary', 'q-secondary') || normalizedFallback.secondary;

  const background =
    firstThemeColor(
      'background',
      'bg-light',
      'q-bg-light',
      'bg-headers-light',
      'q-bg-headers-light',
    ) || normalizedFallback.background;

  const text =
    firstThemeColor(
      'text',
      'text-headers-light',
      'q-text-headers-light',
      'text-primary',
      'q-text-primary',
    ) || normalizedFallback.text;

  let textSecondary =
    firstThemeColor(
      'textSecondary',
      'text-headers-light',
      'q-text-headers-light',
      'text-secondary',
      'q-text-secondary',
    ) || normalizedFallback.textSecondary;

  if (textSecondary.toLowerCase() === background.toLowerCase()) {
    textSecondary = text;
  }

  const border =
    firstThemeColor('border', 'bg-even-light', 'q-bg-even-light') ||
    normalizedFallback.border;

  return {
    ...normalizedFallback,
    primary,
    secondary,
    background,
    text,
    textSecondary,
    border,
  };
};

export const applyPaletteToRuntimeColors = (
  palette = {},
  target = defaultColors,
) => {
  const merged = {
    ...target,
    ...palette,
  };

  Object.keys(merged).forEach(key => {
    target[key] = merged[key];
  });

  return target;
};

export const applyThemeCssVariables = ({
  themeColors = {},
  palette = {},
} = {}) => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;

  Object.keys(themeColors || {}).forEach(key => {
    const normalized = normalizeHex(themeColors[key]);
    if (!normalized) {
      return;
    }

    root.style.setProperty(`--${key}`, normalized);

    if (key.startsWith('q-')) {
      root.style.setProperty(`--${key.slice(2)}`, normalized);
    }
  });

  const paletteVars = {
    primary: palette.primary,
    secondary: palette.secondary,
    background: palette.background,
    text: palette.text,
    'text-secondary': palette.textSecondary,
    border: palette.border,
    negative: palette.error,
    positive: palette.success,
    warning: palette.warning,
    info: palette.info,
    'bg-light': palette.background,
  };

  Object.keys(paletteVars).forEach(key => {
    const value = normalizeHex(paletteVars[key]);
    if (value) {
      root.style.setProperty(`--${key}`, value);
    }
  });
};

export const buildAssetUrl = asset => {
  if (!asset) {
    return null;
  }

  if (typeof asset === 'string') {
    return asset;
  }

  const rawUrl = asset.url || asset.path || asset.uri;
  if (!rawUrl || typeof rawUrl !== 'string') {
    return null;
  }

  if (/^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }

  if (/^\/\//.test(rawUrl)) {
    return `https:${rawUrl}`;
  }

  const domain = asset.domain;
  if (typeof domain === 'string' && domain.trim()) {
    const normalizedDomain = /^https?:\/\//i.test(domain)
      ? domain
      : `https://${domain}`;
    const normalizedPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
    return `${normalizedDomain}${normalizedPath}`;
  }

  return rawUrl;
};
