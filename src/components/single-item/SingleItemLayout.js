import React, {useLayoutEffect, useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useStore} from '@store';
import {app_type, app_type_base} from '@appType';
import BottomNavigationBar from '@controleonline/ui-common/src/react/components/BottomNavigationBar';
import AppTypeSwitcher from '@controleonline/ui-common/src/react/components/AppTypeSwitcher';
import PosKioskBarcodeListener from '@controleonline/ui-orders/src/react/components/PosKioskBarcodeListener';
import HomeAvatar from '../HomeAvatar';
import CompanySwitchContext from './CompanySwitchContext';
import SingleItemCompanyControl from './SingleItemCompanyControl';
import {isCompanySelectable} from '@controleonline/ui-people/src/react/utils/currentCompanySelection';
import resolveHomeAvatar from '../resolveHomeAvatarUrl';
import {getAvatarDisplayName} from '@controleonline/ui-common/src/react/utils/userAvatar';
import {DefaultTableThemeContext} from '@controleonline/ui-default/src/react/components/table/useDefaultTableTheme';
import {managerTableTheme} from '../manager-preview/managerTableTheme';
import {resolveManagerTheme} from '../../styles/managerTheme';
import {readPreviewMode} from '../manager-preview/model';
import DefaultLayout from '../manager-preview/ManagerLayout';
import ManagerAccountMenu from '../manager-preview/ManagerAccountMenu';
import {useManagerPreview} from '../manager-preview/ManagerPreviewProvider';
import DefaultTooltip from '@controleonline/ui-default/src/react/components/help/DefaultTooltip';
import {buildPosOperationInfo} from '@controleonline/ui-orders/src/react/utils/posOperationInfo';
import HomeIcon from '../HomeIcon';
import SingleItemHistoryHeader from './SingleItemHistoryHeader';
import {isSingleItemPos, SINGLE_ITEM_ROUTES, singleItemNavigation} from './policy';

export default function SingleItemLayout(props) {
  const {item:device} = useStore('device_config').getters;
  const {isLogged} = useStore('auth').getters;
  if (!isLogged || !isSingleItemPos(app_type,device?.configs) || !SINGLE_ITEM_ROUTES.has(props.route?.name)) return <DefaultLayout {...props}/>;
  return <SingleItemShell {...props}/>;
}

