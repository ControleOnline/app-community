import React from 'react';
import renderer,{act} from 'react-test-renderer';
import {api} from '@controleonline/ui-common/src/api';
import AppliedThemeOverview from '../../components/theme-editor/AppliedThemeOverview';
import {loadDomainBinding,loadDomainTheme} from '../../components/theme-editor/themeService';
const runtime={status:'ready',mode:'light',raw:{'cardText-light':'#123456','cardText-dark':'#abcdef'},themeId:11};
// Domain loading is mocked below; importing the module catalog must not load the browser API client.
jest.mock('@controleonline/ui-common/src/api',()=>({api:{fetch:jest.fn(()=>{throw new Error('Unexpected API request in AppliedThemeOverview test');})}}));
jest.mock('../../styles/themeRuntime',()=>({useThemeRuntime:()=>runtime}));
let mockModuleIcons;
const mockOpenEditor=jest.fn();
jest.mock('../../components/manager-preview/ManagerPreviewProvider',()=>({useManagerPreview:()=>({moduleIcons:mockModuleIcons})}));
jest.mock('../../components/theme-editor/ThemeToolsProvider',()=>({useThemeTools:()=>({available:true,openEditor:mockOpenEditor})}));
jest.mock('../../components/theme-editor/CompanyBrandingEditor',()=> 'CompanyBrandingEditor');
jest.mock('../../components/HomeIcon', () => 'Icon');
jest.mock('../../components/theme-editor/ThemeCatalog',()=> 'ThemeCatalog');
jest.mock('../../components/theme-editor/ThemeEditorDialog',()=> 'ThemeEditorDialog');
jest.mock('../../components/theme-editor/themeService',()=>({editorContext:()=> 'local',loadDomainBinding:jest.fn(),loadDomainTheme:jest.fn()}));
const textOf=tree=>tree.root.findAllByType('Text').map(node=>node.children.join('')).join('\n');
const press=(tree,label)=>tree.root.findAllByType('Pressable').find(node=>node.findAllByType('Text').some(text=>text.children.join('')===label));
beforeEach(()=>api.fetch.mockClear());
afterEach(()=>expect(api.fetch).not.toHaveBeenCalled());
test('keeps domain #11 separate from company Gyros #5 and shows the applied values and their original keys',async()=>{
 loadDomainBinding.mockResolvedValue({id:7,themeId:11,canApply:true});
 loadDomainTheme.mockResolvedValue({id:11,theme:'Domínio real',colors:runtime.raw});
 let tree;await act(async()=>{tree=renderer.create(<AppliedThemeOverview companyThemes={[{id:5,theme:'GYROS',colors:{accent:'#febc1d'}}]}/>);});
 expect(textOf(tree)).toContain('Domínio real #11');expect(textOf(tree)).toContain('GYROS #5 · é diferente');
 await act(async()=>press(tree,'Prévia do login').props.onPress());
 expect(mockOpenEditor).toHaveBeenCalledWith({preview:'login'});
 await act(async()=>press(tree,'Editar tema aplicado').props.onPress());
 expect(tree.root.findByType('ThemeEditorDialog').props.theme.id).toBe(11);
 await act(async()=>press(tree,'Ver detalhes').props.onPress());
 const field=tree.root.findAllByType('TextInput')[0];await act(async()=>field.props.onChangeText('cardText'));
 expect(textOf(tree)).toContain('#123456');expect(textOf(tree)).toContain('theme.colors[cardText-light]');expect(textOf(tree)).toContain('#abcdef');
 await act(async()=>tree.unmount());
});
test('an inaccessible identity is reported as an error, never silently replaced by the company theme',async()=>{
 loadDomainBinding.mockRejectedValue(new Error('Sem permissão para consultar domínio'));
 let tree;await act(async()=>{tree=renderer.create(<AppliedThemeOverview companyThemes={[{id:5,theme:'GYROS'}]}/>);});
 expect(textOf(tree)).toContain('Cadastro não identificado');expect(textOf(tree)).toContain('Sem permissão');
 expect(press(tree,'Editar tema aplicado')).toBeUndefined();await act(async()=>tree.unmount());
});

test('offers to link an existing theme when the domain has no theme yet',async()=>{
 loadDomainTheme.mockClear();
 loadDomainBinding.mockResolvedValue({id:7,themeId:null,canApply:true});
 let tree;await act(async()=>{tree=renderer.create(<AppliedThemeOverview/>);});
 expect(textOf(tree)).toContain('Sem tema vinculado');
 expect(tree.root.findAllByType('ThemeCatalog').some(node=>node.props.mode==='apply')).toBe(true);
 expect(loadDomainTheme).not.toHaveBeenCalled();
 await act(async()=>tree.unmount());
});

test('shows the independent Home module layout preference in Minha interface', async () => {
 const setValue=jest.fn();
 mockModuleIcons={key:'local-user-domain',ready:true,value:false,setValue};
 loadDomainBinding.mockResolvedValue({id:7,themeId:null,canApply:true});
 let tree;
 try {
  await act(async()=>{tree=renderer.create(<AppliedThemeOverview/>);});
  expect(textOf(tree)).toContain('Minha interface');
  const toggle=tree.root.findByProps({accessibilityLabel:'Mostrar módulos como ícones'});
  expect(toggle.props.value).toBe(false);
  await act(async()=>toggle.props.onValueChange(true));
  expect(setValue).toHaveBeenCalledWith(true);
 } finally {
  if(tree) await act(async()=>tree.unmount());
  mockModuleIcons=undefined;
 }
});
