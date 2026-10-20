import { useEffect, useMemo, useRef } from 'react';
import {
  persistTableFiltersPreference,
  resolveStoredTableFiltersPreference,
  resolveStoredVisibleColumnsPreference,
  sanitizeTableFiltersPreference,
  sanitizeVisibleColumnsPreference,
} from '../../utils/tableVisibleColumnsPreferences';

export const publishStoreValue = (store, actionName, value, getterName) => {
  if (typeof store?.actions?.[actionName] === 'function') {
    store.actions[actionName](value);
    return;
  }

  if (store?.getters) {
    store.getters[getterName] = value;
  }
};

export const assignGetterValue = (store, getterName, value) => {
  if (store?.getters) {
    store.getters[getterName] = value;
  }
};

/** Stable JSON compare for filter objects (anti React #185 on period toggle). */
export const areTableFiltersEqual = (a, b) => {
  try {
    return JSON.stringify(a ?? {}) === JSON.stringify(b ?? {});
  } catch {
    return a === b;
  }
};

/**
 * Keeps controlled DefaultTable props (data/columns/configs/preferences) in sync
 * with the zustand store without depending on store object identity.
 * Zustand replaces the store slice on every commit; using that identity in effect
 * deps caused React error #185 (Maximum update depth exceeded) on Devices.
 *
 * Stored filters are hydrated once per preference scope / columns signature.
 * Re-applying on every storeFilters change caused Maximum update depth when
 * toggling date period (today → all → today) on OrderHistoryPage (app-community#448).
 */
export function useDefaultTableStoreSync({
  columns,
  columnsForTable,
  data,
  defaultTableConfigs,
  defaultTableConfigsSignature,
  filters,
  onFilterChange,
  store,
  storeColumnsLength,
  storeFilters,
  storeName,
  tablePreferenceScope,
}) {
  const onFilterChangeRef = useRef(onFilterChange);
  onFilterChangeRef.current = onFilterChange;
  const controlledFiltersRef = useRef(filters);
  controlledFiltersRef.current = filters;
  const lastControlledFiltersRef = useRef(filters);
  const storeRef = useRef(store);
  storeRef.current = store;
  const lastPublishedItemsRef = useRef(undefined);
  // Keep custom presentation closures current (for example after a theme switch)
  // without publishing configs for every new callback identity and reintroducing #185.
  const cardOwner = useMemo(() => {
    const owner = {current: null, signature: ''};
    owner.render = (...args) => owner.current?.(...args);
    return owner;
  }, [storeName, store?.actions?.setConfigs]);
  cardOwner.current = defaultTableConfigs.renderCard;
  const hasRenderCard = typeof defaultTableConfigs.renderCard === 'function';
  const lastHydratedFiltersKeyRef = useRef('');
  const storeFiltersRef = useRef(storeFilters);
  storeFiltersRef.current = storeFilters;

  useEffect(() => {
    if (storeColumnsLength > 0 || !Array.isArray(columns) || columns.length === 0) {
      return;
    }

    publishStoreValue(storeRef.current, 'setColumns', columns, 'columns');
  }, [columns, storeColumnsLength, storeName]);

  useEffect(() => {
    if (data === undefined || !Array.isArray(data)) {
      lastPublishedItemsRef.current = undefined;
      return;
    }

    if (lastPublishedItemsRef.current === data) {
      return;
    }

    lastPublishedItemsRef.current = data;
    publishStoreValue(storeRef.current, 'setItems', data, 'items');
  }, [data, storeName]);

  useEffect(() => {
    if (!columnsForTable.length) {
      return;
    }

    const storedVisibleColumns = resolveStoredVisibleColumnsPreference(tablePreferenceScope);
    if (!storedVisibleColumns) {
      return;
    }

    const nextVisibleColumns = sanitizeVisibleColumnsPreference({
      columns: columnsForTable,
      visibleColumns: storedVisibleColumns,
    });

    if (!nextVisibleColumns.length) {
      return;
    }

    publishStoreValue(
      storeRef.current,
      'setVisibleColumns',
      nextVisibleColumns,
      'visibleColumns',
    );
  }, [columnsForTable, storeName, tablePreferenceScope]);

  useEffect(() => {
    if (!columnsForTable.length) {
      return;
    }

    const scopeKey = [
      tablePreferenceScope?.companyKey || '',
      tablePreferenceScope?.storeKey || '',
      tablePreferenceScope?.routeKey || '',
      columnsForTable.map(c => c?.key || c?.name || '').join('|'),
    ].join('::');

    if (lastHydratedFiltersKeyRef.current === scopeKey) return;
    lastHydratedFiltersKeyRef.current = scopeKey;
    const storedFilters = resolveStoredTableFiltersPreference(tablePreferenceScope);
    const controlled = typeof onFilterChangeRef.current === 'function';
    if (!storedFilters && !controlled) return;
    const nextFilters = sanitizeTableFiltersPreference({
      columns: columnsForTable,
      filters: storedFilters || controlledFiltersRef.current || {},
    });
    if (!areTableFiltersEqual(storeFiltersRef.current, nextFilters)) {
      publishStoreValue(storeRef.current, 'setFilters', nextFilters, 'filters');
    }
    // The screen builds requestParams from its controlled filters. Hydration must
    // notify it too, including saved {}, or the UI and request disagree.
    if (controlled && !areTableFiltersEqual(controlledFiltersRef.current, nextFilters)) {
      onFilterChangeRef.current(nextFilters);
    }
  }, [columnsForTable, storeName, tablePreferenceScope]);

  useEffect(() => {
    if (typeof onFilterChangeRef.current !== 'function') return;
    if (areTableFiltersEqual(lastControlledFiltersRef.current, filters)) return;
    lastControlledFiltersRef.current = filters;
    persistTableFiltersPreference(tablePreferenceScope, sanitizeTableFiltersPreference({
      columns: columnsForTable, filters: filters || {},
    }));
    if (!areTableFiltersEqual(storeFiltersRef.current, filters)) {
      publishStoreValue(storeRef.current, 'setFilters', filters || {}, 'filters');
    }
  }, [filters]);

  useEffect(() => {
    const signature = `${storeName}:${defaultTableConfigsSignature}:render-card:${hasRenderCard}`;
    if (cardOwner.signature === signature) {
      return;
    }

    cardOwner.signature = signature;
    publishStoreValue(storeRef.current, 'setConfigs', {
      ...defaultTableConfigs,
      renderCard: hasRenderCard ? cardOwner.render : defaultTableConfigs.renderCard,
    }, 'configs');
  }, [defaultTableConfigs, defaultTableConfigsSignature, storeName, hasRenderCard, cardOwner]);
}
