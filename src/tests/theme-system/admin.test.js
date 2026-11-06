import React from 'react';
import renderer,{act} from 'react-test-renderer';
import ThemeToolsProvider,{useThemeTools} from '../../components/theme-editor/ThemeToolsProvider';
const app=require('@appType');
import {auth} from './store.cjs';
jest.mock('../../components/theme-editor/FloatingThemePanel',()=> 'FloatingThemePanel');
function Launcher(){const tools=useThemeTools();return <launch available={tools.available} onPress={tools.openEditor}/>;}
test('ADMIN keeps its authorized tools when opening MANAGER, without exposing them to ordinary Manager builds',async()=>{
  auth.getters.isLogged=true;auth.getters.user={id:1,roles:['ROLE_SUPER']};app.app_type='MANAGER';app.is_admin_build=true;let tree;
  await act(async()=>{tree=renderer.create(<ThemeToolsProvider><Launcher/></ThemeToolsProvider>);});
  expect(tree.root.findByType('launch').props.available).toBe(true);
  await act(async()=>tree.root.findByType('launch').props.onPress());expect(tree.root.findAllByType('FloatingThemePanel')).toHaveLength(1);
  app.is_admin_build=false;await act(async()=>tree.update(<ThemeToolsProvider><Launcher/></ThemeToolsProvider>));
  expect(tree.root.findByType('launch').props.available).toBe(false);expect(tree.root.findAllByType('FloatingThemePanel')).toHaveLength(0);
  app.is_admin_build=true;auth.getters.user={id:2,roles:[]};await act(async()=>tree.update(<ThemeToolsProvider><Launcher/></ThemeToolsProvider>));
  expect(tree.root.findByType('launch').props.available).toBe(false);
  await act(async()=>tree.unmount());app.app_type='ADMIN';app.is_admin_build=true;
});
