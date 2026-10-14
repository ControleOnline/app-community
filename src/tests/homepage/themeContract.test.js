import fs from 'fs';
import path from 'path';
import {resolveHomepagePalette} from '../../styles/homepagePalette';
import gridStyles from '@controleonline/ui-layout/src/react/components/AppMenuGrid.styles';
import companyStyles from '@controleonline/ui-manager/src/react/components/CompanyFilter.styles';

jest.mock('react-native', () => ({StyleSheet: {create: value => value, absoluteFillObject: {}}}));
const map = fs.readFileSync(path.resolve(__dirname, '../../../docs/themes/themes-map.md'), 'utf8');
const names = [...map.matchAll(/^- `([A-Za-z][A-Za-z0-9]+)`/gm)].map(match => match[1]);
const tokens = Object.freeze(Object.fromEntries(names.map((name, index) => [name,
  `#${(index + 4096).toString(16).padStart(6, '0')}`])));

describe('official home theme contract', () => {
  it('preserves every configured canonical token without local defaults or calculated replacements', () => {
    expect(resolveHomepagePalette(tokens)).toEqual(tokens);
    expect(resolveHomepagePalette({})).toEqual({});
  });
  it('uses each visual object token directly in the soft grid', () => {
    const s = gridStyles({colors: tokens, width: 393, appearance: 'soft'});
    expect(s.card.backgroundColor).toBe(tokens.cardBackground);
    expect(s.card.borderColor).toBe(tokens.cardBorder);
    expect(s.card.shadowColor).toBe(tokens.cardShadow);
    expect(s.cardLabel.color).toBe(tokens.cardText);
    expect(s.sectionTitle.color).toBe(tokens.textPrimary);
    expect(s.sectionDivider.backgroundColor).toBe(tokens.dividerBorder);
    expect(s.cardHighlighted.borderColor).toBe(tokens.buttonFocusBorder);
    expect(s.cardPressed.backgroundColor).toBe(tokens.buttonPressedBackground);
  });
  it('uses header tokens without borrowing card or page colors', () => {
    const s = companyStyles(tokens, 'soft', tokens, true);
    expect(s.container.backgroundColor).toBe(tokens.headerBackground);
    expect(s.greeting.color).toBe(tokens.headerText);
    expect(s.companyName.color).toBe(tokens.headerText);
  });
});
