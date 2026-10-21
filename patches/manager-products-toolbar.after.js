import React, {useMemo, useState} from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { useStore } from '@store';
import DefaultTableCompactToolbar from './DefaultTableCompactToolbar';
import DefaultTableControls from './DefaultTableControls';
import DefaultTableImportModal from './DefaultTableImportModal';
import {
  DefaultTableCollapsedSearch,
  DefaultTableCompactSearch,
  DefaultTableInlineSearch,
} from './DefaultTableSearch';
import DefaultToolbarAction from './DefaultToolbarAction';
import styles from './DefaultTable.styles';
import useDefaultTableTheme from './useDefaultTableTheme';

const translateConfigKey = key => {
  if (!Array.isArray(key) || key.length < 3) {
    return '';
  }

  return String(global.t?.t?.(key[0], key[1], key[2]) ?? '').trim();
};

const resolveConfiguredLabel = config => {
  const literalLabel = String(config?.label ?? '').trim();
  if (literalLabel) {
    return literalLabel;
  }

  const configuredLabel = translateConfigKey(config?.labelKey);
  if (configuredLabel) {
    return configuredLabel;
  }

  return global.t?.t?.('defaultTable', 'button', 'import');
};

const DefaultTableToolbar = ({
  storeName,
  showToolbarActions: showToolbarActionsProp,
  showToolbarControls: showToolbarControlsProp,
}) => {
  const store = useStore(storeName);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const { width } = useWindowDimensions();
  const configs = store?.getters?.configs || {};
  const compactBreakpoint = Number(configs.compactBreakpoint || 768);
  const isCompactView = width > 0 && width <= compactBreakpoint;
  const showTotalItemsInCompactToolbar = configs.showTotalItemsInCompactToolbar === true;
  const showTotalItemsInFooter = configs.showTotalItemsInFooter !== false;
  const toolbarActions = Array.isArray(configs.toolbarActions) ? configs.toolbarActions : [];
  const showToolbarActions =
    showToolbarActionsProp === null || showToolbarActionsProp === undefined
      ? configs.showToolbarActions !== false
      : showToolbarActionsProp !== false;
  const showToolbarControls =
    showToolbarControlsProp === null || showToolbarControlsProp === undefined
      ? configs.showToolbarControls !== false
      : showToolbarControlsProp !== false;
  const buildTransferAction = (action, fallback) => {
    if (!action) return null;

    if (typeof action === 'function') {
      return {
        ...fallback,
        onPress: action,
      };
    }

    if (typeof action === 'object') {
      return {
        ...fallback,
        ...action,
      };
    }

    return null;
  };
  const importConfig = configs.showAdministrativeTools === false ? null : configs.import || null;
  const importActionOverrides =
    configs.importAction && typeof configs.importAction === 'object'
      ? configs.importAction
      : null;
  const genericImportAction = useMemo(() => {
    if (!importConfig || importConfig.enabled === false || !importConfig.importType) {
      return null;
    }

    return {
      ...(importActionOverrides || {}),
      key: 'default-table-import',
      icon: importConfig.icon || 'upload',
      label: resolveConfiguredLabel(importConfig),
      onPress: () => setIsImportModalVisible(true),
    };
  }, [importActionOverrides, importConfig]);
  const importTableAction =
    genericImportAction ||
    buildTransferAction(
      configs.importAction || configs.onImport,
      {
        key: 'default-table-import',
        icon: 'upload',
        label: global.t?.t?.('defaultTable', 'button', 'import'),
      },
    );
  const exportTableAction = buildTransferAction(
    configs.exportAction || configs.onExport,
    {
      key: 'default-table-export',
      icon: 'download',
      label: global.t?.t?.('defaultTable', 'button', 'export'),
    },
  );
  const resolvedToolbarActions = showToolbarActions
    ? [importTableAction, exportTableAction, ...toolbarActions].filter(Boolean)
    : [];
  const { tableBorderColors, toolbarColors } = useDefaultTableTheme();
  const {
    backgroundColor: toolbarBackgroundColor,
    borderColor: toolbarBorderColor,
    countBackgroundColor: toolbarCountBackgroundColor,
    countTextColor: toolbarCountTextColor,
  } = toolbarColors;
  const resolvedToolbarBorderColor =
    tableBorderColors.toolbarBorderColor || toolbarBorderColor;
  const storeTotalItems = store?.getters?.totalItems;
  const resolvedTotalItems = storeTotalItems;
  const totalItemsNumber = Number(resolvedTotalItems);
  const shouldRenderTotalItems =
    resolvedTotalItems !== null &&
    resolvedTotalItems !== undefined &&
    Number.isFinite(totalItemsNumber);
  const shouldRenderFooterTotalItems =
    shouldRenderTotalItems &&
    showTotalItemsInFooter !== false;
  const shouldRenderCompactToolbarTotalItems =
    showTotalItemsInCompactToolbar === true &&
    isCompactView &&
    shouldRenderTotalItems &&
    !shouldRenderFooterTotalItems;
  const resolvedTotalItemsText =
    shouldRenderTotalItems
      ? `${totalItemsNumber} ${global.t?.t(storeName, 'label', 'items')}`
      : '';
  const renderToolbarActions = () =>
    resolvedToolbarActions.length > 0 ? (
      <View style={styles.toolbarActionGroup}>
        {resolvedToolbarActions.map(action => (
          <DefaultToolbarAction
            key={action?.key || action?.icon || action?.label}
            action={action}
          />
        ))}
      </View>
    ) : null;

  if (configs.appearance === 'compact') {
    return <>
      <DefaultTableCompactToolbar storeName={storeName} actions={resolvedToolbarActions} showControls={showToolbarControls} />
      <DefaultTableImportModal onClose={() => setIsImportModalVisible(false)} storeName={storeName} visible={isImportModalVisible} />
    </>;
  }
  return (
    <View
      style={[
        styles.toolbar,
        shouldRenderCompactToolbarTotalItems ? styles.toolbarWithCompactTotal : null,
        {
          borderBottomColor: resolvedToolbarBorderColor,
          borderBottomWidth: resolvedToolbarBorderColor ? 1 : 0,
          backgroundColor: toolbarBackgroundColor,
        },
      ]}
    >
      {shouldRenderCompactToolbarTotalItems ? (
        <View style={styles.toolbarCompactLead}>
          <View style={[styles.toolbarCountPill, { backgroundColor: toolbarCountBackgroundColor }]}>
            <Text
              style={[styles.toolbarCountText, { color: toolbarCountTextColor }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
            >
              {resolvedTotalItemsText}
            </Text>
          </View>
          <DefaultTableCompactSearch storeName={storeName} />
          {renderToolbarActions()}
        </View>
      ) : null}

      <View style={shouldRenderCompactToolbarTotalItems ? styles.toolbarCompactActions : styles.toolbarLeft}>
        <DefaultTableInlineSearch storeName={storeName} />
        <DefaultTableCollapsedSearch storeName={storeName} />
        <View style={styles.toolbarActionGroup}>
          {!shouldRenderCompactToolbarTotalItems ? renderToolbarActions() : null}
          {showToolbarControls ? <DefaultTableControls storeName={storeName} /> : null}
        </View>
      </View>
      <DefaultTableImportModal
        onClose={() => setIsImportModalVisible(false)}
        storeName={storeName}
        visible={isImportModalVisible}
      />
    </View>
  );
};

export default DefaultTableToolbar;
