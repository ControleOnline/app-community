// Completion is explicit: an empty response is ready; an unresolved request is not.
export function adminBootstrapState({routeName, publicRoute, sessionChecked, isLogged,
  hasCompany, translationReady, menuContextKey, menuLoad, companyError}) {
  if (publicRoute) return {pending: false, error: ''};
  const currentMenu = menuLoad?.key === menuContextKey;
  const error = currentMenu && menuLoad.status === 'error'
    ? 'Não foi possível carregar os menus.'
    : isLogged && !hasCompany && companyError ? 'Não foi possível carregar a empresa.' : '';
  const ready = routeName && sessionChecked && isLogged && hasCompany && translationReady &&
    currentMenu && menuLoad.status === 'ready';
  return {pending: !ready, error};
}
