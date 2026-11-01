import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import DefaultSearch from '@controleonline/ui-default/src/react/components/filters/DefaultSearch';
import SingleItemStatusCounts from './SingleItemStatusCounts';

export default function SingleItemHistoryHeader({summary, colors, canCreate, onNewSale, filters, onChangeFilters}) {
  return <View testID="single-item-history-header" style={s.header}>
    <View style={s.counts}>
      <SingleItemStatusCounts summary={summary} colors={colors} style={s.statuses} />
    </View>
    <View testID="single-item-search-row" style={s.searchRow}>
    <DefaultSearch storeName="orders" placeholder="Buscar por ID ou cliente" filters={filters}
      onChangeFilters={onChangeFilters} style={{flex:1,minWidth:0,width:0}}/>
    {canCreate && <Pressable accessibilityRole="button" accessibilityLabel="Nova venda"
      onPress={onNewSale} style={[s.newSale, {backgroundColor: colors.buttonBackground}]}>
      <Text style={{color: colors.buttonText, fontWeight: '600'}}>+ Nova venda</Text>
    </Pressable>}
    </View>
  </View>;
}

const s = StyleSheet.create({
  header: {paddingHorizontal: 16, paddingVertical: 10, gap: 8},
  searchRow: {flexDirection:'row',alignItems:'center',gap:8},
  counts: {minWidth: 0},
  statuses: {paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0},
  newSale: {minHeight: 44, flexShrink: 0, paddingHorizontal: 12, borderRadius: 10, justifyContent: 'center'},
});
