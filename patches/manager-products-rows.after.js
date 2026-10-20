import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useStore } from '@store';
import { formatStoreColumnLabel } from '@controleonline/ui-common/src/react/utils/storeColumns';
import { getColumnKey } from '../inputs/defaultInputUtils';
import DefaultColumnFilter from '../filters/DefaultColumnFilter';
import DefaultTableEmptyState from './DefaultTableEmptyState';
import DefaultTableInput from './DefaultTableInput';
import DefaultTableRowActions, {
  hasDefaultTableRowActionsComponent,
  resolveDefaultTableRowActionsWidth,
} from './DefaultTableRowActions';
import {
  END_REACHED_THRESHOLD,
  getColumnStyle,
  getColumnMinWidth,
  getRowKey,
  getSortField,
  isSortableColumn,
  mergeSortedDataWithLiveItems,
  shouldTriggerEndReachedFromScroll,
  shouldIncludeColumn,
} from './DefaultTable.utils';
import styles from './DefaultTable.styles';
import {getCompactColumnLabel} from './DefaultTableCompact.helpers';
import useDefaultTableRowInteraction from './useDefaultTableRowInteraction';
import useDefaultTableTheme from './useDefaultTableTheme';

/** Row stripes: themes-map listItemEvenRow / listItemOddRow — never status.color. */
export const resolveRowBackgroundColor = ({ index, tableOddColor, tableEvenColor }) => {
  return index % 2 === 0 ? tableOddColor : tableEvenColor;
};

