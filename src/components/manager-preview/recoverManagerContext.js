import {normalizeRuntimeMenuResponse} from '@controleonline/ui-common/src/react/utils/runtimeMenu';

// Explicit retry uses the canonical company selection action and the same menu endpoint.
// Never manufacture menus from route registrations or resurrect an earlier identity.
export async function recoverManagerContext({people, theme, api, isCurrent, getPeople = () => people}) {
  if (!isCurrent()) return;
  if (!getPeople().getters.currentCompany?.id) await people.actions.myCompanies();
  if (!isCurrent()) return;
  const companyId = getPeople().getters.currentCompany?.id;
  if (!companyId) throw new Error('Nenhuma empresa acessível foi retornada.');
  const responses = await Promise.all(['home', 'toolbar'].map(menuType =>
    api.fetch('menus-people', {params: {myCompany: companyId, appType: 'MANAGER', menuType}}),
  ));
  if (!isCurrent() || String(getPeople().getters.currentCompany?.id) !== String(companyId)) return;
  if (responses.some(response => response?.response?.success === false)) throw new Error('Não foi possível carregar os menus.');
  theme.actions.setMenus(responses.flatMap(response =>
    normalizeRuntimeMenuResponse(response, {appType: 'MANAGER', allowFallback: false}),
  ));
}
