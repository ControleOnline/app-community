import contract from './themeContract.generated';
import {resolveManagerTheme} from './managerTheme';

// Capture compatibility defaults at the load boundary, before live content edits.
// Once captured, chrome colors are independent tokens, not live content aliases.
export function initializeGlobalChromeColors(colors = {}) {
  const result = {...colors};
  for (const mode of ['light', 'dark']) {
    const resolved = resolveManagerTheme(colors, mode);
    for (const [token, metadata] of Object.entries(contract.variants || {})) {
      if (!['globalChrome', 'shortcutBar', 'moduleList'].includes(metadata.variant)) continue;
      const key = `${token}-${mode}`;
      if (Object.hasOwn(colors, token) || Object.hasOwn(colors, key)) continue;
      const value = resolved[token];
      if (value != null && String(value).trim() !== '') result[key] = value;
    }
    for (const role of ['Background','Border','Text','SecondaryText','MutedText','IconBackground','IconColor']) {
      const token = `homeResults${role}`, key = `${token}-${mode}`;
      if (!Object.hasOwn(colors, token) && !Object.hasOwn(colors, key) && resolved[token] != null) result[key] = resolved[token];
    }
  }
  return result;
}
