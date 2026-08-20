import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

/**
 * Placeholder marketing dashboard for APP_TYPE=MKT.
 * Structured fake KPIs / channels / campaigns — no live ad integrations yet.
 */
const KPI_CARDS = [
  {id: 'impressions', label: 'Impressões', value: '—', hint: 'últimos 7 dias'},
  {id: 'clicks', label: 'Cliques', value: '—', hint: 'últimos 7 dias'},
  {id: 'ctr', label: 'CTR', value: '—', hint: 'médio'},
  {id: 'conversions', label: 'Conversões', value: '—', hint: 'site → CRM'},
  {id: 'spend', label: 'Investimento', value: '—', hint: 'período'},
  {id: 'roas', label: 'ROAS', value: '—', hint: 'estimado'},
];

const CHANNELS = [
  {id: 'meta', name: 'Meta (Facebook / Instagram)', status: 'Em breve'},
  {id: 'google', name: 'Google Ads', status: 'Em breve'},
  {id: 'organic', name: 'Orgânico / Site', status: 'Placeholder'},
  {id: 'crm', name: 'CRM (leads)', status: 'Placeholder'},
];

const MOCK_CAMPAIGNS = [
  {id: 'c1', name: 'Campanha institucional', channel: 'Meta', status: 'Rascunho'},
  {id: 'c2', name: 'Promoção sazonal', channel: 'Google Ads', status: 'Rascunho'},
  {id: 'c3', name: 'Remarketing site', channel: 'Meta', status: 'Rascunho'},
];

const MarketingDashboard = () => {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.scroll}
      testID="mkt-marketing-dashboard">
      <View style={styles.header}>
        <Text style={styles.title}>Marketing</Text>
        <Text style={styles.subtitle}>
          Dashboard centralizado (placeholder). Integrações reais com Meta,
          Google Ads e tracking site → CRM virão em entregas posteriores.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>KPIs</Text>
      <View style={styles.kpiGrid}>
        {KPI_CARDS.map(card => (
          <View key={card.id} style={styles.kpiCard} testID={`mkt-kpi-${card.id}`}>
            <Text style={styles.kpiLabel}>{card.label}</Text>
            <Text style={styles.kpiValue}>{card.value}</Text>
            <Text style={styles.kpiHint}>{card.hint}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Canais</Text>
      <View style={styles.list}>
        {CHANNELS.map(ch => (
          <View key={ch.id} style={styles.listRow} testID={`mkt-channel-${ch.id}`}>
            <Text style={styles.listPrimary}>{ch.name}</Text>
            <Text style={styles.listSecondary}>{ch.status}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Campanhas (mock)</Text>
      <View style={styles.list}>
        {MOCK_CAMPAIGNS.map(c => (
          <View key={c.id} style={styles.listRow} testID={`mkt-campaign-${c.id}`}>
            <View style={styles.listTextBlock}>
              <Text style={styles.listPrimary}>{c.name}</Text>
              <Text style={styles.listSecondary}>{c.channel}</Text>
            </View>
            <Text style={styles.badge}>{c.status}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          APP_TYPE=MKT · dados reais dependem de wp-mkt-community e APIs de anúncio.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 10,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 8,
  },
  kpiCard: {
    width: '50%',
    padding: 6,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  kpiHint: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  list: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  listTextBlock: {
    flex: 1,
    paddingRight: 8,
  },
  listPrimary: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  listSecondary: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  badge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  footer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#4338CA',
    lineHeight: 18,
  },
});

export default MarketingDashboard;
