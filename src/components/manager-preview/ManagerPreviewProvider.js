import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {useThemeRuntime,setThemeMode} from '../../styles/themeRuntime';
import {useStore} from '@store';
import {env} from '@env';
import {scopeFor} from '../../session/sessionScope';
import useManagerPreference from './useManagerPreference';
import {managerPreviewEnabled, previewPalette} from './model';
import {missingManagerThemeTokens} from '../../styles/managerTheme';
import {useAvatarRuntime} from '@experimental-avatar';
import useExperienceRuntime from './useExperienceRuntime';
import ManagerCatalogImageCache from './ManagerCatalogImageCache';
import {app_type} from '@appType';
import {isPosSingleItemMode} from '@controleonline/ui-common/src/react/config/deviceConfigBootstrap';
import useBottomNavigationPreference from '@controleonline/ui-common/src/react/hooks/useBottomNavigationPreference';
import useThemeLayoutPreference from './useThemeLayoutPreference';

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
  const user = auth.getters.user;
  const principal = user?.id || user?.username;
  const palette = useMemo(() => previewPalette(themeRuntime.preview || themeRuntime.raw, mode),
    [themeRuntime.preview, themeRuntime.raw, mode]);
  // Theme config is the only source of truth for layout flags (not device/account prefs).
  const sidebarDefault = ![false, 'false', 0, '0'].includes(palette.showLeftMenu ?? palette.enableSidebar);
  const homeLayout = palette.homeModulesLayout ?? theme.getters.homeModulesLayout;
  const modulesAsIconsDefault = homeLayout === 'buttons';
  const layout = useThemeLayoutPreference({
    showLeftMenuDefault: sidebarDefault,
    modulesAsIconsDefault,
  });
  const sidebar = layout.sidebar;
  const moduleIcons = layout.moduleIcons;
  const displayScope = active && principal ? encodeURIComponent(JSON.stringify([scopeFor(env), principal])) : '';
  // Module accent remains a presentation preference for now (category color application).
  const moduleAccent = useManagerPreference(displayScope ? `co.module-accent.v1:${displayScope}` : '', {
    defaultValue: homeLayout === 'list' || homeLayout === 'buttons',
    loadError: 'Não foi possível carregar a preferência de destaque.',
    saveError: 'Não foi possível salvar a preferência de destaque.',
  });
  const bottomBar = useBottomNavigationPreference({enabled: active,
    principal: String(auth.getters.user?.id || auth.getters.user?.username || ''), appType: app_type});
  const avatar = useAvatarRuntime({active: managerPreviewEnabled,
    principal: String(auth.getters.user?.id || auth.getters.user?.username || ''),
    scopeKey: JSON.stringify([active, currentCompany?.id, auth.getters.user?.id || auth.getters.user?.username])});
  const experience = useExperienceRuntime({active, auth: auth.getters, company: currentCompany});
  // Keep mobile navigation presentation across screens, scoped to this login.
  const menuPrincipal = JSON.stringify([!!auth.getters.isLogged, auth.getters.user?.id || auth.getters.user?.username || '']);
  const [menuState, setMenuState] = useState({principal: menuPrincipal, visible: false});
  useEffect(() => {
    setMenuState(previous => previous.principal === menuPrincipal ? previous : {principal: menuPrincipal, visible: false});
  }, [menuPrincipal]);
  const mobileMenu = {
    visible: menuState.principal === menuPrincipal && menuState.visible,
    toggle: () => setMenuState(previous => ({principal: menuPrincipal, visible: previous.principal !== menuPrincipal || !previous.visible})),
  };
  const toggleMode=()=>setThemeMode(mode==='dark'?'light':'dark');
  return <PreviewContext.Provider value={{mobileMenu, sidebar, bottomBar, moduleIcons, moduleAccent, moduleAccentPalette: palette, menus: theme.getters.menus, themeStatus: themeRuntime.status, themeError: themeRuntime.error, themeIssues: themeRuntime.status==='ready' ? missingManagerThemeTokens({},mode,palette) : [], ...avatar, experience, mode, toggleMode, colors: incoming || {}}}>
    <ManagerCatalogImageCache>{children}</ManagerCatalogImageCache>
  </PreviewContext.Provider>;
}
