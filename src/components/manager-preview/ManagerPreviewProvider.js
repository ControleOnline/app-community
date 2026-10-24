import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import {useStore} from '@store';
import {managerPreviewEnabled, previewModeKey, previewPalette, readPreviewMode} from './model';
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
  const base = useRef(incoming || {});
  const applied = useRef(null);
  const [mode, setMode] = useState(readPreviewMode);
  const {item: device} = useStore('device_config').getters;
  const singleItemActive = app_type === 'POS' && isPosSingleItemMode(device?.configs);
  const active = (managerPreviewEnabled || singleItemActive) && !!auth.getters.isLogged;
  const bottomBar = useBottomNavigationPreference({enabled: active,
    principal: String(auth.getters.user?.id || auth.getters.user?.username || ''), appType: app_type});
  const avatar = useAvatarRuntime({active: managerPreviewEnabled,
    principal: String(auth.getters.user?.id || auth.getters.user?.username || ''),
    scopeKey: JSON.stringify([active, currentCompany?.id, auth.getters.user?.id || auth.getters.user?.username])});
  const experience = useExperienceRuntime({active, auth: auth.getters, company: currentCompany});
  useEffect(() => {
    if (!active) return;
    // Reapply after the real provider loads a domain theme or changes company.
    if (incoming !== applied.current) base.current = incoming || {};
    const next = previewPalette(base.current, mode);
    if (singleItemActive) Object.assign(next, {'cart-bottom-bg': next.cardBackground, 'cart-bottom-border': next.cardBorder, 'cart-bottom-total-bg': next.cardBackground, 'cart-bottom-label': next.textSecondary, 'cart-bottom-text': next.textPrimary, radioText: next.textPrimary, radioBorder: next.textSecondary, radioSelectedBorder: next.buttonBackground, radioSelectedDot: next.buttonBackground});
    if (JSON.stringify(incoming) !== JSON.stringify(next)) {
      applied.current = next;
      theme.actions.setColors(next);
    } else applied.current = incoming;
  }, [active, incoming, mode, singleItemActive, theme.actions]);
  useEffect(() => () => {
    if (applied.current) theme.actions.setColors(base.current);
  }, [theme.actions]);
  useEffect(() => {
    if (!active && applied.current) {
      applied.current = null;
      theme.actions.setColors(base.current);
    }
  }, [active, theme.actions]);
  const toggleMode = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(previewModeKey, next); } catch { /* In-memory preference remains usable. */ }
    setMode(next);
  };
  return <PreviewContext.Provider value={{bottomBar, themeIssues: missingManagerThemeTokens(base.current, mode), ...avatar, experience, mode, toggleMode, colors: active ? previewPalette(base.current, mode) : incoming}}>
    <ManagerCatalogImageCache>{children}</ManagerCatalogImageCache>
  </PreviewContext.Provider>;
}
