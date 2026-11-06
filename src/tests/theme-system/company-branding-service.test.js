import {api} from '@controleonline/ui-common/src/api';
import {editorContext} from '../../components/theme-editor/themeService';
import {loadCompanyBranding,saveCompanyBranding} from '../../components/theme-editor/companyBrandingService';
jest.mock('@controleonline/ui-common/src/api',()=>({api:{fetch:jest.fn()}}));
const company={id:5},empty={logoLight:'',logoDark:''},draft={logoLight:'/files/20/download',logoDark:'/white.svg'};
beforeEach(()=>api.fetch.mockReset());
test('loads only branding configuration of the selected company',async()=>{
 api.fetch.mockResolvedValueOnce({'hydra:member':[{configKey:'company_branding',configValue:JSON.stringify(draft)}]});
 expect((await loadCompanyBranding(company)).branding).toEqual(draft);
 expect(api.fetch).toHaveBeenCalledWith('configs',{params:{people:5,configKey:'company_branding',itemsPerPage:50}});
});
test('uses the existing company configuration endpoint and never modifies theme colors or links',async()=>{
 api.fetch.mockResolvedValueOnce({'hydra:member':[]}).mockResolvedValueOnce({id:30});
 await saveCompanyBranding(company,empty,draft,editorContext());
 expect(api.fetch.mock.calls[1]).toEqual(['configs/add-configs',{method:'POST',body:{people:5,configKey:'company_branding',configValue:JSON.stringify(draft),visibility:'public'}}]);
});
test('rejects stale configuration and does not write',async()=>{
 api.fetch.mockResolvedValueOnce({'hydra:member':[{configKey:'company_branding',configValue:JSON.stringify(draft)}]});
 await expect(saveCompanyBranding(company,empty,draft,editorContext())).rejects.toThrow('outra edição');expect(api.fetch).toHaveBeenCalledTimes(1);
});
test('does not save when editor was closed or selection changed while loading',async()=>{
 let current=true;api.fetch.mockImplementationOnce(async()=>{current=false;return {'hydra:member':[]};});
 await expect(saveCompanyBranding(company,empty,draft,editorContext(),()=>current)).rejects.toThrow('sessão');expect(api.fetch).toHaveBeenCalledTimes(1);
});
test('rejects invalid addresses and changed session before requesting data',async()=>{
 await expect(saveCompanyBranding(company,empty,{...draft,logoLight:'javascript:x'},editorContext())).rejects.toThrow('válidos');
 await expect(saveCompanyBranding(company,empty,draft,'old-session')).rejects.toThrow('sessão');expect(api.fetch).not.toHaveBeenCalled();
});
test('does not report success when the existing endpoint returns an error body',async()=>{
 api.fetch.mockResolvedValueOnce({'hydra:member':[]}).mockResolvedValueOnce({error:'Permission denied'});
 await expect(saveCompanyBranding(company,empty,draft,editorContext())).rejects.toThrow('não confirmou');
});
