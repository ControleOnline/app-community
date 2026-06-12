const { expect, test } = require('playwright/test');
const packageJson = require('../../../package.json');

const API_ORIGIN = 'https://api.controleonline.com';
const APP_VERSION = packageJson?.version || '1.0.0';
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers':
    'API-TOKEN, APP-DOMAIN, DEVICE, ACCEPT, CONTENT-TYPE, X-Requested-With',
  'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
};

const collection = (member = []) => ({
  member,
  'hydra:member': member,
  totalItems: member.length,
  'hydra:totalItems': member.length,
  summary: {},
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
  name: 'Restaurante Teste',
  alias: 'Restaurante Teste',
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

const createMenuCategories = () => [
  {
    id: 10,
    '@id': '/categories/10',
    name: 'Lanches',
    context: 'products',
    active: true,
    extraData: { sortOrder: 1 },
  },
  {
    id: 11,
    '@id': '/categories/11',
    name: 'Bebidas',
    context: 'products',
    active: true,
    extraData: { sortOrder: 2 },
  },
];

const createMenuProducts = ({ withCategory = true } = {}) => [
  {
    id: 1104,
    '@id': '/products/1104',
    product: 'Alpha Gyros (Fraldinha)',
    description: 'Pao Frances, Carne, Vinagrete',
    sku: 'ALPHA',
    type: 'product',
    active: true,
    price: 59.9,
    productCategory: withCategory ? [{ category: { id: 10, '@id': '/categories/10' } }] : [],
    productFiles: [],
    extraData: {},
  },
];

const mockMenuCostsApi = async page => {
  const company = createCompany();
  const savedConfigRequests = [];

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
        body: JSON.stringify({ ip: '127.0.0.1' }),
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

    if (pathname === 'configs/discovery-configs') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify({ configs: {} }),
      });
    }

    if (pathname === 'configs/add-many-configs' || pathname === 'configs/add-configs') {
      savedConfigRequests.push(request.postDataJSON());
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify({}),
      });
    }

    if (pathname === 'categories') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection(createMenuCategories())),
      });
    }

    if (pathname === 'products') {
      const search = url.search.toLowerCase();
      const isCategoryLookup = search.includes('productcategory.category');
      const products = !isCategoryLookup && (search.includes('feedstock') || search.includes('package') || search.includes('manufactured'))
        ? []
        : createMenuProducts({ withCategory: isCategoryLookup });

      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection(products)),
      });
    }

    return route.fulfill({
      status: 200,
      headers: jsonHeaders(),
      body: JSON.stringify(collection([])),
    });
  });

  await page.addInitScript(
    ({ appVersion }) => {
      localStorage.setItem(
        'session',
        JSON.stringify({
          id: 7,
          people: '/people/7',
          api_key: 'test-api-key',
          active: 1,
          mycompany: 3,
        }),
      );
      localStorage.setItem('config', JSON.stringify({ language: 'pt-br' }));
      localStorage.setItem(
        'device',
        JSON.stringify({
          id: 'web-manager',
          device: 'web-manager',
          type: 'WEB',
          appName: 'Browser Manager',
          appVersion,
          buildNumber: appVersion,
          systemName: 'web',
          systemVersion: 'web',
          deviceType: 'web',
          metadata: {},
        }),
      );
      },
    { appVersion: APP_VERSION },
  );

  return { savedConfigRequests };
};

test.describe('menu costs dashboard smoke', () => {
  test('renders the executive radar on the dashboard route', async ({ page }) => {
    const api = await mockMenuCostsApi(page);

    await page.goto('/menu-costs-page');

    await expect(page.getByText('Radar da operação')).toBeVisible();
    await expect(page.getByText('Cardápio técnico pronto para leitura')).toBeVisible();
    await expect(page.getByText('Abrir cardápio técnico')).toBeVisible();
    await expect(page.getByText('Ajustar premissas e rateio')).toBeVisible();
    await expect(page.getByText('Entender motor de custo')).toBeVisible();
    await expect(page.getByText('Revisar compras')).toBeVisible();

    await page.getByText('Entender motor de custo').click();

    await expect(page.getByText('Motor de custo atual')).toBeVisible();
    await expect(page.getByText('Fluxo de cálculo')).toBeVisible();
    await expect(page.getByText('Regras por canal', { exact: true })).toBeVisible();
    await expect(page.getByText('Marketplace')).toBeVisible();
    await expect(page.getByText('Salvar regras do motor')).toBeVisible();
    await expect(page.getByText('Vincular estes canais aos canais homologados do ERP')).toBeVisible();

    await page.getByText('Salvar regras do motor').click();
    await expect.poll(() => api.savedConfigRequests.length).toBeGreaterThan(0);
    expect(JSON.stringify(api.savedConfigRequests)).toContain('menu-costs-cost-engine-rules');

    await page.getByText('Produtos de venda').click();

    await expect(page.getByText('Cardápio de engenharia')).toBeVisible();
    await expect(page.getByText('Lanches').first()).toBeVisible();
    await expect(page.getByText('Bebidas').first()).toBeVisible();
    await expect(page.getByText('Expandir todas')).toBeVisible();

    await page.getByText('Expandir todas').click();

    await expect(page.getByText('Alpha Gyros (Fraldinha)').first()).toBeVisible();

    await page.getByText('Motor de custo', { exact: true }).click();

    await page.getByText('Editar premissas').click();

    await expect(page).toHaveURL(/menu-costs-page\/parametros/);
    await expect(page.getByRole('heading', { name: 'Premissas e rateio' })).toBeVisible();
    await expect(page.getByText('Premissas da operação')).toBeVisible();
  });
});
