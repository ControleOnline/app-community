import React from 'react';
import {Modal, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaProvider, useSafeAreaFrame, useSafeAreaInsets} from 'react-native-safe-area-context';
import HomeIcon from '../HomeIcon';

function AccountPanel({anchor, mobile, colors: c, name, mode, canOpenProfile, onProfile, onHelp, onTheme, onLogout, bottomBar, onBarSession, onBarRemember}) {
  // A native Modal has its own window; activity insets may exclude its system bars.
  const insets = useSafeAreaInsets();
  const frame = useSafeAreaFrame();
  const usableWidth = Math.max(0, frame.width - insets.left - insets.right);
  const top = insets.top + (mobile || anchor === 'sidebar' ? 18 : 68);
  const bottom = insets.bottom + (mobile ? 18 : anchor === 'sidebar' ? 84 : 18);
  const position = mobile ? {
    left: insets.left + usableWidth * 0.03,
    right: insets.right + usableWidth * 0.03,
    bottom, width: undefined, maxWidth: undefined,
  } : anchor === 'sidebar' ? {left: insets.left + 12, bottom}
    : {right: insets.right + 20, top};
  const option = (label, icon, action) => <Pressable key={label} accessibilityRole="menuitem" accessibilityLabel={label}
    onPress={action} style={({hovered, pressed}) => [s.option, {backgroundColor: hovered || pressed ? c.navigationActiveBackground : 'transparent'}]}>
    <HomeIcon name={icon} size={18} color={c.textSecondary} /><Text style={{color: c.textPrimary, fontSize: 13}}>{label}</Text>
  </Pressable>;
  return <View accessibilityRole="menu" accessibilityLabel="Opções do usuário" accessibilityViewIsModal
    style={[s.panel, {backgroundColor: c.cardBackground, borderColor: c.cardBorder}, position,
      {maxHeight: Math.max(0, frame.height - top - bottom)}]}>
    <ScrollView style={s.options}>
      <Text numberOfLines={1} style={[s.name, {color: c.textPrimary}]}>{name}</Text>
      {canOpenProfile && option('Meu perfil', 'user', onProfile)}
      {onHelp && option('Ajuda do On Manager', 'help-circle', onHelp)}
      {option(mode === 'light' ? 'Usar tema escuro' : 'Usar tema claro', mode === 'light' ? 'moon' : 'sun', onTheme)}
      {bottomBar?.ready && <View style={[s.barOptions, {borderTopColor: c.cardBorder}]}>
        <Text style={[s.barTitle, {color: c.textSecondary}]}>Barra de atalhos</Text>
        {option(bottomBar.visible ? 'Ocultar nesta sessão' : 'Mostrar nesta sessão', 'layout', onBarSession)}
        {option(bottomBar.rememberedVisible ? 'Manter oculta neste aparelho' : 'Manter visível neste aparelho', 'save', onBarRemember)}
        {!!bottomBar.error && <Text accessibilityRole="alert" style={{color: c.textPrimary, padding: 12}}>{bottomBar.error}</Text>}
      </View>}
      {onLogout && option('Sair da conta', 'log-out', onLogout)}
    </ScrollView>
  </View>;
}

export default function ManagerAccountMenu(props) {
  if (!props.anchor) return null;
  return <Modal transparent visible animationType="fade" onRequestClose={props.onClose}>
    <SafeAreaProvider style={s.layer}>
      <View style={s.layer}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar opções do usuário" onPress={props.onClose}
          style={[StyleSheet.absoluteFill, {backgroundColor: 'rgba(0,0,0,0.18)'}]} />
        <AccountPanel {...props} />
      </View>
    </SafeAreaProvider>
  </Modal>;
}
const s = StyleSheet.create({
  layer: {flex: 1}, panel: {position: 'absolute', width: 260, maxWidth: '94%', borderWidth: 1, borderRadius: 16, padding: 8},
  options: {flexShrink: 1},
  barOptions: {borderTopWidth: 1, marginTop: 6, paddingTop: 6},
  barTitle: {fontSize: 12, fontWeight: '600', paddingHorizontal: 12, paddingVertical: 6},
  name: {fontSize: 14, fontWeight: '700', paddingHorizontal: 12, paddingVertical: 14},
  option: {minHeight: 46, borderRadius: 10, paddingHorizontal: 12, flexDirection: 'row', gap: 12, alignItems: 'center'},
});
