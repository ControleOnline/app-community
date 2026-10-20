import {api} from '@controleonline/ui-common/src/api';
import localDB from '@controleonline/ui-common/src/api/localDB';
import {queue} from '@controleonline/ui-common/src/api/queue';
import * as types from '@controleonline/ui-default/src/store/default/mutation_types';

let db = null;

export const STORE_ACTION_META_KEY = '__storeMeta'

const isPlainObject = value =>
  Object.prototype.toString.call(value) === '[object Object]'

const normalizeText = value => String(value ?? '').trim()

const stableSerialize = value => {
  if (value === null || value === undefined) {
    return 'null'
  }

  if (Array.isArray(value)) {
    return `[${value.map(item => stableSerialize(item)).join(',')}]`
  }

  if (value instanceof Date) {
    return JSON.stringify(value.toISOString())
  }

  if (isPlainObject(value)) {
    return `{${Object.keys(value)
      .sort()
      .map(key => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
      .join(',')}}`
  }

  return JSON.stringify(value)
}

const normalizeCollectionItems = response => {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.member)) return response.member
  if (Array.isArray(response?.['hydra:member'])) return response['hydra:member']

  return []
}

const resolveCollectionTotalItems = (response, items) =>
  Number(
    response?.totalItems ||
      response?.['hydra:totalItems'] ||
      items?.length ||
      0,
  )

const normalizeCollectionItemId = item =>
  normalizeText(item?.['@id'] || item?.id || '').replace(/\D+/g, '')

const normalizeSavedItemPatch = (data, patch) => {
  if (!isPlainObject(patch)) {
    return {}
  }

  return Object.entries(patch).reduce((normalizedPatch, [key, value]) => {
    const incomingValue = data?.[key]
    normalizedPatch[key] = isPlainObject(incomingValue) ? incomingValue : value

    return normalizedPatch
  }, {})
}

const mergeSavedItem = ({currentItem, data, storeMeta}) => {
  const incomingItem = isPlainObject(data) ? {...data} : {}
  delete incomingItem['@context']

  return {
    ...(isPlainObject(currentItem) ? currentItem : {}),
    ...incomingItem,
    ...normalizeSavedItemPatch(incomingItem, storeMeta.savedItemPatch),
  }
}

const appendCollectionItems = (currentItems, nextItems) => {
  const mergedItems = Array.isArray(currentItems) ? [...currentItems] : []
  const incomingItems = Array.isArray(nextItems) ? nextItems : []

  incomingItems.forEach(item => {
    const itemId = normalizeCollectionItemId(item)
    const existingIndex = mergedItems.findIndex(
      currentItem => normalizeCollectionItemId(currentItem) === itemId,
    )

    if (existingIndex >= 0) {
      mergedItems[existingIndex] = item
      return
    }

    mergedItems.push(item)
  })

  return mergedItems
}

export const splitStoreActionPayload = value => {
  if (!isPlainObject(value)) {
    return {
      payload: value,
      storeMeta: {},
    }
  }

  const payload = {...value}
  const rawStoreMeta = payload[STORE_ACTION_META_KEY]
  delete payload[STORE_ACTION_META_KEY]

  return {
    payload,
    storeMeta: isPlainObject(rawStoreMeta) ? rawStoreMeta : {},
  }
}

export const buildStoreErrorCommitOptions = storeMeta => {
  if (!isPlainObject(storeMeta)) {
    return {}
  }

  const options = {}

  if (storeMeta.skipSystemError === true) {
    options.skipSystemError = true
  }

  if (typeof storeMeta.dedupeKey === 'string' && storeMeta.dedupeKey.trim()) {
    options.dedupeKey = storeMeta.dedupeKey.trim()
  }

  if (typeof storeMeta.providerKey === 'string' && storeMeta.providerKey.trim()) {
    options.providerKey = storeMeta.providerKey.trim()
  }

  if (typeof storeMeta.position === 'string' && storeMeta.position.trim()) {
    options.position = storeMeta.position.trim()
  }

  return options
}

const commitStoreError = (commit, error, storeMeta) => {
  commit(
    types.SET_ERROR,
    error?.message || error,
    buildStoreErrorCommitOptions(storeMeta),
  )
}

export const executeQueue = ({commit, getters}, func, callback) => {
  queue.executeQueue(func, callback);
};

export const addToQueue = ({commit, getters}, func) => {
  queue.addToQueue(func);
};
export const initQueue = ({commit, getters}, func) => {
  queue.initQueue(func);
  return queue;
};

export const saveOffline = ({commit, getters}, data) => {
  return;
};

