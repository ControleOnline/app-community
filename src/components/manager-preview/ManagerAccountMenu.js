import React from 'react';
import {Modal, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaProvider, useSafeAreaFrame, useSafeAreaInsets} from 'react-native-safe-area-context';
import HomeIcon from '../HomeIcon';
import ScreenThemeBoundary from '../theme-editor/ScreenThemeBoundary';

function AccountPanel({anchor, mobile, colors: c, name, mode, canOpenProfile, onProfile, onHelp, onTheme, onThemeEditor, onLogout, sidebarPreference, bottomBar, onBarSession, onBarRemember}) {
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
    onPress={action} style={({hovered, pressed}) => [s.option, {backgroundColor: hovered || pressed ? c.menuActiveBackground : c.containerTransparentBackground}]}>
    {({hovered, pressed}) => {
      const highlighted = hovered || pressed;
      return <><HomeIcon name={icon} size={18} color={highlighted ? c.menuActiveIcon : c.menuIcon} />
        <Text style={{color:highlighted ? c.menuActiveText : c.menuText, fontSize:13}}>{label}</Text></>;
    }}
  </Pressable>;
  return <View accessibilityRole="menu" accessibilityLabel={global.t?.t('configs', 'a11y', 'user_options')} accessibilityViewIsModal
    style={[s.panel, {backgroundColor: c.menuBackground, borderColor: c.menuBorder}, position,
      {maxHeight: Math.max(0, frame.height - top - bottom)}]}>
    <ScrollView style={s.options}>
      <Text numberOfLines={1} style={[s.name, {color: c.menuText}]}>{name}</Text>
      {canOpenProfile && option(global.t?.t('configs', 'menu', 'my_profile') || global.t?.t('menu', 'menu', 'my_profile'), 'user', onProfile)}
      {onHelp && option(global.t?.t('configs', 'menu', 'manager_help') || global.t?.t('menu', 'menu', 'manager_help'), 'help-circle', onHelp)}
      {option(mode === 'light' ? (global.t?.t('configs', 'menu', 'use_dark_theme') || global.t?.t('menu', 'menu', 'use_dark_theme')) : (global.t?.t('configs', 'menu', 'use_light_theme') || global.t?.t('menu', 'menu', 'use_light_theme')), mode === 'light' ? 'moon' : 'sun', onTheme)}
      {sidebarPreference?.ready && option(sidebarPreference.visible ? 'Ocultar menu lateral' : 'Mostrar menu lateral', 'layout',
        () => sidebarPreference.setRememberedVisible(!sidebarPreference.visible))}
      {!!sidebarPreference?.error && <Text accessibilityRole="alert" style={{color: c.menuText}}>{sidebarPreference.error}</Text>}
      {onThemeEditor && option('Configurar temas', 'sliders', onThemeEditor)}
      {bottomBar?.ready && <View style={[s.barOptions, {borderTopColor: c.menuBorder}]}>
        <Text style={[s.barTitle, {color: c.textSecondary}]}>{global.t?.t('configs', 'section_title', 'shortcut_bar')}</Text>
        {option(bottomBar.visible ? 'Ocultar nesta sessão' : 'Mostrar nesta sessão', 'layout', onBarSession)}
        {option(bottomBar.rememberedVisible ? 'Manter oculta neste aparelho' : 'Manter visível neste aparelho', 'save', onBarRemember)}
        {!!bottomBar.error && <Text accessibilityRole="alert" style={{color: c.menuText, padding: 12}}>{bottomBar.error}</Text>}
      </View>}
      {onLogout && option(global.t?.t('configs', 'menu', 'logout') || global.t?.t('menu', 'menu', 'logout'), 'log-out', onLogout)}
    </ScrollView>
  </View>;
}

export default function ManagerAccountMenu(props) {
  if (!props.anchor) return null;
  return <Modal transparent visible animationType="fade" onRequestClose={props.onClose}>
    <SafeAreaProvider style={s.layer}>
      <ScreenThemeBoundary screen={props.screen}>
      <View style={s.layer} dataSet={{coThemeEditorHost:'true'}}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar opções do usuário" onPress={props.onClose}
          style={[StyleSheet.absoluteFill, {backgroundColor: props.colors.overlayBackground}]} />
        <AccountPanel {...props} />
      </View>
      </ScreenThemeBoundary>
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
