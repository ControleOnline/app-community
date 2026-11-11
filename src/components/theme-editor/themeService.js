import {api} from '@controleonline/ui-common/src/api';
import {resolveAppDomain} from '@controleonline/ui-common/src/utils/appDomain';
import {env} from '@env';
import {scopeFor,sessionVersion} from '../../session/sessionScope';
import {registerActiveTheme,refreshDomainTheme} from '../../styles/themeRuntime';
import {stripScreenThemeKeys} from '../../styles/stripScreenThemeKeys';
import {initializeGlobalChromeColors} from '../../styles/globalChromeTheme';

const idOf = value => String(value?.id || value?.['@id'] || value || '').split('/').pop();
let pending = null;
let pendingKey = '';
export const editorContext = () => `${scopeFor(env)}|${sessionVersion()}`;
export async function loadDomainBinding() {
  const key = editorContext();
  const domain = resolveAppDomain(env.DOMAIN);
  let binding;
  try {
    const result = await api.fetch('theme-management/domain', {params: {domain}});
    binding = result?.domain || null;
  } catch (error) {
    if ((error?.status ?? error?.code) !== 404 || !domain || key !== editorContext()) throw error;
    // Older APIs expose the link through the authenticated domain collection.
    const result = await api.fetch('people_domains', {params: {domain, itemsPerPage:50}});
    const rows = result?.['hydra:member'] || result?.member || result?.response?.data || result?.data || result;
    const matches = Array.isArray(rows) ? rows.filter(item => item?.domain === domain) : [];
    const view = result?.['hydra:view'] || result?.view;
    const entry = matches.length === 1 && !view?.['hydra:next'] && !view?.next ? matches[0] : null;
    const themeId = idOf(entry?.theme);
    binding = entry ? {domain, themeId: /^\d+$/.test(themeId) ? themeId : null, canApply:false} : null;
  }
  if (key !== editorContext()) throw new Error('O contexto mudou. Abra o editor novamente.');
  return binding;
}
export async function loadDomainTheme(binding) {
  const context = editorContext();
  const entry = binding || await loadDomainBinding();
  const id = idOf(entry?.themeId);
  if (!id) throw new Error('O domínio atual não possui um tema acessível para edição.');
  if (context !== editorContext()) throw new Error('O contexto mudou. Abra o editor novamente.');
  const key = JSON.stringify([context, id]);
  if (pending && key === pendingKey) return pending;

  pendingKey = key;
  const request = api.fetch(`themes/${id}`).then(theme => {
    if (context !== editorContext() || pending !== request) {
      throw new Error('O contexto ou o tema mudou. Abra o editor novamente.');
    }
    registerActiveTheme(id, scopeFor(env));
    // Never surface per-screen overrides to the editor or runtime consumers.
    const colors = initializeGlobalChromeColors(stripScreenThemeKeys(theme.colors || {}));
    return {...theme, id: theme.id || id, colors};
  }).finally(() => {
    if (pending === request) pending = null;
  });
  pending = request;
  return request;
}
export async function saveThemeChanges(theme,changes,context) {
  if(context!==editorContext())throw new Error('A sessão ou o domínio mudou. Abra o editor novamente.');
  const latest=await api.fetch(`themes/${idOf(theme)}`);
  if(context!==editorContext())throw new Error('A sessão ou o domínio mudou. Abra o editor novamente.');
  const latestColors = initializeGlobalChromeColors(stripScreenThemeKeys(latest.colors || {}));
  const themeColors = initializeGlobalChromeColors(stripScreenThemeKeys(theme.colors || {}));
  for(const key of Object.keys(changes)) {
    if((latestColors[key] ?? '')!==(themeColors[key] ?? ''))throw new Error(`A cor ${key} foi alterada. Reabra o editor para atualizar.`);
  }
  // Preserve stored keys outside this edit, including legacy screen overrides.
  const body={theme:latest.theme,colors:{...latest.colors,...latestColors,...stripScreenThemeKeys(changes)}};
  for(const field of ['background','logo','icon','pin']) {
    if(Object.hasOwn(latest,field))body[field]=latest[field] && typeof latest[field]==='object'?Number(idOf(latest[field])):latest[field];
  }
  const result=await api.fetch(`themes/${idOf(theme)}`,{method:'PUT',body});
  if(context!==editorContext())throw new Error('O contexto mudou durante a gravação. Recarregue o tema.');
  refreshDomainTheme();
  return {...latest,...result,colors:stripScreenThemeKeys(result?.colors || body.colors)};
}

/** Persist layout flags on the domain theme (not device/account preference). */
export async function saveThemeLayoutFlags(flags = {}) {
  const context = editorContext();
  const theme = await loadDomainTheme();
  const changes = {};
  if (Object.hasOwn(flags, 'showLeftMenu')) {
    changes.showLeftMenu = flags.showLeftMenu ? 'true' : 'false';
  }
  if (Object.hasOwn(flags, 'showModulesAsIcons')) {
    changes.homeModulesLayout = flags.showModulesAsIcons ? 'buttons' : 'list';
  }
  if (Object.hasOwn(flags, 'useModuleColors')) {
    changes.useModuleColors = flags.useModuleColors ? 'true' : 'false';
  }
  if (!Object.keys(changes).length) return theme;
  return saveThemeChanges(theme, changes, context);
}
