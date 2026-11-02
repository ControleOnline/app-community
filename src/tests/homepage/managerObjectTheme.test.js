import fs from 'node:fs';
import path from 'node:path';
import light from '../../../docs/themes/lave-go/light.json';
import dark from '../../../docs/themes/lave-go/dark.json';
import {localDomainThemeEnabled} from '../../components/manager-preview/localDomainTheme';
import {previewPalette, readPreviewMode} from '../../components/manager-preview/model';
import {managerObjectThemeTokens, missingManagerThemeTokens, resolveManagerTheme} from '../../styles/managerTheme';

const location = (hostname='localhost', search='') => ({hostname,search});
const domain = 'https://app.lave-go.com';
jest.mock('react-native',()=>({Platform:{OS:'web'}}));
jest.mock('@appType',()=>({app_type:'MANAGER'}));
jest.mock('@env',()=>({env:{DOMAIN:'https://app.lave-go.com'}}));
afterEach(()=>{delete global.window;delete global.localStorage;});

it('enables the approved theme on normal localhost only for the configured Lave-Go domain',()=>{
 expect(localDomainThemeEnabled(location(),domain)).toBe(true);
 expect(localDomainThemeEnabled(location('127.0.0.1','?lavegoThemePreview=dark'),domain)).toBe(true);
 for(const host of ['app.lave-go.com','manager.controleonline.com','staging.controleonline.com'])
  expect(localDomainThemeEnabled(location(host),domain)).toBe(false);
 for(const other of ['https://staging.controleonline.com','http://localhost:8081','https://manager.controleonline.com','invalid'])
  expect(localDomainThemeEnabled(location(),other)).toBe(false);
 expect(localDomainThemeEnabled(location('localhost',''),domain)).toBe(true);
});
it.each([['light',light],['dark',dark]])('%s contains only canonical object tokens and covers the consumed roles',(mode,fixture)=>{
 const map=fs.readFileSync(path.join(process.cwd(),'docs/themes/themes-map.md'),'utf8');
 const allowed=new Set([...map.matchAll(/^- `([^`]+)`/gm)].map(match=>match[1]));
 expect(Object.keys(fixture).filter(key=>!allowed.has(key))).toEqual([]);
 expect(missingManagerThemeTokens({},mode,fixture)).toEqual([]);
 const changed={...fixture}; delete changed.cardIconBackground;
 expect(missingManagerThemeTokens({},mode,changed)).toContain('cardIconBackground');
 global.window={location:location('localhost',`?lavegoThemePreview=${mode}`)};
 expect(previewPalette({pageBackground:'another-domain',darkCard:'legacy'},mode)).toEqual(fixture);
 expect(previewPalette({},mode).cardIconBackground).toBe(fixture.cardIconBackground);
});
it('selects the approved local theme without a query and never leaks it into published domains',()=>{
 const source={pageBackground:'other-page',cardBackground:'other-card','bg-dark':'other-night'};
 global.window={location:location('localhost','')};
 expect(previewPalette(source,'light')).toEqual(light);
 global.window={location:location()}; expect(previewPalette(source,'light')).toEqual(light);
 global.window={location:location('staging.controleonline.com')};
 expect(previewPalette(source,'dark')).toEqual(resolveManagerTheme(source,'dark'));
 expect(source.cardBackground).toBe('other-card');
});
it('uses object tokens without color literals, cross-token fallbacks, or Lave-Go branches in the shared objects',()=>{
 const dir=path.join(process.cwd(),'src/components/manager-preview');
 for(const file of ['ManagerOverview.js','ManagerShell.js','ManagerCompanySelector.js','ManagerAccountMenu.js','ManagerOrdersTrend.js']){
  const source=fs.readFileSync(path.join(dir,file),'utf8');
  expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/);
  expect(source).not.toMatch(/c\.\w+\s*\|\|\s*c\./);
  expect(source).not.toMatch(/lavego|localThemePreview|reviewStyles/i);
  for(const match of source.matchAll(/\bc\.([A-Za-z]+)/g)) expect(managerObjectThemeTokens).toContain(match[1]);
 }
});

it('uses the saved menu preference rather than the retired preview query',()=>{
 global.window={location:location('localhost','?lavegoThemePreview=light')};
 global.localStorage={getItem:()=> 'dark'};
 expect(readPreviewMode()).toBe('dark');
 global.window.location.search='?lavegoThemePreview=dark';
 global.localStorage={getItem:()=> 'light'};
 expect(readPreviewMode()).toBe('light');
});
