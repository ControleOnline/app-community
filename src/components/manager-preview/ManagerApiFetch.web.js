import originalFetch from '../../../node_modules/@controleonline/ui-common/src/api/fetch';
import {env} from '@env';
import {managerPreviewEnabled} from './model';
import resolvePreviewApiUrl from '../../../scripts/lib/manager-api-url.cjs';
import {readWithTransientRetry} from '../../../scripts/lib/manager-read-transport.cjs';

// Keep canonical ERP headers, parsing and errors; only local preview routing changes.
export default function managerApiFetch(resource, options) {
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const target = resolvePreviewApiUrl(resource, env.API_ENTRYPOINT, origin, managerPreviewEnabled);
  const request = () => originalFetch(target, options);
  if (!managerPreviewEnabled || !target.startsWith(origin + '/__manager_api__/')) return request();
  const session = localStorage.getItem('session');
  return readWithTransientRetry(request, options, {canRetry: () => session === localStorage.getItem('session')});
}
