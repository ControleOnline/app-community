import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getColumnKey,
  isDateLikeColumn,
} from '../inputs/defaultInputUtils';
import {
  normalizeCollectionItems,
  resolveDateRangeQuery,
  resolveFilterQueryValue,
  resolveHasMore,
  stableSerialize,
} from './DefaultTable.utils';

const buildQueryFromState = ({
  append,
  columnsForTable,
  filters,
  page,
  pageSizeNumber,
  requestParams,
  sort,
}) => {
  const query = {
    ...requestParams,
    itemsPerPage: pageSizeNumber,
    page,
  };

  if (sort?.field && sort?.direction) {
    query[`order[${sort.field}]`] = sort.direction;
  }

  Object.entries(filters || {}).forEach(([fieldName, value]) => {
    if (!fieldName) return;

    const column = columnsForTable.find(item => getColumnKey(item) === fieldName);

    if (isDateLikeColumn(column)) {
      const dateRange = resolveDateRangeQuery(value);
      if (dateRange.after) {
        query[`${fieldName}[after]`] = dateRange.after;
      }
      if (dateRange.before) {
        query[`${fieldName}[before]`] = dateRange.before;
      }
      return;
    }

    const normalizedValue = resolveFilterQueryValue(value);
    if (Array.isArray(normalizedValue)) {
      if (normalizedValue.length > 0) {
        query[fieldName] = normalizedValue;
      }
      return;
    }

    if (normalizedValue !== '') {
      query[fieldName] = normalizedValue;
    }
  });

  if (append) {
    query.append = true;
  }

  return query;
};

const useAutoPageLoader = ({
  autoMode,
  autoQuerySignature,
  buildRequestQuery,
  endReachedLockRef,
  pageSizeNumber,
  resolvedActions,
  showError,
  storeName,
  store,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [autoHasLoaded, setAutoHasLoaded] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoLoadingMore, setAutoLoadingMore] = useState(false);
  const [autoRefreshing, setAutoRefreshing] = useState(false);
  const [autoLastPageCount, setAutoLastPageCount] = useState(0);
  const autoRequestIdRef = useRef(0);
  const autoLoadedQueryKeyRef = useRef('');
  const autoLoadedStoreKeyRef = useRef(null);
  const autoErroredQueryKeyRef = useRef('');
  const autoPageRef = useRef(0);
  const isFetchingRef = useRef(false);

  const loadAutoPage = useCallback(
    (page, { append = false, refresh = false } = {}) => {
      if (!autoMode || typeof resolvedActions.getItems !== 'function') {
        return Promise.resolve([]);
      }
      if (isFetchingRef.current) {
        return Promise.resolve([]);
      }
      isFetchingRef.current = true;

      const requestId = autoRequestIdRef.current + 1;
      autoRequestIdRef.current = requestId;

      if (refresh) {
        setAutoRefreshing(true);
        autoPageRef.current = 0;
      } else if (append) {
        setAutoLoadingMore(true);
      } else {
        setAutoLoading(true);
        setAutoHasLoaded(false);
        setAutoLastPageCount(0);
        autoPageRef.current = 0;
      }

      const query = buildRequestQuery(page, append);
      if (refresh && resolvedActions.catalogCache) query.__storeMeta = {catalogRefresh: true};

      const request = resolvedActions.getItems(query);
      const owningRequestKey = store?.getters?.activeRequestKey;
      return Promise.resolve(request)
        .then(response => {
          if (autoRequestIdRef.current !== requestId) {
            return response;
          }

          const pageItems = normalizeCollectionItems(response);
          // A retained screen must not present another screen's shared-store result.
          if (owningRequestKey && store?.getters?.lastCompletedRequest?.requestKey !== owningRequestKey) {
            autoLoadedQueryKeyRef.current = '';
            setAutoHasLoaded(false);
            return pageItems;
          }
          autoLoadedStoreKeyRef.current = owningRequestKey || store?.getters?.lastCompletedRequest?.requestKey || null;
          autoPageRef.current = Number(response?.catalogPage) || page;
          setCurrentPage(autoPageRef.current);
          autoLoadedQueryKeyRef.current = autoQuerySignature;
          autoErroredQueryKeyRef.current = '';
          setAutoHasLoaded(true);
          setAutoLastPageCount(response?.catalogLastPageCount ?? pageItems.length);
          return pageItems;
        })
        .catch(error => {
          if (autoRequestIdRef.current === requestId) {
            autoErroredQueryKeyRef.current = autoQuerySignature;
            showError?.(
              error?.message || global.t?.t(storeName, 'error', 'load'),
            );
          }

          return [];
        })
        .finally(() => {
          isFetchingRef.current = false;
          if (autoRequestIdRef.current === requestId) {
            setAutoLoading(false);
            setAutoLoadingMore(false);
            setAutoRefreshing(false);
            endReachedLockRef.current = false;
          }
        });
    },
    [
      autoMode,
      autoQuerySignature,
      buildRequestQuery,
      endReachedLockRef,
      resolvedActions,
      showError,
      storeName,
      store,
    ],
  );

  return {
    currentPage,
    autoErroredQueryKeyRef,
    autoHasLoaded,
    autoLastPageCount,
    autoLoadedQueryKeyRef,
    autoLoadedStoreKeyRef,
    autoLoading,
    autoLoadingMore,
    autoRefreshing,
    autoPageRef,
    loadAutoPage,
    pageSizeNumber,
  };
};

