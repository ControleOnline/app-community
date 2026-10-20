import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useStore } from '@store';
import DefaultInput from '../inputs/DefaultInput';
import Formatter from '@controleonline/ui-common/src/utils/formatter';
import {
  formatSaveValue,
  getColumnKey,
  isEditableColumn,
  normalizeId,
  resolveCellPresentation,
} from '../inputs/defaultInputUtils';
import { getColumnStyle } from './DefaultTable.utils';
import styles from './DefaultTable.styles';
import useDefaultTableTheme from './useDefaultTableTheme';

const STORE_ACTION_META_KEY = '__storeMeta';

const isPlainObject = value =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const asStyleArray = style => (Array.isArray(style) ? style : [style]).filter(Boolean);

const buildSavedItemPatch = (column, fieldName, value) => {
  if (!column?.list || !fieldName || !isPlainObject(value)) {
    return {};
  }

  if (isPlainObject(value.object)) {
    return {
      [fieldName]: value.object,
    };
  }

  if (value.value == null && value.label == null) {
    return {};
  }

  const labelField = column?.listSearchParam || column?.searchParam || fieldName;

  return {
    [fieldName]: {
      id: value.value,
      value: value.value,
      label: value.label,
      [labelField]: value.label,
    },
  };
};

const DefaultTableInput = ({
  column: columnProp = null,
  fieldName = '',
  options = {},
  row = {},
  storeName = '',
  variant = 'cell',
}) => {
  const store = useStore(storeName);
  const configs = store?.getters?.configs || {};
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    options.onInteractionChange?.(isEditing || isSaving);
    return () => options.onInteractionChange?.(false);
  }, [isEditing, isSaving, options.onInteractionChange]);
  const columns = Array.isArray(store?.getters?.columns) ? store.getters.columns : [];
  const hasRowPress = false;
  const { resolvedAccentColor, themeColors } = useDefaultTableTheme();
  const column = columnProp || columns.find(item => getColumnKey(item) === fieldName);

  if (!column) return null;

  const resolvedFieldName = getColumnKey(column);
  const compact = configs.appearance === 'compact';
  const presentation = resolveCellPresentation({column, columns, row, storeName});
  const statusColor = compact && resolvedFieldName === 'status' && typeof column.compactStatusColor === 'function'
    ? column.compactStatusColor(row, themeColors) : presentation.color || themeColors.textSecondary;
  const compactType = storeName === 'orders' && resolvedFieldName === 'orderType' ? ({sale: 'Venda', purchase: 'Compra', transfer: 'Transferência', loss: 'Perda', cart: 'Carrinho', tab: 'Comanda', table: 'Mesa', stamp: 'Carimbo'})[row.orderType] : undefined;
  const dateField = compact && storeName === 'orders' && ['orderDate', 'alterDate'].includes(resolvedFieldName);
  const rawValue = row[resolvedFieldName];
  const time = typeof rawValue === 'string' ? /[T ](\d{2}:\d{2})/.exec(rawValue)?.[1] : '';
  const compactDisplay = compact && storeName === 'orders' ? (resolvedFieldName === 'price' ? Formatter.formatMoney(rawValue || 0) : dateField && rawValue ? `${Formatter.formatDateYmdTodmY(rawValue, false)}${time && (time !== '00:00' || resolvedFieldName === 'alterDate') ? '\n' + time : ''}` : compactType) : undefined;
  const compactTextStyle = compact ? {fontSize: 13, fontWeight: column.isIdentity ? '600' : '400', ...(resolvedFieldName === 'status' ? {color: statusColor} : {color: themeColors.textPrimary})} : null;
  const statusStyle = compact && resolvedFieldName === 'status' ? {width: 'auto', alignSelf: 'flex-start', borderWidth: 1, borderColor: statusColor, borderRadius: 18, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: /^#[0-9a-f]{6}$/i.test(statusColor) ? statusColor + '10' : themeColors.panelBackground} : null;
  const input = column.cellComponent ? React.createElement(column.cellComponent,{row,column}) : (
    <DefaultInput
      accentColor={options.accentColor || resolvedAccentColor}
      column={column}
      columns={columns}
      containerStyle={[options.containerStyle, statusStyle, compact && column.isIdentity ? {alignSelf: 'flex-start', width: 'auto', borderWidth: 1, borderRadius: 8, borderColor: themeColors.border, backgroundColor: themeColors.inputBackground, paddingHorizontal: 9, paddingVertical: 5} : null]}
      defaultColor={options.defaultColor || configs.defaultColor}
      displayValue={options.displayValue ?? compactDisplay}
      editing={isEditing}
      getOptionsForColumn={configs.getOptionsForColumn}
      inputStyle={options.inputStyle}
      label={options.label}
      numberOfLines={options.numberOfLines ?? (dateField ? 2 : undefined)}
      onCancelEditing={() => {options.onInteractionChange?.(isSaving); setIsEditing(false);}}
      onSave={value => {
        if (typeof store?.actions?.save !== 'function') {
          setIsEditing(false);
          return Promise.resolve(null);
        }

        options.onInteractionChange?.(true);
        setIsSaving(true);
        const savedItemPatch = buildSavedItemPatch(column, resolvedFieldName, value);
        const storeMeta =
          Object.keys(savedItemPatch).length > 0
            ? {
                [STORE_ACTION_META_KEY]: {
                  savedItemPatch,
                },
              }
            : {};

        return Promise.resolve(
          store.actions.save({
            id: normalizeId(row?.['@id'] || row?.id),
            [resolvedFieldName]: formatSaveValue(column, value, row),
            ...storeMeta,
          }),
        )
          .then(savedItem => {
            configs.onSaved?.(savedItem, row);
            return savedItem;
          })
          .finally(() => {
            options.onInteractionChange?.(false);
            setIsSaving(false);
            setIsEditing(false);
          });
      }}
      onStartEditing={() => {options.onInteractionChange?.(true); setIsEditing(true);}}
      readTextStyle={[compactTextStyle, options.readTextStyle || options.textStyle]}
      row={row}
      saving={isSaving}
      showLabel={options.showLabel}
      storeName={storeName}
      variant={options.variant || variant}
    />
  );

  if (variant !== 'cell') {
    return input;
  }

  const shouldDelegatePress = hasRowPress && !isEditableColumn(column);

  return (
    <View
      style={[
        ...asStyleArray(getColumnStyle(column)),
        ...asStyleArray(options.cellStyle),
        isEditing ? styles.editingCell : null,
      ]}
      pointerEvents={shouldDelegatePress ? 'none' : 'auto'}
    >
      {input}
    </View>
  );
};

export default DefaultTableInput;
