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

const collection = (member = [], summary = {}) => ({
  member,
  'hydra:member': member,
  totalItems: member.length,
  'hydra:totalItems': member.length,
  summary,
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

const createCategory = (id, name, context) => ({
  '@id': `/categories/${id}`,
  id,
  name,
  context,
});

const createEmployeeProfile = employeeLink => ({
  '@id': '/employee_profiles/21',
  id: 21,
  peopleLink: employeeLink,
  jobTitle: createCategory(101, 'Analista de RH', 'employment-job'),
  jobTitleLabel: 'Analista de RH',
  jobFunction: createCategory(102, 'Departamento pessoal', 'employment-function'),
  jobFunctionLabel: 'Departamento pessoal',
  department: createCategory(103, 'Gente e gestao', 'employment-department'),
  departmentLabel: 'Gente e gestao',
  employmentType: createCategory(104, 'CLT', 'employment-type'),
  employmentTypeLabel: 'CLT',
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

const createContract = employee => ({
  '@id': '/contracts/61',
  id: 61,
  contractModel: {
    '@id': '/models/71',
    id: 71,
    model: 'Contrato CLT',
    context: 'employment',
  },
  status: {
    '@id': '/statuses/1',
    id: 1,
    status: 'open',
    realStatus: 'open',
    color: '#16A34A',
  },
  provider: createCompany(),
  client: employee,
  peoples: [
    {
      peopleType: 'Contractor',
      people: employee,
    },
  ],
  docKey: 'employment-61',
  startDate: '2026-01-05T00:00:00.000Z',
  endDate: '2027-01-05T00:00:00.000Z',
  creationDate: '2026-07-10T08:00:00.000Z',
  alterDate: '2026-07-10T08:00:00.000Z',
});

const createExportJob = (employee, company) => ({
  '@id': '/people_export_jobs/51',
  id: 51,
  context: 'employment',
  contextLabel: 'employment',
  kind: 'timesheet',
  kindLabel: 'Folha de ponto',
  company: company || createCompany(),
  companyLabel: 'GYROS',
  people: employee,
  peopleLabel: 'Ana Souza',
  periodStart: '2026-07-01',
  periodEnd: '2026-07-31',
  status: 'done',
  statusLabel: 'Concluido',
  fileLabel: 'folha-rh-2026-07.pdf',
  file: {
    '@id': '/files/91',
    id: 91,
    fileName: 'folha-rh-2026-07',
    extension: 'pdf',
  },
  filters: {
    period: {
      shortcut: '30d',
    },
  },
  creationDate: '2026-07-10T08:00:00.000Z',
  alterDate: '2026-07-10T08:00:00.000Z',
});

const createAttendanceLateRow = employee => ({
  '@id': '/report/people/attendance/1',
  id: '1-20260713',
  context: 'employment',
  contextLabel: 'RH',
  company: createCompany(),
  companyLabel: 'GYROS',
  peopleId: employee.id,
  peopleLabel: 'Ana Souza',
  department: 'Gente e gestao',
  jobTitle: 'Analista de RH',
  jobFunction: 'Departamento pessoal',
  date: '2026-07-13',
  dateLabel: '13/07/2026',
  weekdayLabel: 'Segunda',
  scheduleLabel: 'Segunda 08:00 - 17:00',
  entryTimesLabel: '08:15',
  exitTimesLabel: '17:25',
  workedMinutes: 550,
  workedHoursLabel: '09:10',
  expectedMinutes: 540,
  expectedHoursLabel: '09:00',
  delayMinutes: 15,
  delayLabel: '+00:15',
  overtimeMinutes: 25,
  overtimeLabel: '+00:25',
  balanceMinutes: 10,
  status: 'late_overtime',
  statusLabel: 'Atraso e extra',
  tone: 'warning',
  absenceLabel: '-',
  justificationLabel: '-',
  justificationFileLabel: '-',
  absenceId: null,
});

const createAttendanceAbsenceRow = employee => ({
  '@id': '/report/people/attendance/2',
  id: '1-20260714',
  context: 'employment',
  contextLabel: 'RH',
  company: createCompany(),
  companyLabel: 'GYROS',
  peopleId: employee.id,
  peopleLabel: 'Ana Souza',
  department: 'Gente e gestao',
  jobTitle: 'Analista de RH',
  jobFunction: 'Departamento pessoal',
  date: '2026-07-14',
  dateLabel: '14/07/2026',
  weekdayLabel: 'Terca',
  scheduleLabel: 'Segunda 08:00 - 17:00',
  entryTimesLabel: '-',
  exitTimesLabel: '-',
  workedMinutes: 0,
  workedHoursLabel: '00:00',
  expectedMinutes: 540,
  expectedHoursLabel: '09:00',
  delayMinutes: 0,
  delayLabel: '-',
  overtimeMinutes: 0,
  overtimeLabel: '-',
  balanceMinutes: -540,
  status: 'absent_justified',
  statusLabel: 'Falta justificada',
  tone: 'danger',
  absenceLabel: 'Falta justificada',
  justificationLabel: 'Atestado medico',
  justificationFileLabel: 'atestado-medico.pdf',
  absenceId: 81,
});

const createAttendanceSummary = () => ({
  rows: 2,
  late: 1,
  absences: 1,
  overtime: 1,
  justifiedAbsences: 1,
  workedMinutes: 550,
  expectedMinutes: 1080,
  delayMinutes: 15,
  overtimeMinutes: 25,
  balanceMinutes: -530,
});

const createAbsence = employee => ({
  '@id': '/people_absences/81',
  id: 81,
  context: 'employment',
  contextLabel: 'RH',
  company: createCompany(),
  companyLabel: 'GYROS',
  people: employee,
  peopleLabel: 'Ana Souza',
  absenceDate: '2026-07-14',
  absenceDateLabel: '14/07/2026',
  reason: 'Atestado medico',
  justificationFileId: 91,
  justificationFileLabel: 'atestado-medico.pdf',
  justificationLabel: 'Atestado medico',
  hasJustification: true,
  statusLabel: 'Justificada',
  active: true,
  creationDate: '2026-07-14T08:00:00.000Z',
  alterDate: '2026-07-14T08:00:00.000Z',
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
  const contract = createContract(employee);
  const exportJob = createExportJob(employee, company);
  const attendanceRows = [
    createAttendanceLateRow(employee),
    createAttendanceAbsenceRow(employee),
  ];
  const attendanceSummary = createAttendanceSummary();
  const absences = [createAbsence(employee)];
  const requestCounts = new Map();

  const incrementRequestCount = pathname => {
    requestCounts.set(pathname, (requestCounts.get(pathname) || 0) + 1);
  };

  await page.route(`${API_ORIGIN}/**`, async route => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/^\/+/, '');
    const method = request.method().toUpperCase();

    if (method !== 'OPTIONS') {
      incrementRequestCount(pathname);
    }

    if (method === 'OPTIONS') {
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

    if (pathname === 'people') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection([employee])),
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
        body: JSON.stringify(collection([exportJob])),
      });
    }

    if (pathname === 'report/people/attendance') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection(attendanceRows, attendanceSummary)),
      });
    }

    if (pathname === 'people_absences') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection(absences)),
      });
    }

    if (pathname === 'contracts') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection([contract])),
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

  return {requestCounts};
};