const DefaultTableRows = ({ storeName }) => {
  const {canOpenRow, setRowInteraction} = useDefaultTableRowInteraction();
  const store = useStore(storeName);
  const configs = store?.getters?.configs || {};
  const { palette, resolvedAccentColor, tableBorderColors, themeTokens } = useDefaultTableTheme();
  const columns = Array.isArray(configs.presentationColumns) ? configs.presentationColumns : Array.isArray(store?.getters?.columns) ? store.getters.columns : [];
  const visibleColumns = store?.getters?.visibleColumns || {};
  const tableColumns = columns.filter(
    column => shouldIncludeColumn(column) && visibleColumns[getColumnKey(column)] !== false,
  );
  const sortedData = mergeSortedDataWithLiveItems({
    liveItems: store?.getters?.items,
    sortedData: configs.sortedData,
  });
  const resolvedFilters = store?.getters?.filters || {};
  const isLoading = Boolean(store?.getters?.isLoadingList || store?.getters?.isLoading);
  const emptyStateLabel = isLoading
    ? global.t?.t(storeName, 'label', 'loading')
    : global.t?.t(storeName, 'label', 'empty');
  const tableBorderColor = tableBorderColors.rowBorderColor;
  const tableHeaderBorderColor = tableBorderColors.headerBorderColor || tableBorderColor;
  const tableEvenColor = themeTokens.listItemEvenRow || themeTokens['bg-even-light'] || palette.background;
  const tableHeaderColor = themeTokens['bg-headers-light'] || resolvedAccentColor;
  const tableMutedColor = palette.textSecondary;
  const tableOddColor = themeTokens.listItemOddRow || themeTokens['bg-odd-light'] || palette.background;
  const tableSurfaceColor = palette.background;
  const tableTextColor = palette.text;
  const rowStyle = configs.rowStyle;
  const hasRowPress = typeof configs.onRowPress === 'function';
  const hasCustomRowActions = hasDefaultTableRowActionsComponent(configs.rowActionsComponent);
  const hasEditAction = typeof configs.onEditRow === 'function';
  const hasRowActions = configs.showRowActions !== false && (hasCustomRowActions || hasEditAction);
  const shouldPinRowActions = configs.pinRowActions !== false;
  const hasColumnFilters =
    configs.showColumnFiltersButton !== false &&
    configs.tableFiltersVisible === true;
  const actionsCellWidth = hasRowActions ? resolveDefaultTableRowActionsWidth(configs) : 0;
  const tableMinWidth = useMemo(
    () =>
      tableColumns.reduce(
        (totalWidth, column) => totalWidth + getColumnMinWidth(column),
        actionsCellWidth,
      ),
    [actionsCellWidth, tableColumns],
  );
  const [horizontalMetrics, setHorizontalMetrics] = useState({
    contentWidth: 0,
    viewportWidth: 0,
    x: 0,
  });
  const updateHorizontalMetrics = patch => {
    setHorizontalMetrics(current => {
      const next = {
        ...current,
        ...patch,
      };

      return next.contentWidth === current.contentWidth &&
        next.viewportWidth === current.viewportWidth &&
        next.x === current.x
        ? current
        : next;
    });
  };
  const stickyBodyTransforms = useMemo(() => {
    const viewportWidth = Number(horizontalMetrics.viewportWidth || 0);
    const contentWidth = Number(horizontalMetrics.contentWidth || 0);
    const x = Number(horizontalMetrics.x || 0);
    const canScrollHorizontally = viewportWidth > 0 && contentWidth > viewportWidth;
    const actionsTranslateX = canScrollHorizontally
      ? x + viewportWidth - contentWidth
      : 0;

    return {
      actions:
        shouldPinRowActions && actionsTranslateX !== 0
          ? [{ translateX: actionsTranslateX }]
          : null,
    };
  }, [horizontalMetrics, shouldPinRowActions]);
  const handleHorizontalScroll = event => {
    updateHorizontalMetrics({
      x: Number(event?.nativeEvent?.contentOffset?.x || 0),
    });
  };
  const handleHorizontalLayout = event => {
    updateHorizontalMetrics({
      viewportWidth: Number(event?.nativeEvent?.layout?.width || 0),
    });
  };
  const handleHorizontalContentSizeChange = width => {
    updateHorizontalMetrics({
      contentWidth: Number(width || 0),
    });
  };
  const handleListScroll = event => {
    if (shouldTriggerEndReachedFromScroll(event)) {
      configs.onEndReached?.();
    }
  };
  const tableWidth = Math.max(
    tableMinWidth,
    Number(horizontalMetrics.viewportWidth || 0),
  );

  const renderTableItem = ({ item: row, index }) => {
    const RowComponent = hasRowPress ? TouchableOpacity : View;
    const rowStyleValue = typeof rowStyle === 'function' ? rowStyle(row, index) : rowStyle;
    const rowPressProps = hasRowPress
      ? {
        activeOpacity: 0.84,
        onPress: () => {if (canOpenRow(row)) configs.onRowPress(row);},
      }
      : {};
    const rowBackgroundColor = resolveRowBackgroundColor({
      index,
      tableOddColor,
      tableEvenColor,
    });
    const RowActionsComponent = configs.rowActionsComponent;

    return (
      <RowComponent
        key={getRowKey(row)}
        style={[
          styles.row,
          {
            backgroundColor: rowBackgroundColor,
            borderBottomColor: tableBorderColor,
            borderBottomWidth: tableBorderColor ? 1 : 0,
            minWidth: tableWidth,
            width: tableWidth,
          },
          rowStyleValue,
          configs.appearance === 'compact' ? {minHeight: 58} : null,
        ]}
        {...rowPressProps}
      >
        {tableColumns.map(column => (
          <React.Fragment key={getColumnKey(column)}>
            <DefaultTableInput
              column={column}
              options={{...(column?.isIdentity ? {
                cellStyle: [
                  styles.pinnedIdentityCell,
                  styles.stickyIdentityCell,
                  {
                    backgroundColor: rowBackgroundColor,
                  },
                ],
              } : {
                cellStyle: {
                  backgroundColor: rowBackgroundColor,
                },
              }), onInteractionChange: blocked => setRowInteraction(row, column, blocked)}}
              row={row}
              storeName={storeName}
              variant="cell"
            />
          </React.Fragment>
        ))}
        {hasRowActions ? (
          <View
            testID={`default-table-row-actions-${getRowKey(row)}`}
            style={[
              styles.cell,
              styles.actionsCell,
              shouldPinRowActions ? styles.pinnedActionsCell : null,
              shouldPinRowActions ? styles.stickyActionsCell : null,
              {
                minWidth: actionsCellWidth,
                width: actionsCellWidth,
                flexBasis: actionsCellWidth,
                maxWidth: actionsCellWidth,
                ...(stickyBodyTransforms.actions
                  ? { transform: stickyBodyTransforms.actions }
                  : {}),
                backgroundColor: rowBackgroundColor,
              },
            ]}
          >
            <View style={styles.rowActionsGroup}>
              {hasCustomRowActions ? (
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
              ) : null}
              {hasEditAction ? (
                <TouchableOpacity
                  style={[styles.iconButton, { borderColor: tableBorderColor, backgroundColor: tableSurfaceColor }]}
                  activeOpacity={0.82}
                  onPress={() => configs.onEditRow?.(row)}
                >
                  <Icon name="edit-2" size={14} color={tableMutedColor} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : null}
      </RowComponent>
    );
  };

  return (
    <>
      <ScrollView
        horizontal
        onContentSizeChange={handleHorizontalContentSizeChange}
        onLayout={handleHorizontalLayout}
        onScroll={handleHorizontalScroll}
        scrollEventThrottle={16}
        style={styles.scroll}
        contentContainerStyle={styles.horizontalScrollContent}
      >
        <View style={[styles.content, { minWidth: tableWidth, width: tableWidth }]}>
          <View
            style={[
              styles.headerRow,
              {
                backgroundColor: tableHeaderColor,
                borderBottomColor: tableHeaderBorderColor,
                borderBottomWidth: tableHeaderBorderColor ? 1 : 0,
                minWidth: tableWidth,
                width: tableWidth,
              },
            ]}
          >
            {tableColumns.map(column => {
              const fieldName = getColumnKey(column);
              const defaultLabel = formatStoreColumnLabel({
                columns,
                fieldName,
                fallbackLabel: column?.label || fieldName,
                storeName,
              });
              const label = configs.appearance === 'compact' ? getCompactColumnLabel(column, defaultLabel) : defaultLabel;
              const sortFieldName = getSortField(column);

              return (
                <TouchableOpacity
                  key={fieldName}
                  accessibilityRole={isSortableColumn(column) ? 'button' : undefined}
                  accessibilityLabel={`Ordenar por ${label}`}
                  accessibilityHint={configs.resolvedSort?.field === sortFieldName ? `Ordem ${configs.resolvedSort.direction === 'asc' ? 'crescente' : 'decrescente'}` : undefined}
                  style={[
                    getColumnStyle(column),
                    column?.isIdentity
                      ? [styles.stickyIdentityCell, styles.stickyHeaderCell, { backgroundColor: tableHeaderColor }]
                      : null,
                  ]}
                  activeOpacity={isSortableColumn(column) ? 0.8 : 1}
                  onPress={() => configs.requestSort?.(column)}
                >
                  <View style={styles.sortableHeader}>
                    <Text style={[styles.headerText, { color: tableTextColor }, configs.appearance === 'compact' ? {fontSize: 12, fontWeight: '600', textTransform: 'none'} : null]} numberOfLines={1}>{label}</Text>
                    {isSortableColumn(column) && configs.resolvedSort?.field === sortFieldName ? (
                      <Icon name={configs.resolvedSort?.direction === 'desc' ? 'chevron-down' : 'chevron-up'} size={12} color={tableTextColor} />
                    ) : isSortableColumn(column) ? (
                      <Icon name="chevrons-up" size={12} color={tableBorderColor} />
                    ) : null}
                    {resolvedFilters?.[fieldName] ? <Icon name="filter" size={11} color={tableTextColor} /> : null}
                  </View>
                </TouchableOpacity>
              );
            })}
            {hasRowActions ? (
              <View
                testID="default-table-row-actions-header"
                style={[
                  styles.cell,
                  styles.actionsCell,
                  shouldPinRowActions ? styles.stickyActionsCell : null,
                  shouldPinRowActions ? styles.stickyHeaderCell : null,
                  {
                    minWidth: actionsCellWidth,
                    width: actionsCellWidth,
                    flexBasis: actionsCellWidth,
                    maxWidth: actionsCellWidth,
                    backgroundColor: tableHeaderColor,
                  },
                ]}
              >
                <Text style={[styles.headerText, { color: tableTextColor }, configs.appearance === 'compact' ? {fontSize: 12, fontWeight: '600', textTransform: 'none'} : null]}>
                  {configs.appearance === 'compact' ? 'Ações' : global.t?.t(storeName, 'label', 'actions')}
                </Text>
              </View>
            ) : null}
          </View>
          {hasColumnFilters ? (
            <View
              style={[
                styles.filterRow,
                {
                  backgroundColor: tableHeaderColor,
                  borderBottomColor: tableHeaderBorderColor,
                  borderBottomWidth: tableHeaderBorderColor ? 1 : 0,
                },
              ]}
            >
              {tableColumns.map(column => {
                const fieldName = getColumnKey(column);

                return (
                  <View
                    key={`${fieldName}-filter`}
                    style={[
                      getColumnStyle(column),
                      column?.isIdentity
                        ? [styles.stickyIdentityCell, { backgroundColor: tableHeaderColor }]
                        : null,
                    ]}
                  >
                    {column?.filter !== false && column?.filters !== false ? (
                      <DefaultColumnFilter
                        column={column}
                        filters={resolvedFilters}
                        storeName={storeName}
                        style={styles.filterCell}
                      />
                    ) : null}
                  </View>
                );
              })}
              {hasRowActions ? (
                <View
                  style={[
                    styles.cell,
                    styles.actionsCell,
                    shouldPinRowActions ? styles.stickyActionsCell : null,
                    {
                      minWidth: actionsCellWidth,
                      width: actionsCellWidth,
                      flexBasis: actionsCellWidth,
                      maxWidth: actionsCellWidth,
                      backgroundColor: tableHeaderColor,
                    },
                  ]}
                />
              ) : null}
            </View>
          ) : null}

          <FlatList
            data={sortedData}
            keyExtractor={getRowKey}
            renderItem={renderTableItem}
            style={styles.tableList}
            contentContainerStyle={styles.tableListContent}
            ListEmptyComponent={(
              <DefaultTableEmptyState
                emptyStateLabel={emptyStateLabel}
                isLoading={isLoading}
                isTable
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
        </View>
      </ScrollView>
    </>
  );
};

export default DefaultTableRows;
