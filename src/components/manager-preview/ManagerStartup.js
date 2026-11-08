import React from 'react';
import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import {useManagerPreview} from './ManagerPreviewProvider';

// Authentication and redirects remain owned by the shared CheckLogin component.
export default function ManagerStartup({message='Carregando sessão…',accessibilityLabel='Carregando sessão do On Manager',busy=true,error='',onRetry,onOpenThemeSettings,palette}={}) {
  const preview = useManagerPreview();
  // Shared bootstrap runs above the management provider; use its own palette.
  const colors = palette || preview?.colors || {};
  return <View accessibilityLabel={accessibilityLabel} accessibilityState={{busy}}
    style={{flex:1, alignItems:'center', justifyContent:'center', gap:12,
      backgroundColor:colors.pageBackground}}>
    {busy && <ActivityIndicator color={colors.textPrimary}/>}
    <Text style={{color:colors.textPrimary}}>{message}</Text>
    {!!error && <Text accessibilityRole="alert" style={{color:colors.textPrimary}}>{error}</Text>}
    {onRetry && <Pressable accessibilityRole="button" accessibilityLabel="Tentar carregar novamente" disabled={busy} onPress={onRetry} style={{minHeight:44,padding:12,justifyContent:'center'}}><Text style={{color:colors.textPrimary}}>Tentar novamente</Text></Pressable>}
    {onOpenThemeSettings && <Pressable accessibilityRole="button" onPress={onOpenThemeSettings}
      style={{minHeight:44,padding:12,justifyContent:'center'}}>
      <Text style={{color:colors.textPrimary}}>Abrir Configurador de Temas</Text>
    </Pressable>}
  </View>;
}
