import {isPublicRoute} from '@controleonline/ui-common/src/react/router/publicRoutes';

// Paylist is an anonymous customer page even though the shared public set omits it.
export const isManagementRoute = name => !isPublicRoute(name) && name !== 'PaylistPage';
export const managerRouteOptions = (name, options, enabled) =>
  enabled && isManagementRoute(name) ? {...options, headerShown: false} : options;
