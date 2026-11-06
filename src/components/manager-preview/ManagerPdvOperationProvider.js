import React, {useCallback, useMemo, useState} from 'react';
import {NavigationContext, useFocusEffect} from '@react-navigation/native';
import {Pressable, Text, View} from 'react-native';
import {useStore as useBaseStore} from '@controleonline/ui-common/src/react/stores';
import {api} from '@controleonline/ui-common/src/api';
import {parseConfigsObject, isPosSingleItemMode} from '@controleonline/ui-common/src/react/config/deviceConfigBootstrap';
import {app_type} from '@appType';
import OperationalStoreContext from '../../store/OperationalStoreContext';
import {createManagerPdvNavigation,isManagerPdvRoute,selectManagerPdvConfig,managerPdvConfigQuery,managerPdvTabParams} from './managerPdvOperation';
import {resolveMenuRouteName} from '@controleonline/ui-layout/src/react/utils/menuNavigation';
import SingleItemOperationInfo from '../single-item/SingleItemOperationInfo';

export default function ManagerPdvOperationProvider(props) {
  return isManagerPdvRoute(app_type,props.route) ? <OperationalPage {...props}/> : <props.Component navigation={props.navigation} route={props.route}/>;
}

function OperationalPage({navigation,route,Component}) {
  const base=useBaseStore('device_config');
  const baseOrders=useBaseStore('orders');
  const {item:device}=useBaseStore('device').getters;
  const {currentCompany:company}=useBaseStore('people').getters;
  const {menus=[],colors={}}=useBaseStore('theme').getters;
  const scope=JSON.stringify([company?.id,device?.id,device?.device]);
  const [state,setState]=useState(null);
  const [attempt,setAttempt]=useState(0);
  useFocusEffect(useCallback(()=>{
    let active=true;
    if(!company?.id || !device?.id) return undefined;
    setState(previous=>previous?.scope===scope && !previous.error ? previous : {scope,loading:true});
    api.fetch('device_configs',{params:managerPdvConfigQuery(company,device)})
      .then(items=>{if(active) {
        const config=selectManagerPdvConfig(items,company,device);
        setState(previous=>previous?.scope===scope && !previous.error && !previous.loading
          && JSON.stringify(previous.config)===JSON.stringify(config) ? previous : {scope,config});
      }})
      .catch(()=>{if(active) setState({scope,error:true});});
    return ()=>{active=false;};
  },[scope,attempt]));
  const ready=state?.scope===scope && !state.error && !state.loading;
  const config=ready ? state.config : null;
  const singleItem=!!config && isPosSingleItemMode(config.configs);
  const canViewHistory=menus.some(group=>(group.menus || []).some(item=>resolveMenuRouteName(item.route)==='OrderHistoryPage'));
  const scopedStore=useMemo(()=>({
    ...base,
    getters:{...base.getters,item:{...(config || {}),device:config?.device || device,
      // Operational settings do not turn a Manager request into a payment terminal.
      type:'MANAGER',operationalType:'PDV',people:`/people/${company?.id}`,
      configs:config ? parseConfigsObject(config.configs) : {'pos-operation-mode':'counter','check-order-type':'none'}}},
    actions:{...base.actions,setItem:value=>setState({scope,config:value})},
  }),[base,config,device,company?.id,scope]);
  const pdv=useMemo(()=>({manager:true,singleItem,configured:!!config,deviceConfig:scopedStore.getters.item}),[singleItem,config,scopedStore]);
  const scopedNavigation=useMemo(()=>createManagerPdvNavigation(navigation,{singleItem,canViewHistory}),[navigation,singleItem,canViewHistory]);
  const scopedOrders=useMemo(()=>{
    const actions={...baseOrders.actions};
    const deviceReference=device?.device || device?.id;
    for(const method of ['replaceProducts','addProducts']) if(actions[method]) {
      actions[method]=(order,items,...args)=>baseOrders.actions[method](order,
        Array.isArray(items) ? items.map(item=>({...item,device:deviceReference,deviceType:'PDV'}))
          : {...items,device:deviceReference,deviceType:'PDV'},...args);
    }
    return {...baseOrders,actions};
  },[baseOrders.actions,baseOrders.getters,device?.id,device?.device]);
  const context=useMemo(()=>({stores:{device_config:scopedStore,orders:scopedOrders},pdv}),[scopedStore,scopedOrders,pdv]);
  if(!company?.id || !device?.id) return <View style={{padding:20}}><Text>Selecione uma empresa e aguarde a identificação do dispositivo.</Text></View>;
  if(!ready) return <View style={{padding:20,gap:12}}><Text>{state?.scope===scope && state.error ? 'Não foi possível carregar a configuração PDV.' : 'Carregando configuração PDV…'}</Text>
    {state?.scope===scope && state.error ? <Pressable accessibilityRole="button" onPress={()=>setAttempt(value=>value+1)} style={{minHeight:44,justifyContent:'center'}}><Text>Tentar novamente</Text></Pressable> : null}</View>;
  const catalogRequested=route.name==='PdvPage' && (route.params?.pdvView==='catalog' || route.params?.orderId || route.params?.id || route.params?.startNewOrder);
  const active=route.name==='OrderHistoryPage' || (route.name==='PdvPage' && !catalogRequested) ? 'orders' : 'catalog';
  const go=view=>scopedNavigation.navigate('PdvPage',managerPdvTabParams(view,{route,order:baseOrders.getters.item,company}));
  return <OperationalStoreContext.Provider value={context}>
    <NavigationContext.Provider value={scopedNavigation}>
      <View key={scope} style={{flex:1,minHeight:0}}>
        {singleItem ? <View style={{flexDirection:'row',gap:8,paddingHorizontal:12,paddingVertical:8}}>
          {(canViewHistory ? ['orders','catalog'] : ['catalog']).map(view=><Pressable key={view} accessibilityRole="tab" accessibilityState={{selected:active===view}}
            accessibilityLabel={view==='orders' ? 'Pedidos do PDV' : 'Catálogo do PDV'} onPress={()=>go(view)}
            style={{minHeight:44,paddingHorizontal:16,borderRadius:10,borderWidth:1,borderColor:colors.cardBorder,
              backgroundColor:active===view ? colors.buttonBackground : colors.cardBackground,justifyContent:'center'}}>
            <Text style={{color:active===view ? colors.buttonText : colors.textPrimary}}>{view==='orders' ? 'Pedidos' : 'Catálogo'}</Text>
          </Pressable>)}
          <View style={{flex:1,flexDirection:'row',gap:6,alignItems:'center',justifyContent:'flex-end'}}>
            <Text style={{fontSize:12,color:colors.textSecondary}}>Single Item</Text>
            <SingleItemOperationInfo currentCompany={company} deviceConfig={scopedStore.getters.item} color={colors.textSecondary}/>
          </View>
        </View> : null}
        <Component navigation={scopedNavigation} route={route}/>
      </View>
    </NavigationContext.Provider>
  </OperationalStoreContext.Provider>;
}
