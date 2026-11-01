import {useManagementPageTitle} from './ManagementPageTitleContext';
import React, {useContext, useLayoutEffect} from 'react';
import DefaultModalButton from '@controleonline/ui-default/src/react/components/table/DefaultModalButton';
import DefaultCompactDialog from '@controleonline/ui-default/src/react/components/table/DefaultCompactDialog';
import DefaultToolbarAction from '@controleonline/ui-default/src/react/components/table/DefaultToolbarAction';
import {Pressable, Text, View, useWindowDimensions} from 'react-native';
import {useStore} from '@store';
import OperationalStoreContext from '../../store/OperationalStoreContext';
import {resolveMenuRouteName} from '@controleonline/ui-layout/src/react/utils/menuNavigation';
import SingleItemOrdersPage from '../single-item/SingleItemOrdersPage';
import AddProductScreen from '@controleonline/ui-orders/src/react/pages/checkout/AddProductScreen';
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
  const ownsTitle=useManagementPageTitle();
  const {width} = useWindowDimensions();
  const preview = useManagerPreview();
  const mobile = width <= 760;
  const {menus} = useStore('theme').getters;
  const {currentCompany} = useStore('people').getters;
  const {item: deviceConfig} = useStore('device_config').getters;
  const operation = useContext(OperationalStoreContext)?.pdv;
  if (operation?.singleItem) return <ConfiguredSingleItemPdv {...props}/>;
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
    <View style={{padding: width <= 760 ? 10 : 18, borderBottomWidth: 1, borderBottomColor: c.cardBorder,
      gap: 12, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'}}>
      <View style={{flex: 1, minWidth: 60}}>
        {!ownsTitle && <Text accessibilityRole="header" style={{fontSize: 18, fontWeight: '700', color: c.textPrimary}}>PDV</Text>}
      </View>
      {mobile ? (settlement || history) && <DefaultModalButton
        renderButton={({open}) => <DefaultToolbarAction action={{key:'pdv-more',icon:'more-horizontal',
          label:'Mais opções',accessibilityLabel:'Mais opções do PDV',onPress:open,style:{minHeight:44}}}/> }>
        {({isOpen,close}) => isOpen && <DefaultCompactDialog visible title="Mais opções do PDV" onClose={close} bodyHeight={120}>
          {settlement && action('Mesas e comandas', () => {close(); go(settlement,
            linkedType !== POS_CHECK_ORDER_TYPE_NONE ? {orderType:linkedType} : {});})}
          {history && action('Histórico de pedidos', () => {close(); go(history,{interactionMode:'pdv',showBottomToolBar:true});})}
        </DefaultCompactDialog>}
      </DefaultModalButton> : <View style={{flexDirection:'row', flexWrap:'wrap', gap:8}}>
        {settlement && action('Mesas e comandas', () => go(settlement,
          linkedType !== POS_CHECK_ORDER_TYPE_NONE ? {orderType:linkedType} : {}))}
        {history && action('Histórico de pedidos', () => go(history,{interactionMode:'pdv',showBottomToolBar:true}))}
      </View>}
    </View>
    <CollectionReadStatus catalog={experience?.catalog} endpoint="categories" onlyProblems color={c.textMuted}/>
    <View style={{flex: 1, minHeight: 0, minWidth: 0}}><PdvPage {...props} /></View>
  </View>;
}

function ConfiguredSingleItemPdv({navigation,route}) {
  const {menus=[],colors={}}=useStore('theme').getters;
  const historyAllowed=menus.some(group=>(group.menus || []).some(item=>resolveMenuRouteName(item.route)==='OrderHistoryPage'));
  const catalogRequested=route.params?.pdvView==='catalog' || route.params?.orderId || route.params?.id || route.params?.startNewOrder;
  useLayoutEffect(()=>{navigation.setOptions({headerRight:undefined});},[navigation]);
  const catalogRoute={...route,params:{...route.params,managerPdv:true,singleItemMode:true,interactionMode:'pdv',
    showBottomCart:false,showBottomToolBar:true,startNewOrder:route.params?.startNewOrder || (!route.params?.orderId && !route.params?.id)}};
  return <View style={{flex:1,minHeight:0}}>
    {!historyAllowed && route.params?.pdvCompleted && !catalogRequested ? <Text style={{padding:20,color:colors.textPrimary}}>Venda concluída. Use o catálogo para iniciar outra venda.</Text>
      : historyAllowed && !catalogRequested ? <SingleItemOrdersPage navigation={navigation} route={route}/>
      : <AddProductScreen navigation={navigation} route={catalogRoute}/>}
  </View>;
}
