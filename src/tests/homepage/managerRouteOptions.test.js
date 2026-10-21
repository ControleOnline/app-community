import {managerRouteOptions} from '../../components/manager-preview/managerRouteOptions';
it('uses the shared preview header on adapted lists but preserves native detail actions',()=>{
  const options={headerShown:true,headerRight:()=>null,title:'Original'};
  expect(managerRouteOptions('ClientsIndex',options,true)).toEqual({...options,headerShown:false});
  expect(managerRouteOptions('EmployeesIndex',options,true).headerShown).toBe(false);
  expect(managerRouteOptions('MyCompaniesPage',options,true).headerShown).toBe(false);
  expect(managerRouteOptions('MyCompaniesPage',options,false)).toBe(options);
  expect(managerRouteOptions('MyCompanyDetails',options,true)).toBe(options);
  expect(managerRouteOptions('PdvPage',options,true).headerShown).toBe(false);
  expect(managerRouteOptions('DevicesIndex',options,true).headerShown).toBe(false);
  expect(managerRouteOptions('DevicesIndex',options,false)).toBe(options);
  expect(managerRouteOptions('IncomeStatement',options,true).headerShown).toBe(false);
  expect(managerRouteOptions('IncomeStatement',options,false)).toBe(options);
  expect(managerRouteOptions('ConfiguratorPage',options,true).headerShown).toBe(false);
  expect(managerRouteOptions('ConfiguratorPage',options,false)).toBe(options);
  expect(managerRouteOptions('GeneralSettings',options,true)).toBe(options);
  expect(managerRouteOptions('DeviceDetails',options,true)).toBe(options);
  expect(managerRouteOptions('ClientsIndex',options,false)).toBe(options);
});
