import {env} from '@env';
import {readSession} from './sessionScope';
export const readStoredSessionToken = storage => {
  const session=readSession(env,storage);
  return session?.token || session?.api_key || '';
};
