import React from 'react';
import renderer,{act} from 'react-test-renderer';
import ScreenThemeBoundary from '../../components/theme-editor/ScreenThemeBoundary.web';
import {screenThemeKey} from '../../styles/screenThemeKeys';
let mockState;
jest.mock('../../styles/themeRuntime',()=>({useThemeRuntime:()=>mockState}));
test('two mounted screen boundaries keep their own variable values and preserve child state during preview/cancel',()=>{
 const raw={'cardBackground-light':'#111111'};
 mockState={raw,mode:'light',preview:null};let mounts=0,tree;
 function Child(){const [value,setValue]=React.useState('draft form');React.useEffect(()=>{mounts++;},[]);return <form-draft value={value} setValue={setValue}/>;}
 const render=()=> <><ScreenThemeBoundary screen={{id:'home',label:'Início'}}><Child/></ScreenThemeBoundary><ScreenThemeBoundary screen={{id:'finance',label:'Centro financeiro'}}><content/></ScreenThemeBoundary></>;
 act(()=>{tree=renderer.create(render());});
 const boundaries=()=>tree.root.findAllByType('div');
 expect(boundaries()[0].props.style['--co-theme-cardBackground']).toBeUndefined();
 mockState={...mockState,preview:{...raw,[screenThemeKey('finance','cardBackground','light')]:'#abcdef'}};
 act(()=>tree.update(render()));
 expect(boundaries()[0].props.style['--co-theme-cardBackground']).toBeUndefined();expect(boundaries()[1].props.style['--co-theme-cardBackground']).toBe('#abcdef');
 expect(boundaries()[1].props['data-co-theme-screen']).toBe('finance');
 mockState={...mockState,preview:null};act(()=>tree.update(render()));
 expect(boundaries()[1].props.style['--co-theme-cardBackground']).toBeUndefined();expect(mounts).toBe(1);
 expect(tree.root.findByType('form-draft').props.value).toBe('draft form');act(()=>tree.unmount());
});

test('uses native scrollbar defaults without a pair and marks configured hover per screen',()=>{
 const raw={'scrollbar-thumb-light':'#666666','scrollbar-track-light':'#eeeeee'};
 const render=()=> <ScreenThemeBoundary screen={{id:'home',label:'Início'}}><content/></ScreenThemeBoundary>;
 let tree;mockState={raw:{},mode:'light',preview:null};
 act(()=>{tree=renderer.create(render());});
 const boundary=()=>tree.root.findByType('div');
 expect(boundary().props['data-co-scrollbars']).toBeUndefined();
 mockState={...mockState,raw};
 act(()=>tree.update(render()));
 expect(boundary().props['data-co-scrollbars']).toBe('normal');
 mockState={...mockState,preview:{...raw,[screenThemeKey('home','scrollbarThumbHover','light')]:'#333333'}};
 act(()=>tree.update(render()));
 expect(boundary().props['data-co-scrollbars']).toBe('hover');
 expect(boundary().props.style['--co-theme-scrollbarThumbHover']).toBe('#333333');
 act(()=>tree.unmount());
});
