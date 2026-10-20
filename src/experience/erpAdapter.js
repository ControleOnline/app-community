import {createJourney} from './journey';
import {createReadCoordinator} from './reads';
import {createCollectionCache} from './collectionCache';
import {invalidateProductCatalogCache} from '@controleonline/ui-common/src/react/utils/productCatalogCacheRevision';

export function createErpExperience({api, getContext, now, cacheTtlMs = 30000, getStores, collectionStorage} = {}) {
  const journal = createJourney({now});
  const original = api.fetch;
  const storeBindings = [];
  let catalog;
  const recipes = new Map();
  let contextKey = '', capabilityKey = '', allowed = new Set(), route = '', intentTimer = null, installed = false;
  const scope = () => JSON.stringify(getContext());
  const sync = () => {
    const next = scope();
    if (next === contextKey) return;
    contextKey = next; recipes.clear(); reads.invalidate(); journal.setContext(getContext());
  };
  const policy = (uri, options = {}) => {
    const path = String(uri).replace(/^\//, '');
    if (options.signal || options.headers || options.responseType || options.body) return 0;
    if (!/^(?:people(?:\/\d+)?|people_links|products)$/.test(path)) return 0;
    // Dashboard counts are not collections to hydrate a CRM list from.
    if (Number(options.params?.itemsPerPage) === 1) return 0;
    return cacheTtlMs;
  };
  const reads = createReadCoordinator({fetch: (uri, options) => original.call(api, uri, options), getScope: scope, journal, now, policy,
    // Translation registration does not mutate people/product collection data.
    invalidates: uri => String(uri).replace(/^\//, '').split('?')[0] !== 'translates/resolve'});
  catalog = createCollectionCache({getScope: () => {const c = getContext(); return c.active && c.company && c.principal ? JSON.stringify(c) : '';}, storage: collectionStorage, onRefresh: () => reads.invalidate({cancelPending:false})});
  const fetch = (uri, options = {}) => {
    sync();
    const method = String(options.method || 'GET').toUpperCase();
    if (method !== 'GET' && String(uri).replace(/^\//, '').split('?')[0] !== 'translates/resolve') {recipes.clear(); void catalog.invalidate();}
    const optionsCopy = {...options, params: options.params && {...options.params}};
    if (method === 'GET' && allowed.has(route) && policy(uri, options) && /^\/?(?:people|people_links|products)$/.test(uri))
      recipes.set(route, {uri, options: {...optionsCopy, params: optionsCopy.params && JSON.parse(JSON.stringify(optionsCopy.params))}, scope: contextKey});
    const catalogWrite = method !== 'GET' && /^(?:products|categories|product_groups|product_group_products|product_categories|product_files|product_showcases|product_showcase_items)(?:\/|$)/.test(String(uri).replace(/^\//, '').split('?')[0]);
    const result = reads.read(uri, optionsCopy).then(data => {
      if (catalogWrite) invalidateProductCatalogCache();
      return data;
    });
    return method !== 'GET' && String(uri).replace(/^\//, '').split('?')[0] !== 'translates/resolve' ? result.finally(() => catalog.invalidate()) : result;
  };
  const x = {
    journal, catalog,
    stats: reads.stats,
    setCapabilities(names) {
      const next = [...new Set(names)].sort().join('|');
      if (next !== capabilityKey) {reads.invalidate({cancelPending: false}); recipes.clear(); capabilityKey = next;}
      allowed = new Set(names);
    },
    begin(name, source) {sync(); route = name; return journal.begin(name, source);},
    present(name) {sync(); route = name; journal.present(name);},
    dataCommitted(name) {sync(); journal.finish(name);},
    async prefetchRoute(name) {
      sync();
      const recipe = recipes.get(name);
      if (!allowed.has(name) || !recipe || recipe.scope !== contextKey) return false;
      return reads.prefetch(recipe.uri, {...recipe.options, params: recipe.options.params && JSON.parse(JSON.stringify(recipe.options.params))});
    },
    anticipate(name) {
      clearTimeout(intentTimer);
      intentTimer = setTimeout(() => {void x.prefetchRoute(name);}, 250);
    },
    cancelAnticipation() {clearTimeout(intentTimer);},
    invalidate() {reads.invalidate(); recipes.clear();},
    install() {
      if (!installed) {
        api.fetch = fetch; installed = true;
        const stores = getStores?.() || {};
        for (const name of ['people','people_link','categories']) {
          const store = stores[name]; if (!store?.actions?.getItems) continue;
          const previous = store.actions.getItems, previousMarker = store.actions.catalogCache, wrapped = catalog.wrap(store).getItems;
          store.actions.getItems = wrapped; store.actions.catalogCache = true; storeBindings.push({store,previous,previousMarker,wrapped});
        }
      }
      return () => {for (const {store,previous,previousMarker,wrapped} of storeBindings.splice(0)) if (store.actions.getItems === wrapped) {store.actions.getItems = previous; if (previousMarker === undefined) delete store.actions.catalogCache; else store.actions.catalogCache = previousMarker;} if (api.fetch === fetch) api.fetch = original; installed = false; x.cancelAnticipation(); reads.invalidate();};
    },
    reset() {void catalog.invalidate(); contextKey = ''; recipes.clear(); reads.invalidate(); journal.reset(); x.cancelAnticipation();},
    dispose() {if (api.fetch === fetch) api.fetch = original; installed = false; x.reset(); reads.dispose();},
  };
  return x;
}
