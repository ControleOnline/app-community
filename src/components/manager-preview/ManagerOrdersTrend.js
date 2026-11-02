import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {formatInteger, normalizeNumber} from '@controleonline/ui-report/src/react/components/operationalInsights/shared';
import HomeIcon from '../HomeIcon';

// Shared data formatting; visual roles come exclusively from the domain theme.
export default function ManagerOrdersTrend({items = [], colors: c, title, subtitle, style}) {
  const max = items.reduce((value, item) => Math.max(value, normalizeNumber(item.orders)), 0);
  return <View style={[s.frame, {backgroundColor:c.panelBackground,borderColor:c.panelBorder}, style]}>
    <View style={s.header}>
      <View style={[s.icon, {backgroundColor:c.cardIconBackground,borderColor:c.cardIconBorder}]}>
        <HomeIcon name="bar-chart-2" size={18} color={c.cardIconColor} />
      </View>
      <View><Text style={[s.title, {color:c.cardText}]}>{title}</Text>
        <Text style={[s.subtitle, {color:c.textSecondary}]}>{subtitle}</Text></View>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator
      style={{maxHeight: 190}} contentContainerStyle={{minWidth: '100%'}}>
      <View accessibilityLabel="Pedidos por período" style={{
        flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around',
        gap: 8, padding: 8, minWidth: '100%', minHeight: 170,
      }}>
        {items.map((item, index) => {
          const value = Math.max(0, normalizeNumber(item.orders));
          const height = max > 0 ? Math.round(value / max * 118) : 0;
          return <View key={item.key || index} style={[s.trendColumn, {flexShrink: 0}]}
            accessibilityLabel={`${item.label}: ${formatInteger(value)} pedidos`}>
            <Text style={[s.trendColumnValue,{color:c.cardText}]}>{formatInteger(value)}</Text>
            <View style={[s.trendColumnTrack, {backgroundColor: c.sectionBackground}]}>
              <View style={[s.trendColumnFill, {height, minHeight: 0,
                backgroundColor: c.cardIconColor}]} />
            </View>
            <Text style={[s.trendColumnLabel,{color:c.textSecondary}]}>{item.label}</Text>
          </View>;
        })}
      </View>
    </ScrollView>
  </View>;
}

const s = StyleSheet.create({
  frame:{borderWidth:1,borderRadius:16,padding:14},
  header:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:14},
  icon:{width:38,height:38,borderRadius:19,borderWidth:1,alignItems:'center',justifyContent:'center'},
  title:{fontSize:14,fontWeight:'700'}, subtitle:{fontSize:12,marginTop:4},
  trendColumn:{width:54,alignItems:'center',justifyContent:'flex-end',gap:6},
  trendColumnValue:{fontSize:11,lineHeight:13,fontWeight:'900'},
  trendColumnTrack:{width:'100%',height:118,borderRadius:16,justifyContent:'flex-end',overflow:'hidden'},
  trendColumnFill:{width:'100%',borderTopLeftRadius:12,borderTopRightRadius:12},
  trendColumnLabel:{fontSize:10,lineHeight:12,fontWeight:'800',textAlign:'center'},
});
