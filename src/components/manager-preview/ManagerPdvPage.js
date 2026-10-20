import React from 'react';
import {Pressable, Text, View, useWindowDimensions} from 'react-native';
import {useStore} from '@store';
import PdvPage from '@controleonline/ui-orders/src/react/pages/PdvPage';
import {
  POS_CHECK_ORDER_TYPE_NONE,
  resolvePosCheckOrderEntryTypeForShop,
} from '@controleonline/ui-common/src/react/config/deviceConfigBootstrap';
import {managerMenu, managerPreviewEnabled} from './model';
import CollectionReadStatus from './CollectionReadStatus';
import {useManagerPreview} from './ManagerPreviewProvider';

// Presentation only: linked identification and settlement remain owned by ui-orders.
export default function ManagerPdvPage(props) {
  const {width} = useWindowDimensions();
  const preview = useManagerPreview();
  const compactNative = width <= 760 && process.env.EXPO_PUBLIC_MANAGER_NATIVE_PREVIEW === '1';
  const {menus} = useStore('theme').getters;
  const {currentCompany} = useStore('people').getters;
  const {item: deviceConfig} = useStore('device_config').getters;
  if (!managerPreviewEnabled || !preview) return <PdvPage {...props} />;

  const {colors: c, experience} = preview;
  const {navigation} = props;
  const routeNames = navigation.getState().routeNames;
  const menuItems = ['home', 'toolbar'].flatMap(menuType =>
    managerMenu(menus, routeNames, global.t?.t, menuType).flatMap(group => group.items),
  );
  const settlement = menuItems.find(item => item.name === 'LinkedOrderSettlementPage');
  const history = menuItems.find(item => item.name === 'OrderHistoryPage');
  const linkedType = resolvePosCheckOrderEntryTypeForShop(deviceConfig?.configs, currentCompany?.configs);
  const go = (item, params) => {
    experience?.begin(item.name, 'click');
    navigation.navigate(item.name, {...item.params, ...params});
  };
  const action = (label, onPress) => <Pressable accessibilityRole="button" accessibilityLabel={label}
    onPress={onPress} style={{minHeight: 44, paddingHorizontal: 14, paddingVertical: 10,
      borderWidth: 1, borderColor: c.cardBorder, borderRadius: 10, justifyContent: 'center', backgroundColor: c.cardBackground}}>
    <Text style={{color: c.textPrimary, fontSize: 12, fontWeight: '600'}}>{label}</Text>
  </Pressable>;
  return <View style={{flex: 1, minHeight: 0, minWidth: 0, backgroundColor: c.pageBackground}}>
    {!compactNative && <View style={{padding: width <= 760 ? 10 : 18, borderBottomWidth: 1, borderBottomColor: c.cardBorder,
      gap: 12, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'}}>
      <View style={{flex: 1, minWidth: 180}}>
        <Text accessibilityRole="header" style={{fontSize: 18, fontWeight: '700', color: c.textPrimary}}>Ponto de venda</Text>
        {width>760&&<Text style={{marginTop: 4, fontSize: 12, color: c.textMuted}}>Escolha os itens e acompanhe o pedido.</Text>}
      </View>
      <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
        {settlement && action('Mesas e comandas', () => go(settlement,
          linkedType !== POS_CHECK_ORDER_TYPE_NONE ? {orderType: linkedType} : {}))}
        {history && action('Histórico de pedidos', () => go(history, {interactionMode: 'pdv', showBottomToolBar: true}))}
      </View>
    </View>}
    <CollectionReadStatus catalog={experience?.catalog} endpoint="categories" hideFresh={width<=760} color={c.textMuted}/>
    <View style={{flex: 1, minHeight: 0, minWidth: 0}}><PdvPage {...props} /></View>
  </View>;
}
