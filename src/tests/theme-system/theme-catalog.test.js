import React from 'react';
import renderer,{act} from 'react-test-renderer';
import ThemeCatalog from '../../components/theme-editor/ThemeCatalog';
import {loadThemeCatalog,loadCatalogTheme,applyDomainTheme,deleteUnusedTheme} from '../../components/theme-editor/themeManagementService';
let mockAvailable=true;
jest.mock('../../components/theme-editor/ThemeToolsProvider',()=>({useThemeTools:()=>({available:mockAvailable})}));
jest.mock('../../styles/themeRuntime',()=>({useThemeRuntime:()=>({raw:{},mode:'dark'})}));
jest.mock('../../components/theme-editor/themeService',()=>({editorContext:()=> 'local-session'}));
jest.mock('../../components/theme-editor/themeManagementService',()=>({loadThemeCatalog:jest.fn(),loadCatalogTheme:jest.fn(),applyDomainTheme:jest.fn(),deleteUnusedTheme:jest.fn()}));
jest.mock('../../components/theme-editor/ThemeEditorDialog',()=> 'ThemeEditorDialog');
const data={domain:{id:7,domain:'localhost:8081',themeId:11,canApply:true},canDeleteUnused:true,canManageGlobal:true,items:[{id:11,theme:'ATUAL',canEdit:true,usage:{count:1,links:[{type:'domain',id:7,domain:'localhost:8081',companyId:3}],hiddenCount:0},canDelete:false},{id:5,theme:'GYROS',canEdit:true,usage:{count:0,links:[],hiddenCount:0},canDelete:true}]};
const text=tree=>tree.root.findAllByType('Text').map(n=>n.children.join('')).join('\n');
const button=(tree,label)=>tree.root.findAllByType('Pressable').find(n=>n.props.accessibilityLabel===label || n.findAllByType('Text').some(t=>t.children.join('')===label));
async function open(){let tree;await act(async()=>{tree=renderer.create(<ThemeCatalog/>);});await act(async()=>button(tree,'Gerenciar temas e vínculos').props.onPress());return tree;}
beforeEach(()=>{mockAvailable=true;jest.clearAllMocks();loadThemeCatalog.mockResolvedValue(data);loadCatalogTheme.mockResolvedValue({...data.items[1],colors:{}});});
test('shows current theme and links without any write, blocking deletion in use',async()=>{
 const tree=await open();expect(text(tree)).toContain('Tema: ATUAL #11');expect(text(tree)).toContain('Em uso em localhost:8081');expect(text(tree)).toContain('Empresa #3');
 expect(text(tree)).not.toContain('Domínio: localhost:8081');
 await act(async()=>button(tree,'Ver vínculos de ATUAL').props.onPress());
 expect(text(tree)).toContain('Domínio: localhost:8081');
 expect(button(tree,'Excluir ATUAL')).toBeUndefined();expect(applyDomainTheme).not.toHaveBeenCalled();expect(deleteUnusedTheme).not.toHaveBeenCalled();await act(async()=>tree.unmount());
});
test('application confirmation identifies old/new theme and cancel performs no write',async()=>{
 const tree=await open();await act(async()=>button(tree,'Aplicar GYROS neste domínio').props.onPress());
 expect(text(tree)).toContain('De: ATUAL #11\nPara: GYROS #5');expect(applyDomainTheme).not.toHaveBeenCalled();
 await act(async()=>button(tree,'Cancelar').props.onPress());expect(applyDomainTheme).not.toHaveBeenCalled();await act(async()=>tree.unmount());
});
test('confirmed application uses domain identity and reloads list',async()=>{
 const tree=await open();await act(async()=>button(tree,'Aplicar GYROS neste domínio').props.onPress());await act(async()=>button(tree,'Confirmar aplicação').props.onPress());
 expect(applyDomainTheme).toHaveBeenCalledWith(data.domain,data.items[1],'local-session',expect.any(Function));expect(loadThemeCatalog).toHaveBeenCalledTimes(2);await act(async()=>tree.unmount());
});
test('deletion is explicit and a server refusal is shown',async()=>{
 deleteUnusedTheme.mockRejectedValue(new Error('Tema em uso'));
 const tree=await open();await act(async()=>button(tree,'Gestão global').props.onPress());await act(async()=>button(tree,'Excluir GYROS').props.onPress());expect(deleteUnusedTheme).not.toHaveBeenCalled();
 await act(async()=>button(tree,'Confirmar exclusão').props.onPress());expect(text(tree)).toContain('Tema em uso');await act(async()=>tree.unmount());
});
test('read-only users see themes but no apply, edit or delete controls',async()=>{
 mockAvailable=false;const tree=await open();expect(text(tree)).toContain('GYROS #5');expect(button(tree,'Excluir GYROS')).toBeUndefined();expect(button(tree,'Aplicar GYROS neste domínio')).toBeUndefined();await act(async()=>tree.unmount());
});
test('editor receives full persisted colors',async()=>{
 const full={...data.items[1],colors:{accent:'#abcdef'}};loadCatalogTheme.mockResolvedValue(full);
 const tree=await open();await act(async()=>button(tree,'Editar cores de GYROS').props.onPress());expect(tree.root.findByType('ThemeEditorDialog').props.theme).toBe(full);await act(async()=>tree.unmount());
});