const useAutoPageEffect = ({
  autoErroredQueryKeyRef,
  autoLoadedQueryKeyRef,
  autoLoading,
  autoLoadingMore,
  autoMode,
  autoQuerySignature,
  endReachedLockRef,
  isFocused,
  loadAutoPage,
  resolvedActions,
  ownsStoreResult,
  autoPageRef,
}) => {
  const wasFocused = useRef(false);
  useEffect(() => {
    const entering = isFocused && !wasFocused.current;
    wasFocused.current = isFocused;
    if (!autoMode || !isFocused) return;
    if (typeof resolvedActions.getItems !== 'function') return;
    // A failed visit may retry on the next focus, but never spin while still focused.
    if (entering) autoErroredQueryKeyRef.current = '';
    if (
      autoLoading ||
      autoLoadingMore ||
      (autoLoadedQueryKeyRef.current === autoQuerySignature && ownsStoreResult && !(entering && resolvedActions.catalogCache)) ||
      autoErroredQueryKeyRef.current === autoQuerySignature
    ) {
      return;
    }

    endReachedLockRef.current = false;
    const retainedPage = autoLoadedQueryKeyRef.current === autoQuerySignature && (!ownsStoreResult || resolvedActions.catalogCache)
      ? Math.max(1, autoPageRef.current) : 1;
    loadAutoPage(retainedPage, { append: false });
  }, [
    autoErroredQueryKeyRef,
    autoLoadedQueryKeyRef,
    autoLoading,
    autoLoadingMore,
    autoMode,
    autoQuerySignature,
    endReachedLockRef,
    isFocused,
    loadAutoPage,
    resolvedActions,
    ownsStoreResult,
  autoPageRef,
  ]);
};

