import React, {useEffect, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {useStore} from '@store';
import HomeIcon from '../HomeIcon';
import {managerMenu} from './model';
import {useManagerPreview} from './ManagerPreviewProvider';
import {buildDateRangeWindow, buildOperationalInsightsFilters} from '@controleonline/ui-report/src/react/utils/reportInsights';
import {resolveHistorySalesTotals} from '@controleonline/ui-orders/src/react/pages/orders/orderHistoryCompactSummary';
import ManagerOrdersTrend from './ManagerOrdersTrend';
import Formatter from '@controleonline/ui-common/src/utils/formatter';
import {api} from '@controleonline/ui-common/src/api';
import {readCollection} from '../../experience/collections';
import {getAvatarDisplayName} from '@controleonline/ui-common/src/react/utils/userAvatar';

export default function ManagerOverview({navigation}) {
  const {width} = useWindowDimensions();
  const {colors: c, experience} = useManagerPreview();
  const people = useStore('people');
  const {currentCompany} = people.getters;
  const {user} = useStore('auth').getters;
  const firstName = getAvatarDisplayName(user).split(' ')[0] || 'Usuário';
  const focused = useIsFocused();
  const companyId = currentCompany?.id;
  const [period, setPeriod] = useState('today');
  const periods = [
    {id: 'today', label: 'Hoje', suffix: 'hoje'},
    {id: 'week', label: 'Últimos 7 dias', suffix: 'nos últimos 7 dias'},
    {id: 'all', label: 'Todo o período', suffix: 'em todo o período'},
  ];
  const selectedPeriod = periods.find(option => option.id === period);
  const {menus} = useStore('theme').getters;
  // Every destination comes from the real runtime menu, never a demo capability.
  const groups = managerMenu(menus, navigation.getState().routeNames, global.t?.t);
  const items = groups.flatMap(group => group.items);
  const canReadOrders = items.some(item => item.name === 'OrderHistoryPage');
  const canReadClients = items.some(item => item.name === 'ClientsIndex');
  const [refresh, setRefresh] = useState(0);
  const [metrics, setMetrics] = useState({});
  const metricKey = `${companyId || ''}:${period}:${refresh}`;
  const live = metrics.key === metricKey ? metrics : {};
  useEffect(() => {
    if (!focused || !companyId) return;
    let cancelled = false;
    const key = `${companyId}:${period}:${refresh}`;
    const publish = patch => {
      if (!cancelled) setMetrics(previous => ({...(previous.key === key ? previous : {}), key, ...patch}));
    };
    setMetrics({key});
    const ranges = buildDateRangeWindow({comparisonDays: 7});
    const range = period === 'today' ? ranges.current : period === 'week' ? ranges.comparison : {};
    const query = buildOperationalInsightsFilters({companyId, after: range.after, before: range.before});
    if (canReadOrders) {
      // Reuse the ERP client and server-side summary without replacing history state.
      // Never calculate revenue from a paginated list or from payment status.
      readCollection(api, 'orders', {...query, itemsPerPage: 1, page: 1, summary: 'sales'})
        .then(result => {
          const totals = resolveHistorySalesTotals(result.summary);
          const summary = result.summary?.sales?.sales || result.summary?.sales;
          const series = period === 'all' ? summary?.monthly : summary?.daily;
          publish({series: Array.isArray(series) ? series : null, sales: totals?.revenue ?? null,
            salesError: totals ? '' : 'Resumo de vendas não retornado pela API.'});
        }).catch(() => publish({salesError: 'Não foi possível carregar as vendas.'}));
      // Match the existing homepage: orders include every order type.
      const {orderType, ...allOrdersQuery} = query;
      readCollection(api, 'orders', {...allOrdersQuery, itemsPerPage: 1, page: 1})
        .then(result => publish({count: result.totalItems}))
        .catch(() => publish({periodError: 'Não foi possível carregar os pedidos.'}));
      readCollection(api, 'orders', {provider: query.provider, orderType: 'sale', 'status.realStatus': 'open', itemsPerPage: 1, page: 1})
        .then(result => publish({open: result.totalItems}))
        .catch(() => publish({openError: 'Não foi possível carregar os pedidos abertos.'}));
    }
    if (canReadClients) {
      // Reuse the legacy homepage's client relation without replacing the people list.
      readCollection(api, 'people', {'link.company': `/people/${companyId}`, 'link.linkType': 'client', itemsPerPage: 1, page: 1})
        .then(result => publish({clients: result.totalItems}))
        .catch(() => publish({clientsError: 'Não foi possível carregar os clientes.'}));
    }
    return () => {cancelled = true;};
  }, [focused, companyId, period, refresh, canReadOrders, canReadClients]);
  useEffect(() => {
    if (!focused || metrics.key !== metricKey) return;
    const ordersReady = !canReadOrders || ((live.sales !== undefined || live.salesError) && (live.count !== undefined || live.periodError) && (live.open !== undefined || live.openError));
    const clientsReady = !canReadClients || live.clients !== undefined || live.clientsError;
    if (ordersReady && clientsReady) experience?.dataCommitted('HomePage');
  }, [focused, metrics, metricKey, canReadOrders, canReadClients, experience]);
  const find = route => items.find(item => item.name === route);
  const devices = find('DevicesIndex');
  const configs = find('ConfiguratorPage');
  const results = find('IncomeStatement');
  const history = find('OrderHistoryPage');
  const clients = find('ClientsIndex');
  const main = find('OrderHistoryPage') || devices || items[0];
  const quick = ['PdvPage', 'DevicesIndex', 'ProductShowcasesPage', 'Inventory', 'FinancialHubPage', 'ConfiguratorPage', 'Integrations', 'MyCompaniesPage']
    .map(find).filter(Boolean);
  const columns = width > 1450 ? 4 : 2;
  const icon = (name, color = c.buttonBackground, size = 19) => <HomeIcon name={name || 'grid'} size={size} color={color} />;
  const go = item => {experience?.begin(item.name, 'click'); navigation.navigate(item.name, item.params);};
  const button = (item, primary = false) => item && <Pressable accessibilityRole="button" onPress={() => go(item)}
    style={[s.button, {backgroundColor: primary ? c.buttonBackground : c.cardBackground, borderColor: c.cardBorder}]}>
    {icon(primary ? 'arrow-right' : item.icon, primary ? c.buttonText : c.textPrimary, 16)}
    <Text style={{color: primary ? c.buttonText : c.textPrimary, fontSize: 12, fontWeight: '600'}}>{item.title}</Text>
  </Pressable>;
  const cards = [
    [`Vendas concluídas ${selectedPeriod.suffix}`, live.sales, 'Vendas fechadas · data do pedido', 'credit-card', c.textSuccess, selectedPeriod.label, live.salesError, canReadOrders, true, history],
    [`Pedidos ${selectedPeriod.suffix}`, live.count, 'Todos os tipos · data do pedido', 'file-text', c.buttonBackground, selectedPeriod.label, live.periodError, canReadOrders, false, history],
    ['Em andamento', live.open, 'Pedidos de venda abertos', 'clock', c.textWarning, 'Situação atual', live.openError, canReadOrders, false, history],
    ['Clientes', live.clients, 'Clientes vinculados à empresa', 'users', c.buttonBackground, 'Total cadastrado', live.clientsError, canReadClients, false, clients],
  ];
  return <ScrollView style={{backgroundColor: c.pageBackground}} contentContainerStyle={[s.page, {paddingHorizontal: width <= 760 ? 16 : 32}]}>
    <View style={[s.hero, width <= 760 && {flexDirection: 'column'}]}>
      <View style={{flex: 1}}><Text accessibilityRole="header" style={[s.title, {color: c.textPrimary}]}>Olá, {firstName}</Text></View>
      <View style={s.actions}>{button(main, true)}{configs !== main && button(configs)}</View>
    </View>
    <View style={[s.periodBar, width <= 760 && s.periodBarMobile]}>
      <Text style={[s.periodLabel, {color: c.textSecondary}]}>Período</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel="Período dos indicadores" style={s.periodOptions}>
        {periods.map(option => <Pressable key={option.id} accessibilityRole="radio"
          accessibilityLabel={option.label} accessibilityState={{checked: period === option.id}}
          onPress={() => setPeriod(option.id)} style={[s.periodOption, {
            backgroundColor: period === option.id ? c.buttonBackground : c.cardBackground,
            borderColor: period === option.id ? c.buttonBackground : c.cardBorder,
          }]}>
          <Text style={{fontSize: 12, fontWeight: '600', color: period === option.id ? c.buttonText : c.textPrimary}}>{option.label}</Text>
        </Pressable>)}
        <Pressable accessibilityRole="button" accessibilityLabel="Atualizar indicadores" onPress={() => setRefresh(value => value + 1)} style={[s.periodOption, {borderColor: c.cardBorder, backgroundColor: c.cardBackground}]}>
          {icon('refresh-cw', c.textPrimary, 16)}
        </Pressable>
      </View>
    </View>
    <View style={s.metrics}>{cards.map(([label, value, help, glyph, tone, scope, error, allowed, money, destination]) => <View key={label}
      style={[s.metricSlot, {width: `${100 / columns}%`}]}>
      <Pressable accessibilityRole={destination ? "button" : undefined} accessibilityLabel={destination ? `Abrir ${label}` : undefined} disabled={!destination} onPress={() => go(destination)} style={[s.metric, width <= 760 && s.metricMobile, {backgroundColor: c.cardBackground, borderColor: c.cardBorder}]}>
      <View style={s.between}><Text style={[s.label, {color: c.textSecondary}]}>{label}</Text>
        <View style={[s.puck, {backgroundColor: c.cardIconBackground}]}>{icon(glyph, tone || c.buttonBackground)}</View></View>
      <Text numberOfLines={2} style={[s.value, width <= 760 && {fontSize: 20}, {color: c.textPrimary}]}>{error || !allowed || value === null ? '—' : value === undefined ? '…' : money ? Formatter.formatMoney(value) : Number(value).toLocaleString('pt-BR')}</Text>
      <Text style={[s.help, {color: c.textMuted}]}>{help}</Text>
      <Text style={[s.scope, {color: c.textSecondary}]}>{scope}</Text>
      <Text style={[s.help, {color: c.textMuted}]}>{!companyId ? 'Selecione uma empresa' : !allowed ? 'Sem acesso neste perfil' : error || (value === undefined ? 'Carregando…' : 'Dados da API')}</Text>
      </Pressable>
    </View>)}</View>
    {results && <Pressable accessibilityRole="button" accessibilityLabel="Resultados" onPress={() => go(results)} style={[s.results, {backgroundColor: c.cardBackground, borderColor: c.cardBorder}]}><View style={{flex: 1}}><Text style={[s.panelTitle, {color: c.textPrimary}]}>Resultados</Text><Text style={[s.sub, {color: c.textSecondary}]}>Resumo dos resultados</Text></View>{icon('arrow-right', c.textPrimary)}</Pressable>}
    <View style={[s.panels, width <= 1060 && {flexDirection: 'column'}]}>
      <View style={[s.panel, {backgroundColor: c.cardBackground, borderColor: c.cardBorder}]}>
        <Text style={[s.panelTitle, {color: c.textPrimary}]}>Movimento de pedidos</Text>
        <Text style={[s.sub, {color: c.textSecondary}]}>Período selecionado: {selectedPeriod.label}.</Text>
        {!companyId || !canReadOrders || live.salesError || !Array.isArray(live.series) || !live.series.length ?
          <View style={[s.pending, {backgroundColor: c.cardIconBackground}]}>
            {icon('bar-chart-2', c.textMuted, 34)}
            <Text style={[s.sub, {color: c.textMuted, textAlign: 'center'}]}>{!companyId ? 'Selecione uma empresa' : !canReadOrders ? 'Sem acesso neste perfil' : live.salesError || (live.series === undefined ? 'Carregando movimento…' : live.series === null ? 'A API não retornou a série do período.' : 'Nenhuma venda concluída no período.')}</Text>
          </View> : <ManagerOrdersTrend
            title="Pedidos de venda concluídos"
            subtitle={period === 'all' ? 'Por mês · todo o período · data do pedido' : 'Por dia · data do pedido'}
            items={live.series}
            accentColor={c.buttonBackground}
            ppcColors={{cardBg: c.cardBackground, panelBg: c.cardIconBackground, borderSoft: c.cardBorder, textPrimary: c.textPrimary, textSecondary: c.textSecondary}}
            style={{marginTop: 18}}
          />}

      </View>
      <View style={[s.panel, {backgroundColor: c.cardBackground, borderColor: c.cardBorder}]}>
        <Text style={[s.panelTitle, {color: c.textPrimary}]}>Acesso rápido</Text>
        <Text style={[s.sub, {color: c.textSecondary}]}>Suas ferramentas de gestão e configuração.</Text>
        <View style={s.quick}>{(quick.length ? quick : items.slice(0, 6)).map((item, i) => <Pressable key={item.id || i}
          accessibilityRole="button" onPress={() => go(item)} style={({hovered}) => [s.quickItem,
            {borderColor: c.cardBorder, backgroundColor: hovered ? c.navigationActiveBackground : c.cardIconBackground}]}>
          {icon(item.icon)}<Text style={{color: c.textPrimary, fontWeight: '600', fontSize: 12, flex: 1}}>{item.title}</Text>{icon('chevron-right', c.textMuted, 14)}
        </Pressable>)}</View>
      </View>
    </View>
    <Text style={[s.panelTitle, {color: c.textPrimary, marginBottom: 16}]}>Explore seus módulos</Text>
    <View style={s.modules}>{groups.map((group, i) => <View key={group.id || i} style={[s.module, {backgroundColor: c.cardBackground, borderColor: c.cardBorder}]}>
      <Text style={[s.panelTitle, {color: c.textPrimary}]}>{group.title}</Text>
      {group.items.map((item, j) => <Pressable key={item.id || j} accessibilityRole="button" onPress={() => go(item)} style={s.moduleItem}>
        {icon(item.icon, c.textMuted, 16)}<Text style={{color: c.textPrimary, fontSize: 12, flex: 1}}>{item.title}</Text>{icon('chevron-right', c.textMuted, 14)}
      </Pressable>)}
    </View>)}</View>
  </ScrollView>;
}

const s = StyleSheet.create({
  page: {paddingTop: 24, paddingBottom: 24, maxWidth: 1650, width: '100%', alignSelf: 'center'},
  hero: {flexDirection: 'row', gap: 16, alignItems: 'flex-start', marginBottom: 24},
  title: {fontSize: 24, lineHeight: 32, fontWeight: '700'},
  sub: {fontSize: 12, lineHeight: 19, marginTop: 8}, actions: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  button: {minHeight: 44, paddingHorizontal: 14, borderWidth: 1, borderRadius: 10, flexDirection: 'row', gap: 8, alignItems: 'center'},
  periodBar: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16},
  periodBarMobile: {flexDirection: 'column', alignItems: 'stretch', gap: 8},
  periodLabel: {fontSize: 12, fontWeight: '600', flexShrink: 0},
  periodOptions: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  periodOption: {minHeight: 44, paddingHorizontal: 12, borderWidth: 1, borderRadius: 10, justifyContent: 'center'},
  scope: {fontSize: 10, fontWeight: '600', marginTop: 10},
  metrics: {flexDirection: 'row', flexWrap: 'wrap', rowGap: 14, marginHorizontal: -7, marginBottom: 22},
  metricSlot: {paddingHorizontal: 7},
  metric: {flex: 1, borderWidth: 1, borderRadius: 16, minHeight: 150, padding: 20},
  metricMobile: {padding: 12},
  between: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8},
  label: {fontSize: 12, fontWeight: '600', flex: 1}, puck: {width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  value: {fontSize: 23, fontWeight: '700', marginTop: 15}, help: {fontSize: 11, marginTop: 7},
  results: {borderWidth: 1, borderRadius: 14, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22},
  panels: {flexDirection: 'row', gap: 18, marginBottom: 26}, panel: {flex: 1, borderWidth: 1, borderRadius: 16, padding: 20},
  panelTitle: {fontSize: 15, fontWeight: '700'}, pending: {marginTop: 20, minHeight: 210, borderRadius: 12, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 12},
  quick: {marginTop: 18, gap: 10}, quickItem: {flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 12, padding: 16},
  modules: {flexDirection: 'row', flexWrap: 'wrap', gap: 16}, module: {flexGrow: 1, flexBasis: 280, borderRadius: 16, borderWidth: 1, padding: 20},
  moduleItem: {flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 13},
});
