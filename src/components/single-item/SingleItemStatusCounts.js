import React from 'react';
import {Text, View} from 'react-native';
import {resolveOrderHistoryStatusColor} from '@controleonline/ui-orders/src/react/pages/orders/orderHistoryStatusColor';

export default function SingleItemStatusCounts({summary, colors}) {
  const statuses = Array.isArray(summary?.statuses) ? summary.statuses.filter(status => Number(status.quantity) > 0) : [];
  if (!statuses.length) return null;
  return <View accessibilityLabel="Quantidade de pedidos por status" style={{flexDirection:'row',flexWrap:'wrap',gap:6,paddingHorizontal:16,paddingTop:4,paddingBottom:10}}>
    {statuses.map(status => {
      const color = resolveOrderHistoryStatusColor(status, colors);
      const label = global.t?.t('orders','status',String(status.status).toLowerCase()) || status.status;
      return <View key={status.id || status.status} style={{borderColor:color,borderWidth:1,borderRadius:16,paddingHorizontal:9,paddingVertical:4}}>
        <Text style={{fontSize:12,fontWeight:'600',color}}>{label} · {status.quantity}</Text>
      </View>;
    })}
  </View>;
}
