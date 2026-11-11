import fs from 'node:fs';
import path from 'node:path';
import contract from '../../styles/themeContract.generated';
import {apiModeTheme,resolveManagerTheme} from '../../styles/managerTheme';
import {env} from '@env';
import {themeEditorGroups,themeFieldValue,serializeThemeColors,validThemeValue} from '../../styles/themeEditorModel';
const {parseThemeMap}=require('../../../scripts/lib/theme-contract.cjs');
test('the generated contract exactly matches Markdown and preserves all 26 preview groups',()=>{
  const parsed=parseThemeMap(fs.readFileSync(path.join(process.cwd(),'docs/themes/themes-map.md'),'utf8'));
  expect(contract.names).toEqual(parsed.names);expect(contract.groups).toEqual(parsed.groups);
  expect(new Set(contract.names).size).toBe(362);
  expect(contract.variants).toEqual(parsed.variants);
  expect(contract.legacyKeys).toEqual(parsed.legacyKeys);
  expect(themeEditorGroups()).toHaveLength(26);
  expect(themeEditorGroups()[0]).toEqual({label:'tokens base',tokens:['loadingSpinner']});
});
test('rejects invented transport names and never borrows a light value for missing dark',()=>{
  expect(apiModeTheme({'inventedColor-light':'#123456'},'light')).toBeNull();
  const colors={cardBackground:'#ffffff','cardBackground-light':'#ffffff','pageBackground-dark':'#000000'};
  expect(resolveManagerTheme(colors,'dark').cardBackground).toBeUndefined();
  expect(themeFieldValue(colors,'cardBackground','dark')).toBe('');
});
test('preserves explicit shared values and selects primary/secondary modes independently',()=>{
  const colors={iconBackground:'rgba(1,2,3,.5)','buttonBackground-light':'#ffffff','buttonBackground-dark':'#000000','buttonBackgroundSecondary-light':'#aaaaaa','buttonBackgroundSecondary-dark':'#bbbbbb'};
  expect(resolveManagerTheme(colors,'dark')).toMatchObject({iconBackground:'rgba(1,2,3,.5)',buttonBackground:'#000000',buttonBackgroundSecondary:'#bbbbbb'});
  expect(themeFieldValue({cardBackground:'#ffffff'},'cardBackground','dark')).toBe('#ffffff');
});
test('reads shortcut colors from the theme and never from the domain name',()=>{
  const previousDomain=env.DOMAIN;
  env.DOMAIN='https://app.lave-go.com';
  const colors={'navigationBackground-light':'#020202','navigationActiveBackground-light':'#facc0c',
    'navigationBackground-dark':'#29261e','navigationActiveBackground-dark':'#febc1d'};
  try {
    expect(resolveManagerTheme(colors,'light')).toMatchObject({
      navigationBackground:'#020202',navigationActiveBackground:'#facc0c',
      shortcutBarBackground:'#020202',shortcutBarActiveBackground:'#facc0c',
    });
    expect(resolveManagerTheme(colors,'dark').shortcutBarBackground).toBe('#29261e');
    expect(resolveManagerTheme({...colors,'shortcutBarBackground-light':'#abcdef'},'light')
      .shortcutBarBackground).toBe('#abcdef');
  }finally{
    env.DOMAIN=previousDomain;
  }
});
test('preserves opacity, rgba, transparent and pre-existing legacy fields on serialization',()=>{
  expect(serializeThemeColors({buttonDisabledOpacity:'0.5','modalOverlay-dark':'rgba(1, 2, 3, .5)',containerTransparentBackground:'transparent',googleLoading:'#abcdef'})).toEqual({buttonDisabledOpacity:'0.5','modalOverlay-dark':'rgba(1, 2, 3, .5)',containerTransparentBackground:'transparent',googleLoading:'#abcdef'});
  expect(validThemeValue('buttonDisabledOpacity','1.2')).toBe(false);
  expect(()=>serializeThemeColors({'cardBackground-dark':'invalid'})).toThrow();
});

test('the component preview defaults to the domain theme and can explicitly show the company registration',()=>{
 const {displayedThemes}=require('../../styles/themeEditorModel');
 const domain={id:11,theme:'Domínio'},company={id:5,theme:'GYROS'};
 expect(displayedThemes([company],domain,true)).toEqual([domain]);
 expect(displayedThemes([company],domain,false)).toEqual([company]);
 expect(displayedThemes([company],null,true)).toEqual([company]);
});

test('reuses saved scrollbar colors for each mode and preserves the legacy palette model',()=>{
  const colors={
    'bg-dark':'#111111',
    'scrollbar-thumb-light':'#444444',
    'scrollbar-thumb-dark':'#cccccc',
    'scrollbar-track-dark':'#222222',
    'scrollbar-thumb-hover-dark':'#dddddd',
    'scrollbarThumb-light':'#666666',
  };
  expect(themeFieldValue(colors,'scrollbarThumb','light')).toBe('#666666');
  expect(themeFieldValue(colors,'scrollbarThumb','dark')).toBe('#cccccc');
  expect(resolveManagerTheme(colors,'dark')).toMatchObject({
    pageBackground:'#111111',scrollbarThumb:'#cccccc',scrollbarTrack:'#222222',scrollbarThumbHover:'#dddddd',
  });
  expect(resolveManagerTheme(colors,'light').scrollbarTrack).toBeUndefined();
});
