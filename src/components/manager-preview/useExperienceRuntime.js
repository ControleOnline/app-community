import {useLayoutEffect, useRef} from 'react';
import {getAllStores} from '@store';
import {pdvImageCache} from '../../experience/pdvImageCache';
import {api} from '@controleonline/ui-common/src/api';
import eventBus from '@controleonline/ui-common/src/react/components/EventBus';
import {attachJourneyConsole} from '../../experience/consoleReporter';
import {createCollectionStorage} from '../../experience/collectionStorage';
import {createErpExperience} from '../../experience/erpAdapter';

export default function useExperienceRuntime({active, auth, company}) {
  const latest = useRef(); latest.current = {active, auth, company};
  const runtime = useRef();
  const hadActive = useRef(false);
  if (!runtime.current) runtime.current = createErpExperience({api, getStores: getAllStores, collectionStorage: createCollectionStorage(), getContext: () => {
    const stores = typeof getAllStores === 'function' ? getAllStores() : null;
    const authState = stores?.auth?.getters || latest.current.auth;
    const currentCompany = stores?.people?.getters?.currentCompany || latest.current.company;
    const user = authState?.user || {};
    return {application: 'MANAGER', company: currentCompany?.id || '',
      principal: user.id || user.username || '', session: user.api_key || user.token || '',
      permissions: Array.isArray(user.roles) ? [...user.roles].sort().join('|') : '',
      device: stores?.device?.getters?.item?.id || '',
      active: latest.current.active && !!authState?.isLogged};
  }});
  useLayoutEffect(() => {
    const x = runtime.current;
    if (!active) {if (hadActive.current) {x.reset(); void pdvImageCache.clear();} return;}
    hadActive.current = true;
    const uninstall = x.install();
    const detachConsole = attachJourneyConsole(x.journal);
    const clearCatalog = () => {x.invalidate(); void x.catalog.invalidate(); void pdvImageCache.clear();};
    eventBus.on('product-catalog-cache:cleared', clearCatalog);
    const observe = () => x.journal.record('interaction.observed', {source: 'click', route: x.journal.snapshot().active?.route || ''});
    if (typeof document !== 'undefined') document.addEventListener('click', observe, true);
    return () => {eventBus.off('product-catalog-cache:cleared', clearCatalog); detachConsole(); uninstall(); if (typeof document !== 'undefined') document.removeEventListener('click', observe, true);};
  }, [active]);
  return runtime.current;
}
