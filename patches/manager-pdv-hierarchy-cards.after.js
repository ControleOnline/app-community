import React, {useState} from 'react';
import { FlatList, Text, View, useWindowDimensions } from 'react-native';
import { useStore } from '@store';
import { formatStoreColumnLabel } from '@controleonline/ui-common/src/react/utils/storeColumns';
import { getColumnKey, resolveCellText } from '../inputs/defaultInputUtils';
import DefaultTableEmptyState from './DefaultTableEmptyState';
import DefaultTableInput from './DefaultTableInput';
import DefaultTableRowActions, {
  hasDefaultTableRowActionsComponent,
} from './DefaultTableRowActions';
import {
  END_REACHED_THRESHOLD,
  getRowKey,
  mergeSortedDataWithLiveItems,
  shouldTriggerEndReachedFromScroll,
  shouldIncludeColumn,
} from './DefaultTable.utils';
import styles from './DefaultTable.styles';
import compactStyles from './DefaultTableCompact.styles';
import useDefaultTableRowInteraction from './useDefaultTableRowInteraction';
import useDefaultTableTheme from './useDefaultTableTheme';

// Vertical cards must keep their intrinsic height; zero basis is only for grid rows.
const intrinsicHeight = {flexBasis: 'auto', flexGrow: 0, flexShrink: 0};

/** Responsive card grid (OrderHistory / compact lists). Explicit cardListProps.numColumns wins. */
export const resolveResponsiveCardColumns = width => {
  const w = Number(width) || 0;
  if (w >= 1280) return 3;
  if (w >= 800) return 2;
  return 1;
};


