import {recoverManagerContext} from '../../components/manager-preview/recoverManagerContext';
jest.mock('@controleonline/ui-common/src/react/utils/runtimeMenu',()=>({normalizeRuntimeMenuResponse:x=>x}));
const setup=()=>{const people={getters:{currentCompany:{}},actions:{myCompanies:jest.fn(async()=>{people.getters.currentCompany={id:3};})}};const theme={actions:{setMenus:jest.fn()}};const api={fetch:jest.fn(async()=>['authorized'])};return {people,theme,api,isCurrent:()=>true};};
it('recovers the canonical company and both scoped menu types without dropping the toolbar',async()=>{
 const x=setup();
 x.api.fetch.mockImplementation(async(url,{params})=>[params.menuType==='home'?'authorized-home':'authorized-toolbar']);
 await recoverManagerContext(x);
 expect(x.people.actions.myCompanies).toHaveBeenCalledTimes(1);
 for(const menuType of ['home','toolbar'])expect(x.api.fetch).toHaveBeenCalledWith('menus-people',{params:{myCompany:3,appType:'MANAGER',menuType}});
 expect(x.theme.actions.setMenus).toHaveBeenCalledWith(['authorized-home','authorized-toolbar']);
});
it('does not invent a company or menus when the canonical read fails',async()=>{const x=setup();x.people.actions.myCompanies.mockRejectedValue(new Error('Network'));await expect(recoverManagerContext(x)).rejects.toThrow('Network');expect(x.api.fetch).not.toHaveBeenCalled();expect(x.theme.actions.setMenus).not.toHaveBeenCalled();});
it('discards menus if the company changes during the read',async()=>{const x=setup();x.api.fetch.mockImplementation(async()=>{x.people.getters.currentCompany={id:9};return ['old'];});await recoverManagerContext(x);expect(x.theme.actions.setMenus).not.toHaveBeenCalled();});
it('does not request private context after logout',async()=>{const x=setup();x.isCurrent=()=>false;await recoverManagerContext(x);expect(x.people.actions.myCompanies).not.toHaveBeenCalled();expect(x.api.fetch).not.toHaveBeenCalled();});
