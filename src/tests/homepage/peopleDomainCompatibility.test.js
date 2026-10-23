import {mainCompany} from '@controleonline/ui-people/src/store/people/customActions';
import {resolve_app_type} from '../../appType';
import {saveAppTypeValue} from '@controleonline/ui-people/src/store/people_domains/formatters';
const mockFetch=jest.fn();
jest.mock('@controleonline/ui-common/src/api',()=>({api:{fetch:(...args)=>mockFetch(...args)}}));
it.each(['MANAGER','POS','ADMIN'])('keeps the company payload and stores canonical domain appType %s',async type=>{
 const old=global.localStorage;const values=new Map();global.localStorage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
 const company={id:3,appType:type};mockFetch.mockResolvedValue(company);const commit=jest.fn();
 try{expect(await mainCompany({commit})).toBe(company);expect(values.get('app-type')).toBe(type);expect(commit).toHaveBeenCalledWith('SET_MAIN_COMPANY',company);
 expect(resolve_app_type({DOMAIN:'https://manager.controleonline.com'})).toBe(type);
 expect(resolve_app_type({APP_TYPE:'ADMIN'})).toBe('ADMIN');
 }finally{global.localStorage=old;}
});
it('retains the single-app-type vocabulary used by domain administration',()=>{expect(saveAppTypeValue({value:'pos'})).toBe('POS');expect(saveAppTypeValue('MANAGER')).toBe('MANAGER');});


it.each(['MANAGER', 'POS', 'PPC', 'SHOP', 'DELIVERY', 'CRM', 'SERVICE'])(
 'keeps the configured %s application when a previous domain stored ADMIN', type => {
  const old = global.localStorage;
  global.localStorage = {getItem: () => 'ADMIN', setItem: jest.fn()};
  try {
   expect(resolve_app_type({APP_TYPE: type, DOMAIN: 'http://localhost:8081'})).toBe(type);
  } finally {global.localStorage = old;}
 });

it('keeps the explicit ADMIN selector separate from company bootstrap', () => {
 const old = global.localStorage;
 const values = new Map([['app-type', 'POS'], ['admin-app-type', 'MANAGER']]);
 global.localStorage = {getItem: key => values.get(key), setItem: jest.fn()};
 try {
  expect(resolve_app_type({APP_TYPE: 'ADMIN'})).toBe('MANAGER');
  values.delete('admin-app-type');
  expect(resolve_app_type({APP_TYPE: 'ADMIN'})).toBe('ADMIN');
 } finally {global.localStorage = old;}
});
