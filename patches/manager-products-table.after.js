import React, { useEffect, useMemo, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { NavigationRouteContext, useIsFocused } from '@react-navigation/native';
import { useStore } from '@store';
import { useMessage } from '@controleonline/ui-common/src/react/components/MessageService';
import { normalizeText } from '../inputs/defaultInputUtils';
import { DEFAULT_COMPACT_BREAKPOINT, isObject, stableSerialize } from './DefaultTable.utils';
import {
  resolveDefaultTablePreferenceScope,
  resolveStoredTableViewModePreference,
} from '../../utils/tableVisibleColumnsPreferences';
import { useDefaultTablePagination } from './useDefaultTablePagination';
import {
  useDefaultTableSortedData,
  useDefaultTableSortState,
} from './useDefaultTableSorting';
import useDefaultTableTheme from './useDefaultTableTheme';
import DefaultTableView from './DefaultTableView';
import useDefaultTableCreateForm from './useDefaultTableCreateForm';
import {
  assignGetterValue, publishStoreValue,
  useDefaultTableStoreSync,
} from './useDefaultTableStoreSync';
export {
  mergeSortedDataWithLiveItems,
  resolveColumnListLoadParams,
  shouldTriggerEndReachedFromScroll,
} from './DefaultTable.utils';
const DefaultTable = ({
  accentColor = null,
  actions = {},
  add = null,
  addButtonPlacement = 'toolbar',
  addLabel = '',
  compactBreakpoint = DEFAULT_COMPACT_BREAKPOINT,
  cardListProps = {},
  columns = [],
  presentationColumns = null,
  data = undefined,
  defaultColor = '',
  filters = {},
  footerComponent = null,
  forceCardsOnCompact = true,
  getOptionsForColumn = null,
  hasMore = null,
  importAction = null,
  initialViewMode = 'table',
  isLoading = false,
  exportAction = null,
  onAdd = null,
  onDataLoaded = null,
  onEditRow = null,
  onEndReached = null,
  onExport = null,
  onFilterChange = null,
  onImport = null,
  onMomentumScrollBegin = null,
  onRefresh = null,
  onRowPress = null,
  onSaved = null,
  onScrollBeginDrag = null,
  onSelectionChange = null,
  onSortChange = null,
  pageSize = null,
  appearance = 'compact',
  paginationMode = 'infinite',
  pinRowActions = true,
  renderCard = null,
  requestParams = {},
  rowActionsComponent = null,
  rowActionsWidth = null,
  rowStyle = null,
  searchKey = 'search',
  searchPlaceholder = '',
  showColumnFiltersButton = true,
  showSearch = null,
  showRowActions = true,
  showToolbar = true,
  showAdministrativeTools = true,
  showToolbarActions = null,
  showToolbarControls = null,
  showTotalItemsInCompactToolbar = false,
  showTotalItemsInFooter = true,
  sort = null,
  storeName = '',
  summary = undefined, totalItems = undefined,
  summaryLabels = {},
  toolbarActions = [],
  viewMode = null,
  visibleColumnsPreferenceKey = '',
}) => {
  const { width } = useWindowDimensions();
  const route = React.useContext(NavigationRouteContext);
  const store = useStore(storeName);
  const peopleStore = useStore('people');
  const isFocused = useIsFocused();
  const storeDeclaredConfigsRef = useRef(null);
  const { showError } = useMessage() || {};
  const { tableBorderColors, themeColors } = useDefaultTableTheme(accentColor, appearance);
  const tablePanelBorderColor = tableBorderColors.containerBorderColor;
  const floatingAddBackgroundColor =
    themeColors.buttonBackground || themeColors.primary || accentColor;
  const floatingAddIconColor = themeColors.buttonText;
  const currentCompanyId = peopleStore?.getters?.currentCompany?.id;
  const tablePreferenceScope = useMemo(
    () =>
      resolveDefaultTablePreferenceScope({
        companyId: currentCompanyId,
        preferenceKey: visibleColumnsPreferenceKey,
        route,
        storeName,
      }),
    [currentCompanyId, route?.key, route?.name, storeName, visibleColumnsPreferenceKey],
  );
  const storedViewMode = useMemo(
    () => resolveStoredTableViewModePreference(tablePreferenceScope, null),
    [initialViewMode, tablePreferenceScope],
  );
  const resolvedActions = useMemo(
    () => ({
      ...(store?.actions || {}),
      ...(actions || {}),
    }),
    [actions, store?.actions],
  );
  const autoMode = data === undefined && normalizeText(storeName) !== '';
  const storeColumns = Array.isArray(store?.getters?.columns) ? store.getters.columns : [];
  const columnsForTable = storeColumns.length > 0 ? storeColumns : columns;
  const storeFilters = isObject(store?.getters?.filters) ? store.getters.filters : {};
  const requestParamsSeed = isObject(requestParams) ? requestParams : {};
  const resolvedTotalItems = totalItems ?? (!autoMode && paginationMode === 'pages' ? data.length : store?.getters?.totalItems);
  useEffect(() => {if ((!autoMode && paginationMode === 'pages') || totalItems !== undefined) publishStoreValue(store, 'setTotalItems', resolvedTotalItems, 'totalItems');}, [autoMode, paginationMode, totalItems, resolvedTotalItems, storeName, store?.actions?.setTotalItems]);
  if (storeDeclaredConfigsRef.current === null) {
    storeDeclaredConfigsRef.current = isObject(store?.getters?.configs)
      ? store.getters.configs
      : {};
  }
  const storeDeclaredConfigs = storeDeclaredConfigsRef.current || {};
  const currentConfigs = {
    ...storeDeclaredConfigs,
    ...(store?.getters?.configs || {}),
  };
  const storeSelectable = storeDeclaredConfigs.selectable === true;
  const isCompactView = width > 0 && width <= compactBreakpoint;
  const addConfig = store?.getters?.add;
  const normalizedAddButtonPlacement = normalizeText(addButtonPlacement) || 'toolbar';
  const resolvedAddLabel =
    normalizeText(addLabel) ||
    normalizeText(global.t?.t(storeName, 'button', 'add')) ||
    'Adicionar';
  if (storeColumns.length === 0 && Array.isArray(columns) && columns.length > 0) {
    assignGetterValue(store, 'columns', columns);
  }
  if (data !== undefined && Array.isArray(data)) {
    assignGetterValue(store, 'items', data);
  }

  const { requestSort, resolvedSort } = useDefaultTableSortState({
    autoMode,
    columnsForTable,
    onSortChange,
    sort,
    tablePreferenceScope,
  });
  const {
    buildRequestQuery,
    currentPage,
    pageSizeNumber, paginateData,
    goToPage,
    resolvedIsLoading,
    handleEndReached,
    handleRefresh,
    resolvedData,
    resolvedIsRefreshing,
  } = useDefaultTablePagination({
    autoMode,
    columnsForTable,
    data,
    filters: storeFilters,
    hasMore,
    isFocused,
    isLoading,
    onEndReached,
    onRefresh,
    pageSize,
    paginationMode,
    requestParams: requestParamsSeed,
    resolvedActions,
    resolvedSort,
    resolvedTotalItems,
    showError,
    store,
    storeName,
  });
  const sortedItems = useDefaultTableSortedData({
    resolvedData,
    resolvedSort,
    storeName,
    tableColumns: columnsForTable,
  });
  const sortedData = useMemo(() => paginateData(sortedItems), [paginateData, sortedItems]);
  const {isCreateFormOpen, closeCreateForm, resolvedOnAdd, handleDefaultCreateSaved} =
    useDefaultTableCreateForm({onAdd, onSaved, resolvedActions, handleRefresh});
  const hasAddAction =
    add !== false && (addConfig === true || add === true) &&
    typeof resolvedOnAdd === 'function';
  const shouldRenderFloatingAddButton =
    hasAddAction &&
    (normalizedAddButtonPlacement === 'floating' || showToolbar === false);
  const shouldRenderBottomAddButton =
    hasAddAction &&
    showToolbar !== false &&
    normalizedAddButtonPlacement === 'bottom';
  const debugFallbackParameters = useMemo(() => {
    if (autoMode) {
      return buildRequestQuery(currentPage || 1, false);
    }
    return {
      filters: storeFilters,
      requestParams: requestParamsSeed,
      sort: resolvedSort || null,
    };
  }, [autoMode, buildRequestQuery, currentPage, requestParamsSeed, resolvedSort, storeFilters]);
  const previousCompactRef = useRef(isCompactView);
  const enteringCompact = isCompactView && !previousCompactRef.current;
  useEffect(() => {previousCompactRef.current = isCompactView;}, [isCompactView]);
  const effectiveViewMode = viewMode || (
    enteringCompact && forceCardsOnCompact !== false ? 'cards' :
    currentConfigs.viewMode ||
    storedViewMode ||
    (isCompactView && forceCardsOnCompact !== false ? 'cards' : initialViewMode));
  const tableFiltersVisible = Boolean(currentConfigs.tableFiltersVisible);
  const defaultTableConfigs = useMemo(
    () => ({
      ...storeDeclaredConfigs,
      appearance,
      paginationMode,
      currentPage,
      pageSizeNumber,
      onPageChange: goToPage,
      paginationLoading: resolvedIsLoading,
      add,
      addButtonPlacement: normalizedAddButtonPlacement,
      addLabel: resolvedAddLabel,
      cardListProps,
      compactBreakpoint,
      debugFallbackParameters,
      defaultColor,
      effectiveViewMode, viewMode,
      filters,
      footerComponent,
      forceCardsOnCompact,
      getOptionsForColumn,
      import: storeDeclaredConfigs.import,
      importAction,
      initialViewMode,
      exportAction,
      onAdd: resolvedOnAdd,
      onDataLoaded,
      onEditRow,
      onEndReached: handleEndReached,
      onExport,
      onFilterChange,
      onImport,
      onMomentumScrollBegin,
      onRefresh: handleRefresh,
      onRowPress,
      onSaved,
      onScrollBeginDrag,
      onSelectionChange,
      pinRowActions,
      renderCard,
      requestParams: requestParamsSeed,
      requestSort,
      resolvedSort,
      presentationColumns,
      rowActionsComponent,
      rowActionsWidth,
      rowStyle,
      searchKey,
      searchPlaceholder,
      selectable: storeSelectable,
      showColumnFiltersButton,
      showSearch,
      showRowActions: presentationColumns !== null ? showRowActions : storeDeclaredConfigs.showRowActions === false ? false : showRowActions,
      showAdministrativeTools,
      showToolbar,
      showToolbarActions:
        showToolbarActions === null
          ? storeDeclaredConfigs.showToolbarActions !== false
          : showToolbarActions !== false,
      showToolbarControls:
        showToolbarControls === null
          ? storeDeclaredConfigs.showToolbarControls !== false
          : showToolbarControls !== false,
      showTotalItemsInCompactToolbar,
      showTotalItemsInFooter,
      sortedData,
      summary: summary !== undefined ? summary : store?.getters?.summary,
      summaryLabels: Object.keys(summaryLabels || {}).length
        ? summaryLabels
        : storeDeclaredConfigs.summaryLabels || {},
      tableFiltersVisible,
      refreshing: resolvedIsRefreshing,
      tablePreferenceScope,
      toolbarActions,
      // A controlled presentation must not replace the saved list mode.
      viewMode: viewMode ? storeDeclaredConfigs.viewMode : effectiveViewMode,
    }),
    [
      appearance, paginationMode, currentPage, pageSizeNumber, goToPage, resolvedIsLoading,
      add,
      normalizedAddButtonPlacement,
      resolvedAddLabel,
      cardListProps,
      compactBreakpoint,
      debugFallbackParameters,
      defaultColor,
      effectiveViewMode, viewMode,
      filters,
      footerComponent,
      forceCardsOnCompact,
      getOptionsForColumn,
      handleEndReached,
      handleRefresh,
      resolvedOnAdd,
      storeDeclaredConfigs,
      storeSelectable,
      importAction,
      initialViewMode,
      exportAction,
      onDataLoaded,
      onEditRow,
      onExport,
      onFilterChange,
      onImport,
      onMomentumScrollBegin,
      onRefresh,
      onRowPress,
      onSaved,
      onScrollBeginDrag,
      onSelectionChange,
      pinRowActions,
      renderCard,
      requestParamsSeed,
      requestSort,
      resolvedIsRefreshing,
      resolvedSort,
      presentationColumns,
      rowActionsComponent,
      rowActionsWidth,
      rowStyle,
      searchKey,
      searchPlaceholder,
      showColumnFiltersButton,
      showSearch,
      showRowActions,
      showAdministrativeTools,
      showToolbar,
      showToolbarActions,
      showToolbarControls,
      showTotalItemsInCompactToolbar,
      showTotalItemsInFooter,
      sortedData,
      store,
      summary,
      summaryLabels,
      tableFiltersVisible,
      tablePreferenceScope,
      toolbarActions,
    ],
  );
  const defaultTableConfigsSignature = useMemo(
    () =>
      stableSerialize({
        appearance, paginationMode, currentPage, pageSizeNumber, resolvedIsLoading,
        configuredImport: storeDeclaredConfigs.import || null,
        add,
        addButtonPlacement: normalizedAddButtonPlacement,
        addLabel: resolvedAddLabel,
        cardListProps,
        compactBreakpoint,
        defaultColor,
        effectiveViewMode,
        filters,
        forceCardsOnCompact,
        hasExportAction: Boolean(exportAction || onExport),
        hasImportAction: Boolean(storeDeclaredConfigs.import || importAction || onImport),
        initialViewMode,
        pinRowActions,
        presentationColumns,
        rowActionsComponentType: rowActionsComponent ? typeof rowActionsComponent : '',
        rowActionsWidth,
        resolvedIsRefreshing,
        resolvedSort,
        searchKey,
        searchPlaceholder,
        selectable: storeSelectable,
        showColumnFiltersButton,
        showSearch,
        showRowActions,
        showAdministrativeTools,
        showToolbar,
        showToolbarActions,
        showToolbarControls,
        showTotalItemsInCompactToolbar,
        showTotalItemsInFooter,
        storedViewMode, controlledViewMode: viewMode,
        tableFiltersVisible,
        sortedData: stableSerialize(sortedData),
        toolbarActionsLength: Array.isArray(toolbarActions) ? toolbarActions.length : 0,
      }),
    [
      appearance, paginationMode, currentPage, pageSizeNumber, goToPage, resolvedIsLoading,
      add,
      normalizedAddButtonPlacement,
      resolvedAddLabel,
      cardListProps,
      compactBreakpoint,
      defaultColor,
      debugFallbackParameters,
      effectiveViewMode, viewMode,
      filters,
      forceCardsOnCompact,
      storeDeclaredConfigs,
      storeSelectable,
      exportAction,
      importAction,
      initialViewMode,
      onExport,
      onImport,
      pinRowActions,
      presentationColumns,
      rowActionsComponent,
      rowActionsWidth,
      resolvedIsRefreshing,
      resolvedSort,
      searchKey,
      searchPlaceholder,
      showColumnFiltersButton,
      showSearch,
      showRowActions,
      showAdministrativeTools,
      showToolbar,
      showToolbarActions,
      showToolbarControls,
      showTotalItemsInCompactToolbar,
      showTotalItemsInFooter,
      storedViewMode,
      tableFiltersVisible,
      sortedData,
      toolbarActions,
    ],
  );
  // Do not mutate store.configs during render. A new configs object is built
  // every pass; writing it here retriggers subscribers and React #185 when
  // opening Adicionar on DefaultTable (categories). Sync only in the hook
  // when defaultTableConfigsSignature changes.
  useDefaultTableStoreSync({
    filters,
    onFilterChange,
    columns,
    columnsForTable,
    data,
    defaultTableConfigs,
    defaultTableConfigsSignature,
    store,
    storeColumnsLength: storeColumns.length,
    storeFilters,
    storeName,
    tablePreferenceScope,
  });

  useEffect(() => {
    onDataLoaded?.(sortedData);
  }, [onDataLoaded, sortedData]);

  return <DefaultTableView {...{
    tablePanelBorderColor,
    themeColors,
    showToolbar,
    storeName,
    showToolbarActions,
    showToolbarControls,
    shouldRenderBottomAddButton,
    resolvedAddLabel,
    floatingAddBackgroundColor,
    resolvedOnAdd,
    floatingAddIconColor,
    shouldRenderFloatingAddButton,
    closeCreateForm,
    isCreateFormOpen,
    resolvedActions,
    columnsForTable,
    getOptionsForColumn,
    handleDefaultCreateSaved,
    requestParamsSeed
  }} />;
};
export default DefaultTable;
