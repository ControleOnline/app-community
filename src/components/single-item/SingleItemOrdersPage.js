import React, {useCallback, useContext} from 'react';
import OperationalStoreContext from '../../store/OperationalStoreContext';
import {Text, View} from 'react-native';
import {useStore} from '@store';
import {app_type} from '@appType';
import OrderHistoryPage from '@controleonline/ui-orders/src/react/pages/orders/OrderHistoryPage';
import {canDeviceViewCompanyOrders, parseConfigsObject} from '@controleonline/ui-common/src/react/config/deviceConfigBootstrap';
import SingleItemHistoryHeader from './SingleItemHistoryHeader';
import SingleItemOrderCard from './SingleItemOrderCard';
import {isSingleItemPos, singleItemNavigation} from './policy';

export default function SingleItemOrdersPage(props) {
  const {item:device} = useStore('device_config').getters;
  const {menus=[]} = useStore('theme').getters;
  const operation=useContext(OperationalStoreContext)?.pdv;
  const singleItem = isSingleItemPos(app_type, device?.configs) || operation?.singleItem === true;
  const configs = parseConfigsObject(device?.configs);
  // This presentation defaults to company orders, without rewriting saved device preferences.
  const visibility = String(configs?.['pos-order-visibility'] || '').trim();
  const companyOrders = !visibility || canDeviceViewCompanyOrders(configs);
  const canCreate = singleItemNavigation(menus, props.navigation.getState().routeNames)
    .some(item => item.route === 'HomePage');
  const renderHeader = useCallback(({summary, colors, filters, onChangeFilters, onNewSale}) =>
    <SingleItemHistoryHeader summary={summary} colors={colors} filters={filters}
      onChangeFilters={onChangeFilters} canCreate={canCreate} onNewSale={onNewSale}/>, [canCreate]);
  const renderCard = useCallback(({order, openRow, onOpenOrder, purchaseSuppliersById}) =>
    <SingleItemOrderCard order={order} openRow={openRow} onOpenOrder={onOpenOrder}
      purchaseSuppliersById={purchaseSuppliersById}/>, []);
  const canViewHistory = singleItemNavigation(menus, props.navigation.getState().routeNames)
    .some(item => item.route === 'OrderHistoryPage');
  if (singleItem && !canViewHistory) return <View style={{padding:20}}><Text>Listagem de pedidos indisponível neste perfil.</Text></View>;
  return <OrderHistoryPage {...props} {...(singleItem ? {
    operationalCompanyOrders:companyOrders,
    renderOperationalHeader:renderHeader,
    renderOperationalCard:renderCard,
  } : {})}/>;
}
