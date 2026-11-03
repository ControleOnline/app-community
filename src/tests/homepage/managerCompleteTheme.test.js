import fs from 'node:fs';
import path from 'node:path';
import light from '../../../docs/themes/manager/light.json';
import dark from '../../../docs/themes/manager/dark.json';
import {localManagerThemeEnabled, localDomainTheme, domainProfile} from '../../components/manager-preview/localDomainTheme';
import {apiModeTheme, missingManagerThemeTokens, resolveManagerTheme} from '../../styles/managerTheme';
const config={DOMAIN:'http://localhost:8081',API_ENTRYPOINT:'http://localhost:8000'};
jest.mock('@env',()=>({env:{DOMAIN:'http://localhost:8081',API_ENTRYPOINT:'http://localhost:8000'}}));
afterEach(()=>{delete global.window;});
it.each([['light',light],['dark',dark]])('%s supplies every canonical token without legacy aliases',(mode,palette)=>{
 const map=fs.readFileSync(path.join(process.cwd(),'docs/themes/themes-map.md'),'utf8');
 const expected=[...map.matchAll(/^- `([^`]+)`/gm)].map(x=>x[1]).sort();
 expect(Object.keys(palette).sort()).toEqual(expected);
 expect(missingManagerThemeTokens({},mode,palette)).toEqual([]);
 for(const [key,value] of Object.entries(palette))
   expect(value).toMatch(key==='buttonDisabledOpacity'?/^0\.\d+$/:/^#[\da-f]{6}([\da-f]{2})?$/i);
 global.window={location:{hostname:'localhost',search:'?managerThemePreview=1'}};
 expect(localDomainTheme(mode)).toBeNull();
});
it('applies on normal localhost only with a local domain AND a local API',()=>{
 const location={hostname:'localhost',search:'?managerThemePreview=1'};
 expect(localManagerThemeEnabled(location,config)).toBe(true);
 expect(localManagerThemeEnabled({...location,search:''},config)).toBe(true);
 expect(localManagerThemeEnabled({...location,hostname:'manager.controleonline.com'},config)).toBe(false);
 expect(localManagerThemeEnabled(location,{...config,API_ENTRYPOINT:'https://api.controleonline.com'})).toBe(false);
 expect(localManagerThemeEnabled(location,{...config,DOMAIN:'https://app.lave-go.com'})).toBe(false);
 expect(localManagerThemeEnabled(location,{...config,DOMAIN:'invalid'})).toBe(false);
 global.window={location:{hostname:'localhost',search:''}};
 expect(localDomainTheme('light')).toBeNull();
 expect(localDomainTheme('dark')).toBeNull();
 global.window={location:{hostname:'staging.controleonline.com',search:''}};
 expect(localDomainTheme('light')).toBeNull();
});
const luminance=hex=>{
 const rgb=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4);
 return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;
};
it.each([light,dark])('keeps readable foregrounds on the main surfaces',palette=>{
 for(const [foreground,background] of [['textPrimary','pageBackground'],['cardText','cardBackground'],['textMuted','cardBackground'],['buttonText','buttonBackground'],['navigationActiveText','navigationActiveBackground'],['menuText','menuBackground'],['selectOptionSelectedText','selectOptionSelectedBackground']]){
  const a=luminance(palette[foreground]),b=luminance(palette[background]);
  expect((Math.max(a,b)+0.05)/(Math.min(a,b)+0.05)).toBeGreaterThanOrEqual(4.5);
 }
});

it('activates published profiles only for the assigned domain AND API',()=>{
 for (const [host,api,name] of [['dev.controleonline.com','dd.controleonline.com','manager'],['staging.controleonline.com','s.controleonline.com','manager'],['app.lave-go.com','apinew.lave-go.com','lave-go']]) {
   const config={DOMAIN:`https://${host}`,API_ENTRYPOINT:`https://${api}`};
   expect(domainProfile(config,{hostname:host}).theme).toBe(name);
   expect(domainProfile({...config,API_ENTRYPOINT:'https://api.other.test'},{hostname:host})).toBeNull();
   expect(domainProfile(config,{hostname:'other.test'})).toBeNull();
 }
 expect(domainProfile({DOMAIN:'https://manager.controleonline.com',API_ENTRYPOINT:'https://api.controleonline.com'},{hostname:'manager.controleonline.com'})).toBeNull();
});

it.each([['light',light],['dark',dark]])('reads all approved Manager %s tokens from the API transport',(mode,palette)=>{
 const transport=Object.fromEntries(Object.entries(palette).map(([key,value])=>[`${key}-${mode}`,value]));
 expect(apiModeTheme(transport,mode)).toEqual(palette);
 expect(resolveManagerTheme(transport,mode)).toMatchObject(palette);
});
