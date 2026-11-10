import React from 'react';
import renderer, {act} from 'react-test-renderer';
import ManagerPreviewProvider, {useManagerPreview} from '../../components/manager-preview/ManagerPreviewProvider';
import {saveThemeLayoutFlags} from '../../components/theme-editor/themeService';
let mockLogged = true;
let mockUser = 'admin-1';
let mockTheme = {};
jest.mock('react-native',()=>({Platform:{OS:'web'}}));
jest.mock('@store',()=>({useStore:name=>({getters:name==='auth'?{isLogged:mockLogged,user:{id:mockUser}}:name==='theme'?{colors:{}}:name==='people'?{currentCompany:{id:5}}:{item:{}}})}));
jest.mock('../../styles/themeRuntime',()=>({useThemeRuntime:()=>({status:'ready',mode:'light',raw:mockTheme}),setThemeMode:jest.fn()}));
jest.mock('../../components/theme-editor/themeService',()=>({editorContext:()=>`domain:${mockUser}`,saveThemeLayoutFlags:jest.fn().mockResolvedValue({})}));
jest.mock('../../components/manager-preview/model',()=>({managerPreviewEnabled:true,previewPalette:colors=>colors}));
jest.mock('@experimental-avatar',()=>({useAvatarRuntime:()=>({})}));
jest.mock('../../components/manager-preview/useExperienceRuntime',()=>()=>({}));
jest.mock('../../components/manager-preview/ManagerCatalogImageCache',()=>({children})=>children);
jest.mock('@controleonline/ui-common/src/react/hooks/useBottomNavigationPreference',()=>()=>({}));
jest.mock('@appType',()=>({app_type:'MANAGER'}));
jest.mock('@controleonline/ui-common/src/react/config/deviceConfigBootstrap',()=>({isPosSingleItemMode:()=>false}));
function Probe(){return <menu-state value={useManagerPreview().mobileMenu}/>;}
it('retains the rail between screens and resets it when the login changes',()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;mockLogged=true;mockUser='admin-1';let tree;
 const view=key=><ManagerPreviewProvider><Probe key={key}/></ManagerPreviewProvider>;
 act(()=>{tree=renderer.create(view('home'));});
 const menu=()=>tree.root.findByType('menu-state').props.value;
 expect(menu().visible).toBe(false);
 act(()=>menu().toggle());
 act(()=>tree.update(view('clients')));
 expect(menu().visible).toBe(true);
 mockLogged=false;act(()=>tree.update(view('logout')));
 mockLogged=true;act(()=>tree.update(view('login')));
 expect(menu().visible).toBe(false);
 act(()=>menu().toggle());mockUser='admin-2';act(()=>tree.update(view('other-user')));
 expect(menu().visible).toBe(false);
 act(()=>tree.unmount());
});

it('uses the shared domain theme flag and saves explicitly without account storage', async () => {
  function Preferences() {
    const {sidebar, moduleIcons, moduleAccent} = useManagerPreview();
    return <preferences sidebar={sidebar} icons={moduleIcons} accent={moduleAccent} />;
  }

  mockTheme = {showLeftMenu:'false', homeModulesLayout:'buttons'};
  const previousStorage = global.localStorage;
  const values = new Map();
  global.localStorage = {getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
  let tree;
  try {
    await act(async () => {tree = renderer.create(<ManagerPreviewProvider><Preferences /></ManagerPreviewProvider>);});
    const current = () => tree.root.findByType('preferences').props;
    expect(current().sidebar.visible).toBe(false);
    expect(current().icons.value).toBe(true);
    expect(current().accent.value).toBe(true);
    await act(async () => {
      await current().sidebar.setRememberedVisible(true);
      await current().icons.setValue(false);
      await current().accent.setValue(false);
    });
    expect(saveThemeLayoutFlags).toHaveBeenCalledWith({useModuleColors:false});
    mockTheme = {enableSidebar:0, homeModulesLayout:'buttons', useModuleColors:'false'};
    await act(async () => tree.update(<ManagerPreviewProvider><Preferences /></ManagerPreviewProvider>));
    expect(current().sidebar.visible).toBe(true);
    expect(current().icons.value).toBe(false);
    expect(current().accent.value).toBe(false);
    mockUser='another-user';
    await act(async () => tree.update(<ManagerPreviewProvider><Preferences /></ManagerPreviewProvider>));
    expect(current().accent.value).toBe(false);
    expect(values.size).toBe(0);
  } finally {
    if (tree) await act(async () => tree.unmount());
    global.localStorage = previousStorage;
    mockTheme = {};
  }
});
