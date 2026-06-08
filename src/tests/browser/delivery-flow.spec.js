/*
 * Browser smoke for DELIVERY flows.
 * - Uses a fake session and mocked API responses so the suite stays open-source safe.
 * - Exercises the real browser routes for courier setup, rate history, presence and manager inbox screens.
 */

const {expect, test} = require('playwright/test');
const packageJson = require('../../../package.json');

const API_ORIGIN = 'https://api.controleonline.com';
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers':
    'API-TOKEN, APP-DOMAIN, DEVICE, ACCEPT, CONTENT-TYPE, X-Requested-With',
  'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
};

const APP_VERSION = packageJson?.version || '1.0.0';

const jsonHeaders = () => ({
  ...CORS_HEADERS,
  'content-type': 'application/ld+json; charset=utf-8',
});

const textHeaders = () => ({
  ...CORS_HEADERS,
  'content-type': 'text/css; charset=utf-8',
});

const collection = (member = []) => ({
  member,
  'hydra:member': member,
  totalItems: member.length,
  summary: {},
});

const weekdayLabel = weekday => {
  const map = {
    1: 'Segunda',
    2: 'Terca',
    3: 'Quarta',
    4: 'Quinta',
    5: 'Sexta',
    6: 'Sabado',
    7: 'Domingo',
  };

  return map[Number(weekday)] || '-';
};

const windowLabel = (startTime, endTime) => {
  const start = String(startTime || '').slice(0, 5) || '-';
  const end = String(endTime || '').slice(0, 5) || '-';

  if (start === '-' && end === '-') {
    return '-';
  }

  return `${start} - ${end}`;
};

const buildGroupRow = (group, defaults = {}) => {
  const taxes = Array.isArray(group?.taxes) ? group.taxes : [];
  const companies = Array.isArray(group?.companies) ? group.companies : [];
  const courier = group?.courier || defaults.courier || null;

  return {
    '@id': `/delivery_tax_groups/${group.id}`,
    id: group.id,
    code: group.code || null,
    groupName: group.groupName || '',
    vehicleType: group.vehicleType || null,
    versionNumber: group.versionNumber || 1,
    courier,
    taxes,
    companies,
    taxesCount: group.taxesCount ?? taxes.length,
    companiesCount: group.companiesCount ?? companies.length,
    activeCompaniesCount:
      group.activeCompaniesCount ??
      companies.filter(link => link && link.enabled !== false).length,
    creationDate: group.creationDate || '2026-06-06T12:00:00.000Z',
    alterDate: group.alterDate || '2026-06-06T12:00:00.000Z',
    previousGroup: group.previousGroup || null,
  };
};

const buildScheduleRow = schedule => ({
  '@id': `/delivery_courier_schedules/${schedule.id}`,
  id: schedule.id,
  courier: schedule.courier,
  label: schedule.label || '',
  weekday: Number(schedule.weekday || 1),
  weekdayLabel: schedule.weekdayLabel || weekdayLabel(schedule.weekday),
  startTime: schedule.startTime || '10:00',
  endTime: schedule.endTime || '12:00',
  windowLabel:
    schedule.windowLabel || windowLabel(schedule.startTime || '10:00', schedule.endTime || '12:00'),
  active: schedule.active !== false,
  usageCount: schedule.usageCount ?? 0,
  creationDate: schedule.creationDate || '2026-06-06T12:00:00.000Z',
  alterDate: schedule.alterDate || '2026-06-06T12:00:00.000Z',
});

