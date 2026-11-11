import {resolveManagerTheme} from '../../styles/managerTheme';
import {Platform} from 'react-native';
import {app_type} from '@appType';
import {filterRuntimeMenuModulesByType, resolveRuntimeMenuLabel} from '@controleonline/ui-common/src/react/utils/runtimeMenu';
import {resolveMenuRouteName, resolveMenuRouteParams} from '@controleonline/ui-layout/src/react/utils/menuNavigation';
import {resolveManagerLayout} from '../../../scripts/lib/manager-layout.cjs';

// Standard Expo defaults to modern; explicit build choices and app type stay authoritative.
// The legacy preview flag remains loopback-only for existing local workflows.
export const shouldPreview = ({platform, appType, layout, enabled, nativeEnabled, hostname}) => {
  const resolvedLayout = resolveManagerLayout(layout);
  return ['ADMIN', 'MANAGER'].includes(appType) && resolvedLayout !== 'legacy' && (
    (resolvedLayout === 'modern' && ['web','android'].includes(platform)) ||
    (platform === 'android' && nativeEnabled === '1') ||
    (platform === 'web' && enabled === '1' && ['localhost', '127.0.0.1', '[::1]'].includes(hostname))
  );
};
export const managerPreviewEnabled = shouldPreview({
  platform: Platform.OS, appType: app_type,
  layout: process.env.EXPO_PUBLIC_MANAGER_LAYOUT,
  enabled: process.env.EXPO_PUBLIC_MANAGER_PREVIEW,
  nativeEnabled: process.env.EXPO_PUBLIC_MANAGER_NATIVE_PREVIEW,
  hostname: typeof window === 'undefined' ? '' : window.location?.hostname,
});


/** Machine keys only — never Portuguese display strings. Values resolve via translate. */
const routeTranslationKeys = {
  MyCompaniesPage: 'my_companies',
  EmployeesIndex: 'employees',
  PdvPage: 'pdv',
  LinkedOrderSettlementPage: 'tables_and_orders',
  OrderHistoryPage: 'orders',
  ProductsPage: 'products',
  ClientsIndex: 'clients',
  ProvidersIndex: 'providers',
  FranchiseesIndex: 'franchisees',
  DevicesIndex: 'devices',
  ConfiguratorPage: 'settings',
  IncomeStatement: 'results',
  FinancialHubPage: 'financial',
  ProductShowcasesPage: 'showcases',
};

/**
 * Resolve a route title exclusively from the translation store (menu → configs).
 * No hardcoded natural-language fallbacks.
 */
export function managerRouteTitle(name, params = {}, translate) {
  const t = translate || global.t?.t;
  if (name === 'OrderHistoryPage') {
    const kind = params.orderTypeFilter || params.orderType;
    if (kind === 'sale') {
      return (
        t?.('menu', 'menu', 'sale_orders') ||
        t?.('configs', 'title', 'sale_orders') ||
        t?.('menu', 'menu', 'orders_sale')
      );
    }
    if (kind === 'purchase') {
      return (
        t?.('menu', 'menu', 'purchase_orders') ||
        t?.('configs', 'title', 'purchase_orders') ||
        t?.('menu', 'menu', 'orders_purchase')
      );
    }
  }
  const key = routeTranslationKeys[name] || name;
  return (
    t?.('menu', 'menu', key) ||
    t?.('configs', 'title', key) ||
    t?.('menu', 'menu', name)
  );
}

export function managerMenu(menus, availableRoutes, translate, menuType = 'home') {
  const registered = new Set(availableRoutes);
  const t = translate || global.t?.t;
  return filterRuntimeMenuModulesByType(menus, menuType).map(group => {
    const groupKey = group.menuKey || group.label;
    return {
      ...group,
      title:
        t?.('menu', 'menu', groupKey) ||
        t?.('menu', 'menu', group.label) ||
        resolveRuntimeMenuLabel({menuKey: groupKey, label: group.label}, t),
      items: group.menus
        .map(item => {
          const name = resolveMenuRouteName(item.route);
          const params = resolveMenuRouteParams(item.routeParams);
          return {
            ...item,
            categoryColor: group.color,
            categoryId: group.id,
            name,
            params,
            title:
              resolveRuntimeMenuLabel(item, t) ||
              managerRouteTitle(name, params, t),
          };
        })
        .filter(item => registered.has(item.name)),
    };
  }).filter(group => group.items.length);
}

export const matchesManagerMenuParams = (item, route) => Object.entries(item.params || {})
  .every(([key, value]) => JSON.stringify(route.params?.[key]) === JSON.stringify(value));

export function selectedManagerMenuItem(items, route) {
  const candidates = items.filter(item => item.name === route.name);
  if (candidates.length === 1) return candidates[0];
  // A shared route can represent distinct domain flows (sales and purchases).
  return candidates.sort((a, b) => Object.keys(b.params || {}).length - Object.keys(a.params || {}).length)
    .find(item => matchesManagerMenuParams(item, route));
}

export const previewModeKey = 'controleonline.manager-preview.mode';
export function readPreviewMode() {
  try { return localStorage.getItem(previewModeKey) === 'dark' ? 'dark' : 'light'; }
  catch { return 'light'; }
}

export function previewPalette(base, mode) {
  return resolveManagerTheme(base, mode);
}
