const styleId = 'co-theme-scrollbar-styles';

const css = `
@media not all and (forced-colors: active) {
  [data-co-scrollbars] {
    scrollbar-color: var(--co-theme-scrollbarThumb) var(--co-theme-scrollbarTrack);
    scrollbar-width: thin;
  }
  [data-co-scrollbars] *::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  [data-co-scrollbars] *::-webkit-scrollbar-thumb {
    background-color: var(--co-theme-scrollbarThumb);
    border-radius: 999px;
  }
  [data-co-scrollbars] *::-webkit-scrollbar-track {
    background-color: var(--co-theme-scrollbarTrack);
    border-radius: 999px;
  }
  @supports selector(::-webkit-scrollbar-thumb) {
    [data-co-scrollbars="hover"] {
      /* Standard scrollbar styling takes precedence over the hover pseudo-element. */
      scrollbar-color: auto;
      scrollbar-width: auto;
    }
    [data-co-scrollbars="hover"] *::-webkit-scrollbar-thumb:hover {
      background-color: var(--co-theme-scrollbarThumbHover);
    }
  }
}
`;

export function installThemeScrollbarStyles(document) {
  if (!document.head || document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = css;
  document.head.appendChild(style);
}
