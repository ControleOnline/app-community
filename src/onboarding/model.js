import {
  parseConfigsObject, resolvePosOperationMode, resolvePosCheckOrderType,
  resolvePosCheckOrderManagementMode, isOrderChargeEnabled,
} from '@controleonline/ui-common/src/react/config/deviceConfigBootstrap';
import {getDeviceDetailRoute} from '@controleonline/ui-common/src/react/pages/Devices/deviceTypes/deviceListHelpers';

const enabled = value => value === true || value === 1 || value === '1';
const idOf = value => String(value?.id ?? value?.['@id'] ?? value ?? '').match(/(?:^|\/)(\d+)$/)?.[1];

// Company flags/permissions are produced by the current company's API projection.
// A global ROLE_MANAGER must never authorize administration of another tenant.
export function onboardingAccess(company, user) {
  if (!company?.id || !user) return 'denied';
  const flags = company.user || {};
  const permissions = company.permission || company.permissions || [];
  if (['owner', 'director', 'manager'].some(role =>
    enabled(flags[`${role}_enabled`]) || enabled(company[`${role}_enabled`]) ||
    (Array.isArray(permissions) && permissions.includes(role)),
  )) return 'manage';
  return (user.roles || []).some(role => ['ROLE_SUPER', 'SUPER'].includes(String(role).toUpperCase()))
    ? 'preview' : 'denied';
}

export function contextKey({api, domain, appType, companyId, userId} = {}) {
  if (!api || !companyId || !userId) return null;
  return `co.setup.v1:${[api, domain || '', appType || '', companyId, userId].map(value => encodeURIComponent(String(value))).join(':')}`;
}

export const createDraft = () => ({version: 1, step: 0, waiters: false, production: false, notes: '', reviewed: {}});

export async function readDraft(storage, context) {
  const key = contextKey(context);
  if (!key) return createDraft();
  try {
    const value = JSON.parse(await storage.getItem(key));
    if (value?.version !== 1) return createDraft();
    const reviewed = Object.fromEntries(['company', 'team', 'catalog', 'device', 'production'].filter(id => value.reviewed?.[id] === true).map(id => [id, true]));
    return {...createDraft(), step: Math.max(0, Math.min(5, Number(value.step) || 0)), waiters: value.waiters === true, production: value.production === true, notes: typeof value.notes === 'string' ? value.notes.slice(0, 2000) : '', reviewed};
  } catch {
    return createDraft();
  }
}

export async function writeDraft(storage, context, draft) {
  const key = contextKey(context);
  if (!key) return false;
  try {
    await storage.setItem(key, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

const evidence = (runtime, keys) => {
  const results = keys.map(key => runtime?.[key]);
  if (results.some(result => result?.available === false)) return 'unavailable';
  if (results.some(result => !result)) return 'unknown';
  if (results.some(result => !result.complete)) return 'partial';
  return results.every(result => result.items.length > 0) ? 'found' : 'empty';
};

export function buildSteps(draft, runtime) {
  return [
    {id: 'company', title: 'Empresa e responsáveis', description: 'Confira a empresa, seus donos, diretores e gestores. Os vínculos e acessos continuam nos cadastros do ERP.', routes: [{name: 'MyCompaniesPage', label: 'Empresa e vínculos'}, {name: 'UsersPage', label: 'Contas de acesso'}], keys: ['team'], required: true},
    {id: 'team', title: 'Equipe e garçons', description: 'Cadastre os colaboradores e confira seus acessos. Garçom é um modo de operação do PDV; o vínculo da pessoa continua sendo o cadastro existente.', routes: [{name: 'EmployeesPage', label: 'Cadastrar colaboradores'}, {name: 'UsersPage', label: 'Conferir acessos'}], keys: ['team'], required: draft.waiters},
    {id: 'catalog', title: 'Produtos e catálogo', description: 'Confira produtos, categorias, preços, adicionais e a vitrine que será utilizada no PDV.', routes: [{name: 'ProductsPage', label: 'Cadastrar produtos'}, {name: 'ProductShowcasesPage', label: 'Configurar vitrines'}], keys: ['products'], required: true},
    {id: 'device', title: 'Configuração dos devices', description: 'Defina quem usará cada equipamento e revise seu modo, vínculo com mesa/comanda, cobrança, impressão e comandos nas telas atuais.', routes: [{name: 'DevicesIndex', label: 'Cadastrar e configurar devices'}, {name: 'ConfiguratorPage', label: 'Configurações da empresa'}], keys: ['devices'], required: true},
    {id: 'production', title: 'Filas, produção e displays', description: 'Configure os displays e suas filas; associe os produtos, confira entrada, preparo, saída, conferência e impressão.', routes: [{name: 'DisplayList', label: 'Configurar filas e displays'}], keys: ['queues', 'displays'], required: draft.production},
    {id: 'review', title: 'Revisão da preparação', description: 'Revise as configurações e registre o que ainda precisa de conferência. A operação real será validada nos módulos responsáveis.', routes: [], keys: [], required: false},
  ].map(step => ({...step, reviewed: draft.reviewed?.[step.id] === true, evidence: step.keys.length ? evidence(runtime, step.keys) : 'unknown'}));
}

export function deviceSummary(record) {
  const configs = parseConfigsObject(record.configs);
  const type = String(record.type || record.device?.type || '').toUpperCase();
  const modes = {waiter: 'Garçom', counter: 'Balcão', cashier: 'Caixa', totem: 'Totem', 'single-item': 'Item único'};
  const links = {table: 'Mesa', tab: 'Comanda', 'table-tab': 'Mesa + comanda', none: 'Sem vínculo', stamp: 'Identificação'};
  return {
    mode: type === 'PDV' ? modes[resolvePosOperationMode(configs)] || 'Conferir no device' : type || 'Tipo não informado',
    link: type === 'PDV' ? links[resolvePosCheckOrderType(configs)] || 'Conferir no device' : 'Não se aplica',
    management: resolvePosCheckOrderManagementMode(configs) === 'existing-only' ? 'Somente vínculos já abertos' : 'Gerencia abertura de vínculos',
    charge: isOrderChargeEnabled(configs) ? 'Habilitada; a API valida cada operação' : 'Desabilitada neste device',
  };
}

export function deviceRoute(record) {
  const id = idOf(record.device);
  if (!id) return null;
  return {name: getDeviceDetailRoute(record.type || record.device?.type), params: {deviceId: Number(id)}};
}

export function applyOnboardingRoute(routes, component) {
  return routes.map(route => route.name === 'OnboardingPage'
    ? {...route, component, options: {...route.options, title: 'Preparar a operação', showCompanyFilter: true, companyFilterMode: 'icon'}}
    : route);
}
