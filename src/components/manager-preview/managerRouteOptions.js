// These pages already expose their primary actions inside the shared preview shell.
// Other routes retain their native header/back actions until explicitly adapted.
const adapted = new Set(['HomePage','ProductsPage','ClientsIndex','ProvidersIndex','FranchiseesIndex','EmployeesIndex','MyCompaniesPage','OrderHistoryPage','PdvPage','DevicesIndex','IncomeStatement','ConfiguratorPage']);
export const managerRouteOptions = (name, options, enabled) =>
  enabled && adapted.has(name) ? {...options, headerShown:false} : options;
