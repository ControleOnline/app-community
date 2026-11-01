import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import OrderIdentityLabel from '@controleonline/ui-orders/src/react/components/OrderIdentityLabel';
import {getEntityId, getPeopleLabel} from '@controleonline/ui-orders/src/react/pages/orders/orderHistoryHelpers';
import {resolveOrderHistoryStatusColor} from '@controleonline/ui-orders/src/react/pages/orders/orderHistoryStatusColor';
import useDefaultTableTheme from '@controleonline/ui-default/src/react/components/table/useDefaultTableTheme';
import Formatter from '@controleonline/ui-common/src/utils/formatter';

export default function SingleItemOrderCard({order, openRow, onOpenOrder, purchaseSuppliersById}) {
  const {themeColors:c} = useDefaultTableTheme(null, 'compact');
  const text = c.cardText || c.textPrimary;
  const muted = c.textSecondary || text;
  const status = order?.status || {};
  const rawStatus = typeof status === 'string' ? status : status.status || status.name || '';
  const label = global.t?.t('orders','status',rawStatus.toLowerCase()) || rawStatus || '—';
  const statusColor = resolveOrderHistoryStatusColor(status,c);
  const client = getPeopleLabel(order?.client) || purchaseSuppliersById?.[getEntityId(order?.client)] || 'Sem cliente';
  const date = order?.orderDate || order?.alterDate;
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Abrir pedido ${order.id}`}
    activeOpacity={0.85} onPress={openRow || (()=>onOpenOrder?.(order))}
    style={[s.card,{backgroundColor:c.cardBackground,borderColor:c.cardBorder || c.border}]}>
    <View style={s.row}>
      <OrderIdentityLabel order={order} containerStyle={{flex:1,minWidth:0}}
        primaryTextStyle={{color:text,fontWeight:'700',fontSize:14}}
        secondaryTextStyle={{color:muted,fontSize:12}}/>
      <View style={[s.status,{borderColor:statusColor}]}><Text style={{color:statusColor,fontSize:12,fontWeight:'600'}}>{label}</Text></View>
    </View>
    <Text numberOfLines={2} style={{color:text,fontSize:14}}>{client}</Text>
    <View style={s.row}>
      <Text style={{color:muted,fontSize:12,flex:1}}>{date ? Formatter.formatDateYmdTodmY(date) : '—'}</Text>
      <Text style={{color:text,fontSize:17,fontWeight:'700'}}>{Formatter.formatMoney(order?.price || 0)}</Text>
    </View>
  </TouchableOpacity>;
}
const s=StyleSheet.create({
  card:{width:'100%',borderWidth:1,borderRadius:14,padding:14,gap:10},
  row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},
  status:{borderWidth:1,borderRadius:16,paddingHorizontal:9,paddingVertical:4,flexShrink:0},
});
