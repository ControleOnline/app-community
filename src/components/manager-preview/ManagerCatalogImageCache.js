import React, {useMemo} from 'react';
import {useStore} from '@store';
import {DefaultFileCacheContext} from '@controleonline/ui-default/src/react/components/files/DefaultFile';
import {getCatalogCacheScope} from '@controleonline/ui-products/src/react/utils/catalogCacheScope';
import {pdvImageCache} from '../../experience/pdvImageCache';

// Reuse the ERP catalog's tenant/session/device/permission scope for binary previews.
// Stores retain file references; the existing bounded cache retains the image bytes.
export default function ManagerCatalogImageCache({children}) {
  const {isLogged, user} = useStore('auth').getters;
  const {currentCompany} = useStore('people').getters;
  const {item:device} = useStore('device').getters;
  const companyId = currentCompany?.id;
  const principal = user?.id || user?.username;
  const permissions = JSON.stringify(Array.isArray(user?.roles) ? [...user.roles].sort() : []);
  const cache = useMemo(() => ({load:async (uri, headers, load) => {
    const scope = await getCatalogCacheScope(companyId, 'products');
    return scope ? pdvImageCache.load(scope, uri, headers, load) : load();
  }}), [companyId, principal, permissions, device?.id]);
  return <DefaultFileCacheContext.Provider value={isLogged ? cache : null}>
    {children}
  </DefaultFileCacheContext.Provider>;
}
