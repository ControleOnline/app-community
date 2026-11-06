import originalFetch from '@theme-original/ui-common/fetch';
import {env} from '@env';
import {rejectSession} from './sessionScope';

export default function scopedApiFetch(resource,options={}) {
  const headers=new Headers(options.headers);
  const base=new URL(env.API_ENTRYPOINT);
  const requested=new URL(resource,base.href.endsWith('/')?base.href:base.href+'/');
  let route=requested.pathname.replace(/^\/__manager_api__\//,'/');
  const prefix=base.pathname.replace(/\/$/,'');
  if(prefix && route.startsWith(prefix+'/'))route=route.slice(prefix.length);
  const publicTheme=route==='/themes-colors.css';
  const login=route==='/token';
  if(publicTheme || login || options.skipSession)headers.delete('API-TOKEN');
  const token=headers.get('API-TOKEN');
  return originalFetch(resource,{...options,headers}).catch(error=>{
    if((error?.status===401 || error?.code===401) && token && !login)rejectSession(token,env);
    throw error;
  });
}
