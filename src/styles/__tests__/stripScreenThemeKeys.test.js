import {countScreenThemeKeys, isScreenThemeKey, stripScreenThemeKeys} from '../stripScreenThemeKeys';

describe('stripScreenThemeKeys', () => {
  it('keeps global tokens and drops screen_* keys', () => {
    const input = {
      'primary-light': '#FEBC1D',
      'screen_006d0061006e0061006700650072__cardBackground-light': '#fff',
      'q-screen_abc__text-dark': '#000',
      showLeftMenu: 'true',
      homeModulesLayout: 'buttons',
    };
    const cleaned = stripScreenThemeKeys(input);
    expect(cleaned).toEqual({
      'primary-light': '#FEBC1D',
      showLeftMenu: 'true',
      homeModulesLayout: 'buttons',
    });
    expect(countScreenThemeKeys(input)).toBe(2);
    expect(countScreenThemeKeys(cleaned)).toBe(0);
  });

  it('treats null/invalid as empty', () => {
    expect(stripScreenThemeKeys(null)).toEqual({});
    expect(stripScreenThemeKeys(undefined)).toEqual({});
    expect(isScreenThemeKey('screen_x')).toBe(true);
    expect(isScreenThemeKey('primary-light')).toBe(false);
  });
});
