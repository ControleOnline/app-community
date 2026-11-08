import useManagerPreference from './useManagerPreference';

export default function useSidebarPreference(principal, defaultValue = true) {
  const key = principal ? `co.sidebar.v1:${encodeURIComponent(principal)}` : '';
  const {ready, value, error, setValue} = useManagerPreference(key, {
    defaultValue, storedTrue: 'visible', storedFalse: 'hidden',
    loadError: 'Não foi possível carregar a preferência do menu.',
    saveError: 'Não foi possível salvar a preferência do menu.',
  });
  return {ready, visible: value, error, setRememberedVisible: setValue};
}
