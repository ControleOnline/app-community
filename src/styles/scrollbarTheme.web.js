const styleId = 'co-global-scrollbar-styles';
const outsideScreen = ':not([data-co-scrollbars], [data-co-scrollbars] *)';

export function applyThemeScrollbarStyles() {
  if (typeof document === 'undefined' || !document.head || document.getElementById(styleId)) return;

  // ScreenThemeBoundary owns scrollbars inside a themed screen.
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
@media not all and (forced-colors: active) {
  ${outsideScreen} {
    scrollbar-width: thin;
    scrollbar-color: var(--co-theme-scrollbarThumb, #aaa) var(--co-theme-scrollbarTrack, #353434);
  }
  ${outsideScreen}::-webkit-scrollbar {
    width: var(--co-theme-scrollbar-width, 10px);
    height: var(--co-theme-scrollbar-width, 10px);
  }
  ${outsideScreen}::-webkit-scrollbar-track {
    background: var(--co-theme-scrollbarTrack, #353434);
    border-radius: var(--co-theme-scrollbar-radius, 8px);
  }
  ${outsideScreen}::-webkit-scrollbar-thumb {
    background: var(--co-theme-scrollbarThumb, #aaa);
    border-radius: var(--co-theme-scrollbar-radius, 8px);
  }
  @supports selector(::-webkit-scrollbar-thumb) {
    ${outsideScreen} {
      scrollbar-color: auto;
      scrollbar-width: auto;
    }
    ${outsideScreen}::-webkit-scrollbar-thumb:hover {
      background: var(--co-theme-scrollbarThumbHover, var(--co-theme-scrollbarThumb, #aaa));
    }
  }
}
`;
  document.head.appendChild(style);
}
