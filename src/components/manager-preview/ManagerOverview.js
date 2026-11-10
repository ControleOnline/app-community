import {homeMetricColors, homeResultsColors} from '../../styles/homeMetricAppearance';
import React, {useEffect, useMemo, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {useStore} from '@store';
import HomeIcon from '../HomeIcon';
import {managerMenu} from './model';
import {resolveModuleAccent, moduleAccentSource, moduleListAppearance} from './moduleAccent';
import {useManagerPreview} from './ManagerPreviewProvider';
import {buildDateRangeWindow, buildOperationalInsightsFilters} from '@controleonline/ui-report/src/react/utils/reportInsights';
import {resolveHistorySalesTotals} from '@controleonline/ui-orders/src/react/pages/orders/orderHistoryCompactSummary';
import ManagerOrdersTrend from './ManagerOrdersTrend';
import {groupPaidOrdersSeries, mapSummarySeries} from './groupPaidOrdersSeries';
import ManagerStartup from './ManagerStartup';
import {CONTROL_HEIGHT} from './controlHeight';
import Formatter from '@controleonline/ui-common/src/utils/formatter';
import {api} from '@controleonline/ui-common/src/api';
import {readCollection} from '../../experience/collections';
import {getAvatarDisplayName} from '@controleonline/ui-common/src/react/utils/userAvatar';

export default function ManagerOverview({navigation}) {
  const {width} = useWindowDimensions();
  const {colors: c, experience, moduleIcons, moduleAccent, moduleAccentPalette} = useManagerPreview();
  const showModuleIcons = moduleIcons?.value === true;
  const people = useStore('people');
  const {currentCompany} = people.getters;
  const {user} = useStore('auth').getters;
  const translateStore = useStore('translate');
  const translateMessages = translateStore?.getters?.messages || {};
  const pendingTranslateMessages = translateStore?.getters?.pendingMessages || {};
  const t = useMemo(() => global.t?.t, [translateMessages, pendingTranslateMessages]);
  const firstName =
    getAvatarDisplayName(user).split(' ')[0] ||
    t?.('configs', 'label', 'user') ||
    t?.('menu', 'menu', 'user');
  const focused = useIsFocused();
  const companyId = currentCompany?.id;
  const [period, setPeriod] = useState('today');
  const periods = useMemo(
    () => [
      {
        id: 'today',
        label: t?.('configs', 'period', 'today') || t?.('configs', 'label', 'today'),
        suffix: t?.('configs', 'period_suffix', 'today'),
      },
      {
        id: 'week',
        label: t?.('configs', 'period', 'last_7_days') || t?.('configs', 'label', 'last_7_days'),
        suffix: t?.('configs', 'period_suffix', 'last_7_days'),
      },
      {
        id: 'all',
        label: t?.('configs', 'period', 'all_time') || t?.('configs', 'label', 'all_time'),
        suffix: t?.('configs', 'period_suffix', 'all_time'),
      },
    ],
    [t, translateMessages, pendingTranslateMessages],
  );
  const selectedPeriod = periods.find(option => option.id === period) || periods[0];
  const {menus} = useStore('theme').getters;
  // Every destination comes from the real runtime menu, never a demo capability.
  const groups = useMemo(
    () => managerMenu(menus, navigation.getState().routeNames, t),
    [menus, navigation, t, translateMessages, pendingTranslateMessages],
  );
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
        .then(async result => {
          const totals = resolveHistorySalesTotals(result.summary);
          const summary = result.summary?.sales?.sales || result.summary?.sales;
          const rawSeries = period === 'all' ? summary?.monthly : summary?.daily;
          let series = mapSummarySeries(rawSeries);
          const pageSize = 200;
          // Only use the fallback when one page can cover the entire period.
          if ((!series || !series.length) && !cancelled && result.totalItems > 0 && result.totalItems <= pageSize) {
            try {
              const paidPage = await api.fetch('orders', {params: {
                ...query,
                itemsPerPage: pageSize,
                page: 1,
                'order[id]': 'DESC',
              }});
              const orders = paidPage?.member ?? paidPage?.['hydra:member'] ?? paidPage?.items;
              const total = paidPage?.totalItems ?? paidPage?.['hydra:totalItems'] ?? result.totalItems;
              if (Array.isArray(orders) && orders.length >= Number(total)) {
                series = groupPaidOrdersSeries(orders, {
                  from: range.after,
                  to: range.before,
                  longPeriodDays: period === 'all' ? 0 : 60,
                });
              }
            } catch (_) {
              // Keep the API series state if the fallback cannot be loaded.
            }
          }
          publish({series: series && series.length ? series : (Array.isArray(rawSeries) ? [] : null), sales: totals?.revenue ?? null,
            salesError: totals ? '' : t?.('configs', 'error', 'sales_summary_missing')});
        }).catch(() => publish({salesError: t?.('configs', 'error', 'load_sales')}));
      // Match the existing homepage: orders include every order type.
      const {orderType, ...allOrdersQuery} = query;
      readCollection(api, 'orders', {...allOrdersQuery, itemsPerPage: 1, page: 1})
        .then(result => publish({count: result.totalItems}))
        .catch(() => publish({periodError: t?.('configs', 'error', 'load_orders')}));
      readCollection(api, 'orders', {provider: query.provider, orderType: 'sale', 'status.realStatus': 'open', itemsPerPage: 1, page: 1})
        .then(result => publish({open: result.totalItems}))
        .catch(() => publish({openError: t?.('configs', 'error', 'load_open_orders')}));
    }
    if (canReadClients) {
      // Reuse the legacy homepage's client relation without replacing the people list.
      readCollection(api, 'people', {'link.company': `/people/${companyId}`, 'link.linkType': 'client', itemsPerPage: 1, page: 1})
        .then(result => publish({clients: result.totalItems}))
        .catch(() => publish({clientsError: t?.('configs', 'error', 'load_clients')}));
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
  const icon = (name, color = c.cardIconColor, size = 19) => <HomeIcon name={name || 'grid'} size={size} color={color} />;
  const go = item => {experience?.begin(item.name, 'click'); navigation.navigate(item.name, item.params);};
  const button = (item, primary = false) => item && <Pressable accessibilityRole="button" onPress={() => go(item)}
    style={[s.button, {backgroundColor: primary ? c.buttonBackground : c.buttonBackgroundSecondary, borderColor: primary ? c.buttonBorder : c.buttonBorderSecondary}]}>
    {icon(primary ? 'arrow-right' : item.icon, primary ? c.buttonIcon : c.buttonIconSecondary, 16)}
    <Text style={{color: primary ? c.buttonText : c.buttonTextSecondary, fontSize: 12, fontWeight: '600'}}>{item.title}</Text>
  </Pressable>;
  const resultsColors = homeResultsColors(c);
  const cards = [
    [
      [t?.('configs', 'metric', 'closed_sales'), selectedPeriod.suffix].filter(Boolean).join(' '),
      live.sales,
      t?.('configs', 'metric_hint', 'closed_sales_by_order_date'),
      'credit-card',
      selectedPeriod.label,
      live.salesError,
      canReadOrders,
      true,
      history,
      'closed-sales',
    ],
    [
      [t?.('configs', 'metric', 'orders'), selectedPeriod.suffix].filter(Boolean).join(' '),
      live.count,
      t?.('configs', 'metric_hint', 'all_types_by_order_date'),
      'file-text',
      selectedPeriod.label,
      live.periodError,
      canReadOrders,
      false,
      history,
      'period-orders',
    ],
    [
      t?.('configs', 'metric', 'in_progress'),
      live.open,
      t?.('configs', 'metric_hint', 'open_sale_orders'),
      'clock',
      t?.('configs', 'metric_footer', 'current_status'),
      live.openError,
      canReadOrders,
      false,
      history,
      'open-orders',
    ],
    [
      t?.('configs', 'metric', 'clients') || t?.('menu', 'menu', 'clients'),
      live.clients,
      t?.('configs', 'metric_hint', 'clients_linked_to_company'),
      'users',
      t?.('configs', 'metric_footer', 'total_registered'),
      live.clientsError,
      canReadClients,
      false,
      clients,
      'clients',
    ],
  ];
  // Labels may arrive after the company/theme. Queue through the existing translator
  // before hiding the incomplete presentation; keep all data hooks above this gate.
  const essentialTexts = [
    ...periods.map(option => option.label), t?.('configs','label','period'),
    t?.('configs','metric','closed_sales'), t?.('configs','metric','orders'),
    t?.('configs','metric','in_progress'), cards[3][0],
  ];
  const textsReady=essentialTexts.every(value=>typeof value==='string' && value.trim());
  const [translationAttempt,setTranslationAttempt]=useState(0);
  const [translationsSettled,setTranslationsSettled]=useState(false);
  useEffect(()=>{
    if(textsReady)return;
    let current=true;setTranslationsSettled(false);
    Promise.resolve().then(()=>global.t?.scheduleQueuedTranslateResolution?.()).catch(()=>{}).finally(()=>{if(current)setTranslationsSettled(true);});
    return()=>{current=false;};
  },[textsReady,companyId,translationAttempt]);
  if(!companyId || !items.length)return null; // Shell owns context recovery and empty-access messaging.
  if(!textsReady)return <ManagerStartup accessibilityLabel="Preparando a Home" busy={!translationsSettled}
    message={translationsSettled?'Alguns textos da Home ainda não estão disponíveis.':'Preparando os textos da Home…'}
    onRetry={translationsSettled?()=>setTranslationAttempt(value=>value+1):undefined}/>;
  return <ScrollView style={{backgroundColor: c.pageBackground}} contentContainerStyle={[s.page, {paddingHorizontal: width <= 760 ? 16 : 32}]}>
    <View style={[s.hero, width <= 760 && {flexDirection: 'column'}]}>
      <View style={{flex: 1}}><Text accessibilityRole="header" style={[s.title, {color: c.textPrimary}]}>Olá, {firstName}</Text></View>
      <View style={s.actions}>{button(main, true)}{configs !== main && button(configs)}</View>
    </View>
    <View style={[s.periodBar, width <= 760 && s.periodBarMobile]}>
      <Text style={[s.periodLabel, {color: c.textSecondary}]}>{t?.('configs', 'label', 'period')}</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={t?.('configs', 'a11y', 'metrics_period')} style={s.periodOptions}>
        {periods.map(option => <Pressable key={option.id} accessibilityRole="radio"
          accessibilityLabel={option.label} accessibilityState={{checked: period === option.id}}
          onPress={() => setPeriod(option.id)} style={[s.periodOption, {
            backgroundColor: period === option.id ? c.buttonBackground : c.buttonBackgroundSecondary,
            borderColor: period === option.id ? c.buttonBorder : c.buttonBorderSecondary,
          }]}>
          <Text style={{fontSize: 12, fontWeight: '600', color: period === option.id ? c.buttonText : c.buttonTextSecondary}}>{option.label}</Text>
        </Pressable>)}
        <Pressable accessibilityRole="button" accessibilityLabel={t?.('configs', 'a11y', 'refresh_metrics')} onPress={() => setRefresh(value => value + 1)} style={[s.periodOption, {borderColor: c.buttonBorderSecondary, backgroundColor: c.buttonBackgroundSecondary}]}>
          {icon('refresh-cw', c.textPrimary, 16)}
        </Pressable>
      </View>
    </View>
    <View style={s.metrics}>{cards.map(([label, value, help, glyph, scope, error, allowed, money, destination, id]) => {
      const metric = homeMetricColors(c, id);
      return <View key={id} testID={`manager-metric-${id}`}
      style={[s.metricSlot, {width: `${100 / columns}%`}]}>
      <Pressable dataSet={{coHomeMetric:id}} accessibilityRole={destination ? "button" : undefined} accessibilityLabel={destination ? `Abrir ${label}` : undefined} disabled={!destination} onPress={() => go(destination)} style={[s.metric, width <= 760 && s.metricMobile, {backgroundColor: metric.Background, borderColor: metric.Border}]}>
      <View style={s.between}><Text style={[s.label, {color: metric.SecondaryText}]}>{label}</Text>
        <View style={[s.puck, {backgroundColor: metric.IconBackground}]}>{icon(glyph, metric.IconColor)}</View></View>
      <Text numberOfLines={2} style={[s.value, width <= 760 && {fontSize: 20}, {color: metric.Text}]}>{error || !allowed || value === null ? '—' : value === undefined ? '…' : money ? Formatter.formatMoney(value) : Number(value).toLocaleString('pt-BR')}</Text>
      <Text style={[s.help, {color: metric.MutedText}]}>{help}</Text>
      <Text style={[s.scope, {color: metric.SecondaryText}]}>{scope}</Text>
      <Text style={[s.help, {color: metric.MutedText}]}>{!companyId ? t?.('configs', 'message', 'select_company') : !allowed ? t?.('configs', 'message', 'no_access_profile') : error || (value === undefined ? t?.('configs', 'message', 'loading') : t?.('configs', 'message', 'api_data'))}</Text>
      </Pressable>
    </View>;})}</View>
    {results && <Pressable accessibilityRole="button" accessibilityLabel={t?.('configs', 'button_title', 'results') || results?.title} onPress={() => go(results)} style={[s.results, {backgroundColor: resultsColors.Background, borderColor: resultsColors.Border}]}><View style={{flex: 1}}><Text style={[s.panelTitle, {color: resultsColors.Text}]}>{t?.('configs', 'button_title', 'results') || results?.title}</Text><Text style={[s.sub, {color: resultsColors.SecondaryText}]}>{t?.('configs', 'section_title', 'resultsDescription')}</Text></View>{icon('arrow-right', resultsColors.Text)}</Pressable>}
    <View style={[s.panels, width <= 1060 && {flexDirection: 'column'}]}>
      <View testID="manager-orders-movement" style={[s.panel, width <= 1060 && s.stackedPanel, {backgroundColor: c.panelBackground, borderColor: c.panelBorder}]}>
        <Text style={[s.panelTitle, {color: c.cardText}]}>Movimento de pedidos</Text>
        <Text style={[s.sub, {color: c.textSecondary}]}>Período selecionado: {selectedPeriod.label}.</Text>
        {!companyId || !canReadOrders || live.salesError || !Array.isArray(live.series) || !live.series.length ?
          <View style={[s.pending, {backgroundColor: c.sectionBackground}]}>
            {icon('bar-chart-2', c.textMuted, 34)}
            <Text style={[s.sub, {color: c.textMuted, textAlign: 'center'}]}>{!companyId ? t?.('configs', 'message', 'select_company') : !canReadOrders ? t?.('configs', 'message', 'no_access_profile') : live.salesError || (live.series === undefined ? t?.('configs', 'message', 'loading_movement') : live.series === null ? t?.('configs', 'message', 'series_unavailable') : t?.('configs', 'message', 'no_sales_in_period'))}</Text>
          </View> : <ManagerOrdersTrend
            title={t?.('configs', 'chart', 'completed_sale_orders')}
            subtitle={period === 'all' ? t?.('configs', 'chart', 'by_month_all_period') : t?.('configs', 'chart', 'by_day_order_date')}
            items={live.series}
            colors={c}
            style={{marginTop: 18}}
          />}

      </View>
      <View testID="manager-quick-access" style={[s.panel, width <= 1060 && s.stackedPanel, {backgroundColor: c.panelBackground, borderColor: c.panelBorder}]}>
        <Text style={[s.panelTitle, {color: c.cardText}]}>Acesso rápido</Text>
        <Text style={[s.sub, {color: c.textSecondary}]}>Suas ferramentas de gestão e configuração.</Text>
        <View style={s.quick}>{(quick.length ? quick : items.slice(0, 6)).map((item, i) => <Pressable key={item.id || i}
          accessibilityRole="button" onPress={() => go(item)} style={({hovered}) => [s.quickItem,
            {borderColor: c.listItemBorder, backgroundColor: hovered ? c.listItemActiveBackground : c.listItemBackground}]}>
          <View style={[s.quickIcon, {backgroundColor:c.iconBackground}]}>{icon(item.icon,c.listItemIcon,17)}</View><Text style={{color: c.listItemText, fontWeight: '600', fontSize: 12, flex: 1}}>{item.title}</Text>{icon('chevron-right', c.listItemIcon, 14)}
        </Pressable>)}</View>
      </View>
    </View>
    <Text style={[s.panelTitle, {color: c.textPrimary, marginBottom: 16}]}>{t?.('configs', 'section_title', 'explore_modules') || t?.('menu', 'menu', 'explore_modules')}</Text>
    <View testID="manager-explore-modules" style={[s.modules, showModuleIcons && s.moduleCards]}>
      {groups.map((group, i) => {
        // Category card follows the Categories color; each button follows its own route color (issue 1450).
        const groupAccent = moduleAccent?.value ? resolveModuleAccent(group.color, moduleAccentPalette) : undefined;
        return <View key={group.id || i}
          dataSet={{coThemeSource: moduleAccentSource(groupAccent, 'category.color', group.id, group.color)}}
          style={[s.module, showModuleIcons && s.iconModule, {backgroundColor: groupAccent ?? c.cardBackground, borderColor: c.cardBorder}]}>
          <Text style={[s.panelTitle, {color: c.cardText}]}>{group.title}</Text>
          <View testID={showModuleIcons ? 'manager-module-icon-grid' : undefined} style={showModuleIcons ? s.moduleGrid : s.moduleList}>
            {group.items.map((item, j) => {
              const accent = moduleAccent?.value ? resolveModuleAccent(item.color, moduleAccentPalette) : undefined;
              const appearance = moduleListAppearance({accent, colors: c});
              // Database colors are used as-is: no opacity applied (issue 1453).
              const accentBackground = accent;
              return <Pressable key={item.id || j} accessibilityRole="button"
              dataSet={{coThemeSource: moduleAccentSource(accent, 'routes.color', item.name, item.color)}}
              accessibilityLabel={item.title} onPress={() => go(item)}
              style={showModuleIcons ? ({hovered, pressed}) => [s.moduleTile, {
                borderColor: c.listItemBorder,
                backgroundColor: hovered || pressed
                  ? accent ?? c.listItemActiveBackground
                  : accentBackground ?? c.listItemBackground,
              }] : [s.moduleItem, accentBackground && {backgroundColor: accentBackground}]}>
              {showModuleIcons ? <>
                <View style={[s.moduleTileIcon, {backgroundColor: c.iconBackground}]}>
                  {icon(item.icon, c.listItemIcon, 22)}
                </View>
                <Text style={[s.moduleTileLabel, {color: c.listItemText}]}>{item.title}</Text>
              </> : <>
                {icon(item.icon, appearance.iconColor, 16)}
                <Text style={{color: appearance.textColor, fontSize: 12, flex: 1}}>{item.title}</Text>
                {icon('chevron-right', appearance.iconColor, 14)}
              </>}
            </Pressable>;
            })}
          </View>
        </View>;
      })}
    </View>
  </ScrollView>;
}

const s = StyleSheet.create({
  page: {paddingTop: 24, paddingBottom: 24, maxWidth: 1650, width: '100%', alignSelf: 'center'},
  hero: {flexDirection: 'row', gap: 16, alignItems: 'flex-start', marginBottom: 24},
  title: {fontSize: 24, lineHeight: 32, fontWeight: '700'},
  sub: {fontSize: 12, lineHeight: 19, marginTop: 8}, actions: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  button: {minHeight: CONTROL_HEIGHT, paddingHorizontal: 14, borderWidth: 1, borderRadius: 10, flexDirection: 'row', gap: 8, alignItems: 'center'},
  periodBar: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16},
  periodBarMobile: {flexDirection: 'column', alignItems: 'stretch', gap: 8},
  periodLabel: {fontSize: 12, fontWeight: '600', flexShrink: 0},
  periodOptions: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  periodOption: {minHeight: CONTROL_HEIGHT, paddingHorizontal: 12, borderWidth: 1, borderRadius: 10, justifyContent: 'center'},
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
  stackedPanel: {flexGrow:0,flexShrink:0,flexBasis:'auto'},
  panelTitle: {fontSize: 15, fontWeight: '700'}, pending: {marginTop: 20, minHeight: 210, borderRadius: 12, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 12},
  quickIcon: {width:24,height:24,borderRadius:7,alignItems:'center',justifyContent:'center'},
  quick: {marginTop: 18, gap: 10}, quickItem: {flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 10, minHeight: CONTROL_HEIGHT, paddingHorizontal: 12, paddingVertical: 3},
  modules: {flexDirection: 'row', flexWrap: 'wrap', gap: 16}, module: {flexGrow: 1, flexBasis: 280, borderRadius: 16, borderWidth: 1, padding: 20},
  moduleCards: {alignItems: 'flex-start'},
  iconModule: {minWidth: 0, flexShrink: 1},
  moduleGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12},
  moduleTile: {width: 104, maxWidth: '100%', minHeight: 96, padding: 8, gap: 6,
    alignItems: 'center', borderWidth: 1, borderRadius: 10},
  moduleTileIcon: {width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  moduleListIcon: {width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center'},
  moduleTileLabel: {fontSize: 12, textAlign: 'center', width: '100%'},
  // List items match the Quick access items: 32px high, 10px apart (issue 1463).
  moduleList: {marginTop: 12, gap: 10},
  moduleItem: {flexDirection: 'row', gap: 10, alignItems: 'center', minHeight: CONTROL_HEIGHT, paddingVertical: 3, paddingHorizontal: 12, borderRadius: 10},
});
