const {expect, test} = require('playwright/test');
const packageJson = require('../../../../package.json');
const {API_ORIGIN} = require('../apiOrigin');

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
  'hydra:totalItems': member.length,
  summary: {},
});

const createCompany = () => ({
  id: 3,
  name: 'Gyros',
  alias: 'GYROS',
  panel_enabled: true,
  enabled: true,
  commercial_enabled: true,
  theme: {
    colors: {
      primary: '#0EA5E9',
      secondary: '#F97316',
    },
  },
  configs: {},
});

const createEmployee = () => ({
  '@id': '/people/1',
  id: 1,
  name: 'Ana Souza',
  alias: 'Ana Souza',
  peopleType: 'F',
  otherInformations: {
    snapshot: 'RH',
  },
});

const createEmployeeLink = employee => ({
  '@id': '/people_links/11',
  id: 11,
  company: createCompany(),
  people: employee,
  linkType: 'employee',
  enable: true,
});

const createEmployeeProfile = employeeLink => ({
  '@id': '/employee_profiles/21',
  id: 21,
  peopleLink: employeeLink,
  jobTitle: 'Analista de RH',
  jobFunction: 'Departamento pessoal',
  department: 'Gente e gestao',
  employmentType: 'CLT',
  admissionDate: '2026-01-05',
  terminationDate: null,
  workloadHours: 44,
  linkedinUrl: 'https://linkedin.com/in/ana',
  linkedinHeadline: 'Especialista em RH',
  linkedinSummary: 'Resumo profissional',
  linkedinSnapshot: [
    {
      headline: 'Especialista em RH',
    },
  ],
  notes: 'Perfil local do colaborador.',
  active: true,
  creationDate: '2026-07-01T10:00:00.000Z',
  alterDate: '2026-07-02T10:00:00.000Z',
});

const createMovement = employee => ({
  '@id': '/people_access_events/31',
  id: 31,
  context: 'employment',
  contextLabel: 'employment',
  company: createCompany(),
  companyLabel: 'GYROS',
  people: employee,
  peopleLabel: 'Ana Souza',
  direction: 'entry',
  directionLabel: 'entry',
  eventAt: '2026-07-10T08:00:00.000Z',
  source: 'manual',
  payload: {
    source: 'smoke',
  },
  creationDate: '2026-07-10T08:00:00.000Z',
  alterDate: '2026-07-10T08:00:00.000Z',
});

const createSchedule = employee => ({
  '@id': '/people_schedules/41',
  id: 41,
  context: 'employment',
  contextLabel: 'employment',
  company: createCompany(),
  companyLabel: 'GYROS',
  people: employee,
  peopleLabel: 'Ana Souza',
  professionalPeople: null,
  professionalPeopleLabel: null,
  label: 'Turno da manha',
  mode: 'recurring',
  modeLabel: 'recurring',
  weekday: 1,
  weekdayLabel: 'Segunda',
  startTime: '08:00:00',
  endTime: '17:00:00',
  windowLabel: 'Segunda 08:00 - 17:00',
  periodLabel: '-',
  active: true,
  payload: {},
  creationDate: '2026-07-10T08:00:00.000Z',
  alterDate: '2026-07-10T08:00:00.000Z',
});

const createAdminRuntimeMenusResponse = () => ({
  modules: {},
});

