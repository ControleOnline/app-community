import {resolveManagerTheme,missingManagerThemeTokens} from '../../styles/managerTheme';
it('uses exact configured values and explicit mode mappings without generating a palette',()=>{
 const theme={buttonBackground:'brand',pageBackground:'page',cardBackground:'card',textPrimary:'ink','bg-headers-light':'head','bg-even-light':'even','bg-odd-light':'odd','bg-dark':'night','darkCard':'night-card','darkBorder':'night-line','text-headers-dark':'night-ink','text-menu-dark':'night-menu','bg-menu-dark':'night-nav','bg-headers-dark':'night-head','bg-even-dark':'night-even','bg-odd-dark':'night-odd'};
 const light=resolveManagerTheme(theme,'light'),dark=resolveManagerTheme(theme,'dark');
 expect(light.buttonBackground).toBe('brand');expect(light.pageBackground).toBe('page');expect(light.cardBackground).toBe('card');expect(light.tableHeaderBackground).toBe('head');
 expect(dark.pageBackground).toBe('night');expect(dark.cardBackground).toBe('night-card');expect(dark.textPrimary).toBe('night-ink');expect(dark.tableRowOddBackground).toBe('night-odd');expect(dark.buttonBackground).toBe('brand');
 expect(theme).not.toHaveProperty('tableHeaderBackground');
});
it('reports missing required tokens and leaves them unset instead of substituting colors',()=>{
 const colors=resolveManagerTheme({},'dark');expect(colors.buttonBackground).toBeUndefined();expect(colors.cardBackground).toBeUndefined();
 expect(missingManagerThemeTokens({},'dark')).toEqual(expect.arrayContaining(['buttonBackground','darkCard','bg-dark']));
 expect(Object.values(colors).filter(value=>typeof value==='string')).toEqual([]);
});
it('switches exact domain tokens without reusing the previous domain or mode values',()=>{
 const one={'bg-dark':'one-night',buttonBackground:'one'},two={'bg-dark':'two-night',buttonBackground:'two'};
 expect(resolveManagerTheme(one,'dark').pageBackground).toBe('one-night');expect(resolveManagerTheme(two,'dark').pageBackground).toBe('two-night');expect(resolveManagerTheme(two,'light').pageBackground).toBeUndefined();
});

it('reuses existing domain row tokens when explicit light mode keys are absent',()=>{
 const theme={listItemEvenRow:'#FFF7E3',listItemOddRow:'#FFDE8E'};
 expect(resolveManagerTheme(theme,'light')).toMatchObject({tableRowEvenBackground:'#FFF7E3',tableRowOddBackground:'#FFDE8E'});
 expect(missingManagerThemeTokens(theme,'light')).not.toContain('bg-even-light');
 expect(resolveManagerTheme({...theme,'bg-even-light':'explicit'},'light').tableRowEvenBackground).toBe('explicit');
 expect(resolveManagerTheme(theme,'dark').tableRowEvenBackground).toBeUndefined();
});
