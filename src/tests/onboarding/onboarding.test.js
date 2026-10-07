/* global test, expect, jest */
import {
  onboardingAccess, contextKey, createDraft, readDraft, writeDraft,
  buildSteps, deviceSummary, deviceRoute, applyOnboardingRoute,
} from '../../onboarding/model';
import {readSetup} from '../../onboarding/readSetup';

jest.mock('react-native', () => ({Dimensions: {}, PixelRatio: {}}));

const context = {api: 'https://api.example.test', domain: 'https://app.example.test', appType: 'MANAGER', companyId: 4, userId: 8};
const storage = () => {
  const data = new Map();
  return {getItem: async key => data.get(key), setItem: async (key, value) => data.set(key, value)};
};

test('a manager of another company cannot open or query this onboarding', () => {
  expect(onboardingAccess({id: 4}, {roles: ['ROLE_MANAGER'], companies: [{id: 9, role: 'owner'}]})).toBe('denied');
  expect(onboardingAccess({id: 4, user: {manager_enabled: 1}}, {id: 8})).toBe('manage');
  expect(onboardingAccess({id: 4, permission: ['director']}, {id: 8})).toBe('manage');
  expect(onboardingAccess({id: 4}, {roles: ['ROLE_SUPER']})).toBe('preview');
});

test('drafts never cross API, domain, app, company or user boundaries', async () => {
  const db = storage();
  await writeDraft(db, context, {...createDraft(), notes: 'My review', reviewed: {device: true}});
  expect((await readDraft(db, context)).notes).toBe('My review');
  for (const change of [{api: 'https://other.test'}, {domain: 'https://other.test'}, {appType: 'POS'}, {companyId: 9}, {userId: 3}]) {
    expect((await readDraft(db, {...context, ...change})).reviewed).toEqual({});
    expect(contextKey({...context, ...change})).not.toBe(contextKey(context));
  }
  expect(contextKey({...context, userId: null})).toBe(null);
});

test('corrupt or unsupported drafts do not restore completion or arbitrary keys', async () => {
  const db = {getItem: async () => '{invalid'};
  expect(await readDraft(db, context)).toEqual(createDraft());
  db.getItem = async () => JSON.stringify({version: 999, reviewed: {device: true}});
  expect((await readDraft(db, context)).reviewed).toEqual({});
});

test('existing records require explicit review and failed reads never become absence or readiness', () => {
  const steps = buildSteps(createDraft(), {products: {available: true, items: [{id: 1}], complete: true}, devices: {available: false, items: []}});
  expect(steps.find(s => s.id === 'catalog').reviewed).toBe(false);
  expect(steps.find(s => s.id === 'device').evidence).toBe('unavailable');
  expect(steps.find(s => s.id === 'team').evidence).toBe('unknown');
  expect(steps.some(s => s.id === 'device')).toBe(true);
  expect(buildSteps({...createDraft(), production: true}).some(s => s.id === 'production' && s.required)).toBe(true);
});

test('device summary uses canonical configuration and does not grant charge from mode or gateway', () => {
  const summary = deviceSummary({type: 'PDV', configs: JSON.stringify({'pos-operation-mode': 'waiter', 'check-order-type': 'table-tab', 'check-order-management-mode': 'existing-only', 'pos-gateway': 'cielo', 'order-charge-enabled': false})});
  expect(summary.mode).toBe('Garçom');
  expect(summary.link).toBe('Mesa + comanda');
  expect(summary.management).toBe('Somente vínculos já abertos');
  expect(summary.charge).toBe('Desabilitada neste device');
  expect(deviceSummary({type: 'PDV', configs: {'order-charge-enabled': true}}).charge).toBe('Habilitada; a API valida cada operação');
  expect(deviceSummary({type: 'DISPLAY', configs: {}}).mode).toBe('DISPLAY');
});

test('device navigation carries the existing details contract and refuses missing device identity', () => {
  expect(deviceRoute({id: 50, type: 'PDV', device: {id: 30, device: 'tablet-30'}, alias: 'Garçom'})).toEqual({name: 'DeviceDetail', params: {deviceId: 30}});
  expect(deviceRoute({id: 50, type: 'PDV'})).toBe(null);
  expect(deviceRoute({type: 'PRINT', device: {id: 31}}).name).toBe('PrinterDeviceDetail');
  expect(deviceRoute({type: 'IP_CAMERA', device: {id: 32}}).name).toBe('IpCameraDetail');
});

test('router keeps the existing onboarding URL and every unrelated route', () => {
  const old = () => null;
  const fresh = () => null;
  const routes = [{name: 'HomePage', component: old}, {name: 'OnboardingPage', path: 'onboarding', component: old}];
  const next = applyOnboardingRoute(routes, fresh);
  expect(next.filter(r => r.name === 'OnboardingPage')).toHaveLength(1);
  expect(next[1].component).toBe(fresh);
  expect(next[1].path).toBe('onboarding');
  expect(next[0]).toBe(routes[0]);
  expect(routes[1].component).toBe(old);
});

test('setup reads use tenant filters, paginate and never invoke a write or financial endpoint', async () => {
  const calls = [];
  const fetch = async (endpoint, options) => {
    calls.push([endpoint, options]);
    return endpoint === 'device_configs' && options.params.page === 1
      ? {'hydra:member': [{id: 50, people: '/people/4', device: {id: 30, device: 'abc'}}], 'hydra:totalItems': 2}
      : endpoint === 'device_configs'
        ? {'hydra:member': [{id: 51, people: '/people/4', device: {id: 31, device: 'def'}}], 'hydra:totalItems': 2}
        : {member: [{id: 1, company: '/people/9'}, {id: 2, company: '/people/4'}], totalItems: 2};
  };
  const setup = await readSetup(fetch, 4);
  expect(setup.devices.items).toHaveLength(2);
  expect(setup.products.items.map(i => i.id)).toEqual([2]);
  expect(calls.every(([endpoint, options]) => ['people_links', 'products', 'device_configs', 'queues', 'displays'].includes(endpoint) && !options.method)).toBe(true);
  expect(calls.find(([e]) => e === 'device_configs')[1].params.people).toBe('/people/4');
  expect(calls.find(([e]) => e === 'people_links')[1].params.company).toBe('/people/4');
});

test('API errors and incomplete pages stay explicitly unverified', async () => {
  const setup = await readSetup(async endpoint => {
    if (endpoint === 'queues') throw new Error('forbidden');
    return {member: [{id: 1, company: '/people/4', people: '/people/4'}], totalItems: 1000};
  }, 4, {maxPages: 1});
  expect(setup.queues.available).toBe(false);
  expect(setup.devices.complete).toBe(false);
  expect(setup.devices.items).toHaveLength(1);
  expect(await readSetup(() => {throw new Error('Must not call');}, null)).toEqual({});
});
