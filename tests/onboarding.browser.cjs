// Exported APP smoke with synthetic session/data. Every non-static request is
// fulfilled locally, including bootstrap device writes; no operational API.
const {chromium, expect} = require('playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {installBrowserModuleResolver} = require('../scripts/browser-module-paths.cjs');
installBrowserModuleResolver(path.resolve(__dirname, '..'));
const apiOriginModule = require.resolve('../src/tests/browser/apiOrigin');
require.cache[apiOriginModule] = {id: apiOriginModule, filename: apiOriginModule, loaded: true, exports: {API_ORIGIN: 'http://api.invalid'}};
const {createWaiterPosChargeMock} = require('../node_modules/@controleonline/ui-orders/src/tests/browser/pos/waiter-pos-charge-api-mock');
const {jsonHeaders, collection} = require('../node_modules/@controleonline/ui-orders/src/tests/browser/pos/single-item-fixtures');
const directory = path.resolve(process.argv[2] || '');
if (!fs.existsSync(path.join(directory, 'index.html'))) throw new Error('Pass the local Expo web export directory.');

(async () => {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const candidate = path.resolve(directory, `.${pathname}`);
    if (candidate !== directory && !candidate.startsWith(directory + path.sep)) {res.writeHead(403); res.end(); return;}
    const file = fs.existsSync(candidate) && fs.statSync(candidate).isFile() ? candidate : path.join(directory, 'index.html');
    const types = {'.js': 'application/javascript', '.html': 'text/html', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.ttf': 'font/ttf'};
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({headless: true});
  try {
    const page = await browser.newPage({viewport: {width: 393, height: 852}, locale: 'pt-BR'});
    await page.routeWebSocket(/.*/, socket => socket.close());
    const errors = [];
    const calls = [];
    let state;
    page.on('pageerror', error => errors.push(error.message));
    const proxy = {
      addInitScript: (script, args) => page.addInitScript(script, {...args, appType: 'MANAGER'}),
      route: async (_pattern, handler) => page.context().route('**/*', async route => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.origin === origin && (request.resourceType() === 'document' || url.pathname.startsWith('/_expo/') || url.pathname.startsWith('/assets/') || url.pathname === '/favicon.ico')) return route.continue();
        if (url.href === 'https://cdn.jsdelivr.net/npm/jsqr@1.2.0/dist/jsQR.min.js' || request.resourceType() === 'script') return route.fulfill({status: 200, contentType: 'application/javascript', body: 'self.jsQR = () => null;'});
        const endpoint = url.pathname.replace(/^\/+/, '');
        calls.push({endpoint, method: request.method()});
        const fixtures = {
          people_links: [{id: 1, company: '/people/3', people: {id: 7}, linkType: 'owner', enable: true}],
          products: [{id: 1, company: '/people/3', product: 'Produto de teste'}],
          queues: [{id: 1, company: '/people/3', queue: 'Produção'}],
          displays: [{id: 1, company: '/people/3', display: 'Cozinha', displayType: 'production'}],
        };
        if (fixtures[endpoint]) return route.fulfill({status: 200, headers: jsonHeaders(), body: JSON.stringify(collection(fixtures[endpoint]))});
        if (endpoint === 'devices/1') return route.fulfill({status: 200, headers: jsonHeaders(), body: JSON.stringify({id: 1, device: 'web-7', type: 'PDV', alias: 'Garçom de teste'})});
        return handler(route);
      }),
    };
    state = await createWaiterPosChargeMock(proxy);
    state.company.user = {owner_enabled: true};
    state.company.permission = ['owner'];
    state.mainCompany.user = {owner_enabled: true};
    state.mainCompany.permission = ['owner'];
    state.deviceConfig.alias = 'Garçom de teste';
    state.deviceConfig.configs = JSON.stringify({...JSON.parse(state.deviceConfig.configs), 'check-order-type': 'table-tab', 'order-charge-enabled': false});
    await page.goto(`${origin}/`);
    try {
      await expect(page.getByTestId('open-operation-setup')).toBeVisible({timeout: 30000});
    } catch (error) {
      await page.screenshot({path: '/tmp/onboarding-1013-home-failure.png', fullPage: true});
      throw new Error(`${error.message}\nSynthetic page: ${await page.locator('body').innerText()}`);
    }
    await page.getByTestId('open-operation-setup').click();
    await expect(page).toHaveURL(/\/onboarding$/);
    expect(await page.evaluate(() => localStorage.getItem('app-type'))).toBe('MANAGER');
    await expect(page.getByTestId('setup-onboarding')).toBeVisible({timeout: 30000});
    await expect(page.getByRole('button', {name: 'Cadastrar e configurar devices'})).toHaveCount(0);
    await page.getByTestId('setup-step-device').click();
    await expect(page.getByText('Vínculo: Mesa + comanda', {exact: true})).toBeVisible();
    await expect(page.getByText('Cobrança: Desabilitada neste device', {exact: true})).toBeVisible();
    await page.getByRole('switch', {name: 'Revisei esta etapa nas telas do ERP'}).check();
    await page.screenshot({path: '/tmp/onboarding-1013-mobile.png', fullPage: true});
    await page.reload();
    await expect(page.getByRole('switch', {name: 'Revisei esta etapa nas telas do ERP'})).toBeChecked();
    await page.getByTestId('setup-step-review').click();
    await expect(page.getByText(/A revisão local não substitui a validação funcional/)).toBeVisible();
    await page.getByLabel('Observações da implantação').fill('Conferir impressora e acesso do garçom');
    await page.setViewportSize({width: 1366, height: 900});
    await page.getByTestId('setup-step-device').click();
    await page.screenshot({path: '/tmp/onboarding-1013-desktop.png', fullPage: true});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const commercial = calls.filter(call => !['GET', 'OPTIONS'].includes(call.method) && /^(orders|invoices|queues|products|people_links)(\/|$)/.test(call.endpoint));
    expect(commercial).toEqual([]);
    if (errors.length) throw new Error(errors.join('\n'));
    console.log(JSON.stringify({passed: true, pageErrors: 0, commercialWrites: 0, requestsIntercepted: calls.length, mobile: '/tmp/onboarding-1013-mobile.png', desktop: '/tmp/onboarding-1013-desktop.png'}));
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {console.error(error.message); process.exitCode = 1;});