export const getOfflineItems = ({commit, getters}, params = {}) => {
  const {storeMeta} = splitStoreActionPayload(params)
  commit(types.SET_ISLOADING, true);
  commit(types.SET_ERROR, null);
  commit(types.SET_SUMMARY, {});
  commit(types.SET_DEBUG, {});

  db = new localDB(getters);

  return db
    .getItemsByFilters()
    .then(async data => {
      if (!data || (Array.isArray(data) && data.length === 0))
        return getOnlineItems({commit, getters}, params).then(data => {
          commit(types.SET_ITEM, data);
          if (getters.offline) saveOffline({commit, getters}, data);
          return data;
        });
    })
    .catch(e => {
      commitStoreError(commit, e, storeMeta)
      throw e;
    })
    .finally(() => {
      commit(types.SET_ISLOADING, false);
    });
};

export const getOnlineItems = ({commit, getters}, params = {}) => {
  const {payload: requestParams, storeMeta} = splitStoreActionPayload(params)
  const {append: shouldAppend = false, ...queryParams} = isPlainObject(requestParams)
    ? requestParams
    : {}
  const requestKey = stableSerialize({
    append: Boolean(shouldAppend),
    endpoint: getters.resourceEndpoint,
    params: queryParams,
  })

  const preserveQuery = storeMeta.preserveItems === true && getters.lastCompletedRequest?.requestKey === requestKey
  commit(types.SET_ACTIVE_REQUEST_KEY, requestKey)
  commit(types.SET_ISLOADING, !preserveQuery);
  commit(types.SET_ISLOADINGLIST, !preserveQuery)
  commit(types.SET_ERROR, null);
  if (!shouldAppend && !preserveQuery) {
    if (getters.items != null) commit(types.SET_ITEMS, []);
    commit(types.SET_TOTALITEMS, 0);
    commit(types.SET_SUMMARY, {});
    commit(types.SET_DEBUG, {});
  }
  return api
    .fetch(getters.resourceEndpoint, {params: queryParams})
    .then(data => {
      const pageItems = normalizeCollectionItems(data)

      if (getters.activeRequestKey !== requestKey) {
        return pageItems
      }

      const nextItems = shouldAppend
        ? appendCollectionItems(getters.items, pageItems)
        : pageItems

      commit(types.SET_ERROR, null);
      commit(types.SET_ITEMS, nextItems);
      commit(types.SET_TOTALITEMS, resolveCollectionTotalItems(data, nextItems));
      commit(types.SET_SUMMARY, data['summary'] || data?.['hydra:summary'] || {});
      commit(types.SET_DEBUG, data?.debug || {});
      commit(types.SET_LAST_COMPLETED_REQUEST, {
        completedAt: Date.now(),
        requestKey,
        status: 'success',
      });

      return pageItems;
    })
    .catch(e => {
      if (getters.activeRequestKey === requestKey) {
        commitStoreError(commit, e, storeMeta)
        commit(types.SET_LAST_COMPLETED_REQUEST, {
          completedAt: Date.now(),
          error: e?.message || String(e || ''),
          requestKey,
          status: 'error',
        });
      }
      throw e;
    })
    .finally(() => {
      if (getters.activeRequestKey === requestKey) {
        commit(types.SET_ACTIVE_REQUEST_KEY, '')
        commit(types.SET_ISLOADING, false);
        commit(types.SET_ISLOADINGLIST, false)
      }
    });
};

export const getItems = ({commit, getters}, params = {}) => {
  //if (getters.offline) return getOfflineItems({commit, getters}, params); else
  return getOnlineItems({commit, getters}, params);
};

export const get = ({commit, getters}, id) => {
  const {payload: requestId, storeMeta} = splitStoreActionPayload(id)
  const normalizedId = String(requestId?.id ?? requestId ?? '').replace(/\D/g, '')
  commit(types.SET_ISLOADING, true);
  commit(types.SET_ERROR, null);
  // Refreshes that need the current record to stay mounted can opt out of the
  // destructive intermediate clear by passing `__storeMeta.preserveItem = true`.
  if (storeMeta.preserveItem !== true && getters.item != null) commit(types.SET_ITEM, {});
  return api
    .fetch(
      getters.resourceEndpoint + '/' + normalizedId,

      {},
    )
    .then(data => {
      commit(types.SET_ERROR, null);
      commit(types.SET_ITEM, data);
      if (normalizedId) {
        commit(types.SET_LOADED_KEY, normalizedId);
        commit(types.SET_LOADED_AT, Date.now());
      }
      if (getters.offline) saveOffline({commit, getters}, data);
      return data;
    })
    .catch(e => {
      commitStoreError(commit, e, storeMeta)
      throw e;
    })
    .finally(() => {
      commit(types.SET_ISLOADING, false);
    });
};

