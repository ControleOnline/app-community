import {managerRouteOptions} from '../../components/manager-preview/managerRouteOptions';
jest.mock('@appType',()=>({app_type:'MANAGER'}));
it.each(['LinkedOrderSettlementPage','FinancialHubPage','MyCompanyDetails','GeneralSettings','ProductDetails','DevicesIndex','HomePage'])('hides the native strip for modern private route %s',name=>{
 const options={headerShown:true,title:'Original',headerRight:()=>null};
 expect(managerRouteOptions(name,options,true)).toEqual({...options,headerShown:false});
 expect(managerRouteOptions(name,options,false)).toBe(options);
});
it.each(['SignInPage','ShopCheckoutPage','PaylistPage'])('preserves navigation outside management: %s',name=>{
 const options={headerShown:true};expect(managerRouteOptions(name,options,true)).toBe(options);
});
