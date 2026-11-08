import {applyThemeScrollbarStyles} from '../../styles/scrollbarTheme.web';

test('keeps native colors when scrollbar tokens are missing and follows theme changes', () => {
  const toggleAttribute = jest.fn();
  const style = {};
  const head = {appendChild: jest.fn()};
  const originalDocument = global.document;
  global.document = {documentElement: {toggleAttribute}, head, getElementById: () => head.appendChild.mock.calls[0]?.[0], createElement: () => style};
  try {
    applyThemeScrollbarStyles({});
    expect(toggleAttribute).toHaveBeenLastCalledWith('data-co-global-scrollbars', false);
    applyThemeScrollbarStyles({scrollbarThumb: '#123456', scrollbarTrack: '#abcdef'});
    expect(toggleAttribute).toHaveBeenLastCalledWith('data-co-global-scrollbars', true);
    applyThemeScrollbarStyles({scrollbarThumb: '#123456'});
    expect(toggleAttribute).toHaveBeenLastCalledWith('data-co-global-scrollbars', false);
    expect(head.appendChild).toHaveBeenCalledTimes(1);
    expect(style.textContent).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  } finally {
    global.document = originalDocument;
  }
});
