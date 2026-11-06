import React, {createContext, useContext, useEffect, useState} from 'react';
import {useThemeRuntime,setThemeMode} from '../../styles/themeRuntime';
import {useStore} from '@store';
import {managerPreviewEnabled, previewPalette} from './model';
import {missingManagerThemeTokens} from '../../styles/managerTheme';
import {useAvatarRuntime} from '@experimental-avatar';
import useExperienceRuntime from './useExperienceRuntime';
import ManagerCatalogImageCache from './ManagerCatalogImageCache';
import {app_type} from '@appType';
import {isPosSingleItemMode} from '@controleonline/ui-common/src/react/config/deviceConfigBootstrap';
import useBottomNavigationPreference from '@controleonline/ui-common/src/react/hooks/useBottomNavigationPreference';

const PreviewContext = createContext(null);
export const useManagerPreview = () => useContext(PreviewContext);

export default function ManagerPreviewProvider({children}) {
  const theme = useStore('theme');
  const auth = useStore('auth');
  const {currentCompany} = useStore('people').getters;
  const incoming = theme.getters.colors;
  const themeRuntime=useThemeRuntime();
  const mode=themeRuntime.mode;
  const {item: device} = useStore('device_config').getters;
  const singleItemActive = app_type === 'POS' && isPosSingleItemMode(device?.configs);
  const active = (managerPreviewEnabled || singleItemActive) && !!auth.getters.isLogged;
  const bottomBar = useBottomNavigationPreference({enabled: active,
    principal: String(auth.getters.user?.id || auth.getters.user?.username || ''), appType: app_type});
  const avatar = useAvatarRuntime({active: managerPreviewEnabled,
    principal: String(auth.getters.user?.id || auth.getters.user?.username || ''),
    scopeKey: JSON.stringify([active, currentCompany?.id, auth.getters.user?.id || auth.getters.user?.username])});
  const experience = useExperienceRuntime({active, auth: auth.getters, company: currentCompany});
  // Keep mobile navigation presentation across screens, scoped to this login.
  const menuPrincipal = JSON.stringify([!!auth.getters.isLogged, auth.getters.user?.id || auth.getters.user?.username || '']);
  const [menuState, setMenuState] = useState({principal: menuPrincipal, visible: false, hint: true});
  useEffect(() => {
    setMenuState(previous => previous.principal === menuPrincipal ? previous : {principal: menuPrincipal, visible: false, hint: true});
  }, [menuPrincipal]);
  const currentMenu = menuState.principal === menuPrincipal ? menuState : {visible: false, hint: true};
  const mobileMenu = {
    visible: currentMenu.visible, hint: currentMenu.hint,
    toggle: () => setMenuState(previous => ({principal: menuPrincipal, visible: previous.principal === menuPrincipal ? !previous.visible : true, hint: false})),
    dismissHint: () => setMenuState(previous => ({principal: menuPrincipal, visible: previous.principal === menuPrincipal && previous.visible, hint: false})),
  };
  const toggleMode=()=>setThemeMode(mode==='dark'?'light':'dark');
  return <PreviewContext.Provider value={{mobileMenu, bottomBar, themeStatus: themeRuntime.status, themeError: themeRuntime.error, themeIssues: themeRuntime.status==='ready' ? missingManagerThemeTokens({},mode,previewPalette(themeRuntime.preview || themeRuntime.raw,mode)) : [], ...avatar, experience, mode, toggleMode, colors: incoming || {}}}>
    <ManagerCatalogImageCache>{children}</ManagerCatalogImageCache>
  </PreviewContext.Provider>;
}
