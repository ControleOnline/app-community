import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import {useStore} from '@store';
import {managerPreviewEnabled, previewModeKey, previewPalette, readPreviewMode} from './model';
import {missingManagerThemeTokens} from '../../styles/managerTheme';
import {useAvatarRuntime} from '@experimental-avatar';
import useExperienceRuntime from './useExperienceRuntime';
import {app_type} from '@appType';
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
  const active = managerPreviewEnabled && !!auth.getters.isLogged;
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
    if (JSON.stringify(incoming) !== JSON.stringify(next)) {
      applied.current = next;
      theme.actions.setColors(next);
    } else applied.current = incoming;
  }, [active, incoming, mode, theme.actions]);
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
  return <PreviewContext.Provider value={{bottomBar, themeIssues: missingManagerThemeTokens(base.current, mode), ...avatar, experience, mode, toggleMode, colors: managerPreviewEnabled ? previewPalette(base.current, mode) : incoming}}>
    {children}
  </PreviewContext.Provider>;
}