const buildPresenceRow = presence => ({
  '@id': `/delivery_courier_company_presences/${presence.id}`,
  id: presence.id,
  company: presence.company,
  courier: presence.courier,
  availabilityMode: presence.availabilityMode || 'automatic',
  availabilityStateLabel:
    presence.availabilityStateLabel ||
    (presence.availabilityMode === 'manual'
      ? presence.isOnline
        ? 'Online manual'
        : 'Offline manual'
      : presence.isOnline
        ? 'Online automatico'
        : 'Offline automatico'),
  currentModeLabel:
    presence.currentModeLabel ||
    (presence.availabilityMode === 'manual' ? 'Manual' : 'Automatico'),
  effectiveOnline:
    presence.effectiveOnline !== undefined ? presence.effectiveOnline : Boolean(presence.isOnline),
  isOnline: Boolean(presence.isOnline),
  schedules: Array.isArray(presence.schedules)
    ? presence.schedules.map(schedule =>
        schedule && typeof schedule === 'object' && schedule.schedule
          ? schedule
          : {
              id: schedule?.id || schedule?.linkId || schedule?.presenceScheduleId || 1,
              schedule,
            },
      )
    : [],
  schedulesSummary:
    presence.schedulesSummary ||
    (Array.isArray(presence.schedules) && presence.schedules.length > 0
      ? presence.schedules
          .map(schedule => {
            const scheduleEntity = schedule && typeof schedule === 'object' && schedule.schedule
              ? schedule.schedule
              : schedule;
            return scheduleEntity?.label || scheduleEntity?.windowLabel || '';
          })
          .filter(Boolean)
          .join(', ')
      : ''),
  manualReason: presence.manualReason || '',
  lastOnlineAt: presence.lastOnlineAt || '2026-06-06T12:00:00.000Z',
  lastOfflineAt: presence.lastOfflineAt || '2026-06-06T11:30:00.000Z',
  alterDate: presence.alterDate || '2026-06-06T12:00:00.000Z',
});

const buildLogRow = log => ({
  '@id': `/logs/${log.id}`,
  id: log.id,
  rowId: log.rowId,
  className: log.className || '',
  entityIri: log.entityIri || '',
  action: log.action || 'update',
  createdAt: log.createdAt || '2026-06-06T12:30:00.000Z',
  userDisplayName: log.userDisplayName || 'Sistema',
  payload: log.payload || {},
});

const createFakeSession = ({
  userId = 7,
  companyId = 3,
  apiKey = 'test-api-key',
} = {}) => ({
  id: userId,
  people: `/people/${userId}`,
  api_key: apiKey,
  active: 1,
  mycompany: companyId,
});

const createCompany = (id, overrides = {}) => ({
  id,
  name: overrides.name || `Empresa ${id}`,
  alias: overrides.alias || `Empresa ${id}`,
  panel_enabled: overrides.panel_enabled !== undefined ? overrides.panel_enabled : true,
  enabled: overrides.enabled !== undefined ? overrides.enabled : true,
  commercial_enabled:
    overrides.commercial_enabled !== undefined ? overrides.commercial_enabled : true,
  theme:
    overrides.theme || {
      colors: {
        primary: '#0EA5E9',
        secondary: '#F97316',
      },
    },
  configs: overrides.configs || {},
});

const createCourier = (id = 7, overrides = {}) => ({
  id,
  name: overrides.name || 'Motoboy Teste',
  alias: overrides.alias || 'Motoboy Teste',
  active: overrides.active !== undefined ? overrides.active : 1,
});

