/**
 * Apply theme scrollbar tokens as web CSS (webkit + standard scrollbar).
 * Tokens come from the domain theme (scrollbar-thumb-*, scrollbar-track-*, …).
 */

let styleNode = null;

function readCssVar(name, fallback) {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export function applyThemeScrollbarStyles({ mode = 'light' } = {}) {
  if (typeof document === 'undefined') return;
  const suffix = mode === 'dark' ? 'dark' : 'light';
  const thumb = readCssVar(`--scrollbar-thumb-${suffix}`, readCssVar('--co-theme-scrollbar-thumb-' + suffix, '#AAAAAA'));
  const track = readCssVar(`--scrollbar-track-${suffix}`, readCssVar('--co-theme-scrollbar-track-' + suffix, '#353434'));
  const hover = readCssVar(
    `--scrollbar-thumb-hover-${suffix}`,
    readCssVar('--co-theme-scrollbar-thumb-hover-' + suffix, thumb),
  );
  const width = readCssVar('--scrollbar-width', readCssVar('--co-theme-scrollbar-width', '10px'));
  const radius = readCssVar('--scrollbar-radius', readCssVar('--co-theme-scrollbar-radius', '8px'));

  const css = `
html, body, * {
  scrollbar-width: thin;
  scrollbar-color: ${thumb} ${track};
}
*::-webkit-scrollbar {
  width: ${width};
  height: ${width};
}
*::-webkit-scrollbar-track {
  background: ${track};
  border-radius: ${radius};
}
*::-webkit-scrollbar-thumb {
  background: ${thumb};
  border-radius: ${radius};
}
*::-webkit-scrollbar-thumb:hover {
  background: ${hover};
}
`;

  if (!styleNode) {
    styleNode = document.createElement('style');
    styleNode.setAttribute('data-co-theme-scrollbar', '1');
    document.head.appendChild(styleNode);
  }
  styleNode.textContent = css;
}
