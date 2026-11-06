import original from '@theme-original/ui-login/mutations';
import * as types from '@theme-original/ui-login/mutation-types';
import {env} from '@env';
import {storeSession} from './sessionScope';
export default {...original,[types.LOGIN_SET_USER](state,user){
  storeSession(user,env);
  return original[types.LOGIN_SET_USER](state,user);
}};
