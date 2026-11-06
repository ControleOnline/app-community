import {api} from '@controleonline/ui-common/src/api';
import {refreshDomainTheme} from '../../styles/themeRuntime';
import {loadThemeCatalog,loadCatalogTheme,applyDomainTheme,deleteUnusedTheme} from '../../components/theme-editor/themeManagementService';
let mockContext='local-session';
jest.mock('../../components/theme-editor/themeService',()=>({editorContext:()=>mockContext}));
jest.mock('@controleonline/ui-common/src/api',()=>({api:{fetch:jest.fn()}}));
jest.mock('../../styles/themeRuntime',()=>({refreshDomainTheme:jest.fn()}));
const domain={id:7,domain:'localhost:8081',themeId:11,canApply:true};
const theme={id:5,theme:'GYROS',canDelete:true,usage:{count:0}};
beforeEach(()=>{mockContext='local-session';jest.clearAllMocks();});
test('loads every catalog page preserving server permissions and domain binding',async()=>{
 api.fetch.mockResolvedValueOnce({items:[{id:11}],domain,canDeleteUnused:true,canManageGlobal:true,nextPage:2}).mockResolvedValueOnce({items:[theme],nextPage:null});
 expect(await loadThemeCatalog()).toEqual({items:[{id:11},theme],domain,canDeleteUnused:true,canManageGlobal:true,scope:'companies'});
 expect(api.fetch.mock.calls[1][1].params.page).toBe(2);
});
test('rejects failed or circular pagination rather than presenting a complete-looking catalog',async()=>{
 api.fetch.mockResolvedValue({items:[theme],nextPage:1});
 await expect(loadThemeCatalog()).rejects.toThrow('paginação');
 api.fetch.mockResolvedValue({error:'forbidden'});
 await expect(loadThemeCatalog()).rejects.toThrow('carregar');
});
test('apply submits only the selected theme and expected binding then refreshes the domain colors',async()=>{
 api.fetch.mockResolvedValue({domainId:7,themeId:5});
 await applyDomainTheme(domain,theme,mockContext);
 expect(api.fetch).toHaveBeenCalledWith('theme-management/domains/7/theme',{method:'PUT',body:{themeId:5,expectedThemeId:11}});
 expect(refreshDomainTheme).toHaveBeenCalledTimes(1);
});
test('stale session, closed dialog and missing permission cannot submit a write',async()=>{
 await expect(applyDomainTheme(domain,theme,'old')).rejects.toThrow('sessão');
 await expect(applyDomainTheme(domain,theme,mockContext,()=>false)).rejects.toThrow('sessão');
 await expect(applyDomainTheme({...domain,canApply:false},theme,mockContext)).rejects.toThrow('permissão');
 expect(api.fetch).not.toHaveBeenCalled();
});
test('failed application is not reported as success or published to theme runtime',async()=>{
 api.fetch.mockResolvedValue({status:409,error:'binding changed'});
 await expect(applyDomainTheme(domain,theme,mockContext)).rejects.toThrow('não confirmou');
 expect(refreshDomainTheme).not.toHaveBeenCalled();
});
test('in-use themes cannot be deleted even when an obsolete canDelete flag says yes',async()=>{
 await expect(deleteUnusedTheme({...theme,usage:{count:1}},mockContext)).rejects.toThrow('vínculos');
 await expect(deleteUnusedTheme({...theme,canDelete:false},mockContext)).rejects.toThrow('permissões');
 expect(api.fetch).not.toHaveBeenCalled();
});
test('deletion requires an explicit successful server acknowledgment',async()=>{
 api.fetch.mockResolvedValueOnce({status:409}).mockResolvedValueOnce({deletedThemeId:5});
 await expect(deleteUnusedTheme(theme,mockContext)).rejects.toThrow('não confirmou');
 await deleteUnusedTheme(theme,mockContext);
 expect(api.fetch).toHaveBeenLastCalledWith('theme-management/themes/5',{method:'DELETE'});
});
test('editing loads persisted colors instead of using the catalog summary as an empty palette',async()=>{
 const full={...theme,colors:{'cardText-light':'#123456'}};api.fetch.mockResolvedValue(full);
 expect(await loadCatalogTheme(theme,mockContext)).toEqual(full);
 expect(api.fetch).toHaveBeenCalledWith('themes/5');
});

test('global scope is explicit and passed on every catalog page',async()=>{
 api.fetch.mockResolvedValue({items:[theme],domain,canManageGlobal:true,nextPage:null});
 const result=await loadThemeCatalog(mockContext,()=>true,'global');
 expect(api.fetch.mock.calls[0][1].params.scope).toBe('global');
 expect(result.scope).toBe('global');
});
