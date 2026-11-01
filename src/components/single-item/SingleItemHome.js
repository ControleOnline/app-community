import React from 'react';
import {Text, View} from 'react-native';
import {useStore} from '@store';
import AddProductScreen from '@controleonline/ui-orders/src/react/pages/checkout/AddProductScreen';
import SingleItemOrdersPage from './SingleItemOrdersPage';
import LegacyHome from '@controleonline/ui-orders/src/react/pages/home/index';
import {app_type} from '@appType';
import {isSingleItemPos, singleItemNavigation} from './policy';

export default function SingleItemHome({navigation, route}) {
  const {item: device} = useStore('device_config').getters;
  const {menus = [], colors = {}} = useStore('theme').getters;
  if (!isSingleItemPos(app_type, device?.configs)) return <LegacyHome navigation={navigation} route={route}/>;
  const allowed = singleItemNavigation(menus, navigation.getState().routeNames).some(item => item.route === 'HomePage');
  if (!allowed) return <View style={{padding:20}}><Text style={{color:colors.textPrimary}}>Nenhuma operação de venda disponível neste perfil.</Text></View>;
  const historyAllowed = singleItemNavigation(menus, navigation.getState().routeNames).some(item => item.route === 'OrderHistoryPage');
  const catalogRequested = route.params?.singleItemCatalog || route.params?.orderId || route.params?.startNewOrder === true;
  if (historyAllowed && !catalogRequested) return <SingleItemOrdersPage navigation={navigation} route={route}/>;
  if (route.params?.singleItemCompleted && !catalogRequested) return <View style={{padding:20,gap:12}}>
    <Text style={{color:colors.textPrimary}}>Venda concluída. Use o catálogo para iniciar outra venda.</Text>
  </View>;
  // The core session owns creation/recovery. Re-entering the tab keeps its existing params.
  const catalogRoute = {...route, params:{...route.params, startNewOrder:route.params?.startNewOrder ?? true,
    singleItemHome:true,interactionMode:'pdv',singleItemMode:true,showBottomCart:false,showBottomToolBar:true}};
  return <AddProductScreen navigation={navigation} route={catalogRoute}/>;
}
