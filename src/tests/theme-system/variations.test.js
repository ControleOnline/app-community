import contract from '../../styles/themeContract.generated';
import {resolveManagerThemeDetails,describeThemeColor} from '../../styles/managerTheme';
import {themeVariationTokens,describeThemeScope} from '../../styles/themeVariations';
const {parseThemeMap}=require('../../../scripts/lib/theme-contract.cjs');
const colors={'cardBackground-light':'#111111','cardBackground-dark':'#222222','cardText-light':'#ffffff','cardText-dark':'#eeeeee'};
test('unconfigured variants inherit the existing same-mode color and report its exact source without mutating storage',()=>{
 const before={...colors};
 expect(describeThemeColor(colors,'indicatorCardBackground','light')).toEqual({value:'#111111',source:'cardBackground-light'});
 expect(describeThemeColor(colors,'summaryCardBackground','dark')).toEqual({value:'#222222',source:'cardBackground-dark'});
 expect(colors).toEqual(before);expect(colors).not.toHaveProperty('indicatorCardBackground-light');
});
test('a variation changes only its purpose and mode, preserving default, other purpose and unrelated elements',()=>{
 const theme={...colors,'indicatorCardBackground-light':'#abcdef','indicatorCardText-light':'#010203'};
 const light=resolveManagerThemeDetails(theme,'light').values,dark=resolveManagerThemeDetails(theme,'dark').values;
 expect(light).toMatchObject({cardBackground:'#111111',indicatorCardBackground:'#abcdef',summaryCardBackground:'#111111',cardText:'#ffffff',indicatorCardText:'#010203'});
 expect(dark).toMatchObject({indicatorCardBackground:'#222222',cardBackground:'#222222',summaryCardBackground:'#222222'});
});
test('clearing a variation returns to its base; a missing base never borrows a color from the other mode',()=>{
 expect(describeThemeColor({...colors,'indicatorCardBackground-light':''},'indicatorCardBackground','light')).toEqual({value:'#111111',source:'cardBackground-light'});
 expect(describeThemeColor({'cardBackground-light':'#112233'},'indicatorCardBackground','dark')).toEqual({value:'',source:null});
});
test('saving the first variation does not switch a legacy palette to a different resolution model',()=>{
 const legacy={darkCard:'#123456','bg-dark':'#010203','indicatorCardBackground-dark':'#abcdef'};
 const values=resolveManagerThemeDetails(legacy,'dark').values;
 expect(values).toMatchObject({cardBackground:'#123456',summaryCardBackground:'#123456',indicatorCardBackground:'#abcdef',pageBackground:'#010203'});
 expect(describeThemeColor({...legacy,indicatorCardBackground:'#ffffff','indicatorCardBackground-light':'#010101','indicatorCardBackground-dark':undefined},'indicatorCardBackground','dark')).toEqual({value:'#123456',source:'darkCard'});
});
test('inspecting a purpose exposes its complete color family without selecting defaults or other purposes',()=>{
 const tokens=themeVariationTokens(['indicatorCardBackground']);
 expect(tokens).toHaveLength(7);expect(tokens).toContain('indicatorCardText');expect(tokens).not.toContain('cardBackground');expect(tokens).not.toContain('summaryCardText');
 expect(describeThemeScope(tokens)).toEqual([{label:'Cards de indicadores',usage:contract.variants.indicatorCardBackground.usage}]);
});
test('contract generation rejects nonexistent bases and nested inheritance',()=>{
 expect(()=>parseThemeMap('### card\n- `testColor` <!-- base: absent; variant: test; label: Test; usage: Test -->')).toThrow('Invalid theme variation base');
 expect(()=>parseThemeMap('### card\n- `base`\n- `first` <!-- base: base; variant: test; label: Test; usage: Test -->\n- `second` <!-- base: first; variant: test; label: Test; usage: Test -->')).toThrow('Invalid theme variation base');
});
