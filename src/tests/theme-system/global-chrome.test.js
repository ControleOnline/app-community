import {initializeGlobalChromeColors} from '../../styles/globalChromeTheme';
import {resolveManagerTheme} from '../../styles/managerTheme';

test('content preview edits leave captured chrome colors unchanged in both modes', () => {
  const loaded = initializeGlobalChromeColors({
    'textMuted-light': '#112233', 'textMuted-dark': '#ddeeff',
    'selectBackground-light': '#aabbcc', 'selectBackground-dark': '#223344',
    'navigationBackground-light': '#ffffff', 'navigationBackground-dark': '#000000',
  });
  const preview = {...loaded, 'textMuted-light': '#ff0000', 'textMuted-dark': '#00ff00',
    'selectBackground-light': '#0000ff', 'navigationBackground-light': '#ffff00'};
  expect(resolveManagerTheme(preview, 'light')).toMatchObject({
    textMuted: '#ff0000', navigationCaptionText: '#112233',
    selectBackground: '#0000ff', navigationAccountBackground: '#aabbcc',
    navigationBackground: '#ffff00', shortcutBarBackground: '#ffffff',
  });
  expect(resolveManagerTheme(preview, 'dark').navigationCaptionText).toBe('#ddeeff');
});

test('explicit chrome colors take precedence and no values cross between themes or modes', () => {
  const first = initializeGlobalChromeColors({'textMuted-light': '#112233',
    'navigationCaptionText-light': '#abcdef'});
  expect(first['navigationCaptionText-light']).toBe('#abcdef');
  expect(first['navigationCaptionText-dark']).toBeUndefined();
  expect(initializeGlobalChromeColors({})).toEqual({});
});
