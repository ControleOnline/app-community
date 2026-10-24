import {isPosSingleItemMode} from '@controleonline/ui-common/src/react/config/deviceConfigBootstrap';
import {resolveMenuRouteName, resolveMenuRouteParams} from '@controleonline/ui-layout/src/react/utils/menuNavigation';

export const isSingleItemPos = (appType, configs) => appType === 'POS' && isPosSingleItemMode(configs);
export const SINGLE_ITEM_ROUTES = new Set(['HomePage', 'PdvPage', 'AddProductScreen', 'ProductsPage', 'Checkout', 'OrderHistoryPage', 'OrderDetails', 'CustomizeScreen', 'ProfilePage']);

// Menus from the authenticated bootstrap stay authoritative, including home-only access.
export function singleItemNavigation(modules = [], availableRoutes = []) {
  const allowed = new Set((Array.isArray(modules) ? modules : []).flatMap(group => group.menus || [])
    .map(item => resolveMenuRouteName(item.route)));
  const registered = new Set(availableRoutes);
  const items = [];
  if (registered.has('HomePage') && (allowed.has('OrderHistoryPage') || allowed.has('PdvPage'))) items.push({route:'HomePage',icon:'grid',label:'Catálogo'});
  if (registered.has('OrderHistoryPage') && allowed.has('OrderHistoryPage')) {
    const source = modules.flatMap(group => group.menus || []).find(item => resolveMenuRouteName(item.route) === 'OrderHistoryPage');
    items.push({route:'OrderHistoryPage',icon:'shopping-bag',label:'Pedidos',routeParams:{...resolveMenuRouteParams(source?.routeParams),interactionMode:'pdv',showBottomToolBar:true}});
  }
  if (registered.has('ProfilePage')) items.push({route:'ProfilePage',icon:'user',label:'Perfil'});
  return items;
}