export const save = ({commit, getters}, params) => {
  const {payload: requestParams, storeMeta} = splitStoreActionPayload(params)
  let id = requestParams?.id?.toString().replace(/\D/g, '');
  delete requestParams.id;

  let options = {
    method: id ? 'PUT' : 'POST',
    body: requestParams,
  };
  commit(types.SET_ISSAVING, true);
  commit(types.SET_ERROR, null);

  return api
    .fetch(getters.resourceEndpoint + (id ? '/' + id : ''), options)
    .then(data => {
      commit(types.SET_ERROR, null);
      let items = getters.items ? [...getters.items] : [];
      if (id) {
        const index = items.findIndex(i => {
          return normalizeCollectionItemId(i) === id;
        });
        const nextItem = mergeSavedItem({
          currentItem: index >= 0 ? items[index] : null,
          data,
          storeMeta,
        });

        if (index >= 0) items[index] = nextItem;
        else items.push(nextItem);
      } else {
        items.push(mergeSavedItem({currentItem: null, data, storeMeta}));
      }
      commit(types.SET_ITEMS, items);
      return data;
    })
    .catch(e => {
      commitStoreError(commit, e, storeMeta)
      throw e;
    })
    .finally(() => {
      commit(types.SET_ISSAVING, false);
    });
};

export const remove = ({commit, getters}, id) => {
  const {payload: requestId, storeMeta} = splitStoreActionPayload(id)
  id = String(requestId?.id ?? requestId ?? '').replace(/\D/g, '');
  let options = {
    method: 'DELETE',
  };
  commit(types.SET_ISSAVING, true);
  commit(types.SET_ERROR, null);

  return api
    .fetch(getters.resourceEndpoint + '/' + id, options)
    .then(() => {
      commit(types.SET_ERROR, null);
      let items = getters.items ? [...getters.items] : [];
      const index = items.findIndex(i => {
        if (i && i['@id']) return i['@id'].toString().replace(/\D/g, '') === id;
      });

      if (index >= 0) items.splice(index, 1);
      else items = [];
      commit(types.SET_ITEMS, items);
      return;
    })
    .catch(e => {
      commitStoreError(commit, e, storeMeta)
      throw e;
    })
    .finally(() => {
      commit(types.SET_ISSAVING, false);
    });
};

export const setFilters = ({commit, getters}, params) => {
  commit(types.SET_FILTERS, params);
};

export const setItem = ({commit, getters}, params) => {
  commit(types.SET_ITEM, params);
};

export const setItems = ({commit, getters}, params) => {
  commit(types.SET_ITEMS, params);
};

export const setPrint = ({commit, getters}, params) => {
  commit(types.SET_PRINT, params);
};

export const setReload = ({commit, getters}, reload) => {
  commit(types.SET_RELOAD, reload);
};

export const setError = ({commit, getters}, error) => {
  commit(types.SET_ERROR, error);
};

export const setIsSaving = ({commit, getters}, IsSaving) => {
  commit(types.SET_ISSAVING, IsSaving);
};
export const setIsLoading = ({commit, getters}, IsLoading) => {
  commit(types.SET_ISLOADING, IsLoading);
};

export const setTotalItems = ({commit, getters}, totalItems) => {
  commit(types.SET_TOTALITEMS, totalItems);
};

export const setSummary = ({commit, getters}, summary) => {
  commit(types.SET_SUMMARY, summary);
};

export const setColumns = ({commit, getters}, columns) => {
  commit(types.SET_COLUMNS, columns);
};

export const setConfigs = ({commit, getters}, configs) => {
  commit(types.SET_CONFIGS, configs);
};

export const setResourceEndpoint = (
  {commit, getters},
  resourceEndpoint = null,
) => {
  commit(types.SET_RESOURCE_ENDPOINT, resourceEndpoint);
};

export const setSelected = ({commit, getters}, selected) => {
  commit(types.SET_SELECTED, selected);
};

export const setMessage = ({commit, getters}, message) => {
  commit(types.SET_MESSAGE, message);
};

export const setMessages = ({commit, getters}, messages) => {
  commit(types.SET_MESSAGES, messages);
};

export const setSelections = ({commit, getters}, selections) => {
  commit(types.SET_SELECTIONS, selections);
};

export const setSelectorModalKey = ({commit, getters}, selectorModalKey) => {
  commit(types.SET_SELECTOR_MODAL_KEY, selectorModalKey);
};

export const setActiveRequestKey = ({commit, getters}, activeRequestKey) => {
  commit(types.SET_ACTIVE_REQUEST_KEY, activeRequestKey);
};

export const setLastCompletedRequest = (
  {commit, getters},
  lastCompletedRequest,
) => {
  commit(types.SET_LAST_COMPLETED_REQUEST, lastCompletedRequest);
};

export const setVisibleColumns = ({commit, getters}, visibleColumns) => {
  commit(types.SET_VISIBLECOLUMNS, visibleColumns);
};

export const setIsLoadingList = ({commit, getters}, isLoadingList) => {
  commit(types.SET_ISLOADINGLIST, isLoadingList);
};

export const setStore = ({commit, getters}, store) => {
  commit(types.SET_STORE, store);
};

export const setOffline = ({commit, getters}, offline) => {
  commit(types.SET_OFFLINE, offline);
};
export const setPayable = ({commit, getters}, payable) => {
  commit(types.SET_PAYABLE, payable);
};
