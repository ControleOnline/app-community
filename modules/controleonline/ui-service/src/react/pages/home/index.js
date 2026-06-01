import React, {useMemo} from 'react';
import {ActivityIndicator, ScrollView, View} from 'react-native';
import {Text} from 'react-native-animatable';
import {useStore} from '@store';
import {resolveThemePalette} from '@controleonline/../../src/styles/branding';
import {colors} from '@controleonline/../../src/styles/colors';
import AppMenuGrid from '@controleonline/ui-layout/src/react/components/AppMenuGrid';
import styles from './index.styles';

export default function ServiceHomePage({navigation}) {
  const themeStore = useStore('theme');
  const peopleStore = useStore('people');

  const {colors: themeColors, menus} = themeStore.getters;
  const {currentCompany} = peopleStore.getters;

  const brandColors = useMemo(
    () =>
      resolveThemePalette(
        { ...themeColors, ...(currentCompany?.theme?.colors || {}) },
        colors,
      ),
    [themeColors, currentCompany?.id],
  );

  if (!currentCompany || !themeColors) {
    return React.createElement(
      View,
      {style: styles.loadingContainer},
      React.createElement(ActivityIndicator, {
        color: brandColors.primary || '#2563EB',
        size: 'large',
      }),
    );
  }

  return React.createElement(
    View,
    {style: [styles.container, {backgroundColor: brandColors.background}]},
    React.createElement(
      ScrollView,
      {
        contentContainerStyle: styles.scroll,
        showsVerticalScrollIndicator: false,
      },
      React.createElement(
        View,
        {style: styles.header},
        React.createElement(Text, {style: styles.title}, 'Operacional'),
      ),
      React.createElement(AppMenuGrid, {
        emptyMessage: 'Nenhum menu operacional configurado.',
        menus,
        navigation,
      }),
    ),
  );
}
