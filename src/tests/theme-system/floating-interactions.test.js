import React from 'react';
import renderer,{act} from 'react-test-renderer';
import FloatingThemePanel from '../../components/theme-editor/FloatingThemePanel.web';
import {attachThemeInspector} from '../../components/theme-editor/themeInspector';
let mockWidth=393,mockMounts=0;
jest.mock('../../components/theme-editor/LoginThemePreview.web',()=> 'LoginPreview');
jest.mock('../../components/theme-editor/LoginPreviewOrigins',()=> 'LoginOrigins');
jest.mock('../../components/theme-editor/loginPreviewModel',()=>({loadLoginPreviewCompany:jest.fn().mockResolvedValue({id:7,alias:'Domain company'})}));
jest.mock('react-dom',()=>({createPortal:node=>node}));
jest.mock('react-native',()=>({...jest.requireActual('react-native'),useWindowDimensions:()=>({width:mockWidth,height:852})}));
jest.mock('../../styles/themeRuntime',()=>({useThemeRuntime:()=>({mode:'light',raw:{},themeId:2}),getThemeSnapshot:()=>({mode:'light',raw:{},themeId:2})}));
jest.mock('../../components/theme-editor/themeService',()=>({editorContext:()=> 'session',loadDomainTheme:jest.fn().mockResolvedValue({id:2,theme:'Local',colors:{}})}));
jest.mock('../../components/theme-editor/themeInspector',()=>({attachThemeInspector:jest.fn(()=>()=>{})}));
jest.mock('../../components/theme-editor/ThemeColorEditor',()=>{
 const React=require('react');return function MockEditor(props){const [draft,setDraft]=React.useState('original');React.useEffect(()=>{mockMounts++;},[]);return React.createElement('draft-editor',{...props,draft,setDraft});};
});
const button=(tree,label)=>tree.root.findAllByType('Pressable').find(n=>n.findAllByType('Text').some(t=>t.children.join('')===label));
beforeEach(()=>{mockWidth=393;mockMounts=0;attachThemeInspector.mockClear();global.window={innerWidth:393,innerHeight:852,addEventListener:jest.fn(),removeEventListener:jest.fn()};global.document={body:{},addEventListener:jest.fn(),removeEventListener:jest.fn()};});
afterEach(()=>{delete global.window;delete global.document;});
test('direct theme-page entry starts in the login preview',async()=>{
 let tree;await act(async()=>{tree=renderer.create(<FloatingThemePanel initialView="login" onClose={jest.fn()}/>);});
 try {
  expect(tree.root.findAllByType('LoginPreview')).toHaveLength(1);
  expect(tree.root.findByType('draft-editor').props.fixedMode).toBe(true);
 }finally{await act(async()=>tree.unmount());}
});
test('opens and closes the login preview without remounting the editor draft',async()=>{
 let tree;await act(async()=>{tree=renderer.create(<FloatingThemePanel onClose={jest.fn()}/>);});
 try {
  const editor=()=>tree.root.findByType('draft-editor');
  await act(async()=>editor().props.setDraft('pending colors'));
  await act(async()=>button(tree,'Prévia do login').props.onPress());
  expect(tree.root.findAllByType('LoginPreview')).toHaveLength(1);
  expect(editor().props.fixedMode).toBe(true);
  await act(async()=>button(tree,'Cancelar inspeção').props.onPress());
  await act(async()=>button(tree,'Voltar à tela atual').props.onPress());
  expect(tree.root.findAllByType('LoginPreview')).toHaveLength(0);
  expect(editor().props.draft).toBe('pending colors');
  expect(mockMounts).toBe(1);
 }finally{await act(async()=>tree.unmount());}
});
test('repeated direct entry reopens login after returning to the screen and preserves drafts',async()=>{
 let tree;await act(async()=>{tree=renderer.create(<FloatingThemePanel initialView="login" viewRequest={1}/>);});
 try {
  await act(async()=>tree.root.findByType('draft-editor').props.setDraft('pending colors'));
  await act(async()=>button(tree,'Voltar à tela atual').props.onPress());
  expect(tree.root.findAllByType('LoginPreview')).toHaveLength(0);
  await act(async()=>tree.update(<FloatingThemePanel initialView="login" viewRequest={2}/>));
  expect(tree.root.findAllByType('LoginPreview')).toHaveLength(1);
  expect(tree.root.findByType('draft-editor').props.draft).toBe('pending colors');
  expect(mockMounts).toBe(1);
 }finally{await act(async()=>tree.unmount());}
});
test('inspecting a large container keeps its content visible and displays its dimensions',async()=>{
 mockWidth=1440;global.window.innerWidth=1440;
 global.window.getComputedStyle=()=>({getPropertyValue:()=> '#123456'});
 let tree;await act(async()=>{tree=renderer.create(<FloatingThemePanel onClose={jest.fn()}/>);});
 try{
  await act(async()=>button(tree,'⌖ Inspecionar elemento').props.onPress());
  await act(async()=>attachThemeInspector.mock.calls.at(-1)[1]({bindings:[{property:'backgroundColor',token:'cardBackground'}],node:{tagName:'DIV',
    getBoundingClientRect:()=>({left:250,top:140,width:1100,height:2400})}}));
  const highlight=tree.root.findByProps({'data-co-theme-highlight':'true'});
  expect(highlight.props.style.background).toBe('transparent');
  expect(highlight.props.style.pointerEvents).toBe('none');
  expect(highlight.props.style.outline).toBeTruthy();
  expect(tree.root.findAllByType('div').some(node=>node.children.join('').includes('1100 × 2400'))).toBe(true);
  expect(tree.root.findAllByType('span').some(node=>node.children.join('').includes('cardBackground · #123456'))).toBe(true);
 }finally{await act(async()=>tree.unmount());}
});
test('keeps the shortcut bar uncovered during mobile inspection and editing',async()=>{
 let bar={getBoundingClientRect:()=>({top:758,width:393,height:56})};
 let notify;
 global.document.querySelectorAll=()=>bar?[bar]:[];
 global.MutationObserver=jest.fn(callback=>{notify=callback;return {observe:jest.fn(),disconnect:jest.fn()};});
 let tree;
 try{
  await act(async()=>{tree=renderer.create(<FloatingThemePanel onClose={jest.fn()}/>);});
  const panel=()=>tree.root.findByProps({role:'dialog'});
  expect(panel().props.style.bottom).toBe(106);
  await act(async()=>button(tree,'⌖ Inspecionar elemento').props.onPress());
  expect(panel().props.style.bottom).toBe(106);
  const bindings=[{property:'backgroundColor',token:'navigationBackground'}];
  await act(async()=>attachThemeInspector.mock.calls.at(-1)[2]({bindings}));
  expect(panel().props.style.bottom).toBe(106);
  expect(tree.root.findByType('draft-editor').props.selectedTokens).toEqual(['navigationBackground']);
  bar=null;await act(async()=>notify());
  expect(panel().props.style.bottom).toBe(12);
 }finally{
  if(tree)await act(async()=>tree.unmount());
  delete global.MutationObserver;
 }
});
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
test('an inspected screen keeps global editing and its draft without offering retired local scope',async()=>{
 let tree;await act(async()=>{tree=renderer.create(<FloatingThemePanel onClose={jest.fn()}/>);});
 const editor=()=>tree.root.findByType('draft-editor');const screen={id:'stable-route',label:'Centro financeiro'};
 await act(async()=>button(tree,'⌖ Inspecionar elemento').props.onPress());
 const bindings=[{property:'backgroundColor',token:'cardBackground'}];
 await act(async()=>attachThemeInspector.mock.calls.at(-1)[2]({bindings,states:{normal:bindings},screen}));
 expect(editor().props.screen).toBeNull();
 expect(button(tree,'Só nesta tela')).toBeUndefined();
 await act(async()=>editor().props.setDraft('unsaved global color'));
 await act(async()=>button(tree,'Voltar à inspeção').props.onPress());
 await act(async()=>attachThemeInspector.mock.calls.at(-1)[2]({bindings,states:{normal:bindings},screen}));
 expect(editor().props.screen).toBeNull();
 expect(editor().props.draft).toBe('unsaved global color');expect(mockMounts).toBe(1);
 await act(async()=>tree.unmount());
});

test('selects native scrollbar colors without depending on a scrollbar DOM element',async()=>{
 let tree;await act(async()=>{tree=renderer.create(<FloatingThemePanel onClose={jest.fn()}/>);});
 try {
  const editor=()=>tree.root.findByType('draft-editor');
  await act(async()=>button(tree,'⌖ Inspecionar elemento').props.onPress());
  expect(button(tree,'Barra de rolagem')).toBeDefined();
  await act(async()=>button(tree,'Barra de rolagem').props.onPress());
  expect(editor().props.selectedTokens).toEqual(['scrollbarThumb','scrollbarTrack']);
  await act(async()=>button(tree,'Hover').props.onPress());
  expect(editor().props.selectedTokens).toEqual(['scrollbarThumbHover']);
 }finally{await act(async()=>tree.unmount());}
});