const DefaultTableCards = ({ storeName }) => {
  const [listWidth, setListWidth] = useState(0);
  const {canOpenRow, setRowInteraction} = useDefaultTableRowInteraction();
  const store = useStore(storeName);
  const configs = store?.getters?.configs || {};
  const { palette } = useDefaultTableTheme();
  const columns = Array.isArray(store?.getters?.columns) ? store.getters.columns : [];
  const visibleColumns = store?.getters?.visibleColumns || {};
  const tableColumns = columns.filter(
    column => shouldIncludeColumn(column) && visibleColumns[getColumnKey(column)] !== false,
  );
  const sortedData = mergeSortedDataWithLiveItems({
    liveItems: store?.getters?.items,
    sortedData: configs.sortedData,
  });
  const cardListProps =
    configs.cardListProps && typeof configs.cardListProps === 'object'
      ? configs.cardListProps
      : {};
  const compact = configs.appearance === 'compact';
  const {width: windowWidth} = useWindowDimensions();
  const explicitNumColumns = Number(cardListProps.numColumns);
  const hasExplicitNumColumns = Number.isFinite(explicitNumColumns) && explicitNumColumns > 0;
  // Default responsive grid for all card tables (same breakpoints as OrderHistory).
  // Callers may still force a fixed column count via cardListProps.numColumns.
  const gridColumns = hasExplicitNumColumns
    ? explicitNumColumns
    : resolveResponsiveCardColumns(windowWidth);
  const compactCardWidth = listWidth ? Math.max(0, (listWidth - 24 - 12 * (gridColumns - 1)) / gridColumns) : undefined;
  const {
    contentContainerStyle,
    key: cardListKey,
    listKey,
    numColumns: _ignoredNumColumns,
    transformData,
    unframedCards,
    ...flatListProps
  } = cardListProps;
  const isLoading = Boolean(store?.getters?.isLoadingList || store?.getters?.isLoading);
  const emptyStateLabel = isLoading
    ? global.t?.t(storeName, 'label', 'loading')
    : global.t?.t(storeName, 'label', 'empty');
  const tableBorderColor = palette.border;
  const tableMutedColor = palette.textSecondary;
  const tableSurfaceColor = palette.background;
  const tableTextColor = palette.text;
  const hasBottomAddButton = configs.addButtonPlacement === 'bottom';
  const handleListScroll = event => {
    flatListProps.onScroll?.(event);
    if (shouldTriggerEndReachedFromScroll(event)) {
      configs.onEndReached?.();
    }
  };

  const renderCardItem = (row, index = 0) => {
    const rowStyleValue = typeof configs.rowStyle === 'function'
      ? configs.rowStyle(row, index)
      : configs.rowStyle;
    const renderField = (fieldName, options = {}) => (
      <DefaultTableInput
        fieldName={fieldName}
        options={{...options, onInteractionChange: blocked => {options.onInteractionChange?.(blocked); setRowInteraction(row, {key: fieldName}, blocked);}}}
        row={row}
        storeName={storeName}
        variant="card"
      />
    );
    const renderValue = (fieldName, fallback = '-') => {
      const column = columns.find(item => getColumnKey(item) === fieldName);
      if (!column) return fallback;

      return resolveCellText({ column, columns, row, storeName }) || fallback;
    };
    const RowActionsComponent = configs.rowActionsComponent;
    const hasRowPress = typeof configs.onRowPress === 'function';
    const hasCustomRowActions = hasDefaultTableRowActionsComponent(RowActionsComponent);
    const hasEditAction = typeof configs.onEditRow === 'function';
    const hasRowActions = configs.showRowActions !== false && (hasCustomRowActions || hasEditAction);
    const customRowActions = hasCustomRowActions ? (
      <DefaultTableRowActions
        component={RowActionsComponent}
        helpers={{
          openEdit: () => configs.onEditRow?.(row),
          openRow: hasRowPress ? () => {if (canOpenRow(row)) configs.onRowPress(row);} : null,
        }}
        openEdit={() => configs.onEditRow?.(row)}
        openRow={hasRowPress ? () => {if (canOpenRow(row)) configs.onRowPress(row);} : null}
        row={row}
        storeName={storeName}
      />
    ) : null;
    const editButton = hasEditAction ? (
      <Text onPress={() => configs.onEditRow?.(row)}>
        {global.t?.t(storeName, 'button', 'edit')}
      </Text>
    ) : null;

    if (typeof configs.renderCard === 'function') {
      return (
        <View
          key={row?.['@id'] || row?.id}
          style={[
            styles.cardItem,
            gridColumns === 1 ? intrinsicHeight : null,
            hasRowActions ? styles.cardItemWithActions : null,
            rowStyleValue,
            compact ? [compactStyles.cardItem, {flex: 0, flexGrow: 0, flexShrink: 0, flexBasis: 'auto', width: compactCardWidth, maxWidth: compactCardWidth, backgroundColor: palette.cardBackground || palette.panelBackground, borderColor: palette.cardBorder || palette.inputBorder}] : null,
            unframedCards ? {borderWidth:0,backgroundColor:'transparent',shadowOpacity:0,elevation:0} : null,
          ]}
        >
          <View style={[styles.cardContent, hasRowActions ? null : intrinsicHeight, compact ? {flex: 0, flexBasis: 'auto', flexGrow: 0} : null]}>
            {configs.renderCard({
              item: row,
              openEdit: () => configs.onEditRow?.(row),
              openRow: hasRowPress ? () => {if (canOpenRow(row)) configs.onRowPress(row);} : null,
              renderField,
              renderValue,
              row,
            })}
          </View>
          {hasRowActions ? (
            <View style={compact ? [compactStyles.cardActions, {backgroundColor: palette.tableFooterBackground, borderTopColor: palette.border}] : styles.cardActions}>
              {customRowActions}
              {editButton}
            </View>
          ) : null}
        </View>
      );
    }

    return (
      <View
        key={row?.['@id'] || row?.id}
        style={[
          styles.defaultCard,
          { backgroundColor: tableSurfaceColor, borderColor: tableBorderColor },
          rowStyleValue,
        ]}
      >
        {tableColumns.map(column => {
          const fieldName = getColumnKey(column);

          return (
            <View key={fieldName} style={styles.defaultCardLine}>
              <Text style={[styles.defaultCardLabel, { color: tableMutedColor }]}>
                {formatStoreColumnLabel({
                  columns,
                  fieldName,
                  fallbackLabel: column?.label || fieldName,
                  storeName,
                })}
              </Text>
              {renderField(fieldName, {
                  readTextStyle: [styles.defaultCardValue, { color: tableTextColor }],
                  numberOfLines: 1,
                })}
            </View>
          );
        })}
        {hasRowActions ? (
          <View style={styles.cardActionGroup}>
            {customRowActions}
            {editButton}
          </View>
        ) : null}
      </View>
    );
  };

  // RN FlatList throws if numColumns changes without remount. Always derive key from numColumns
  // and apply it AFTER the spread so callers cannot override it with a stale key.
  const resolvedNumColumns = gridColumns;
  const resolvedListKey = listKey || cardListKey || `cards-${resolvedNumColumns}`;

  return (
    <FlatList
      {...flatListProps}
      key={`${resolvedListKey}:columns-${resolvedNumColumns}`}
      numColumns={resolvedNumColumns}
      onLayout={event => {flatListProps.onLayout?.(event); setListWidth(event.nativeEvent.layout.width);}}
      columnWrapperStyle={compact && gridColumns > 1 ? {gap: 12} : flatListProps.columnWrapperStyle}
      data={typeof transformData === 'function' ? transformData(sortedData) : sortedData}
      keyExtractor={getRowKey}
      renderItem={({ item, index }) => renderCardItem(item, index)}
      style={styles.cardsScroll}
      contentContainerStyle={[
        styles.cardsGrid,
        contentContainerStyle,
        compact ? {padding: 12, gap: 12} : null,
        hasBottomAddButton ? styles.cardsGridWithBottomAdd : null,
      ]}
      ListEmptyComponent={(
        <DefaultTableEmptyState
          emptyStateLabel={emptyStateLabel}
          isLoading={isLoading}
          isTable={false}
          tableLayoutStyle={null}
          tableMutedColor={tableMutedColor}
        />
      )}
      ListFooterComponent={null}
      nestedScrollEnabled
      onMomentumScrollBegin={configs.onMomentumScrollBegin || undefined}
      onScroll={handleListScroll}
      onScrollBeginDrag={configs.onScrollBeginDrag || undefined}
      onEndReached={configs.onEndReached}
      onEndReachedThreshold={END_REACHED_THRESHOLD}
      onRefresh={configs.onRefresh}
      refreshing={Boolean(configs.refreshing)}
      scrollEventThrottle={120}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default DefaultTableCards;
