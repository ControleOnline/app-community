import React from 'react';
import {StyleSheet, View} from 'react-native';
import {app_type, app_type_base} from '@appType';
import AppTypeSwitcher from './HeaderAppTypeSwitcher';

// SHOP screens come from ui-shop and render no app chrome, so an ADMIN build
// would lose the app type selector as soon as SHOP is selected.
export const shouldShowShopAppTypeSwitcher = (type = app_type, base = app_type_base) =>
  String(type || '').toUpperCase() === 'SHOP' && String(base || '').toUpperCase() === 'ADMIN';

export default function ShopAppTypeSwitcherOverlay({children}) {
  if (!shouldShowShopAppTypeSwitcher()) return children;
  return (
    <View style={styles.root}>
      {children}
      <View style={styles.switcher} pointerEvents="box-none" testID="shop-app-type-switcher">
        <AppTypeSwitcher compact />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  switcher: {position: 'absolute', top: 8, right: 8, zIndex: 1000},
});
