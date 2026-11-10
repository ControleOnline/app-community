import {useRef, useState} from 'react';
import {saveThemeLayoutFlags} from '../theme-editor/themeService';

export function moduleColorsEnabled(colors = {}, homeLayout) {
  const value = colors.useModuleColors;
  if ([true, 'true', 1, '1'].includes(value)) return true;
  if ([false, 'false', 0, '0'].includes(value)) return false;
  // Preserve the previous no-preference default; never read or migrate local storage.
  return homeLayout === 'list' || homeLayout === 'buttons';
}

export default function useModuleColorsPreference({colors, homeLayout, ready, context}) {
  const [saved, setSaved] = useState(null);
  const [status, setStatus] = useState(null);
  const pending = useRef(false);
  const current = useRef(context);
  current.current = context;
  const key = `theme.useModuleColors:${context}`;
  const ownStatus = status?.context === context ? status : null;
  const value = saved?.context === context && saved.colors === colors
    ? saved.value : moduleColorsEnabled(colors, homeLayout);
  const setValue = async next => {
    if (!ready || pending.current) return false;
    pending.current = true;
    setStatus({context, saving: true});
    try {
      await saveThemeLayoutFlags({useModuleColors: !!next});
      if (current.current !== context) return false;
      setSaved({context, colors, value: !!next});
      setStatus({context, saving: false});
      return true;
    } catch (error) {
      if (current.current === context) setStatus({context, saving: false,
        error: error?.message || 'Não foi possível salvar as cores dos módulos no tema.'});
      return false;
    } finally {
      pending.current = false;
    }
  };
  return {key, ready, value, saving: !!ownStatus?.saving, error: ownStatus?.error || '', setValue};
}
