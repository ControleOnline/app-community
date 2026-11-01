const titles = {
  ClientsIndex: 'Clientes', ProvidersIndex: 'Fornecedores', FranchiseesIndex: 'Franquias',
  EmployeesIndex: 'Colaboradores', MyCompaniesPage: 'Minhas empresas',
  DevicesIndex: 'Dispositivos', ConfiguratorPage: 'Configurações', IncomeStatement: 'Resultados',
  PdvPage: 'PDV', LinkedOrderSettlementPage: 'Mesas e comandas',
};

export const resolveManagementPageTitle = (route, options = {}) => {
  if (titles[route.name]) return titles[route.name];
  if (route.name === 'OrderHistoryPage') {
    const type = route.params?.orderTypeFilter || route.params?.orderType;
    if (type === 'sale') return 'Pedidos de venda';
    if (type === 'purchase') return 'Pedidos de compra';
  }
  // Product contexts and record/finance titles belong to their existing page.
  return typeof options.headerTitle === 'string' ? options.headerTitle : options.title;
};
