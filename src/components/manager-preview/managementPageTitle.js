import {managerRouteTitle} from './model';

/**
 * Header titles must come from the translation store (same path as managerMenu).
 * Natural-language Portuguese is never hardcoded here.
 */
export const resolveManagementPageTitle = (route, options = {}) => {
  const t = global.t?.t;
  const fromRoute = managerRouteTitle(route?.name, route?.params || {}, t);
  if (fromRoute) return fromRoute;
  // Product contexts and record/finance titles belong to their existing page.
  return typeof options.headerTitle === 'string' ? options.headerTitle : options.title;
};
