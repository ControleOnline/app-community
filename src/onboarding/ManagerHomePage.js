import React from 'react';
import {View, Text, Pressable} from 'react-native';
import {useStore} from '@store';
import CurrentManagerHome from '@controleonline/ui-manager/src/react/pages/home/index';
import {onboardingAccess} from './model';

export default function ManagerHomePage(props) {
  const {currentCompany} = useStore('people').getters;
  const {user} = useStore('auth').getters;
  const {colors} = useStore('theme').getters;
  const access = onboardingAccess(currentCompany, user);
  const entry = access === 'denied' ? null : React.createElement(
    Pressable,
    {
      accessibilityRole: 'button',
      accessibilityLabel: 'Preparar a operação',
      onPress: () => props.navigation.navigate('OnboardingPage'),
      testID: 'open-operation-setup',
      style: {margin: 12, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: colors?.primary || '#0EA5E9'},
    },
    React.createElement(Text, {style: {fontWeight: '600', color: colors?.text || '#0F172A'}}, 'Preparar a operação'),
    React.createElement(Text, {style: {marginTop: 4, color: colors?.textSecondary || '#475569'}}, 'Empresa, equipe, catálogo, devices e produção'),
  );
  return React.createElement(
    View, {style: {flex: 1}}, entry,
    React.createElement(CurrentManagerHome, props),
  );
}
