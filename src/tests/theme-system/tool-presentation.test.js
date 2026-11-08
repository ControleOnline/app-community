import React from 'react';
import renderer,{act} from 'react-test-renderer';
import {themeEditorText} from '../../components/theme-editor/themeToolPresentation';
import ThemeColorEditor from '../../components/theme-editor/ThemeColorEditor';
const mockRaw={'modalBackground-light':'#112233','modalText-light':'#eeeeee','inputBackground-light':'#223344','inputText-light':'#dddddd','buttonBackgroundSecondary-light':'#334455','buttonTextSecondary-light':'#cccccc'};
jest.mock('../../styles/themeRuntime',()=>({useThemeRuntime:()=>({raw:mockRaw,preview:{'modalBackground-light':'#ff0000'},mode:'light',themeId:1}),previewTheme:jest.fn(),clearThemePreview:jest.fn(),setThemeMode:jest.fn()}));
jest.mock('../../components/theme-editor/themeService',()=>({editorContext:()=> 'context',loadDomainTheme:jest.fn(),saveThemeChanges:jest.fn()}));
afterEach(()=>{delete global.t;});
test('tool chrome uses saved domain colors while the inspected element is previewed',async()=>{
 let tree;await act(async()=>{tree=renderer.create(<ThemeColorEditor theme={{id:1,colors:{}}} selectedTokens={['cardBackground']}/>);});
 const style=tree.root.findAllByType('View')[0].props.style;
 expect(style.backgroundColor).toBe('#112233');
 await act(async()=>tree.unmount());
});
test('editor labels use the existing translator rather than fixed UI labels',async()=>{
 global.t={t:jest.fn((store,type,key)=>key==='Salvar cores'?'Save colors':key),formatMessage:key=>key};
 let tree;await act(async()=>{tree=renderer.create(<ThemeColorEditor theme={{id:1,colors:{}}} selectedTokens={['cardBackground']}/>);});
 expect(tree.root.findAllByType('Text').some(node=>node.children.join('')==='Save colors')).toBe(true);
 expect(global.t.t).toHaveBeenCalledWith('configs','theme_editor','Salvar cores');
 await act(async()=>tree.unmount());
});

test('substitutes theme labels when the translator capitalizes placeholder names',()=>{
 global.t={t:()=> 'Domínio Atual: {{V0}} · {{V1}}',formatMessage:key=>key};
 expect(themeEditorText('Domínio atual: {{v0}} · {{v1}}', {
  v0:'app.controleonline.com',v1:'ON_MANAGER_NEUTRAL_20261016 #11',
 })).toBe('Domínio Atual: app.controleonline.com · ON_MANAGER_NEUTRAL_20261016 #11');
});
