import React, {useState} from 'react';
import {Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useStore} from '@store';
import {isCompanySelectable} from '@controleonline/ui-people/src/react/utils/currentCompanySelection';
import ManagerCompanyLogo from './ManagerCompanyLogo';
import HomeIcon from '../HomeIcon';
import ManagerBrand, {CompanyName} from './ManagerBrand';

export default function ManagerCompanySelector({colors: c, compact = false, mode = 'sidebar'}) {
  const people = useStore('people');
  const {currentCompany, mainCompany, companies: availableCompanies} = people.getters;
  const companies = Array.isArray(availableCompanies) ? availableCompanies : [];
  const [headerWidth,setHeaderWidth]=useState(168);
  const [open, setOpen] = useState(false);
  const {width, height} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const mobile = width <= 760;
  const canSwitch = companies.length > 1;
  const company = currentCompany?.id ? currentCompany : mainCompany;
  const label = company?.alias || company?.name || 'Empresa';
  const close = () => setOpen(false);
  const isLogo = mode === 'logo' || mode === 'header';
  const dense = mode === 'header';
  const iconOnly = compact && !dense;
  const content = isLogo
    ? <View style={s.logoStack} onLayout={event=>setHeaderWidth(Math.round(event.nativeEvent.layout.width))}>
        <ManagerBrand colors={c} home homeSize={40} homeWidth={Math.min(headerWidth, mobile ? 64 : 80)} textColor={c.headerText} compact subtitle={false} />
        <View style={[s.logoCaption, canSwitch && s.captionWithChevron]}>
          <CompanyName key={JSON.stringify([label, mobile, headerWidth, canSwitch])}
            label={label} color={c.selectText} dense small={mobile} complete lines={1} />
          {canSwitch && <View testID="manager-company-chevron" style={s.logoChevron}>
            <HomeIcon name="chevron-down" size={12} color={c.selectIcon} />
          </View>}
        </View>
      </View>
    : <ManagerBrand colors={c} textColor={c.selectText} compact={iconOnly} dense={dense} small={dense && mobile} subtitle={false}
        trailing={canSwitch && !iconOnly ? <View style={[s.chevron,dense && {width:12}]}><HomeIcon name="chevron-down" size={dense?12:18} color={c.selectIcon} /></View> : null} />;
  const triggerStyle = isLogo
    ? [s.logoTrigger]
    : [s.trigger, {borderColor: c.selectBorder, backgroundColor: c.selectBackground}, iconOnly && s.compact, dense && s.dense, dense && mobile && {minHeight:32}];
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
  logoTrigger: {minHeight: 44, minWidth: 0, width: '100%', maxWidth: 240, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4},
  logoStack: {flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, width: '100%', minWidth: 0},
  logoCaption: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', maxWidth: '100%', gap: 4},
  captionWithChevron: {paddingLeft: 16},
  logoChevron: {flexShrink: 0, width: 12, height: 12, alignItems: 'center', justifyContent: 'center'},
  compact: {padding: 6, justifyContent: 'center'},
  dense: {minHeight:34,paddingHorizontal:6,paddingVertical:4,borderRadius:8,width:'100%',minWidth:0},
  chevron: {width: 18, flexShrink: 0, alignItems: 'center', justifyContent: 'center'},
  modalRoot: {flex: 1, justifyContent: 'flex-end'}, desktopRoot: {justifyContent: 'center', alignItems: 'center'},
  sheet: {width: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20, flexShrink: 1},
  heading: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingLeft: 20, paddingRight: 8, paddingVertical: 8, borderBottomWidth: 1},
  title: {fontSize: 18, fontWeight: '600', flex: 1}, close: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  list: {flexShrink: 1}, option: {minHeight: 64, padding: 16, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12},
  optionName: {fontSize: 15, flex: 1, minWidth: 0},
});