const createDeliveryApiMock = async (page, initialState = {}) => {
  const state = {
    courier: initialState.courier || createCourier(),
    companies: initialState.companies || [
      createCompany(3, { name: 'Restaurante Centro', alias: 'Centro' }),
      createCompany(4, { name: 'Restaurante Noite', alias: 'Noite' }),
    ],
    defaultCompany: initialState.defaultCompany || createCompany(3, { name: 'Restaurante Centro', alias: 'Centro' }),
    groups: Array.isArray(initialState.groups) ? [...initialState.groups] : [],
    schedules: Array.isArray(initialState.schedules) ? [...initialState.schedules] : [],
    presences: Array.isArray(initialState.presences) ? [...initialState.presences] : [],
    logs: Array.isArray(initialState.logs) ? [...initialState.logs] : [],
    deviceId: initialState.deviceId || 'web-7',
    nextGroupId: initialState.nextGroupId || 101,
    nextScheduleId: initialState.nextScheduleId || 201,
    nextPresenceId: initialState.nextPresenceId || 301,
  };

  const fulfillJson = async (route, body, status = 200) =>
    route.fulfill({
      status,
      headers: jsonHeaders(),
      body: JSON.stringify(body),
    });

  const fulfillText = async (route, body, status = 200) =>
    route.fulfill({
      status,
      headers: textHeaders(),
      body,
    });

  const normalizeCollectionResponse = items => collection(items.map(item => ({ ...item })));

  const upsertGroup = group => {
    const normalizedGroup = buildGroupRow(group, { courier: state.courier });
    const existingIndex = state.groups.findIndex(item => String(item.id) === String(normalizedGroup.id));

    if (existingIndex >= 0) {
      state.groups[existingIndex] = normalizedGroup;
    } else {
      state.groups.push(normalizedGroup);
    }

    return normalizedGroup;
  };

  const upsertSchedule = schedule => {
    const normalizedSchedule = buildScheduleRow(schedule);
    const existingIndex = state.schedules.findIndex(item => String(item.id) === String(normalizedSchedule.id));

    if (existingIndex >= 0) {
      state.schedules[existingIndex] = normalizedSchedule;
    } else {
      state.schedules.push(normalizedSchedule);
    }

    return normalizedSchedule;
  };

  const upsertPresence = presence => {
    const normalizedPresence = buildPresenceRow(presence);
    const existingIndex = state.presences.findIndex(item => String(item.id) === String(normalizedPresence.id));

    if (existingIndex >= 0) {
      state.presences[existingIndex] = normalizedPresence;
    } else {
      state.presences.push(normalizedPresence);
    }

    return normalizedPresence;
  };

  const findGroup = id =>
    state.groups.find(group => String(group.id) === String(id)) || null;

  const findSchedule = id =>
    state.schedules.find(schedule => String(schedule.id) === String(id)) || null;

  const findPresence = id =>
    state.presences.find(presence => String(presence.id) === String(id)) || null;

  await page.route(`${API_ORIGIN}/**`, async route => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/^\/+/, '');
    const method = request.method().toUpperCase();

    if (method === 'OPTIONS') {
      return route.fulfill({
        status: 204,
        headers: CORS_HEADERS,
        body: '',
      });
    }

    const postBody = () => {
      try {
        return request.postDataJSON();
      } catch {
        try {
          return JSON.parse(request.postData() || '{}');
        } catch {
          return {};
        }
      }
    };

    if (pathname === 'themes-colors.css') {
      return fulfillText(
        route,
        ':root { --primary: #0ea5e9; --secondary: #f97316; --accent: #14b8a6; }',
      );
    }

    if (pathname === 'runtime/ip') {
      return fulfillJson(route, {
        ip: '127.0.0.1',
        member: [{ ip: '127.0.0.1' }],
      });
    }

    if (pathname === 'people/companies/my') {
      return fulfillJson(route, collection(state.companies));
    }

    if (pathname === 'people/company/default') {
      return fulfillJson(route, state.defaultCompany);
    }

    if (pathname === 'menus-people') {
      return fulfillJson(route, collection([]));
    }

    if (pathname.startsWith('translates')) {
      return fulfillJson(route, collection([]));
    }

    if (pathname === 'configs/discovery-configs' && method === 'POST') {
      return fulfillJson(route, {
        configs: {},
      });
    }

    if (pathname === 'devices' && method === 'GET') {
      const deviceId = String(url.searchParams.get('device') || state.deviceId || '').trim();
      return fulfillJson(
        route,
        collection(
          deviceId
            ? [
                {
                  id: 1,
                  device: deviceId,
                  alias: 'Browser Device',
                  type: 'WEB',
                  metadata: {
                    app: {
                      version: APP_VERSION,
                    },
                  },
                },
              ]
            : [],
        ),
      );
    }

    if (pathname === 'devices' && method === 'POST') {
      return fulfillJson(route, {
        id: 1,
        device: state.deviceId,
        alias: 'Browser Device',
        type: 'WEB',
        metadata: {
          app: {
            version: APP_VERSION,
          },
        },
      });
    }

    if (pathname === 'device_configs' && method === 'GET') {
      const deviceId = String(url.searchParams.get('device.device') || state.deviceId || '').trim();
      const peopleId = String(url.searchParams.get('people') || '').replace(/\D+/g, '');
      const type = String(url.searchParams.get('type') || 'MANAGER').trim().toUpperCase();

      if (!deviceId || !peopleId) {
        return fulfillJson(route, collection([]));
      }

      return fulfillJson(
        route,
        collection([
          {
            id: 1,
            device: {
              id: 1,
              device: deviceId,
            },
            people: {
              id: Number(peopleId),
            },
            type,
            configs: JSON.stringify({
              'config-version': APP_VERSION,
              'pos-gateway': 'infinite-pay',
            }),
          },
        ]),
      );
    }

    if (pathname === 'device_configs/add-configs' && method === 'POST') {
      const body = postBody();

      return fulfillJson(route, {
        id: 1,
        device: {
          id: 1,
          device: String(body?.device || state.deviceId || ''),
        },
        people: body?.people ? { id: Number(String(body.people).replace(/\D+/g, '')) } : { id: 3 },
        type: body?.type || 'MANAGER',
        configs: body?.configs || '{}',
      });
    }

    if (pathname === 'people/7') {
      return fulfillJson(route, state.courier);
    }

    if (pathname === 'delivery_tax_groups' && method === 'GET') {
      return fulfillJson(route, normalizeCollectionResponse(state.groups));
    }

    if (pathname === 'delivery_tax_groups' && method === 'POST') {
      const body = postBody();
      const saved = upsertGroup({
        id: state.nextGroupId++,
        groupName: body?.groupName || 'Nova tabela',
        code: body?.code || null,
        vehicleType: body?.vehicleType || 'moto',
        versionNumber: body?.versionNumber || 1,
        courier: state.courier,
        taxes: Array.isArray(body?.taxes)
          ? body.taxes.map((tax, index) => ({
              id: index + 1,
              ...tax,
            }))
          : [],
        companies: [],
      });

      return fulfillJson(route, saved);
    }

    const groupItemMatch = pathname.match(/^delivery_tax_groups\/(\d+)$/);
    if (groupItemMatch && method === 'GET') {
      const group = findGroup(groupItemMatch[1]);
      return fulfillJson(route, group || null);
    }

    const groupCompaniesAssociateMatch = pathname.match(
      /^delivery_tax_groups\/(\d+)\/companies\/associate$/,
    );
    if (groupCompaniesAssociateMatch && method === 'POST') {
      const groupId = groupCompaniesAssociateMatch[1];
      const body = postBody();
      const group = findGroup(groupId);
      const companyIds = Array.isArray(body?.companyIds)
        ? body.companyIds.map(value => String(value).replace(/\D+/g, ''))
        : [];

      if (group) {
        group.companies = companyIds.map(companyId => {
          const company = state.companies.find(item => String(item.id) === String(companyId));
          return {
            id: Number(companyId),
            company: company || {
              id: Number(companyId),
              name: `Empresa ${companyId}`,
              alias: `Empresa ${companyId}`,
            },
            enabled: true,
          };
        });
        group.companiesCount = group.companies.length;
        group.activeCompaniesCount = group.companies.filter(link => link.enabled !== false).length;
      }

      return fulfillJson(route, group || null);
    }

    const groupCompanyToggleMatch = pathname.match(
      /^delivery_tax_groups\/(\d+)\/companies\/(\d+)$/,
    );
    if (groupCompanyToggleMatch && method === 'PATCH') {
      const groupId = groupCompanyToggleMatch[1];
      const companyId = groupCompanyToggleMatch[2];
      const body = postBody();
      const group = findGroup(groupId);
      if (group) {
        const link = Array.isArray(group.companies)
          ? group.companies.find(item => String(item.company?.id || item.companyId || item.id) === String(companyId))
          : null;
        if (link) {
          link.enabled = body?.enabled !== false;
        }
        group.activeCompaniesCount = Array.isArray(group.companies)
          ? group.companies.filter(item => item.enabled !== false).length
          : 0;
      }

      return fulfillJson(route, group || null);
    }

    if (pathname === 'delivery_courier_schedules' && method === 'GET') {
      const courierId = String(url.searchParams.get('courier') || '').replace(/\D+/g, '');
      const items = courierId
        ? state.schedules.filter(schedule => String(schedule.courier?.id || schedule.courierId || '') === courierId)
        : state.schedules;

      return fulfillJson(route, normalizeCollectionResponse(items));
    }

    if (pathname === 'delivery_courier_schedules' && method === 'POST') {
      const body = postBody();
      const saved = upsertSchedule({
        id: state.nextScheduleId++,
        courier: state.courier,
        label: body?.label || '',
        weekday: Number(body?.weekday || 1),
        startTime: body?.startTime || '10:00',
        endTime: body?.endTime || '12:00',
        active: body?.active !== false,
        usageCount: 0,
      });

      return fulfillJson(route, saved);
    }

    const scheduleItemMatch = pathname.match(/^delivery_courier_schedules\/(\d+)$/);
    if (scheduleItemMatch && (method === 'GET' || method === 'PUT')) {
      const schedule = findSchedule(scheduleItemMatch[1]);
      if (method === 'GET') {
        return fulfillJson(route, schedule || null);
      }

      const body = postBody();
      const saved = upsertSchedule({
        ...schedule,
        id: Number(scheduleItemMatch[1]),
        label: body?.label || schedule?.label || '',
        weekday: Number(body?.weekday || schedule?.weekday || 1),
        startTime: body?.startTime || schedule?.startTime || '10:00',
        endTime: body?.endTime || schedule?.endTime || '12:00',
        active: body?.active !== false,
      });

      return fulfillJson(route, saved);
    }

    if (pathname === 'delivery_courier_company_presences' && method === 'GET') {
      const companyId = String(url.searchParams.get('company') || '').replace(/\D+/g, '');
      const courierId = String(url.searchParams.get('courier') || '').replace(/\D+/g, '');
      const items = state.presences.filter(presence => {
        const matchesCompany =
          !companyId || String(presence.company?.id || presence.companyId || '') === companyId;
        const matchesCourier =
          !courierId || String(presence.courier?.id || presence.courierId || '') === courierId;
        return matchesCompany && matchesCourier;
      });

      return fulfillJson(route, normalizeCollectionResponse(items));
    }

    if (pathname === 'logs' && method === 'GET') {
      const rowId = String(url.searchParams.get('row') || '').replace(/\D+/g, '');
      const className = String(url.searchParams.get('class') || '').trim();
      const entityIri = String(url.searchParams.get('entity') || '').trim();
      const items = state.logs.filter(log => {
        const matchesRow = !rowId || String(log.rowId || log.row || '').replace(/\D+/g, '') === rowId;
        const matchesClass = !className || !log.className || String(log.className) === className;
        const matchesEntity = !entityIri || !log.entityIri || String(log.entityIri) === entityIri;
        return matchesRow && matchesClass && matchesEntity;
      });

      return fulfillJson(route, normalizeCollectionResponse(items));
    }

    if (pathname === 'delivery_courier_company_presences' && method === 'POST') {
      const body = postBody();
      const companyId = String(body?.companyId || '').replace(/\D+/g, '');
      const scheduleIds = Array.isArray(body?.scheduleIds)
        ? body.scheduleIds.map(value => String(value).replace(/\D+/g, '')).filter(Boolean)
        : [];
      const company = state.companies.find(item => String(item.id) === companyId) || null;
      const linkedSchedules = state.schedules.filter(schedule =>
        scheduleIds.includes(String(schedule.id)),
      );
      const currentPresence = state.presences.find(
        item => String(item.company?.id || item.companyId || '') === companyId,
      );

      const updated = {
        ...(currentPresence || {}),
        id: currentPresence?.id || state.nextPresenceId++,
        company: company || currentPresence?.company || { id: Number(companyId) },
        courier: state.courier,
        availabilityMode: body?.availabilityMode || currentPresence?.availabilityMode || 'automatic',
        isOnline:
          body?.isOnline !== undefined ? Boolean(body.isOnline) : Boolean(currentPresence?.isOnline),
        manualReason:
          body?.manualReason !== undefined
            ? body.manualReason
            : currentPresence?.manualReason || '',
        schedules: linkedSchedules.length > 0 ? linkedSchedules : currentPresence?.schedules || [],
        effectiveOnline:
          body?.isOnline !== undefined ? Boolean(body.isOnline) : Boolean(currentPresence?.effectiveOnline || currentPresence?.isOnline),
        availabilityStateLabel:
          body?.availabilityMode === 'manual'
            ? body?.isOnline
              ? 'Online manual'
              : 'Offline manual'
            : currentPresence?.availabilityStateLabel || 'Online automatico',
        currentModeLabel:
          body?.availabilityMode === 'manual' ? 'Manual' : 'Automatico',
        schedulesSummary:
          linkedSchedules.length > 0
            ? linkedSchedules.map(schedule => schedule.label || schedule.windowLabel || '').filter(Boolean).join(', ')
            : currentPresence?.schedulesSummary || '',
        lastOnlineAt:
          body?.isOnline !== false
            ? '2026-06-06T13:00:00.000Z'
            : currentPresence?.lastOnlineAt || '2026-06-06T12:00:00.000Z',
        lastOfflineAt:
          body?.isOnline === false
            ? '2026-06-06T13:00:00.000Z'
            : currentPresence?.lastOfflineAt || '2026-06-06T11:30:00.000Z',
      };

      const saved = upsertPresence(updated);
      return fulfillJson(route, saved);
    }

    const presenceItemMatch = pathname.match(/^delivery_courier_company_presences\/(\d+)$/);
    if (presenceItemMatch && method === 'GET') {
      const presence = findPresence(presenceItemMatch[1]);
      return fulfillJson(route, presence || null);
    }

    if (presenceItemMatch && method === 'POST') {
      const presence = findPresence(presenceItemMatch[1]);
      const body = postBody();
      const updated = upsertPresence({
        ...(presence || { id: Number(presenceItemMatch[1]) }),
        availabilityMode: body?.availabilityMode || presence?.availabilityMode || 'automatic',
        isOnline:
          body?.isOnline !== undefined ? Boolean(body.isOnline) : Boolean(presence?.isOnline),
        manualReason:
          body?.manualReason !== undefined
            ? body.manualReason
            : presence?.manualReason || '',
      });
      return fulfillJson(route, updated);
    }

    return fulfillJson(route, collection([]));
  });

  await page.addInitScript(
    ({ session, config, device }) => {
      localStorage.setItem('session', JSON.stringify(session));
      localStorage.setItem('config', JSON.stringify(config));
      localStorage.setItem('device', JSON.stringify(device));
    },
    {
      session: createFakeSession(),
      config: { language: 'pt-br' },
      device: {
        id: 'web-7',
        device: 'web-7',
        type: 'WEB',
        appName: 'Browser Delivery',
        appVersion: APP_VERSION,
        buildNumber: APP_VERSION,
        systemName: 'web',
        systemVersion: 'web',
        deviceType: 'web',
        metadata: {},
      },
    },
  );

  return state;
};

