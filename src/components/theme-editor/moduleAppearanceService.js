import {api} from '@controleonline/ui-common/src/api';
import {normalizeRuntimeMenuResponse} from '@controleonline/ui-common/src/react/utils/runtimeMenu';
import {app_type} from '@appType';
import {editorContext} from './themeService';
import {resolveModuleAccent, modulePropertyColor} from '../manager-preview/moduleAccent';
import glyphs from 'react-native-vector-icons/glyphmaps/Feather.json';

export const moduleAppearanceContext = () => `${editorContext()}|${app_type}`;
const assertContext = context => {
  if (context !== moduleAppearanceContext()) throw new Error('O contexto mudou. Reabra Cores dos módulos.');
};

export function mergeModuleGroups(groups = []) {
  const result = new Map();
  for (const group of groups || []) {
    const key = String(group.id);
    const previous = result.get(key);
    const menus = [...new Map([...(previous?.menus || []), ...(group.menus || [])]
      .map(item => [`${item.id}:${item.menuType || 'home'}`, item])).values()];
    result.set(key, {...group, menus});
  }
  return [...result.values()];
}

export async function loadModuleAppearance(context) {
  const rows = [];
  let total = Infinity;
  for (let page = 1; rows.length < total; page++) {
    assertContext(context);
    const response = await api.fetch('menu-config', {params: {appType: app_type, page, itemsPerPage: 200}});
    assertContext(context);
    const items = response?.member;
    if (!Array.isArray(items) || response?.response?.success === false) throw new Error('Não foi possível carregar os cadastros dos módulos.');
    total = Number(response.totalItems ?? items.length);
    if (!Number.isFinite(total) || total < 0 || (!items.length && rows.length < total)) throw new Error('A lista de módulos está incompleta. Tente novamente.');
    rows.push(...items);
  }
  return mergeModuleGroups(rows.map(item => ({...item.category, label: item.category?.name,
    menus: [{...item, routeId: item.route?.id, route: item.route?.route,
      color: item.route?.color ?? item.color, icon: item.route?.icon ?? item.icon,
      ...Object.fromEntries(['textColor', 'iconColor', 'iconBackgroundColor'].filter(field => Object.hasOwn(item.route || {}, field)).map(field => [field, item.route[field]]))}]})));
}

export const additionalAppearanceFields = kind => kind === 'category' ? ['textColor', 'iconColor'] : ['textColor', 'iconColor', 'iconBackgroundColor'];
export const persistedAppearanceFields = (original, kind = 'route') => ['color', 'icon',
  ...additionalAppearanceFields(kind).filter(field => Object.hasOwn(original, field))];

export function appearanceChanges(original, draft, palette, kind = 'route') {
  const changes = {};
  for (const field of persistedAppearanceFields(original, kind)) {
    const next = String(draft[field] ?? '').trim();
    if (next === String(original[field] ?? '').trim()) continue;
    if (field === 'color' && !resolveModuleAccent(next, palette)) throw new Error('Informe uma cor válida ou uma referência existente, como $primary.');
    if (field === 'icon' && !Object.hasOwn(glyphs, next)) throw new Error('Selecione um ícone válido.');
    const optional = additionalAppearanceFields(kind).includes(field);
    if (optional && next && !modulePropertyColor(next, palette)) throw new Error('Informe uma cor válida ou uma referência existente, como $primary.');
    changes[field] = optional && !next ? null : next;
  }
  return changes;
}

export async function saveModuleAppearance({kind, original, draft, palette, context}) {
  assertContext(context);
  const changes = appearanceChanges(original, draft, palette, kind);
  if (!Object.keys(changes).length) return original;
  if (!/^\d+$/.test(String(original.id))) throw new Error('Cadastro indisponível para edição.');
  const path = kind === 'category' ? `menu-config/categories/${original.id}` : kind === 'route' ? `menu-config/${original.id}` : null;
  if (!path) throw new Error('Tipo de cadastro inválido.');
  const result = await api.fetch(path, {method: 'PATCH', body: changes});
  assertContext(context);
  if (result?.response?.success === false) throw new Error('Não foi possível salvar o cadastro.');
  return result;
}

export async function refreshModuleMenus(companyId, actions, context, isCurrent = () => true) {
  if (!companyId || !actions?.setMenus) return;
  const responses = await Promise.all(['home', 'toolbar'].map(menuType => api.fetch('menus-people', {
    params: {myCompany: companyId, appType: app_type, menuType},
  })));
  assertContext(context);
  if (!isCurrent()) return;
  if (responses.some(result => result?.response?.success === false)) throw new Error('Menus não atualizados. Recarregue a página.');
  actions.setMenus(responses.flatMap(result => normalizeRuntimeMenuResponse(result, {appType: app_type, allowFallback: false}) || []));
}
