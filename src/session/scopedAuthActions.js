export * from '@theme-original/ui-login/actions';
import * as original from '@theme-original/ui-login/actions';
import * as types from '@theme-original/ui-login/mutation-types';
import {env} from '@env';
import {readSession} from './sessionScope';
export function restoreSession(context) {
  const session=readSession(env);
  if(session){
    // Normalize the existing Quasar serialization before the module's shape validation.
    localStorage.setItem('session',JSON.stringify(session));
    return original.restoreSession(context);
  }
  context.commit(types.LOGIN_SET_USER,null);
  context.commit(types.LOGIN_SET_IS_LOGGED,false);
  context.commit(types.LOGIN_SET_SESSION_CHECKED,true);
  return Promise.resolve(null);
}
