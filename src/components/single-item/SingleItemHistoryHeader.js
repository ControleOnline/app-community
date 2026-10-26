import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import SingleItemStatusCounts from './SingleItemStatusCounts';

export default function SingleItemHistoryHeader({summary, colors, canCreate, onNewSale}) {
  return <View testID="single-item-history-header" style={s.header}>
    <View style={s.counts}>
      <SingleItemStatusCounts summary={summary} colors={colors} style={s.statuses} />
    </View>
    {canCreate && <Pressable accessibilityRole="button" accessibilityLabel="Nova venda"
      onPress={onNewSale} style={[s.newSale, {backgroundColor: colors.buttonBackground}]}>
      <Text style={{color: colors.buttonText, fontWeight: '600'}}>+ Nova venda</Text>
    </Pressable>}
  </View>;
}

const s = StyleSheet.create({
  header: {paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10},
  counts: {flex: 1, minWidth: 0},
  statuses: {paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0},
  newSale: {minHeight: 44, flexShrink: 0, paddingHorizontal: 12, borderRadius: 10, justifyContent: 'center'},
});
