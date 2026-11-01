import {resolveManagementPageTitle} from '../../components/manager-preview/managementPageTitle';
it('uses the page name independently from the employees filter',()=>{
 const route={name:'EmployeesIndex',params:{context:'all'}};
 expect(resolveManagementPageTitle(route,{headerTitle:'All'})).toBe('Colaboradores');
 expect(route.params.context).toBe('all');
});
it('preserves financial sections, record identifiers and product contexts',()=>{
 expect(resolveManagementPageTitle({name:'FinancialHubPage'},{headerTitle:'Contas a pagar',title:'Financeiro'})).toBe('Contas a pagar');
 expect(resolveManagementPageTitle({name:'OrderDetails'},{title:'Pedido 42'})).toBe('Pedido 42');
 expect(resolveManagementPageTitle({name:'ProductsPage',params:{context:'supplies'}},{title:'Insumos'})).toBe('Insumos');
});
it('distinguishes purchase and sale lists',()=>{
 expect(resolveManagementPageTitle({name:'OrderHistoryPage',params:{orderTypeFilter:'purchase'}},{title:'Pedidos'})).toBe('Pedidos de compra');
});