const mockAdminHrApi = async page => {
  const company = createCompany();
  const employee = createEmployee();
  const employeeLink = createEmployeeLink(employee);
  const employeeProfile = createEmployeeProfile(employeeLink);
  const movement = createMovement(employee);
  const schedule = createSchedule(employee);

  await page.route(`${API_ORIGIN}/**`, async route => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/^\/+/, '');

    if (request.method().toUpperCase() === 'OPTIONS') {
      return route.fulfill({
        status: 204,
        headers: CORS_HEADERS,
        body: '',
      });
    }

    if (pathname === 'themes-colors.css') {
      return route.fulfill({
        status: 200,
        headers: textHeaders(),
        body: ':root { --primary: #0ea5e9; --secondary: #f97316; }',
      });
    }

    if (pathname === 'runtime/ip') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify({ip: '127.0.0.1'}),
      });
    }

    if (pathname === 'people/companies/my') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection([company])),
      });
    }

    if (pathname === 'people/company/default') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(company),
      });
    }

    if (pathname === 'menus-people') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(createAdminRuntimeMenusResponse()),
      });
    }

    if (pathname === 'menu-config') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify({member: [], summary: {appTypes: ['ADMIN'], linkTypes: ['employee'], categories: [], routes: []}}),
      });
    }

    if (pathname === 'configs/discovery-configs') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify({configs: {}}),
      });
    }

    if (pathname === 'tests') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify({member: [], summary: {types: {}, suites: {}, tests: {}}}),
      });
    }

    if (pathname === 'people/1') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(employee),
      });
    }

    if (pathname === 'people_links') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection([employeeLink])),
      });
    }

    if (pathname === 'employee_profiles') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection([employeeProfile])),
      });
    }

    if (pathname === 'people_access_events') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection([movement])),
      });
    }

    if (pathname === 'people_schedules') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection([schedule])),
      });
    }

    if (pathname === 'people_export_jobs') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection([])),
      });
    }

    return route.fulfill({
      status: 200,
      headers: jsonHeaders(),
      body: JSON.stringify(collection([])),
    });
  });

  await page.addInitScript(
    ({appVersion}) => {
      const setLocalStorageItem = (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch {
          // Some initial documents do not expose storage.
        }
      };

      setLocalStorageItem(
        'session',
        JSON.stringify({
          id: 7,
          people: '/people/7',
          api_key: 'test-api-key',
          active: 1,
          mycompany: 3,
          roles: ['ROLE_SUPER'],
        }),
      );
      setLocalStorageItem('app-type', 'ADMIN');
      setLocalStorageItem('config', JSON.stringify({language: 'pt-br'}));
      setLocalStorageItem(
        'device',
        JSON.stringify({
          id: 'web-admin',
          device: 'web-admin',
          type: 'WEB',
          appName: 'Browser Admin',
          appVersion,
          buildNumber: appVersion,
          systemName: 'web',
          systemVersion: 'web',
          deviceType: 'web',
          metadata: {},
        }),
      );
    },
    {appVersion: APP_VERSION},
  );
};

test.describe('admin employee smoke', () => {
  test('opens the RH detail and switches the generic tabs', async ({page}) => {
    await mockAdminHrApi(page);

    await page.goto('/hr/employees/details?id=1&context=employment');

    await expect(page.getByText('Dados base', {exact: true})).toBeVisible();
    await expect(page.getByText('Ana Souza', {exact: true}).first()).toBeVisible();
    await expect(page.getByText('Analista de RH', {exact: true}).first()).toBeVisible();
    await expect(page.getByRole('button', {name: 'Cargo e funcao'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Movimentos'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Agendas'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Exportacao'})).toBeVisible();

    await page.getByRole('button', {name: 'Cargo e funcao'}).click();
    await expect(page.getByRole('button', {name: 'Salvar perfil'})).toBeVisible();

    await page.getByRole('button', {name: 'Movimentos'}).click();
    await expect(page.getByText('Entrada', {exact: true}).first()).toBeVisible();

    await page.getByRole('button', {name: 'Agendas'}).click();
    await expect(page.getByText('Turno da manha', {exact: true}).first()).toBeVisible();
    await expect(page.getByText('Segunda 08:00 17:00', {exact: true}).first()).toBeVisible();

    await page.getByRole('button', {name: 'Exportacao'}).click();
    await expect(page.getByRole('button', {name: 'Gerar folha'})).toBeVisible();
    await expect(page.getByText('Periodo', {exact: true}).first()).toBeVisible();
  });
});
