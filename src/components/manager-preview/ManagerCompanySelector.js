import React, {useState} from 'react';
import {Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useStore} from '@store';
import {isCompanySelectable} from '@controleonline/ui-people/src/react/utils/currentCompanySelection';
import CompanyIdentityAvatar from '@controleonline/ui-manager/src/react/components/CompanyIdentityAvatar';
import HomeIcon from '../HomeIcon';
import ManagerBrand from './ManagerBrand';

export default function ManagerCompanySelector({colors: c, compact = false}) {
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
  const content = <>
    <ManagerBrand colors={c} compact={compact} subtitle={false} wrapLabel />
    {canSwitch && !compact && <HomeIcon name="chevron-down" size={18} color={c.navigationIcon} />}
  </>;
  return <>
    {canSwitch ? <Pressable testID="manager-company-trigger" accessibilityRole="button"
      accessibilityLabel={`Selecionar empresa. Atual: ${label}`} accessibilityState={{expanded: open}}
      onPress={() => setOpen(true)} style={[s.trigger, {borderColor: c.cardBorder, backgroundColor: c.pageBackground}, compact && s.compact]}>
      {content}
    </Pressable> : <View style={[s.trigger, {borderColor: c.cardBorder}, compact && s.compact]} accessibilityLabel={`Empresa atual: ${label}`}>{content}</View>}
    <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
      <View style={[s.modalRoot, !mobile && s.desktopRoot]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar seleção de empresa" onPress={close}
          style={[StyleSheet.absoluteFill, {backgroundColor: 'rgba(0,0,0,0.45)'}]} />
        <View accessibilityViewIsModal style={[s.sheet, {backgroundColor: c.cardBackground, maxHeight: Math.max(0, height - insets.top - 24), paddingBottom: Math.max(16, insets.bottom)},
          !mobile && {width: Math.min(480, width - 32), borderRadius: 16}]}>
          <View style={[s.heading, {borderBottomColor: c.cardBorder}]}>
            <Text style={[s.title, {color: c.textPrimary}]}>Selecionar Empresa</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar seleção de empresa" onPress={close} style={s.close}>
              <HomeIcon name="x" size={22} color={c.navigationIcon} />
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
                }} style={[s.option, {borderBottomColor: c.cardBorder, opacity: disabled ? 0.45 : 1}]}>
                <CompanyIdentityAvatar home company={item} size={32} backgroundColor={c.cardIconBackground}
                  borderColor={c.cardBorder} textColor={c.textPrimary} />
                <Text style={[s.optionName, {color: c.textPrimary}]}>{item.alias || item.name}</Text>
                {selected && <HomeIcon name="check-circle" size={20} color={c.navigationIcon} />}
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
  compact: {padding: 6, justifyContent: 'center'},
  modalRoot: {flex: 1, justifyContent: 'flex-end'}, desktopRoot: {justifyContent: 'center', alignItems: 'center'},
  sheet: {width: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20, flexShrink: 1},
  heading: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingLeft: 20, paddingRight: 8, paddingVertical: 8, borderBottomWidth: 1},
  title: {fontSize: 18, fontWeight: '600', flex: 1}, close: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  list: {flexShrink: 1}, option: {minHeight: 64, padding: 16, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12},
  optionName: {fontSize: 15, flex: 1, minWidth: 0},
});
