const {expect, test} = require('playwright/test');
const {API_ORIGIN} = require('../apiOrigin');

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers':
    'API-TOKEN, APP-DOMAIN, DEVICE, ACCEPT, CONTENT-TYPE, X-Requested-With',
  'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
};

const collection = (member = [], summary = {}) => ({
  member,
  'hydra:member': member,
  totalItems: member.length,
  'hydra:totalItems': member.length,
  summary,
});

const jsonHeaders = () => ({
  ...CORS_HEADERS,
  'content-type': 'application/ld+json; charset=utf-8',
});

const textHeaders = () => ({
  ...CORS_HEADERS,
  'content-type': 'text/css; charset=utf-8',
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

const createAdminMenus = () => ({
  modules: {
    admin: {
      id: 'admin-configuracoes',
      label: 'Configuracoes',
      icon: 'settings',
      menus: [
        {
          id: 'menu_access',
          menuKey: 'menu_access',
          label: 'Menus por perfil',
          route: 'MenuAccessConfigPage',
          icon: 'list',
          color: '#64748B',
          sortOrder: 10,
          menuType: 'home',
        },
      ],
    },
  },
});

const createMenuConfigResponse = () => ({
  member: [],
  summary: {
    appTypes: ['ADMIN', 'MANAGER', 'CRM', 'POS', 'DELIVERY', 'PPC', 'SHOP', 'SERVICE'],
    linkTypes: ['owner', 'director', 'manager', 'employee', 'salesman', 'after-sales'],
    categories: [],
    routes: [],
  },
});

const mockAdminApi = async page => {
  const company = createCompany();

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
        body: JSON.stringify(createAdminMenus()),
      });
    }

    if (pathname === 'menu-config') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(createMenuConfigResponse()),
      });
    }

    if (pathname === 'configs/discovery-configs') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify({configs: {}}),
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
          // Some initial documents (like about:blank) do not expose storage.
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
      setLocalStorageItem('app-type', 'ADMIN');
    },
    {appVersion: '1.0.0'},
  );
};

test.describe('admin browser smoke', () => {
  test('opens the admin home and reaches menu configuration', async ({page}) => {
    await mockAdminApi(page);

    await page.goto('/');

    await expect(page.getByText('Cadastro de menus')).toBeVisible();

    await page.getByText('Cadastro de menus').click();

    await expect(page).toHaveURL(/menu-access-config-page/);
    await expect(page.getByRole('heading', {name: 'Menus por perfil'})).toBeVisible();
  });
});
