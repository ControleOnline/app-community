import React from 'react';
import renderer,{act} from 'react-test-renderer';
import {Platform} from 'react-native';
import Status from '../../components/manager-preview/CollectionReadStatus';
jest.mock('react-native',()=>({Text:'Text',Platform:{OS:'android'}}));
it('removes only routine success from the compact view and preserves offline, refresh and error information',()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;let tree;const render=(mode,hideFresh=true)=>{
  const state={categories:{mode}},catalog={subscribe:()=>()=>{},snapshot:()=>state};
  act(()=>{if(tree)tree.update(<Status catalog={catalog} endpoint="categories" hideFresh={hideFresh}/>);else tree=renderer.create(<Status catalog={catalog} endpoint="categories" hideFresh={hideFresh}/>);});
 };
 render('fresh');expect(tree.toJSON()).toBeNull();
 render('offline');expect(tree.root.findByType('Text').props.children).toContain('Sem conexão');
 render('refreshing');expect(tree.root.findByType('Text').props.children).toContain('atualizando');
 render('error');expect(tree.root.findByType('Text').props.children).toContain('Não foi possível');
 render('fresh',false);expect(tree.root.findByType('Text').props.children).toBe('Dados atualizados');act(()=>tree.unmount());
});
it.each(['android','ios','web'])('announces collection updates with accessibility supported by %s',platform=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;Platform.OS=platform;
 const state={categories:{mode:'refreshing'}},catalog={subscribe:()=>()=>{},snapshot:()=>state};let tree;
 act(()=>{tree=renderer.create(<Status catalog={catalog} endpoint="categories"/>);});
 const props=tree.root.findByType('Text').props;
 expect(props.accessibilityRole).toBe(platform==='web'?'status':undefined);
 if(platform==='android')expect(props.accessibilityLiveRegion).toBe('polite');
 expect(props.children).toContain('atualizando');
 act(()=>tree.unmount());Platform.OS='android';
});
