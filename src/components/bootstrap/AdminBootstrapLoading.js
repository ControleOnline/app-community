import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {useStore} from '@store';
import {colors as runtimeColors} from '../../styles/colors';

export default function AdminBootstrapLoading({error, onRetry}) {
  const {colors = {}} = useStore('theme').getters;
  const textColor = colors.textPrimary || runtimeColors.text;
  return <View accessibilityRole={error ? 'alert' : 'progressbar'} accessibilityLabel={error || 'Carregando aplicativo'}
    style={[s.overlay, {backgroundColor: colors.pageBackground || runtimeColors.background}]}>
    {!error && <ActivityIndicator color={textColor} />}
    <Text style={{color: textColor, textAlign: 'center'}}>{error || 'Carregando…'}</Text>
    {!!error && <Pressable accessibilityRole="button" accessibilityLabel="Tentar novamente" onPress={onRetry}
      style={[s.retry, {borderColor: colors.cardBorder || runtimeColors.border}]}>
      <Text style={{color: textColor}}>Tentar novamente</Text>
    </Pressable>}
  </View>;
}
const s = StyleSheet.create({
  overlay: {position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 1000,
    justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16},
  retry: {minHeight: 44, paddingHorizontal: 20, justifyContent: 'center', borderWidth: 1, borderRadius: 10},
});