test('ordinary users cannot see or open global management, and default scope is companies',async()=>{
 loadThemeCatalog.mockResolvedValue({...data,canManageGlobal:false,canDeleteUnused:false});
 const tree=await open();expect(button(tree,'Gestão global')).toBeUndefined();
 expect(loadThemeCatalog).toHaveBeenCalledWith('local-session',expect.any(Function),'companies');
 expect(button(tree,'Excluir GYROS')).toBeUndefined();await act(async()=>tree.unmount());
});
test('superadministrator must explicitly switch scope before seeing global deletion controls',async()=>{
 const tree=await open();expect(button(tree,'Excluir GYROS')).toBeUndefined();
 await act(async()=>button(tree,'Gestão global').props.onPress());
 expect(loadThemeCatalog).toHaveBeenLastCalledWith('local-session',expect.any(Function),'global');
 expect(button(tree,'Excluir GYROS').props.disabled).toBe(false);
 expect(button(tree,'Excluir ATUAL').props.disabled).toBe(true);await act(async()=>tree.unmount());
});

test('pins the applied theme without mutating API order and highlights all visible companies once',async()=>{
 const shared={...data.items[0],usage:{count:3,hiddenCount:1,links:[
  {type:'domain',id:1,domain:'one.example',companyId:1,companyName:'CONTROLE ONLINE'},
  {type:'domain',id:2,domain:'two.example',companyId:1,companyName:'CONTROLE ONLINE'},
  {type:'domain',id:3,domain:'three.example',companyId:2,companyName:'TESTE'}]}};
 const source=[data.items[1],shared];loadThemeCatalog.mockResolvedValue({...data,items:source});
 const tree=await open();
 const cards=tree.root.findAllByType('View').filter(n=>n.props.testID?.startsWith('theme-catalog-card-'));
 expect(cards.map(n=>n.props.testID)).toEqual(['theme-catalog-card-11','theme-catalog-card-5']);
 expect(source.map(n=>n.id)).toEqual([5,11]);
 expect(text(tree)).toContain('CONTROLE ONLINE · TESTE');expect(text(tree)).not.toContain('one.example');
 await act(async()=>button(tree,'Ver vínculos de ATUAL').props.onPress());
 expect(text(tree)).toContain('one.example');expect(text(tree)).toContain('sem permissão para exibir detalhes');
 await act(async()=>button(tree,'Ocultar vínculos de ATUAL').props.onPress());expect(text(tree)).not.toContain('one.example');
 expect(applyDomainTheme).not.toHaveBeenCalled();expect(deleteUnusedTheme).not.toHaveBeenCalled();await act(async()=>tree.unmount());
});
test('company search uses only visible link details and changing scope collapses links again',async()=>{
 loadThemeCatalog.mockResolvedValue({...data,items:[{...data.items[0],usage:{...data.items[0].usage,links:[{...data.items[0].usage.links[0],companyName:'CONTROLE ONLINE'}]}},data.items[1]]});
 const tree=await open();
 const search=tree.root.findByType('TextInput');await act(async()=>search.props.onChangeText('CONTROLE ONLINE'));
 expect(text(tree)).toContain('Tema: ATUAL #11');expect(text(tree)).not.toContain('Tema: GYROS #5');
 await act(async()=>button(tree,'Ver vínculos de ATUAL').props.onPress());
 await act(async()=>button(tree,'Gestão global').props.onPress());
 expect(button(tree,'Ver vínculos de ATUAL').props.accessibilityState.expanded).toBe(false);
 expect(text(tree)).not.toContain('Domínio: localhost:8081');await act(async()=>tree.unmount());
});

test('offers a read-only preview before confirmation, with permission from the domain',async()=>{
 mockAvailable=false;
 loadCatalogTheme.mockResolvedValue({...data.items[1],colors:{'cardBackground-light':'#abcdef','cardBackground-dark':'#123456'}});
 let tree;await act(async()=>{tree=renderer.create(<ThemeCatalog mode="apply"/>);});
 await act(async()=>button(tree,'Trocar tema').props.onPress());
 await act(async()=>button(tree,'Prévia de GYROS').props.onPress());
 expect(text(tree)).toContain('GYROS #5');
 expect(tree.root.findByProps({testID:'theme-swap-preview'}).findAllByType('View').some(view=>view.props.style?.backgroundColor==='#abcdef')).toBe(true);
 await act(async()=>button(tree,'Escuro').props.onPress());
 expect(tree.root.findByProps({testID:'theme-swap-preview'}).findAllByType('View').some(view=>view.props.style?.backgroundColor==='#123456')).toBe(true);
 expect(applyDomainTheme).not.toHaveBeenCalled();
 await act(async()=>button(tree,'Confirmar aplicação').props.onPress());
 expect(applyDomainTheme).toHaveBeenCalledWith(data.domain,data.items[1],'local-session',expect.any(Function));
 await act(async()=>tree.unmount());
});
