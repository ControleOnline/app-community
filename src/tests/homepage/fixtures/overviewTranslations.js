const texts={
 'period.today':'Hoje','period.last_7_days':'Últimos 7 dias','period.all_time':'Todo o período',
 'period_suffix.today':'hoje','period_suffix.last_7_days':'nos últimos 7 dias','period_suffix.all_time':'em todo o período',
 'metric.closed_sales':'Vendas concluídas','metric.orders':'Pedidos','metric.in_progress':'Em andamento','metric.clients':'Clientes',
 'error.load_orders':'Não foi possível carregar os pedidos.','error.load_open_orders':'Não foi possível carregar os pedidos abertos.',
 'error.load_sales':'Não foi possível carregar as vendas.','error.sales_summary_missing':'Resumo indisponível.',
 'message.no_sales_in_period':'Nenhuma venda concluída no período.','message.series_unavailable':'A API não retornou a série do período.',
 'message.waiting_menus':'Aguardando os menus disponíveis para seu perfil.',
 'label.period':'Período','button_title.results':'Resultados'
};

export const overviewTranslation=(_store,type,key)=>texts[`${type}.${key}`];
