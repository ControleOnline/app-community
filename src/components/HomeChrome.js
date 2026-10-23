import React from 'react';
import {Platform, StatusBar, StyleSheet, View, useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useIsFocused} from '@react-navigation/native';
import {useStore} from '@store';
import CompanyFilter from '@controleonline/ui-manager/src/react/components/CompanyFilter';
import AppTypeSwitcher from '@controleonline/ui-common/src/react/components/AppTypeSwitcher';
import {resolveHomepagePalette} from '../styles/homepagePalette';

export default function HomeChrome({navigation, showCompany, showAppType}) {
  const {width} = useWindowDimensions();
  const focused = useIsFocused();
  const insets = useSafeAreaInsets();
  const {colors} = useStore('theme').getters;
  const palette = resolveHomepagePalette(colors);
  const mobile = width < 700;
  return (
    <View style={[styles.header, {backgroundColor: palette.headerBackground,
      borderBottomColor: palette.headerBorder, marginTop: -insets.top, paddingTop: insets.top, flexDirection: mobile ? 'column' : 'row'}]}>
      {focused && Platform.OS !== 'web' && <StatusBar
        barStyle="dark-content" backgroundColor={palette.headerBackground} />}
      {showCompany && <View style={styles.identity}>
        <CompanyFilter navigation={navigation} appearance="soft" compact={mobile} wrapLabel />
      </View>}
      {showAppType && <View style={[styles.tools, mobile && styles.mobileTools]}>
        <AppTypeSwitcher />
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {alignItems: 'stretch', flexShrink: 0, borderBottomWidth: 1, paddingHorizontal: 16},
  identity: {flex: 1, minWidth: 0},
  tools: {justifyContent: 'center', paddingVertical: 12, paddingLeft: 20},
  mobileTools: {paddingTop: 0, paddingLeft: 0, alignItems: 'flex-end'},
});
