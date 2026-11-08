import {identifyThemeScreen,screenThemeKey,parseScreenThemeKey} from '../../styles/screenThemeKeys';
import {resolveScreenThemeDetails,screenThemeCss} from '../../styles/screenTheme';
import {resolveManagerThemeDetails} from '../../styles/managerTheme';
import {serializeThemeColors} from '../../styles/themeEditorModel';
const home=identifyThemeScreen({name:'HomePage'},'MANAGER','Início');
const finance=identifyThemeScreen({name:'FinancialHubPage'},'MANAGER','Centro financeiro');
const raw={'cardBackground-light':'#111111','cardBackground-dark':'#222222','cardText-light':'#ffffff'};
test('screen identity uses route and store, never record ID, translated label, navigation instance or filters',()=>{
 const a=identifyThemeScreen({name:'Details',key:'random',params:{store:'invoice',id:1,filter:'x'}},'MANAGER','Receber');
 const b=identifyThemeScreen({name:'Details',key:'other',params:{store:'invoice',id:52,filter:'y'}},'MANAGER','Receive');
 expect(a.id).toBe(b.id);expect(a.id).not.toBe(identifyThemeScreen({name:'Details',params:{store:'orders'}},'MANAGER').id);
 expect(a.id).not.toBe(identifyThemeScreen({name:'Details',params:{store:'invoice'}},'ADMIN').id);
});
test('CSS-safe storage keys round-trip without accepting unknown token vocabularies',()=>{
 const key=screenThemeKey(finance.id,'cardBackground','light');
 expect(key).toMatch(/^[\w-]+$/);expect(parseScreenThemeKey(key)).toEqual({screen:finance.id,token:'cardBackground',mode:'light'});
 expect(()=>screenThemeKey(finance.id,'inventedColor','light')).toThrow();expect(parseScreenThemeKey('screen_001__cardBackground-light')).toBeNull();
});
test('finance overrides affect only that screen and mode, preserving global and Home values',()=>{
 const key=screenThemeKey(finance.id,'cardBackground','light'),colors={...raw,[key]:'#abcdef'};
 expect(resolveScreenThemeDetails(colors,'light',finance.id).values.cardBackground).toBe('#abcdef');
 expect(resolveScreenThemeDetails(colors,'light',home.id).values.cardBackground).toBe('#111111');
 expect(resolveScreenThemeDetails(colors,'dark',finance.id).values.cardBackground).toBe('#222222');
 expect(resolveManagerThemeDetails(colors,'light').values.cardBackground).toBe('#111111');
 expect(resolveScreenThemeDetails(colors,'light',finance.id).sources.cardBackground).toBe(key);
 expect(colors['cardBackground-light']).toBe('#111111');
});
test('global edits affect inheriting screens while a local override stays independent',()=>{
 const colors={...raw,'cardBackground-light':'#334455',[screenThemeKey(finance.id,'cardBackground','light')]:'#abcdef'};
 expect(resolveScreenThemeDetails(colors,'light',finance.id).values.cardBackground).toBe('#abcdef');
 expect(resolveScreenThemeDetails(colors,'light',home.id).values.cardBackground).toBe('#334455');
});
test('clearing a local customization inherits the current global value without storing a copy',()=>{
 const colors={...raw,[screenThemeKey(finance.id,'cardBackground','light')]:''};
 expect(resolveScreenThemeDetails(colors,'light',finance.id).sources.cardBackground).toBe('cardBackground-light');
 expect(screenThemeCss(colors,'light',finance.id)).toEqual({});
});
test('screen transport metadata is excluded from the global runtime palette and does not switch legacy resolution',()=>{
 const key=screenThemeKey(finance.id,'cardBackground','dark'),colors={darkCard:'#123456','bg-dark':'#010203',[key]:'#abcdef',[`q-${key}`]:'#abcdef'};
 const global=resolveManagerThemeDetails(colors,'dark');expect(global.values.cardBackground).toBe('#123456');
 expect(global.values).not.toHaveProperty(key);expect(global.values).not.toHaveProperty(`q-${key}`);
 expect(resolveScreenThemeDetails(colors,'dark',finance.id).values).toMatchObject({cardBackground:'#abcdef',pageBackground:'#010203'});
});
test('optional purpose inheritance follows screen overrides without overwriting explicit purpose colors',()=>{
 const colors={...raw,[screenThemeKey(finance.id,'cardBackground','light')]:'#abcdef'};
 expect(resolveScreenThemeDetails(colors,'light',finance.id).values.indicatorCardBackground).toBe('#abcdef');
 expect(resolveScreenThemeDetails({...colors,'indicatorCardBackground-light':'#123456'},'light',finance.id).values.indicatorCardBackground).toBe('#123456');
});
test('a local shortcut background preview leaves the sidebar and other screens unchanged',()=>{
 const colors={'navigationBackground-light':'#101010',
  [screenThemeKey(home.id,'shortcutBarBackground','light')]:'#ffee00'};
 expect(resolveScreenThemeDetails(colors,'light',home.id).values).toMatchObject({
  shortcutBarBackground:'#ffee00',navigationBackground:'#101010',
 });
 expect(resolveScreenThemeDetails(colors,'light',finance.id).values.shortcutBarBackground).toBe('#101010');
});
test('scoped serialization retains keys and validates their actual canonical token types',()=>{
 const key=screenThemeKey(finance.id,'cardBackground','light'),opacity=screenThemeKey(finance.id,'buttonDisabledOpacity','light');
 expect(serializeThemeColors({[key]:'#abcdef',[opacity]:'0.5'})).toEqual({[key]:'#abcdef',[opacity]:'0.5'});
 expect(()=>serializeThemeColors({[key]:'invalid'})).toThrow();expect(()=>serializeThemeColors({[opacity]:'2'})).toThrow();
});
