import React from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import {useManagerPreview} from './ManagerPreviewProvider';

// Authentication and redirects remain owned by the shared CheckLogin component.
export default function ManagerStartup() {
  const {colors = {}} = useManagerPreview() || {};
  return <View accessibilityLabel="Carregando sessão do On Manager"
    style={{flex:1, alignItems:'center', justifyContent:'center', gap:12,
      backgroundColor:colors.pageBackground || colors.background}}>
    <ActivityIndicator color={colors.textPrimary}/>
    <Text style={{color:colors.textPrimary}}>Carregando sessão…</Text>
  </View>;
}
