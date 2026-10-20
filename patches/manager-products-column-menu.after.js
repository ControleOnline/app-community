import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useStore } from '@store';
import { formatStoreColumnLabel } from '@controleonline/ui-common/src/react/utils/storeColumns';
import { getColumnKey } from '../inputs/defaultInputUtils';
import {
  canHideVisibleColumn,
  isRequiredVisibleColumn,
  persistVisibleColumnsPreference,
  resolveDefaultTablePreferenceScope,
  sanitizeVisibleColumnsPreference,
} from '../../utils/tableVisibleColumnsPreferences';
import styles from './DefaultTable.styles';
import {getCompactColumnLabel} from './DefaultTableCompact.helpers';
import { shouldIncludeColumn } from './DefaultTable.utils';
import useDefaultTableTheme from './useDefaultTableTheme';
import DefaultCompactDialog from './DefaultCompactDialog';

const DefaultColumnMenu = ({ storeName, visible = false, onClose }) => {
  const store = useStore(storeName);
  const columns = Array.isArray(store?.getters?.configs?.presentationColumns) ? store.getters.configs.presentationColumns : Array.isArray(store?.getters?.columns) ? store.getters.columns : [];
  const visibleColumns = store?.getters?.visibleColumns || {};
  const configs = store?.getters?.configs || {};
  const tablePreferenceScope =
    configs.tablePreferenceScope ||
    resolveDefaultTablePreferenceScope({ storeName });
  const availableColumns = columns.filter(column => shouldIncludeColumn(column));
  const {
    checkboxBorderColor: resolvedCheckboxBorderColor,
    checkboxSelectedMarkColor: resolvedCheckboxSelectedMarkColor,
    modalColors,
    themeColors,
  } = useDefaultTableTheme();
  if (!visible) return null;

  const {
    backgroundColor,
    borderColor,
    closeIconColor,
    headerTextColor,
    overlayColor,
    textColor,
  } = modalColors;

  const compact = configs.appearance === 'compact';
  const items = availableColumns.map(column => {
    const fieldName = getColumnKey(column);
    const label = getCompactColumnLabel(column, formatStoreColumnLabel({columns, fieldName, fallbackLabel: column.label || fieldName, storeName}));
    const checked = visibleColumns[fieldName] !== false;
    const locked = isRequiredVisibleColumn(column) || (checked && !canHideVisibleColumn({columns, fieldName, visibleColumns}));
    const toggle = () => {
      const next = sanitizeVisibleColumnsPreference({columns, visibleColumns: {...visibleColumns, [fieldName]: !checked}});
      persistVisibleColumnsPreference(tablePreferenceScope, next);
      if (store.actions?.setVisibleColumns) store.actions.setVisibleColumns(next);
      else if (store.getters) store.getters.visibleColumns = next;
    };
    return <TouchableOpacity key={fieldName} accessibilityRole="checkbox" accessibilityLabel={label}
      accessibilityState={{checked, disabled: locked && checked}} disabled={locked && checked} onPress={toggle}
      style={{minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10, borderRadius: 8, backgroundColor: checked ? themeColors.chipBackground : 'transparent'}}>
      <Icon name={checked ? 'check-square' : 'square'} size={19} color={checked ? resolvedCheckboxSelectedMarkColor : resolvedCheckboxBorderColor} />
      <Text style={{flex: 1, fontSize: 14, color: textColor}}>{label}</Text>
      {locked && checked ? <Text style={{fontSize: 12, color: themeColors.textSecondary}}>Obrigatória</Text> : null}
    </TouchableOpacity>;
  });
  if (compact) return <DefaultCompactDialog visible title="Colunas visíveis" description="Escolha as informações da tabela." onClose={onClose}
    width={400} bodyHeight={items.length * 60 + 40} footer={<TouchableOpacity accessibilityRole="button" accessibilityLabel="Concluir seleção de colunas" onPress={onClose}
      style={{minHeight: 44, justifyContent: 'center', paddingHorizontal: 18, borderRadius: 9, backgroundColor: themeColors.buttonBackground}}><Text style={{color: themeColors.buttonText, fontSize: 14, fontWeight: '600'}}>Concluir</Text></TouchableOpacity>}>
    {items.length ? items : <Text style={{color: textColor}}>Nenhuma coluna disponível.</Text>}
  </DefaultCompactDialog>;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: overlayColor }]}>
        <View style={[styles.modalCard, styles.columnMenuModalCard, { borderColor, backgroundColor }]}>
          <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
            <Text style={[styles.modalTitle, { color: headerTextColor }]} numberOfLines={1}>
              {configs.appearance === 'compact' ? 'Colunas visíveis' : global.t?.t(storeName, 'label', 'columns')}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Fechar seleção de colunas"
              style={[styles.modalCloseButton, { borderColor, backgroundColor }]}
              activeOpacity={0.82}
              onPress={onClose}
            >
              <Icon name="x" size={16} color={themeColors.iconWarning || closeIconColor} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.columnMenuModalBody} contentContainerStyle={styles.columnMenuModalList}>
            {availableColumns.map(column => {
              const fieldName = getColumnKey(column);
              const defaultLabel = formatStoreColumnLabel({
                columns,
                fieldName,
                fallbackLabel: column?.label || fieldName,
                storeName,
              });
              const label = configs.appearance === 'compact' ? getCompactColumnLabel(column, defaultLabel) : defaultLabel;
              const checked = visibleColumns[fieldName] !== false;
              const required = isRequiredVisibleColumn(column);
              const locked =
                required ||
                (checked &&
                  !canHideVisibleColumn({
                    columns,
                    fieldName,
                    visibleColumns,
                  }));
              const toggleColumn = () => {
                if (locked && checked) {
                  return;
                }

                const nextVisibleColumns = sanitizeVisibleColumnsPreference({
                  columns,
                  visibleColumns: {
                    ...visibleColumns,
                    [fieldName]: visibleColumns[fieldName] === false,
                  },
                });

                persistVisibleColumnsPreference(tablePreferenceScope, nextVisibleColumns);

                if (typeof store?.actions?.setVisibleColumns === 'function') {
                  store.actions.setVisibleColumns(nextVisibleColumns);
                } else if (store?.getters) {
                  store.getters.visibleColumns = nextVisibleColumns;
                }
              };

              return (
                <TouchableOpacity
                  key={fieldName}
                  accessibilityRole="checkbox"
                  accessibilityLabel={label}
                  accessibilityState={{checked, disabled: locked && checked}}
                  style={styles.columnMenuItem}
                  activeOpacity={locked ? 1 : 0.82}
                  disabled={locked && checked}
                  onPress={toggleColumn}
                >
                  <Icon
                    name={checked ? 'check-square' : 'square'}
                    size={16}
                    color={checked ? resolvedCheckboxSelectedMarkColor : resolvedCheckboxBorderColor}
                  />
                  <Text style={[styles.columnMenuText, { color: textColor }]} numberOfLines={1}>
                    {required ? `${label} *` : label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default DefaultColumnMenu;
