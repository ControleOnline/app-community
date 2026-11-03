import React, {useState} from 'react';
import {Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useStore} from '@store';
import {isCompanySelectable} from '@controleonline/ui-people/src/react/utils/currentCompanySelection';
import ManagerCompanyLogo from './ManagerCompanyLogo';
import HomeIcon from '../HomeIcon';
import ManagerBrand from './ManagerBrand';

export default function ManagerCompanySelector({colors: c, compact = false, mode = 'sidebar'}) {
  const people = useStore('people');
  const {currentCompany, mainCompany, companies: availableCompanies} = people.getters;
  const companies = Array.isArray(availableCompanies) ? availableCompanies : [];
  const [open, setOpen] = useState(false);
  const {width, height} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const mobile = width <= 760;
  const canSwitch = companies.length > 1;
  const company = currentCompany?.id ? currentCompany : mainCompany;
  const label = company?.alias || company?.name || 'Empresa';
  const close = () => setOpen(false);
  const isLogo = mode === 'logo';
  const content = isLogo
    ? <View style={s.logoStack}>
        <ManagerBrand colors={c} home homeSize={40} homeWidth={80} textColor={c.headerText || c.selectText} compact subtitle={false} />
        <Text numberOfLines={1} style={[s.logoAlias, {color: c.headerText || c.textMuted || c.selectText}]}>{label}</Text>
      </View>
    : <ManagerBrand colors={c} textColor={c.selectText} compact={compact} subtitle={false}
        trailing={canSwitch && !compact ? <View style={s.chevron}><HomeIcon name="chevron-down" size={18} color={c.selectIcon} /></View> : null} />;
  const triggerStyle = isLogo
    ? [s.logoTrigger]
    : [s.trigger, {borderColor: c.selectBorder, backgroundColor: c.selectBackground}, compact && s.compact];
  return <>
    {canSwitch ? <Pressable testID="manager-company-trigger" accessibilityRole="button"
      accessibilityLabel={`Selecionar empresa. Atual: ${label}`} accessibilityState={{expanded: open}}
      onPress={() => setOpen(true)} style={triggerStyle}>
      {content}
    </Pressable> : <View style={triggerStyle} accessibilityLabel={`Empresa atual: ${label}`}>{content}</View>}
    <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
      <View style={[s.modalRoot, !mobile && s.desktopRoot]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar seleção de empresa" onPress={close}
          style={[StyleSheet.absoluteFill, {backgroundColor: c.modalOverlay}]} />
        <View accessibilityViewIsModal style={[s.sheet, {backgroundColor: c.modalBackground, maxHeight: Math.max(0, height - insets.top - 24), paddingBottom: Math.max(16, insets.bottom)},
          !mobile && {width: Math.min(480, width - 32), borderRadius: 16}]}>
          <View style={[s.heading, {borderBottomColor: c.modalBorder}]}>
            <Text style={[s.title, {color: c.modalHeaderText}]}>Selecionar Empresa</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar seleção de empresa" onPress={close} style={s.close}>
              <HomeIcon name="x" size={22} color={c.modalCloseIcon} />
            </Pressable>
          </View>
          <ScrollView style={s.list}>
            {companies.map(item => {
              const selected = String(item.id) === String(currentCompany?.id);
              const disabled = !isCompanySelectable(item);
              return <Pressable key={item.id} testID={`manager-company-option-${item.id}`} accessibilityRole="button"
                accessibilityLabel={item.alias || item.name} accessibilityState={{selected, disabled}}
                disabled={disabled} onPress={() => {
                  if (!isCompanySelectable(item)) return;
                  people.actions.setCurrentCompany(item);
                  close();
                }} style={({hovered, pressed}) => [s.option, {borderBottomColor:c.selectOptionBorder, opacity:disabled ? 0.45 : 1,
                  backgroundColor:selected ? c.selectOptionSelectedBackground : c.selectOptionBackground}]}>
                {({hovered, pressed}) => {
                  const text = selected ? c.selectOptionSelectedText : c.selectText;
                  return <><ManagerCompanyLogo company={item} size={32} colors={c} />
                    <Text style={[s.optionName, {color:text}]}>{item.alias || item.name}</Text>
                    {selected && <HomeIcon name="check-circle" size={20} color={c.iconActive} />}</>;
                }}
              </Pressable>;
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  </>;
}

const s = StyleSheet.create({
  trigger: {minHeight: 64, padding: 10, borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8},
  logoTrigger: {minHeight: 56, minWidth: 96, maxWidth: 160, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4},
  logoStack: {alignItems: 'center', justifyContent: 'center', gap: 2, maxWidth: 152},
  logoAlias: {fontSize: 10, fontWeight: '500', lineHeight: 12, opacity: 0.72, textAlign: 'center', maxWidth: 152},
  compact: {padding: 6, justifyContent: 'center'},
  chevron: {width: 18, flexShrink: 0, alignItems: 'center', justifyContent: 'center'},
  modalRoot: {flex: 1, justifyContent: 'flex-end'}, desktopRoot: {justifyContent: 'center', alignItems: 'center'},
  sheet: {width: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20, flexShrink: 1},
  heading: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingLeft: 20, paddingRight: 8, paddingVertical: 8, borderBottomWidth: 1},
  title: {fontSize: 18, fontWeight: '600', flex: 1}, close: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  list: {flexShrink: 1}, option: {minHeight: 64, padding: 16, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12},
  optionName: {fontSize: 15, flex: 1, minWidth: 0},
});
