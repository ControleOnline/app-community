import React from 'react';
import {Platform, ScrollView, Text, View} from 'react-native';
import {
  createOperationalInsightsStyles, formatInteger, normalizeNumber,
  ReportCardShell, resolveProgressColor,
} from '@controleonline/ui-report/src/react/components/operationalInsights/shared';

// Keep the shared report presentation, with an explicit row layout. The installed
// TrendCard omits flexDirection on its columns container and stacks them on web.
export default function ManagerOrdersTrend({items = [], ppcColors, accentColor, title, subtitle, style}) {
  const s = createOperationalInsightsStyles(ppcColors, accentColor);
  const max = items.reduce((value, item) => Math.max(value, normalizeNumber(item.orders)), 0);
  // Home owns the surface; do not inherit the report shell's elevated frame.
  const frame = {
    backgroundColor: ppcColors.cardBg, borderColor: ppcColors.borderSoft,
    borderWidth: 1, borderRadius: 16,
    shadowOffset: {width: 0, height: 0}, shadowOpacity: 0, shadowRadius: 0,
    elevation: 0, ...(Platform.OS === 'web' ? {boxShadow: 'none'} : {}),
  };
  return <ReportCardShell {...{ppcColors, accentColor, title, subtitle}}
    style={[style, frame]} iconName="chart-line">
    <ScrollView horizontal showsHorizontalScrollIndicator
      style={{maxHeight: 190}} contentContainerStyle={{minWidth: '100%'}}>
      <View accessibilityLabel="Pedidos concluídos por período" style={{
        flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around',
        gap: 8, padding: 8, minWidth: '100%', minHeight: 170,
      }}>
        {items.map((item, index) => {
          const value = Math.max(0, normalizeNumber(item.orders));
          const height = max > 0 ? Math.round(value / max * 118) : 0;
          return <View key={item.key || index} style={[s.trendColumn, {flexShrink: 0}]}
            accessibilityLabel={`${item.label}: ${formatInteger(value)} pedidos`}>
            <Text style={s.trendColumnValue}>{formatInteger(value)}</Text>
            <View style={[s.trendColumnTrack, {backgroundColor: ppcColors.panelBg}]}>
              <View style={[s.trendColumnFill, {height, minHeight: 0,
                backgroundColor: resolveProgressColor(accentColor, index, items.length)}]} />
            </View>
            <Text style={s.trendColumnLabel}>{item.label}</Text>
          </View>;
        })}
      </View>
    </ScrollView>
  </ReportCardShell>;
}
