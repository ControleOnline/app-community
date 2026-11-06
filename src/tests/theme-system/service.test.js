import {api} from '@controleonline/ui-common/src/api';
import {loadDomainTheme,saveThemeChanges,editorContext} from '../../components/theme-editor/themeService';
import {storeSession} from '../../session/sessionScope';
import {env} from '@env';
import {screenThemeKey} from '../../styles/screenThemeKeys';
import {resolveScreenThemeDetails} from '../../styles/screenTheme';
jest.mock('@controleonline/ui-common/src/api',()=>({api:{fetch:jest.fn()}}));
const theme={id:11,theme:'Domínio',background:4,colors:{cardBackground:'#ffffff',googleLoading:'#aabbcc'}};
beforeEach(()=>api.fetch.mockReset());
test('loads the exact domain theme rather than the selected company theme',async()=>{
  api.fetch.mockResolvedValueOnce({'hydra:member':[{domain:'other.test',theme:'/themes/5'},{domain:'localhost:8081',theme:'/themes/11'}]}).mockResolvedValueOnce(theme);
  expect((await loadDomainTheme()).id).toBe(11);expect(api.fetch).toHaveBeenLastCalledWith('themes/11');
});
test('saves only explicit edits while retaining fresh unrelated values and theme metadata',async()=>{
  api.fetch.mockResolvedValueOnce({...theme,colors:{...theme.colors,textPrimary:'#112233'}}).mockResolvedValueOnce({id:11});
  const saved=await saveThemeChanges(theme,{'cardBackground-light':'#fedcba'},editorContext());
  expect(api.fetch.mock.calls[1]).toEqual(['themes/11',{method:'PUT',body:{theme:'Domínio',background:4,colors:{cardBackground:'#ffffff',googleLoading:'#aabbcc',textPrimary:'#112233','cardBackground-light':'#fedcba'}}}]);
  expect(saved.colors.googleLoading).toBe('#aabbcc');
});
test('a concurrent change to an edited field is not overwritten',async()=>{
  api.fetch.mockResolvedValueOnce({...theme,colors:{cardBackground:'#000000'}});
  await expect(saveThemeChanges(theme,{cardBackground:'#123456'},editorContext())).rejects.toThrow('foi alterada');
  expect(api.fetch).toHaveBeenCalledTimes(1);
});
test('a session changed since the editor opened cannot save into the new context',async()=>{
  const context=editorContext();storeSession({api_key:'new-user'},env);
  await expect(saveThemeChanges(theme,{cardBackground:'#123456'},context)).rejects.toThrow('sessão');
  expect(api.fetch).not.toHaveBeenCalled();
});
test('scoped colors survive the existing save/reload JSON transport without changing global colors or metadata',async()=>{
 const screen='["MANAGER","FinancialHubPage",""]',key=screenThemeKey(screen,'cardBackground','light');
 api.fetch.mockResolvedValueOnce(theme).mockResolvedValueOnce({id:11});
 const saved=await saveThemeChanges(theme,{[key]:'#123456'},editorContext());
 const body=api.fetch.mock.calls[1][1].body;
 const reloaded=JSON.parse(JSON.stringify(body));
 expect(body.background).toBe(4);expect(body.colors.cardBackground).toBe('#ffffff');
 expect(resolveScreenThemeDetails(reloaded.colors,'light',screen).values.cardBackground).toBe('#123456');
 expect(resolveScreenThemeDetails(reloaded.colors,'light','other').values.cardBackground).toBe('#ffffff');
 expect(saved.colors[key]).toBe('#123456');
});