export const useDefaultTablePagination = ({
  autoMode,
  columnsForTable,
  data,
  filters,
  hasMore,
  isFocused,
  isLoading,
  onRefresh,
  onEndReached,
  pageSize,
  paginationMode = 'infinite',
  requestParams,
  resolvedActions,
  resolvedSort,
  resolvedTotalItems,
  showError,
  store,
  storeName,
}) => {
  const endReachedLockRef = useRef(false);
  const previousPaginationStateRef = useRef({
    dataLength: Array.isArray(data) ? data.length : 0,
    filtersKey: JSON.stringify(filters || {}),
    sortDirection: resolvedSort?.direction,
    sortField: resolvedSort?.field,
  });
  const pageSizeNumber = Number(requestParams.itemsPerPage || pageSize || 50) || 50;
  const [localPage, setLocalPage] = useState({key: '', page: 1});
  const localQueryKey = stableSerialize([storeName, pageSizeNumber, filters, resolvedSort,
    Array.isArray(data) ? data.map(item => item?.['@id'] ?? item?.id) : []]);
  const localPages = Math.max(1, Math.ceil((Array.isArray(data) ? data.length : 0) / pageSizeNumber));
  const resourceEndpoint = store?.getters?.resourceEndpoint || '';
  const storeReload = store?.getters?.reload;
  const buildRequestQuery = useCallback(
    (page, append = false) =>
      buildQueryFromState({
        append,
        columnsForTable,
        filters,
        page,
        pageSizeNumber,
        requestParams,
        sort: resolvedSort,
      }),
    [columnsForTable, filters, pageSizeNumber, requestParams, resolvedSort],
  );
  const autoQuerySignature = useMemo(
    () =>
      stableSerialize({
        endpoint: resourceEndpoint,
        query: buildQueryFromState({
          append: false,
          columnsForTable,
          filters,
          page: 1,
          pageSizeNumber,
          requestParams,
          sort: resolvedSort,
        }),
        reload: Boolean(storeReload),
        storeName,
      }),
    [columnsForTable, filters, pageSizeNumber, requestParams, resolvedSort, resourceEndpoint, storeName, storeReload],
  );
  const {
    currentPage: autoCurrentPage,
    autoErroredQueryKeyRef,
    autoHasLoaded,
    autoLastPageCount,
    autoLoadedQueryKeyRef,
    autoLoadedStoreKeyRef,
    autoLoading,
    autoLoadingMore,
    autoRefreshing,
    autoPageRef,
    loadAutoPage,
  } = useAutoPageLoader({
    autoMode,
    autoQuerySignature,
    buildRequestQuery,
    endReachedLockRef,
    pageSizeNumber,
    resolvedActions,
    showError,
    storeName,
    store,
  });

  const currentPage = autoMode ? autoCurrentPage : Math.min(localPages, localPage.key === localQueryKey ? localPage.page : 1);
  const paginateData = useCallback(items => !autoMode && paginationMode === 'pages'
    ? items.slice((currentPage - 1) * pageSizeNumber, currentPage * pageSizeNumber) : items,
  [autoMode, paginationMode, currentPage, pageSizeNumber]);

  const ownsStoreResult = !autoLoadedStoreKeyRef.current ||
    autoLoadedStoreKeyRef.current === store?.getters?.lastCompletedRequest?.requestKey;

  useAutoPageEffect({
    autoErroredQueryKeyRef,
    autoLoadedQueryKeyRef,
    autoLoading,
    autoLoadingMore,
    autoMode,
    autoQuerySignature,
    endReachedLockRef,
    isFocused,
    loadAutoPage,
    resolvedActions,
    ownsStoreResult,
    autoPageRef,
  });

  useEffect(() => {
    if (storeReload && typeof store?.actions?.setReload === 'function') {
      store.actions.setReload(false);
    }
  }, [storeReload, store]);

  const resolvedIsLoading = autoMode
    ? (autoLoading || autoLoadingMore)
    : Boolean(isLoading);
  const resolvedIsRefreshing = autoMode
    ? autoRefreshing
    : false;
  const resolvedData = autoMode
    ? (autoHasLoaded && ownsStoreResult && Array.isArray(store?.getters?.items) ? store.getters.items : [])
    : (Array.isArray(data) ? data : []);
  const resolvedHasMore = useMemo(
    () => {
      if (autoMode) {
        if (Number.isFinite(Number(resolvedTotalItems)) && Number(resolvedTotalItems) > 0) {
          return resolvedData.length < Number(resolvedTotalItems);
        }

        return autoLastPageCount >= pageSizeNumber && resolvedData.length > 0;
      }

      return resolveHasMore({
        hasMore,
        dataLength: resolvedData.length,
        totalItems: resolvedTotalItems,
      });
    },
    [autoLastPageCount, autoMode, hasMore, pageSizeNumber, resolvedData.length, resolvedTotalItems],
  );

  useEffect(() => {
    const nextPaginationState = {
      dataLength: resolvedData.length,
      filtersKey: stableSerialize(filters || {}),
      sortDirection: resolvedSort?.direction,
      sortField: resolvedSort?.field,
    };

    const previousPaginationState = previousPaginationStateRef.current;
    const didPaginationStateChange =
      previousPaginationState.dataLength !== nextPaginationState.dataLength ||
      previousPaginationState.filtersKey !== nextPaginationState.filtersKey ||
      previousPaginationState.sortDirection !== nextPaginationState.sortDirection ||
      previousPaginationState.sortField !== nextPaginationState.sortField;

    if (didPaginationStateChange) {
      endReachedLockRef.current = false;
      previousPaginationStateRef.current = nextPaginationState;
    }
  }, [filters, resolvedData.length, resolvedSort?.direction, resolvedSort?.field]);

  const handleEndReached = useCallback(() => {
    if (
      paginationMode === 'pages' ||
      !resolvedHasMore ||
      resolvedIsLoading ||
      endReachedLockRef.current === true
    ) {
      return;
    }

    endReachedLockRef.current = true;

    if (autoMode) {
      const nextPage = autoPageRef.current + 1;
      loadAutoPage(nextPage, { append: true });
      return;
    }

    if (typeof onEndReached === 'function') {
      onEndReached();
    }
  }, [
    paginationMode,
    autoMode,
    autoPageRef,
    loadAutoPage,
    onEndReached,
    resolvedHasMore,
    resolvedIsLoading,
  ]);

  const handleRefresh = useCallback(() => {
    endReachedLockRef.current = false;

    if (autoMode) {
      return loadAutoPage(1, { append: false, refresh: true });
    }

    if (typeof onRefresh === 'function') {
      return Promise.resolve(onRefresh());
    }

    return Promise.resolve([]);
  }, [autoMode, loadAutoPage, onRefresh]);

  return {
    buildRequestQuery,
    currentPage,
    paginateData,
    goToPage: page => {
      const totalPages = autoMode ? Math.max(1, Math.ceil(Number(resolvedTotalItems || 0) / pageSizeNumber)) : localPages;
      if (!autoMode && paginationMode === 'pages' && Number.isInteger(page) && page >= 1 && page <= totalPages && !resolvedIsLoading) setLocalPage({key: localQueryKey, page});
      if (autoMode && paginationMode === 'pages' && Number.isInteger(page) && page >= 1 && page <= totalPages && !resolvedIsLoading) {
        return loadAutoPage(page, {append: false});
      }
      return Promise.resolve([]);
    },
    handleEndReached,
    handleRefresh,
    pageSizeNumber,
    resolvedData,
    resolvedHasMore,
    resolvedIsRefreshing,
    resolvedIsLoading,
  };
};
