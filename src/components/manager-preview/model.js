import {resolveManagerTheme} from '../../styles/managerTheme';
import {Platform} from 'react-native';
import {app_type} from '@appType';
import {filterRuntimeMenuModulesByType, resolveRuntimeMenuLabel} from '@controleonline/ui-common/src/react/utils/runtimeMenu';
import {resolveMenuRouteName, resolveMenuRouteParams} from '@controleonline/ui-layout/src/react/utils/menuNavigation';

// Activation is explicit per build; app type, company and device rules stay authoritative.
// The legacy preview flag remains loopback-only for existing local workflows.
export const shouldPreview = ({platform, appType, layout, enabled, nativeEnabled, hostname}) =>
  appType === 'MANAGER' && layout !== 'legacy' && (
    (layout === 'modern' && ['web','android'].includes(platform)) ||
    (platform === 'android' && nativeEnabled === '1') ||
    (platform === 'web' && enabled === '1' && ['localhost', '127.0.0.1', '[::1]'].includes(hostname))
  );
export const managerPreviewEnabled = shouldPreview({
  platform: Platform.OS, appType: app_type,
  layout: process.env.EXPO_PUBLIC_MANAGER_LAYOUT,
  enabled: process.env.EXPO_PUBLIC_MANAGER_PREVIEW,
  nativeEnabled: process.env.EXPO_PUBLIC_MANAGER_NATIVE_PREVIEW,
  hostname: typeof window === 'undefined' ? '' : window.location?.hostname,
});


const previewRouteTitles = {MyCompaniesPage:'Minhas empresas',EmployeesIndex:'Colaboradores', PdvPage:'PDV', LinkedOrderSettlementPage:'Mesas e comandas', OrderHistoryPage:'Pedidos', ProductsPage:'Produtos', ClientsIndex:'Clientes', ProvidersIndex:'Fornecedores', FranchiseesIndex:'Franquias', DevicesIndex:'Dispositivos', ConfiguratorPage:'Configurações', IncomeStatement:'Resultados', FinancialHubPage:'Financeiro', ProductShowcasesPage:'Vitrines'};

export function managerRouteTitle(name, params = {}) {
  if (name === 'OrderHistoryPage') {
    const kind = params.orderTypeFilter || params.orderType;
    if (kind === 'sale') return 'Pedidos de venda';
    if (kind === 'purchase') return 'Pedidos de compra';
  }
  return previewRouteTitles[name];
}

export function managerMenu(menus, availableRoutes, translate, menuType = 'home') {
  const registered = new Set(availableRoutes);
  return filterRuntimeMenuModulesByType(menus, menuType).map(group => ({
    ...group,
    title: translate?.('menu', 'menu', group.label) || group.label,
    items: group.menus.map(item => ({
      ...item,
      name: resolveMenuRouteName(item.route),
      params: resolveMenuRouteParams(item.routeParams),
      title: managerRouteTitle(resolveMenuRouteName(item.route), resolveMenuRouteParams(item.routeParams)) || resolveRuntimeMenuLabel(item, translate),
    })).filter(item => registered.has(item.name)),
  })).filter(group => group.items.length);
}

export function selectedManagerMenuItem(items, route) {
  const candidates = items.filter(item => item.name === route.name);
  if (candidates.length === 1) return candidates[0];
  // A shared route can represent distinct domain flows (sales and purchases).
  return candidates.sort((a, b) => Object.keys(b.params || {}).length - Object.keys(a.params || {}).length)
    .find(item => Object.entries(item.params || {}).every(([key, value]) => JSON.stringify(route.params?.[key]) === JSON.stringify(value)));
}

export const previewModeKey = 'controleonline.manager-preview.mode';
export function readPreviewMode() {
  try { return localStorage.getItem(previewModeKey) === 'dark' ? 'dark' : 'light'; }
  catch { return 'light'; }
}

export function previewPalette(base, mode) {
  return resolveManagerTheme(base, mode);
}
