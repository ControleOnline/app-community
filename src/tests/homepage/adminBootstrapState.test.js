import {adminBootstrapState} from '../../components/bootstrap/adminBootstrapState';
const ready = {routeName: 'HomePage', publicRoute: false, sessionChecked: true, isLogged: true, hasCompany: true,
  translationReady: true, menuContextKey: 'ADMIN:user:3', menuLoad: {key: 'ADMIN:user:3', status: 'ready'}};
it('requires every bootstrap prerequisite, including the current menu request', () => {
  expect(adminBootstrapState(ready)).toEqual({pending: false, error: ''});
  for (const change of [{routeName: ''}, {sessionChecked: false}, {isLogged: false}, {hasCompany: false},
    {translationReady: false}, {menuLoad: {key: 'old-company', status: 'ready'}}, {menuLoad: {key: ready.menuContextKey, status: 'loading'}}]) {
    expect(adminBootstrapState({...ready, ...change}).pending).toBe(true);
  }
});
it('releases public routes and reports actual load errors instead of an empty menu', () => {
  expect(adminBootstrapState({publicRoute: true})).toEqual({pending: false, error: ''});
  expect(adminBootstrapState({...ready, menuLoad: {key: ready.menuContextKey, status: 'error'}})).toEqual({pending: true, error: 'Não foi possível carregar os menus.'});
  expect(adminBootstrapState({...ready, hasCompany: false, companyError: 'offline'}).error).toBe('Não foi possível carregar a empresa.');
});
