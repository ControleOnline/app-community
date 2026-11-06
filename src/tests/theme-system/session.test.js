import {env} from '@env';
import {readSession,storeSession,rejectSession,scopeFor} from '../../session/sessionScope';
import mutations from '../../session/scopedAuthMutations';
import * as types from '../../../node_modules/@controleonline/ui-login/src/store/modules/auth/mutation_types';
import {restoreSession} from '../../session/scopedAuthActions';
jest.mock('@controleonline/ui-common/src/api',()=>({api:{fetch:jest.fn()}}));
const user={id:1,people:1,active:1,api_key:'synthetic-a'};
test('a session is scoped to the API and domain and is not reused after changing either',()=>{
  storeSession(user,env);expect(readSession(env)).toEqual(user);
  expect(readSession({...env,DOMAIN:'http://other.test'})).toBeNull();
  expect(localStorage.getItem('session')).toBeNull();
  storeSession(user,env);expect(readSession({...env,API_ENTRYPOINT:'http://localhost:8002'})).toBeNull();
});
test('a legacy unscoped credential requires a fresh login',()=>{
  localStorage.setItem('session',JSON.stringify(user));expect(readSession(env)).toBeNull();
});
test('late 401 for an old token cannot log out a newer login',()=>{
  storeSession(user,env);storeSession({...user,api_key:'synthetic-b'},env);
  rejectSession('synthetic-a',env);expect(readSession(env).api_key).toBe('synthetic-b');
  rejectSession('synthetic-b',env);expect(readSession(env)).toBeNull();
});
test('the existing login mutation binds scope without changing user or roles',()=>{
  const state={};mutations[types.LOGIN_SET_USER](state,user);
  expect(state.user).toEqual(user);expect(readSession(env)).toEqual(user);expect(state.isLogged).toBe(true);
  mutations[types.LOGIN_SET_USER](state,null);expect(readSession(env)).toBeNull();
});
test('startup restore clears an unscoped session without sending its token',async()=>{
  const {api}=require('@controleonline/ui-common/src/api');api.fetch.mockClear();
  localStorage.setItem('session',JSON.stringify(user));const commit=jest.fn();
  expect(await restoreSession({commit})).toBeNull();expect(api.fetch).not.toHaveBeenCalled();
  expect(commit).toHaveBeenCalledWith(types.LOGIN_SET_IS_LOGGED,false);
});
test('scope normalizes trailing slashes without incorporating credentials',()=>{
  expect(scopeFor({...env,API_ENTRYPOINT:'http://a:b@localhost:8000/'})).toBe(scopeFor(env));
});
