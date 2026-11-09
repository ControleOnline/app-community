import {useCallback, useEffect, useState} from 'react';
import {saveThemeLayoutFlags} from '../theme-editor/themeService';

/**
 * Theme-level layout flags (sidebar + module icons).
 * Source of truth: theme.colors (showLeftMenu, homeModulesLayout) — not device/account storage.
 */
export default function useThemeLayoutPreference({showLeftMenuDefault = true, modulesAsIconsDefault = false} = {}) {
  const [sidebarVisible, setSidebarVisible] = useState(showLeftMenuDefault);
  const [modulesAsIcons, setModulesAsIcons] = useState(modulesAsIconsDefault);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSidebarVisible(showLeftMenuDefault);
    setModulesAsIcons(modulesAsIconsDefault);
    setError('');
  }, [showLeftMenuDefault, modulesAsIconsDefault]);

  const persist = useCallback(async (patch) => {
    setSaving(true);
    setError('');
    try {
      await saveThemeLayoutFlags(patch);
      if (Object.hasOwn(patch, 'showLeftMenu')) setSidebarVisible(!!patch.showLeftMenu);
      if (Object.hasOwn(patch, 'showModulesAsIcons')) setModulesAsIcons(!!patch.showModulesAsIcons);
      return true;
    } catch (e) {
      setError(e?.message || 'Não foi possível salvar a configuração do tema.');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    ready: true,
    saving,
    error,
    sidebar: {
      ready: true,
      visible: sidebarVisible,
      error,
      setRememberedVisible: (value) => persist({showLeftMenu: !!value}),
    },
    moduleIcons: {
      key: 'theme.homeModulesLayout',
      ready: true,
      value: modulesAsIcons,
      error,
      setValue: (value) => persist({showModulesAsIcons: !!value}),
    },
  };
}
