import {api} from '@controleonline/ui-common/src/api';
import {resolveAppDomain} from '@controleonline/ui-common/src/utils/appDomain';
import {env} from '@env';
import {scopeFor,sessionVersion} from '../../session/sessionScope';
import {registerActiveTheme,refreshDomainTheme} from '../../styles/themeRuntime';

const idOf = value => String(value?.id || value?.['@id'] || value || '').split('/').pop();
const itemsOf = result => result?.['hydra:member'] || result?.member || result?.response?.data || result?.data || result || [];
let pending = null;
let pendingKey = '';
export const editorContext = () => `${scopeFor(env)}|${sessionVersion()}`;
export function loadDomainTheme() {
  const key=editorContext();
  if(pending && key===pendingKey)return pending;
  pendingKey=key;
  pending=(async()=>{
    const domain=resolveAppDomain(env.DOMAIN);
    const response=await api.fetch('people_domains',{params:{domain,itemsPerPage:50}});
    const list=itemsOf(response);
    const entry=Array.isArray(list)?list.find(item=>item.domain===domain):null;
    const id=idOf(entry?.theme);
    if(!id)throw new Error('O domínio atual não possui um tema acessível para edição.');
    const theme=await api.fetch(`themes/${id}`);
    if(key!==editorContext())throw new Error('O contexto mudou. Abra o editor novamente.');
    registerActiveTheme(id,scopeFor(env));
    return {...theme,id:theme.id || id,colors:theme.colors || {}};
  })().finally(()=>{if(pendingKey===key)pending=null;});
  return pending;
}
export async function saveThemeChanges(theme,changes,context) {
  if(context!==editorContext())throw new Error('A sessão ou o domínio mudou. Abra o editor novamente.');
  const latest=await api.fetch(`themes/${idOf(theme)}`);
  if(context!==editorContext())throw new Error('A sessão ou o domínio mudou. Abra o editor novamente.');
  for(const key of Object.keys(changes)) {
    if((latest.colors?.[key] ?? '')!==(theme.colors?.[key] ?? ''))throw new Error(`A cor ${key} foi alterada. Reabra o editor para atualizar.`);
  }
  const body={theme:latest.theme,colors:{...(latest.colors || {}),...changes}};
  for(const field of ['background','logo','icon','pin']) {
    if(Object.hasOwn(latest,field))body[field]=latest[field] && typeof latest[field]==='object'?Number(idOf(latest[field])):latest[field];
  }
  const result=await api.fetch(`themes/${idOf(theme)}`,{method:'PUT',body});
  if(context!==editorContext())throw new Error('O contexto mudou durante a gravação. Recarregue o tema.');
  refreshDomainTheme();
  return {...latest,...result,colors:result?.colors || body.colors};
}
