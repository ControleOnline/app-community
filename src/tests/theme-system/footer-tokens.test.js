import contract from '../../styles/themeContract.generated';
import {resolveManagerThemeDetails} from '../../styles/managerTheme';

test('the footer has its own background and label tokens (#1518)', () => {
  expect(contract.names).toEqual(expect.arrayContaining(['footerBackground', 'footerLabelInfo']));
});

test('footerBackground keeps the previous visible color when the theme has no own value', () => {
  const {values, sources} = resolveManagerThemeDetails({background: '#f3f5fa'}, 'light');
  expect(values.footerBackground).toBe('#f3f5fa');
  expect(sources.footerBackground).toBe('background');
});

test('an explicit footerBackground and footerLabelInfo win over the defaults', () => {
  const {values} = resolveManagerThemeDetails({background: '#f3f5fa', 'footerBackground-light': '#111111', 'footerLabelInfo-light': '#222222'}, 'light');
  expect(values.footerBackground).toBe('#111111');
  expect(values.footerLabelInfo).toBe('#222222');
});

test('footerLabelInfo defaults to black in light mode and reuses footerText in dark mode', () => {
  expect(resolveManagerThemeDetails({background: '#f3f5fa'}, 'light').values.footerLabelInfo).toBe('#000000');
  expect(resolveManagerThemeDetails({'bg-dark': '#010203', 'text-menu-dark': '#eeeeee', darkCard: '#123456'}, 'dark').values.footerLabelInfo).toBe('#eeeeee');
});