test.describe('delivery browser smoke', () => {
  test('opens the courier setup and lands on the company association screen after save', async ({
    page,
  }) => {
    await createDeliveryApiMock(page, {
      groups: [],
    });

    await page.goto('/delivery/courier/rates/setup');

    await expect(page.getByRole('heading', { name: 'Cadastro do veículo' })).toBeVisible();
    await expect(page.getByText('Salvar e continuar', { exact: true })).toBeVisible();

    const setupNameInput = page.getByPlaceholder('Ex.: Entrega região central');
    await setupNameInput.click();
    await setupNameInput.pressSequentially('Entrega Centro');
    await expect(page.getByPlaceholder('Ex.: Entrega região central')).toHaveValue('Entrega Centro');
    await page.getByPlaceholder('Opcional').first().fill('CENTRO');
    await page.getByText('Moto', { exact: true }).locator('xpath=..').click();
    await expect(page.getByText('Veículo: moto', { exact: true })).toBeVisible();

    await page.getByPlaceholder('Km inicial').fill('0');
    await page.getByPlaceholder('Km final').fill('5');
    await page.getByPlaceholder('Valor por km').fill('3.50');
    await page.getByPlaceholder('Mínimo por viagem').fill('10.00');
    await page.getByPlaceholder('Mínimo da diária').fill('25.00');

    await page.getByText('Salvar e continuar', { exact: true }).locator('xpath=..').click();

    await expect(page).toHaveURL(/delivery\/courier\/rates\/companies/);
    await expect(page.getByRole('heading', { name: 'Associar empresas' })).toBeVisible();
    await expect(page.getByText('Restaurante Centro - Centro', { exact: true }).last()).toBeVisible();
    await expect(page.getByText('Restaurante Noite - Noite', { exact: true }).last()).toBeVisible();
  });

  test('opens the courier rate list, version detail and company activation pages', async ({
    page,
  }) => {
    await createDeliveryApiMock(page, {
      groups: [
        buildGroupRow(
          {
            id: 101,
            groupName: 'Tabela Central',
            code: 'CENTRO',
            vehicleType: 'moto',
            versionNumber: 1,
            courier: createCourier(),
            taxes: [
              {
                id: 1,
                taxName: 'Faixa 1',
                kmFrom: '0',
                kmTo: '5',
                pricePerKm: '3.50',
                minimumTripValue: '10.00',
                minimumDailyValue: '25.00',
              },
              {
                id: 2,
                taxName: 'Faixa 2',
                kmFrom: '5',
                kmTo: '10',
                pricePerKm: '4.00',
                minimumTripValue: '12.00',
                minimumDailyValue: '30.00',
              },
            ],
            companies: [
              {
                id: 3,
                company: createCompany(3, { name: 'Restaurante Centro', alias: 'Centro' }),
                enabled: true,
              },
              {
                id: 4,
                company: createCompany(4, { name: 'Restaurante Noite', alias: 'Noite' }),
                enabled: false,
              },
            ],
          },
          { courier: createCourier() },
        ),
      ],
    });

    await page.goto('/delivery/courier/rates');

    await expect(page.getByRole('heading', { name: 'Minhas tabelas' })).toBeVisible();
    await expect(page.getByText('Tabela Central', { exact: true }).last()).toBeVisible();
    await expect(page.getByText('Moto', { exact: true })).toBeVisible();

    await page.getByText('Tabela Central', { exact: true }).last().click();

    await expect(page.getByRole('heading', { name: 'Detalhe da tabela' })).toBeVisible();
    await expect(page.getByText('Tabela Central', { exact: true }).last()).toBeVisible();
    await expect(page.getByText('Empresas', { exact: true }).last()).toBeVisible();

    await page.getByText('Histórico', { exact: true }).last().click();

    await expect(page.getByRole('heading', { name: 'Histórico da tabela' })).toBeVisible();
    await expect(page.getByText('Tabela Central', { exact: true }).last()).toBeVisible();

    await page.goto('/delivery/manager/rates/version?id=101');

    await page.getByText('Empresas', { exact: true }).last().click();

    await expect(page.getByRole('heading', { name: 'Ativação por empresa' })).toBeVisible();
    await expect(page.getByText('Restaurante Centro - Centro').last()).toBeVisible();
    await expect(page.getByText('Restaurante Noite - Noite', { exact: true }).last()).toBeVisible();
    await expect(page.getByText('Tabela ativa', { exact: true })).toBeVisible();
    await expect(page.getByText('Tabela inativa', { exact: true })).toBeVisible();
  });

  test('opens the courier presence flow and saves a reusable schedule', async ({ page }) => {
    await createDeliveryApiMock(page, {
      schedules: [
        buildScheduleRow({
          id: 201,
          courier: createCourier(),
          label: 'Segunda - manha',
          weekday: 1,
          startTime: '10:00',
          endTime: '12:00',
          active: true,
          usageCount: 2,
        }),
      ],
      presences: [
        buildPresenceRow({
          id: 301,
          company: createCompany(3, { name: 'Restaurante Centro', alias: 'Centro' }),
          courier: createCourier(),
          availabilityMode: 'manual',
          isOnline: true,
          manualReason: 'Imprevisto na rota',
          schedules: [],
        }),
      ],
    });

    await page.goto('/delivery/courier/presence/detail?companyId=3');

    await expect(page.getByText('Restaurante Centro - Centro', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Ligar', { exact: true })).toBeVisible();
    await expect(page.getByText('Desligar', { exact: true })).toBeVisible();
    await expect(page.getByText('Horarios', { exact: true })).toBeVisible();

    await page.getByText('Horarios', { exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Horarios do motoboy' })).toBeVisible();
    await expect(page.getByText('Novo horario', { exact: true }).last()).toBeVisible();

    await page.getByText('Novo horario', { exact: true }).last().click();
    await expect(page.getByText('Novo horario', { exact: true }).last()).toBeVisible();

    await page.getByPlaceholder('Opcional').first().fill('Terça - tarde');
    await page.getByText('Terca', { exact: true }).locator('xpath=..').click();

    await page.getByPlaceholder('10:00').fill('14:00');
    await page.getByPlaceholder('12:00').fill('18:00');

    await page.getByText('Salvar horario', { exact: true }).click();

    await expect(page).toHaveURL(/delivery\/courier\/presence\/schedules/);
    await expect(page.getByRole('heading', { name: 'Horarios do motoboy' })).toBeVisible();
    await expect(page.getByText('Terça - tarde', { exact: true })).toBeVisible();
  });

  test('opens the manager inbox and readonly presence detail', async ({ page }) => {
    await createDeliveryApiMock(page, {
      presences: [
        buildPresenceRow({
          id: 301,
          company: createCompany(3, { name: 'Restaurante Centro', alias: 'Centro' }),
          courier: createCourier(),
          availabilityMode: 'manual',
          isOnline: true,
          manualReason: 'Imprevisto na rota',
          schedules: [
            buildScheduleRow({
              id: 201,
              courier: createCourier(),
              label: 'Segunda - manha',
              weekday: 1,
              startTime: '10:00',
              endTime: '12:00',
              active: true,
              usageCount: 2,
            }),
          ],
          schedulesSummary: 'Segunda - manha',
        }),
      ],
    });

    await page.goto('/delivery/manager/presence');

    await expect(page.getByRole('heading', { name: 'Presenca dos motoboys' })).toBeVisible();
    await expect(page.getByText('Restaurante Centro - Centro', { exact: true }).first()).toBeVisible();

    await page.goto('/delivery/manager/presence/detail?presenceId=301');

    await expect(page.getByText('Somente leitura para o manager.')).toBeVisible();
    await expect(page.getByText('Restaurante Centro - Centro', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Imprevisto na rota')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ligar' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Desligar' })).toHaveCount(0);
  });

  test('opens the courier table form and saves a new version draft', async ({ page }) => {
    await createDeliveryApiMock(page);

    await page.goto('/delivery/courier/rates/form');

    await expect(page.getByRole('heading', { name: 'Nova tabela' })).toBeVisible();
    await expect(page.getByText('Salvar tabela', { exact: true })).toBeVisible();

    await page.getByPlaceholder('Ex.: Entrega região central').fill('Entrega Centro');
    await page.getByPlaceholder('Opcional').first().fill('CENTRO');
    await page.getByText('Moto', { exact: true }).locator('xpath=..').click();

    await page.getByPlaceholder('Km inicial').fill('0');
    await page.getByPlaceholder('Km final').fill('5');
    await page.getByPlaceholder('Valor por km').fill('3.50');
    await page.getByPlaceholder('Mínimo por viagem').fill('10.00');
    await page.getByPlaceholder('Mínimo da diária').fill('25.00');

    await page.getByText('Salvar tabela', { exact: true }).locator('xpath=..').click();

    await expect(page).toHaveURL(/delivery\/courier\/rates\/companies/);
    await expect(page.getByRole('heading', { name: 'Associar empresas' })).toBeVisible();
    await expect(page.getByText('Restaurante Centro - Centro', { exact: true }).last()).toBeVisible();
  });

  test('opens the courier presence history screen from the detail view', async ({ page }) => {
    await createDeliveryApiMock(page, {
      presences: [
        buildPresenceRow({
          id: 301,
          company: createCompany(3, { name: 'Restaurante Centro', alias: 'Centro' }),
          courier: createCourier(),
          availabilityMode: 'manual',
          isOnline: true,
          manualReason: 'Imprevisto na rota',
          schedules: [
            buildScheduleRow({
              id: 201,
              courier: createCourier(),
              label: 'Segunda - manha',
              weekday: 1,
              startTime: '10:00',
              endTime: '12:00',
              active: true,
              usageCount: 2,
            }),
          ],
          schedulesSummary: 'Segunda - manha',
        }),
      ],
      logs: [
        buildLogRow({
          id: 9001,
          rowId: 301,
          className: 'ControleOnline\\Entity\\DeliveryCourierCompanyPresence',
          entityIri: '/delivery_courier_company_presences/301',
          action: 'update',
          payload: {
            message: 'Imprevisto na rota',
            availabilityMode: 'manual',
            isOnline: true,
            manualReason: 'Imprevisto na rota',
          },
        }),
      ],
    });

    await page.goto('/delivery/courier/presence/detail?companyId=3');

    await expect(page.getByText('Restaurante Centro - Centro', { exact: true }).first()).toBeVisible();
    await page.getByText('Historico', { exact: true }).click();

    await expect(page).toHaveURL(/delivery\/courier\/presence\/history/);
    await expect(page.getByText('Timeline')).toBeVisible();
    await expect(page.getByText('Imprevisto na rota').last()).toBeVisible();
  });

  test('opens the manager presence history screen in read only mode', async ({ page }) => {
    await createDeliveryApiMock(page, {
      presences: [
        buildPresenceRow({
          id: 301,
          company: createCompany(3, { name: 'Restaurante Centro', alias: 'Centro' }),
          courier: createCourier(),
          availabilityMode: 'manual',
          isOnline: true,
          manualReason: 'Imprevisto na rota',
          schedulesSummary: 'Segunda - manha',
        }),
      ],
      logs: [
        buildLogRow({
          id: 9001,
          rowId: 301,
          className: 'ControleOnline\\Entity\\DeliveryCourierCompanyPresence',
          entityIri: '/delivery_courier_company_presences/301',
          action: 'update',
          payload: {
            message: 'Imprevisto na rota',
            availabilityMode: 'manual',
            isOnline: true,
            manualReason: 'Imprevisto na rota',
          },
        }),
      ],
    });

    await page.goto(
      '/delivery/manager/presence/history?id=301&store=delivery_courier_company_presences&entityClass=ControleOnline%5CEntity%5CDeliveryCourierCompanyPresence&entityLabel=Restaurante%20Centro%20-%20Centro',
    );

    await expect(page.getByText('Timeline')).toBeVisible();
    await expect(page.getByText('Restaurante Centro - Centro', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Imprevisto na rota').last()).toBeVisible();
  });
});
