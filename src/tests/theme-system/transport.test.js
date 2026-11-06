import fetchScoped from '../../session/ScopedApiFetch';
import original from '@theme-original/ui-common/fetch';
import {env} from '@env';
import {storeSession,readSession} from '../../session/sessionScope';
jest.mock('@theme-original/ui-common/fetch',()=>jest.fn());
test('public theme and login omit stale credentials; protected routes preserve authentication',async()=>{
  original.mockResolvedValue('ok');
  const options={headers:new Headers({'API-TOKEN':'synthetic'}),responseType:'text'};
  await fetchScoped('themes-colors.css',options);expect(original.mock.calls.at(-1)[1].headers.has('API-TOKEN')).toBe(false);
  await fetchScoped('http://localhost:8081/__manager_api__/token',options);expect(original.mock.calls.at(-1)[1].headers.has('API-TOKEN')).toBe(false);
  await fetchScoped('orders/token',options);expect(original.mock.calls.at(-1)[1].headers.get('API-TOKEN')).toBe('synthetic');
  expect(options.headers.get('API-TOKEN')).toBe('synthetic');
});
test('a protected 401 invalidates matching credentials; a forbidden operation does not',async()=>{
  const user={api_key:'synthetic'};storeSession(user,env);
  original.mockRejectedValue({status:403});await fetchScoped('themes/1',{headers:{'API-TOKEN':'synthetic'}}).catch(()=>{});expect(readSession(env)).toEqual(user);
  original.mockRejectedValue({status:401});await fetchScoped('themes/1',{headers:{'API-TOKEN':'synthetic'}}).catch(()=>{});expect(readSession(env)).toBeNull();
});