function SingleItemShell({navigation,route,children}) {
  const {colors,menus = []} = useStore('theme').getters;
  const people = useStore('people');
  const {currentCompany} = people.getters;
  const orders = useStore('orders');
  const products = useStore('order_products');
  const cart = useStore('cart');
  const invoice = useStore('invoice');
  const [paymentBusy, setPaymentBusy] = useState(false);
  const busy = paymentBusy || [orders, products, cart, invoice].some(store => store?.getters?.isSaving === true);
  const switchCompany = company => {
    const allowed = people.getters.companies?.find(item => String(item.id) === String(company.id));
    if (busy || !isCompanySelectable(allowed)) return;
    // Clear only in-memory views. Persisted drafts and orders remain owned by their original company.
    orders.actions.setItem({});
    products.actions.setItems([]);
    cart.actions.setItem?.({});
    people.actions.setCurrentCompany(allowed);
    navigation.reset({index:0,routes:[{name:'HomePage'}]});
  };
  const auth = useStore('auth');
  const {user} = auth.getters;
  const {item: device} = useStore('device_config').getters;
  const preview = useManagerPreview();
  const bottomBar = preview?.bottomBar;
  const mode = preview?.mode || readPreviewMode();
  const [accountOpen,setAccountOpen] = useState(false);
  const focused = useIsFocused();
  const insets = useSafeAreaInsets();
  const c = useMemo(()=>resolveManagerTheme(colors,mode),[colors,mode]);
  const tableTheme = useMemo(()=>managerTableTheme(c),[c]);
  const items = singleItemNavigation(menus,navigation.getState().routeNames);
  const catalog = ['HomePage','PdvPage','AddProductScreen','ProductsPage'].includes(route.name);
  const primary = catalog || route.name === 'OrderHistoryPage' || route.name === 'ProfilePage';
  useLayoutEffect(()=>{if(focused) navigation.setOptions({headerShown:false,title:catalog ? 'Catálogo' : route.name === 'OrderHistoryPage' ? 'Pedidos' : undefined});},[focused,navigation,catalog,route.name]);
  const goBack=()=>{if(navigation.canGoBack?.())navigation.goBack();else navigation.navigate('HomePage');};
  const provider = orders.getters.item?.provider;
  const providerId = String(provider?.id || provider?.['@id'] || provider || '').replace(/\D/g,'');
  const wrongCompany = !!providerId && providerId !== String(currentCompany?.id);
  const summary = orders.getters.summary?.operational;
  const active = catalog?'HomePage':route.name==='OrderDetails'?'OrderHistoryPage':route.name;
  return <DefaultTableThemeContext.Provider value={tableTheme}>
    <View style={[s.root,{backgroundColor:c.pageBackground,paddingTop:insets.top}]}>
      <View style={[s.header,{backgroundColor:c.headerBackground,borderColor:c.headerBorder}]}>
        <View style={{minWidth:96,alignSelf:'stretch',justifyContent:'center',alignItems:'center'}}><View style={{flexDirection:'row',alignItems:'center',gap:8}}><Text style={{fontSize:11,color:c.textMuted}}>Single Item</Text><DefaultTooltip accessibilityLabel="Ver configuração do PDV" title="Configuração do PDV" label={<HomeIcon name="info" size={14} color={c.textMuted}/>} rows={buildPosOperationInfo({currentCompany,deviceConfig:device})} closeLabel="×" closeAccessibilityLabel="Fechar configuração do PDV" accentColor={c.textMuted} hitSlop={{top:8,bottom:8,left:8,right:8}} style={{width:20,height:20,borderWidth:0,backgroundColor:'transparent'}} dialogTestID="operation-info-dialog"/></View></View>
        <View style={{flex:1,minWidth:0}}><SingleItemCompanyControl navigation={navigation} people={people.getters} order={orders.getters.item} busy={busy} colors={c} onSwitch={switchCompany} saleScreen={!primary}/></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir opções do usuário" onPress={()=>setAccountOpen(true)} style={{padding:4}}>
          <HomeAvatar imageUrl={resolveHomeAvatar(user,currentCompany)} name={getAvatarDisplayName(user)} size={32} backgroundColor={c.cardIconBackground} borderColor={c.cardBorder} textColor={c.textPrimary}/>
        </Pressable>
      </View>
      {app_type_base === 'ADMIN' && <View style={{backgroundColor:c.headerBackground,paddingHorizontal:12,paddingVertical:8,borderBottomWidth:1,borderColor:c.headerBorder}}><AppTypeSwitcher/></View>}
      {!primary && <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={goBack} style={s.back}><Text style={{color:c.textPrimary}}>← Voltar</Text></Pressable>}
      {route.name === 'OrderHistoryPage' && <SingleItemHistoryHeader summary={summary} colors={c}
        canCreate={items.some(item=>item.route==='HomePage')}
        onNewSale={()=>navigation.navigate('PdvPage',{startNewOrder:true,showBottomCart:false,interactionMode:'pdv'})}/>}
      <CompanySwitchContext.Provider value={setPaymentBusy}><View key={String(currentCompany?.id)} style={s.content}>{wrongCompany ? <View style={{padding:20,gap:16}}><Text style={{color:c.textPrimary}}>Este pedido pertence a outra empresa.</Text><Pressable accessibilityRole="button" onPress={()=>{orders.actions.setItem({});products.actions.setItems([]);navigation.reset({index:0,routes:[{name:'HomePage'}]});}}><Text style={{color:c.textPrimary}}>Voltar ao catálogo</Text></Pressable></View> : children}</View></CompanySwitchContext.Provider>
      {bottomBar?.visible && <BottomNavigationBar navigation={navigation} colors={c} items={items} activeRouteName={active} appearance="soft" placement="inline"/>}
      <PosKioskBarcodeListener navigation={navigation}/>
    </View>
    <ManagerAccountMenu anchor={focused && accountOpen ? 'header' : null} mobile colors={c} name={getAvatarDisplayName(user)} mode={mode} canOpenProfile
      bottomBar={bottomBar}
      onBarSession={()=>{bottomBar.setSessionVisible(!bottomBar.visible);setAccountOpen(false);}}
      onBarRemember={async()=>{if(await bottomBar.setRememberedVisible(!bottomBar.rememberedVisible))setAccountOpen(false);}}
      onClose={()=>setAccountOpen(false)} onProfile={()=>{setAccountOpen(false);navigation.navigate('ProfilePage');}}
      onTheme={()=>{setAccountOpen(false);preview?.toggleMode();}}
      onLogout={!busy && auth.actions?.logOut ? ()=>{setAccountOpen(false);auth.actions.logOut();} : undefined}/>
  </DefaultTableThemeContext.Provider>;
}
const s=StyleSheet.create({root:{flex:1,minHeight:0},header:{minHeight:56,paddingHorizontal:12,paddingVertical:6,borderBottomWidth:1,flexDirection:'row',alignItems:'center',gap:12},company:{fontSize:16,fontWeight:'600'},content:{flex:1,minHeight:0},back:{minHeight:44,paddingHorizontal:18,alignSelf:'flex-start',justifyContent:'center'}});
