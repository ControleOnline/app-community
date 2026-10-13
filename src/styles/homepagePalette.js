import {resolveThemePalette, withOpacity} from './branding';

const rgb = value => {
  const hex = String(value || '').replace('#', '');
  if (!/^[\da-f]{6}$/i.test(hex)) return null;
  return [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
};

const blend = (foreground, background, weight) => {
  const front = rgb(foreground);
  const back = rgb(background);
  if (!front || !back) return background;
  return `#${front.map((channel, index) => Math.round(
    channel * weight + back[index] * (1 - weight),
  ).toString(16).padStart(2, '0')).join('')}`;
};

// Return a home-only palette. Never mutate runtime colors or CSS variables.
export const resolveHomepagePalette = theme => {
  const palette = resolveThemePalette(theme);
  const surface = palette.homeCardBackground || palette.cardBackground || palette.white;
  const text = palette.homeText || palette.textPrimary || palette.text;
  const accent = palette.homeAccent || palette.cardIconBackground || palette.primary;
  const soft = palette.homeAccentBackground || blend(accent, surface, 0.10);
  return {
    ...palette,
    background: palette.homePageBackground || blend(text, surface, 0.025),
    pageBackground: palette.homePageBackground || blend(text, surface, 0.025),
    cardBackground: surface,
    cardBorder: palette.homeCardBorder || blend(text, surface, 0.10),
    homeHoverBorder: palette.homeHoverBorder || blend(accent, surface, 0.42),
    cardShadow: palette.homeCardShadow || withOpacity(text, 0.035),
    textPrimary: text,
    textMuted: palette.homeTextMuted || palette.textSecondary,
    cardIconBackground: soft,
    cardIconColor: palette.homeAccentText || blend(accent, text, 0.72),
    iconBackground: surface,
    iconColor: palette.homeAccentText || blend(accent, text, 0.72),
    buttonBackground: surface,
    buttonText: text,
    homeAccent: accent,
    navigationBackground: surface,
    navigationBorder: palette.homeCardBorder || blend(text, surface, 0.10),
    navigationActiveBackground: soft,
    navigationActiveBorder: blend(accent, surface, 0.20),
    navigationActiveIcon: palette.homeAccentText || blend(accent, text, 0.72),
    navigationActiveText: palette.homeAccentText || blend(accent, text, 0.72),
    navigationIcon: text,
    navigationText: text,
    footerBackground: surface,
    footerText: palette.homeTextMuted || palette.textSecondary,
  };
};
