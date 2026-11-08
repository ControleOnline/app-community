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
  api.fetch.mockResolvedValueOnce({domain:{id:7,domain:'localhost:8081',themeId:11,canApply:true}}).mockResolvedValueOnce(theme);
  expect((await loadDomainTheme()).id).toBe(11);expect(api.fetch).toHaveBeenLastCalledWith('themes/11');
});
test('loads the exact linked theme on APIs without the domain management route', async () => {
  api.fetch.mockRejectedValueOnce(Object.assign(new Error('Not Found'), {status:404}))
    .mockResolvedValueOnce({member:[
      {id:2,domain:'another.example',theme:'/themes/5'},
      {id:7,domain:'localhost:8081',theme:'/themes/11'},
    ]})
    .mockResolvedValueOnce(theme);

  await expect(loadDomainTheme()).resolves.toMatchObject({id:11,colors:theme.colors});
  expect(api.fetch).toHaveBeenNthCalledWith(2, 'people_domains', {
    params:{domain:'localhost:8081',itemsPerPage:50},
  });
  expect(api.fetch).toHaveBeenLastCalledWith('themes/11');
});
test('does not fall back when management access is denied', async () => {
  api.fetch.mockRejectedValueOnce(Object.assign(new Error('Forbidden'), {status:403}));
  await expect(loadDomainTheme()).rejects.toThrow('Forbidden');
  expect(api.fetch).toHaveBeenCalledTimes(1);
});
test('does not pick a theme from ambiguous legacy domain records', async () => {
  api.fetch.mockRejectedValueOnce(Object.assign(new Error('Not Found'), {status:404}))
    .mockResolvedValueOnce({'hydra:member':[
      {id:7,domain:'localhost:8081',theme:'/themes/11'},
      {id:8,domain:'localhost:8081',theme:'/themes/5'},
    ]});
  await expect(loadDomainTheme()).rejects.toThrow('não possui um tema acessível');
  expect(api.fetch).toHaveBeenCalledTimes(2);
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

test('a new domain binding does not reuse the pending colors from the previous theme',async()=>{
  let resolvePrevious;
  api.fetch.mockReturnValueOnce(new Promise(resolve=>{resolvePrevious=resolve;}))
    .mockResolvedValueOnce({id:5,theme:'Novo',colors:{}});
  const previous=loadDomainTheme({themeId:11});
  const next=loadDomainTheme({themeId:5});
  await expect(next).resolves.toMatchObject({id:5});
  resolvePrevious(theme);
  await expect(previous).rejects.toThrow('tema mudou');
});
