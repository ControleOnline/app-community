// Isolated exported-bundle smoke. All API/payment requests are fulfilled locally.
const {chromium, expect} = require('playwright/test');
const path = require('node:path');
const {installBrowserModuleResolver} = require('../scripts/browser-module-paths.cjs');
installBrowserModuleResolver(path.resolve(__dirname, '..'));
const apiOriginModule = require.resolve('../src/tests/browser/apiOrigin');
require.cache[apiOriginModule] = {id: apiOriginModule, filename: apiOriginModule, loaded: true,
  exports: {API_ORIGIN: 'http://api.invalid'}};
const {createWaiterPosChargeMock} = require('../node_modules/@controleonline/ui-orders/src/tests/browser/pos/waiter-pos-charge-api-mock');
const {jsonHeaders, collection} = require('../node_modules/@controleonline/ui-orders/src/tests/browser/pos/single-item-fixtures');
const url = process.argv[2];
if (!/^http:\/\/127\.0\.0\.1:\d+\/$/.test(url || '')) throw new Error('Use the isolated local exported bundle URL.');
(async () => {
 const browser = await chromium.launch({headless: true});
 let debugPage, debugErrors, debugCalls;
 try {
  const page = await browser.newPage({viewport: {width: 393, height: 852}, locale: 'pt-BR'});
  const errors = []; const calls = []; debugPage = page; debugErrors = errors; debugCalls = calls;
  page.on('pageerror', error => errors.push(error.message));
  let state; let holdRoot = false; const heldRoots = [];
  const localOrigin = new URL(url).origin;
  const proxyPage = {
   addInitScript: (...args) => page.addInitScript(...args),
   route: async (_pattern, handler) => page.route('**/*', async route => {
    const request = route.request(); const requestUrl = new URL(request.url());
    if (requestUrl.href === 'https://cdn.jsdelivr.net/npm/jsqr@1.2.0/dist/jsQR.min.js') {
     return route.fulfill({status: 200, contentType: 'application/javascript', body: 'self.jsQR = () => null;'});
    }
    if (requestUrl.origin === localOrigin && (request.resourceType() === 'document' ||
       requestUrl.pathname.startsWith('/_expo/') || requestUrl.pathname.startsWith('/assets/') || requestUrl.pathname === '/favicon.ico')) return route.continue();
    const pathname = requestUrl.pathname.replace(/^\/+/, '');
    calls.push({path: pathname, method: request.method()});
    if (holdRoot && pathname === 'orders/501' && request.method() === 'GET') {
      await new Promise(resolve => heldRoots.push(resolve));
    }
    if (pathname === 'orders') {
     const parents = requestUrl.searchParams.getAll('mainOrderId[]');
     if (requestUrl.searchParams.get('mainOrderId')) parents.push(requestUrl.searchParams.get('mainOrderId'));
     const rows = state.orders.filter(order => parents.includes(String(order.mainOrderId)));
     return route.fulfill({status: 200, headers: jsonHeaders(), body: JSON.stringify(collection(rows))});
    }
    if (pathname === 'invoice') return route.fulfill({status: 404, headers: jsonHeaders(), body: JSON.stringify({message: 'No collection route /invoice'})});
    if (pathname === 'invoices') return route.fulfill({status: 200, headers: jsonHeaders(), body: JSON.stringify(collection(state.invoices))});
    return handler(route);
   }),
  };
  state = await createWaiterPosChargeMock(proxyPage);
  const config = JSON.parse(state.deviceConfig.configs);
  config['check-order-type'] = 'tab'; config['pos-local-charge-enabled'] = true;
  state.deviceConfig.configs = JSON.stringify(config);
  const root = {...state.orders[0], id: 501, provider: '/people/3', orderType: 'tab', externalCode: 'Jorge', price: 80, orderProducts: [], chargeCapability: {enabled: true, local: true, remote: false}};
  const product = (id, name, parent = null) => ({id, quantity: 1, total: id === 10 ? 80 : 0,
   ...(parent ? {orderProduct: `/order_products/${parent}`, showInParentQueue: false,
    productGroup: {id: 8, productGroup: 'Escolha sua batata'}} : {}),
   product: {id, product: name, type: parent || id === 10 ? 'custom' : 'simple'}});
  const sale = {id: 502, provider: '/people/3', mainOrderId: 501, orderType: 'sale', price: 80,
    status: {status: 'preparing', realStatus: 'open'}, orderProducts: [product(10, 'Combo'), product(11, 'Batata', 10)]};
  const draft = {...sale, id: 503, orderType: 'cart', price: 0, status: {status: 'open', realStatus: 'open'}, orderProducts: []};
  state.orders = [root, sale, draft];
  await page.addInitScript(() => {
   const device = JSON.parse(localStorage.getItem('device') || '{}');
   device.configs = {...device.configs, 'check-order-type': 'tab', 'pos-local-charge-enabled': true};
   localStorage.setItem('device', JSON.stringify(device));
  });
  await page.goto(`${url}linked-order-settlement-page?rootOrderId=501&orderType=tab`);
  await expect(page.getByText('Comanda Jorge', {exact: true}).last()).toBeVisible({timeout: 30000});
  await expect(page.getByRole('button', {name: 'Novo lançamento'})).toBeEnabled();
  await expect(page.getByText('Lançamentos enviados (1)', {exact: true})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Rascunhos (1)', exact: true})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Revisar rascunho'})).toHaveCount(0);
  await expect(page.getByText('Batata', {exact: true})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Cobrar comanda'})).toHaveCount(0);
  await page.screenshot({path: '/tmp/pos-consultation-mobile.png', fullPage: true});
  expect(calls.some(call => call.path === 'orders/503' && call.method === 'GET')).toBe(false);
  await page.getByRole('button', {name: 'Rascunhos (1)', exact: true}).click();
  const review = page.getByRole('button', {name: 'Revisar rascunho'});
  await review.scrollIntoViewIfNeeded();
  await expect(review).toBeVisible();
  await expect(page.getByText('Sem itens neste lançamento.', {exact: true})).toBeVisible();
  expect(calls.filter(call => call.path === 'orders/503' && call.method === 'GET')).toHaveLength(1);
  await page.screenshot({path: '/tmp/pos-consultation-mobile-bottom.png', fullPage: true});
  expect(calls.some(call => call.path === 'invoices' && call.method === 'GET')).toBe(true);
  expect(calls.some(call => call.path === 'invoice')).toBe(false);
  // Recreate JS memory and hold the root API response: the visible hierarchy
  // must come from the ERP's real IndexedDB record, not another network read.
  await expect.poll(() => page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('ControleOnline');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pos_tab_consultation_cache')) {db.close(); resolve(0); return;}
      const read = db.transaction('pos_tab_consultation_cache').objectStore('pos_tab_consultation_cache').getAll();
      read.onsuccess = () => {db.close(); resolve(read.result.filter(row => row.snapshot?.rootOrder?.id === 501).length);};
      read.onerror = () => {db.close(); reject(read.error);};
    };
  }))).toBeGreaterThan(0);
  holdRoot = true;
  state.orders[0] = {...state.orders[0], price: 100};
  await page.reload();
  await expect(page.getByText('Batata', {exact: true})).toBeVisible({timeout: 30000});
  await expect(page.getByText('Atualizando consumo…', {exact: true})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Novo lançamento'})).toBeDisabled();
  await expect(page.getByRole('button', {name: 'Fechar comanda'})).toBeDisabled();
  await expect.poll(() => heldRoots.length).toBeGreaterThan(0);
  holdRoot = false; heldRoots.splice(0).forEach(resolve => resolve());
  await expect(page.getByRole('button', {name: 'Novo lançamento'})).toBeEnabled();
  await expect(page.getByText('Pendente: R$ 100,00', {exact: true})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Fechar comanda'})).toBeEnabled();
  await expect(page.getByText('Batata', {exact: true})).toBeVisible();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(JSON.stringify({passed: true, apiRequests: calls.length, capturedCommercialRequests: calls.filter(x => !['GET', 'OPTIONS'].includes(x.method)).length, screenshot: '/tmp/pos-consultation-mobile.png'}));
 } catch (error) {
  console.error(JSON.stringify({errors: debugErrors, requests: debugCalls, text: await debugPage?.locator('body').innerText()}));
  await debugPage?.screenshot({path: '/tmp/waiter-tab-cache-browser-failure.png', fullPage: true});
  throw error;
 } finally {await browser.close();}
})().catch(error => {console.error(error.message); process.exitCode = 1;});