test.describe('admin employee smoke', () => {
  test('opens the RH detail and switches the generic tabs', async ({page}) => {
    const {requestCounts} = await mockAdminHrApi(page);

    await page.goto('/hr/employees/details?id=1&context=employment');

    await expect(page.getByText('Dados base', {exact: true})).toBeVisible();
    await expect(page.getByText('Ana Souza', {exact: true}).first()).toBeVisible();
    await expect(page.getByText('Analista de RH', {exact: true}).first()).toBeVisible();
    await expect(page.getByRole('button', {name: 'Cargo e funcao'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Movimentos'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Ponto'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Agendas'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Exportacao'})).toBeVisible();

    await page.getByRole('button', {name: 'Cargo e funcao'}).click();
    await expect(page.getByRole('button', {name: 'Salvar perfil'})).toBeVisible();

    await page.getByRole('button', {name: 'Movimentos'}).click();
    await expect(page.getByText('Entrada', {exact: true}).first()).toBeVisible();

    await page.getByRole('button', {name: 'Ponto'}).click();
    await expect(page.getByText('Atrasos: 1', {exact: true}).first()).toBeVisible();
    await expect(page.getByText('Faltas: 1', {exact: true}).first()).toBeVisible();
    await expect(page.getByText('Hora extra: 1', {exact: true}).first()).toBeVisible();
    await expect(page.getByText('Falta justificada', {exact: true}).first()).toBeVisible();
    await expect(page.getByRole('button', {name: 'Registrar falta'})).toBeVisible();

    await page.getByRole('button', {name: 'Registrar falta'}).click();
    await expect(page.getByText('Atestado ou justificativa', {exact: true}).first()).toBeVisible();
    await expect(page.getByRole('button', {name: 'Selecionar arquivo'})).toBeVisible();
    await page.getByRole('button', {name: 'Cancelar'}).click();

    await page.getByRole('button', {name: 'Agendas'}).click();
    await expect(page.getByText('Turno da manha', {exact: true}).first()).toBeVisible();
    await expect(page.getByText('Segunda 08:00 17:00', {exact: true}).first()).toBeVisible();

    await page.getByRole('button', {name: 'Exportacao'}).click();
    await expect(page.getByRole('button', {name: 'Gerar folha'})).toBeVisible();
    await expect(page.getByText('Periodo', {exact: true}).first()).toBeVisible();

    expect(requestCounts.get('menus-people') || 0).toBeGreaterThanOrEqual(1);
    expect(requestCounts.get('orders') || 0).toBe(0);
  });

  test('opens the RH hub and the dedicated management screens', async ({page}) => {
    const {requestCounts} = await mockAdminHrApi(page);

    await page.goto('/hr');

    await expect(page.getByText('RH', {exact: true}).first()).toBeVisible();
    await expect(page.getByRole('button', {name: 'Funcionarios'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Cargos e funcoes'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Movimentos'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Ponto por setor'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Contratos'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Agendas'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Folha de ponto'})).toBeVisible();

    await page.getByRole('button', {name: 'Ponto por setor'}).click();
    await expect(page.getByText('Recorte atual: RH.', {exact: true}).first()).toBeVisible();
    await expect(page.getByText('Ana Souza', {exact: true}).first()).toBeVisible();
    await expect(page.getByText('Falta justificada', {exact: true}).first()).toBeVisible();
    await expect(page.getByText('+00:15', {exact: true}).first()).toBeVisible();

    await page.goto('/hr');

    await page.getByRole('button', {name: 'Funcionarios'}).click();
    await expect(page.getByText('Ana Souza', {exact: true}).first()).toBeVisible();

    await page.goto('/hr/functions');
    await expect(page.getByText('Cargos e funcoes', {exact: true}).first()).toBeVisible();
    await expect(page.getByText('Analista de RH', {exact: true}).first()).toBeVisible();

    await page.goto('/hr/movements');
    await expect(page.getByText('Movimentos', {exact: true}).first()).toBeVisible();
    await expect(page.getByText('Entrada', {exact: true}).first()).toBeVisible();

    await page.goto('/hr/contracts');
    await expect(page.getByText('Contratos', {exact: true}).first()).toBeVisible();
    await expect(page.getByText('Contrato CLT', {exact: true}).first()).toBeVisible();

    await page.goto('/hr/schedules');
    await expect(page.getByText('Agendas', {exact: true}).first()).toBeVisible();
    await expect(page.getByText('Turno da manha', {exact: true}).first()).toBeVisible();

    await page.goto('/hr/exports');
    await expect(page.getByText('Folha de ponto', {exact: true}).first()).toBeVisible();
    await expect(page.getByRole('button', {name: 'Gerar folha'})).toBeVisible();
    await expect(page.getByText('folha-rh-2026-07.pdf', {exact: true}).first()).toBeVisible();
    await expect(page.getByText('Periodo da folha', {exact: true}).first()).toBeVisible();

    expect(requestCounts.get('menus-people') || 0).toBeGreaterThanOrEqual(1);
    expect(requestCounts.get('orders') || 0).toBe(0);
  });
});
