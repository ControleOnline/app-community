import {useEffect, useSyncExternalStore} from 'react';
import {useStore} from '@store';
import {subscribeSession, sessionVersion, sessionRejection} from './sessionScope';

export default function useSessionVersion() {
  const version = useSyncExternalStore(subscribeSession, sessionVersion, sessionVersion);
  const auth = useStore('auth');
  useEffect(() => {
    if (sessionRejection() && auth.getters.isLogged) auth.actions.logIn(null);
  }, [version, auth.getters.isLogged, auth.actions]);
  return version;
}
