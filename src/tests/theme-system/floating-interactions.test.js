import React from 'react';
import renderer,{act} from 'react-test-renderer';
import FloatingThemePanel from '../../components/theme-editor/FloatingThemePanel.web';
import {attachThemeInspector} from '../../components/theme-editor/themeInspector';
let mockWidth=393,mockMounts=0;
jest.mock('react-dom',()=>({createPortal:node=>node}));
jest.mock('react-native',()=>({...jest.requireActual('react-native'),useWindowDimensions:()=>({width:mockWidth,height:852})}));
jest.mock('../../styles/themeRuntime',()=>({useThemeRuntime:()=>({mode:'light',raw:{},themeId:2})}));
jest.mock('../../components/theme-editor/themeService',()=>({editorContext:()=> 'session',loadDomainTheme:jest.fn().mockResolvedValue({id:2,theme:'Local',colors:{}})}));
jest.mock('../../components/theme-editor/themeInspector',()=>({attachThemeInspector:jest.fn(()=>()=>{})}));
jest.mock('../../components/theme-editor/ThemeColorEditor',()=>{
 const React=require('react');return function MockEditor(props){const [draft,setDraft]=React.useState('original');React.useEffect(()=>{mockMounts++;},[]);return React.createElement('draft-editor',{...props,draft,setDraft});};
});
const button=(tree,label)=>tree.root.findAllByType('Pressable').find(n=>n.findAllByType('Text').some(t=>t.children.join('')===label));
beforeEach(()=>{mockWidth=393;mockMounts=0;attachThemeInspector.mockClear();global.window={innerWidth:393,innerHeight:852,addEventListener:jest.fn(),removeEventListener:jest.fn()};global.document={body:{},addEventListener:jest.fn(),removeEventListener:jest.fn()};});
afterEach(()=>{delete global.window;delete global.document;});
test('mobile inspection collapses the panel without unmounting the draft, then offers actual Normal/Hover fields',async()=>{
 let tree;await act(async()=>{tree=renderer.create(<FloatingThemePanel onClose={jest.fn()}/>);});
 const editor=()=>tree.root.findByType('draft-editor');
 await act(async()=>editor().props.setDraft('unsaved color'));
 await act(async()=>button(tree,'⌖ Inspecionar elemento').props.onPress());
 expect(button(tree,'Cancelar inspeção')).toBeDefined();expect(editor().props.draft).toBe('unsaved color');
 const states={normal:[{property:'backgroundColor',token:'listItemBackground'}],hover:[{property:'backgroundColor',token:'listItemActiveBackground'}]};
 await act(async()=>attachThemeInspector.mock.calls.at(-1)[2]({bindings:states.hover,states}));
 expect(button(tree,'Cancelar inspeção')).toBeUndefined();expect(editor().props.selectedTokens).toEqual(['listItemBackground']);
 await act(async()=>button(tree,'Hover').props.onPress());expect(editor().props.selectedTokens).toEqual(['listItemActiveBackground']);
 await act(async()=>button(tree,'Normal').props.onPress());expect(editor().props.selectedTokens).toEqual(['listItemBackground']);
 expect(editor().props.draft).toBe('unsaved color');expect(mockMounts).toBe(1);
 expect(button(tree,'Voltar à inspeção')).toBeDefined();await act(async()=>tree.unmount());
});
test('a static element does not get an invented Hover state',async()=>{
 mockWidth=1440;let tree;await act(async()=>{tree=renderer.create(<FloatingThemePanel onClose={jest.fn()}/>);});
 await act(async()=>button(tree,'⌖ Inspecionar elemento').props.onPress());
 const bindings=[{property:'color',token:'textPrimary'}];
 await act(async()=>attachThemeInspector.mock.calls.at(-1)[2]({bindings,states:{normal:bindings}}));
 expect(button(tree,'Hover')).toBeUndefined();expect(button(tree,'Normal')).toBeDefined();await act(async()=>tree.unmount());
});
test('menu item selection offers its enclosing menu without losing the draft',async()=>{
 let tree;await act(async()=>{tree=renderer.create(<FloatingThemePanel onClose={jest.fn()}/>);});
 const editor=()=>tree.root.findByType('draft-editor');
 await act(async()=>editor().props.setDraft('unsaved menu color'));
 await act(async()=>button(tree,'⌖ Inspecionar elemento').props.onPress());
 const bindings=[{property:'backgroundColor',token:'containerTransparentBackground'}];
 const menu=[{property:'backgroundColor',token:'menuBackground'},{property:'borderColor',token:'menuBorder'}];
 await act(async()=>attachThemeInspector.mock.calls.at(-1)[2]({bindings,states:{normal:bindings},container:{bindings:menu,states:{normal:menu}}}));
 await act(async()=>button(tree,'Fundo e borda do menu').props.onPress());
 expect(editor().props.selectedTokens).toEqual(['menuBackground','menuBorder']);
 expect(editor().props.draft).toBe('unsaved menu color');expect(mockMounts).toBe(1);
 await act(async()=>tree.unmount());
});
test('the editor moves inside the modal focus boundary and back without remounting its draft',async()=>{
 const host={parentNode:null,remove:jest.fn()},body={appendChild:jest.fn(node=>{node.parentNode=body;})};
 const menu={appendChild:jest.fn(node=>{node.parentNode=menu;})};
 let modal=null,notify;const disconnect=jest.fn();
 global.document={body,createElement:()=>host,querySelector:()=>modal,addEventListener:jest.fn(),removeEventListener:jest.fn()};
 global.MutationObserver=jest.fn(callback=>{notify=callback;return {observe:jest.fn(),disconnect};});
 let tree;
 try{
  await act(async()=>{tree=renderer.create(<FloatingThemePanel onClose={jest.fn()}/>);});
  const editor=()=>tree.root.findByType('draft-editor');
  await act(async()=>editor().props.setDraft('unsaved menu color'));
  expect(host.parentNode).toBe(body);
  modal=menu;await act(async()=>notify());expect(host.parentNode).toBe(menu);
  modal=null;await act(async()=>notify());expect(host.parentNode).toBe(body);
  expect(editor().props.draft).toBe('unsaved menu color');expect(mockMounts).toBe(1);
  await act(async()=>tree.unmount());expect(disconnect).toHaveBeenCalled();expect(host.remove).toHaveBeenCalled();
 }finally{delete global.MutationObserver;}
});
test('an inspected screen defaults to local editing and explicitly switches to global without losing its draft',async()=>{
 let tree;await act(async()=>{tree=renderer.create(<FloatingThemePanel onClose={jest.fn()}/>);});
 const editor=()=>tree.root.findByType('draft-editor');const screen={id:'stable-route',label:'Centro financeiro'};
 await act(async()=>button(tree,'⌖ Inspecionar elemento').props.onPress());
 const bindings=[{property:'backgroundColor',token:'cardBackground'}];
 await act(async()=>attachThemeInspector.mock.calls.at(-1)[2]({bindings,states:{normal:bindings},screen}));
 expect(editor().props.screen).toEqual(screen);expect(button(tree,'Só nesta tela')).toBeDefined();
 await act(async()=>editor().props.setDraft('unsaved local color'));
 await act(async()=>button(tree,'Em todas as telas').props.onPress());expect(editor().props.screen).toBeNull();
 await act(async()=>button(tree,'Só nesta tela').props.onPress());expect(editor().props.screen).toEqual(screen);
 expect(editor().props.draft).toBe('unsaved local color');expect(mockMounts).toBe(1);
 await act(async()=>tree.unmount());
});
