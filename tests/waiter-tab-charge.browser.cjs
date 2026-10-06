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
 try {
  const page = await browser.newPage({viewport: {width: 393, height: 852}, locale: 'pt-BR'});
  const errors = []; const calls = [];
  page.on('pageerror', error => errors.push(error.message));
  let state;
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
    calls.push({path: pathname, method: request.method(), body: request.postData()});
    if (pathname === 'orders') {
     const parents = requestUrl.searchParams.getAll('mainOrderId[]');
     if (requestUrl.searchParams.get('mainOrderId')) parents.push(requestUrl.searchParams.get('mainOrderId'));
     const rows = state.orders.filter(order => parents.includes(String(order.mainOrderId)));
     return route.fulfill({status: 200, headers: jsonHeaders(), body: JSON.stringify(collection(rows))});
    }
    if (pathname === 'invoice') return route.fulfill({status: 404, headers: jsonHeaders(), body: JSON.stringify({message: 'No collection route /invoice'})});
    if (pathname === 'invoices' && request.method() === 'GET') return route.fulfill({status: 200, headers: jsonHeaders(), body: JSON.stringify(collection(state.invoices))});
    if (pathname === 'statuses') return route.fulfill({status: 200, headers: jsonHeaders(), body: JSON.stringify(collection([{id: 902, '@id': '/statuses/902', context: 'invoice', realStatus: 'closed', status: 'paid'}]))});
    if (pathname === 'invoices' && request.method() === 'POST') {
     const body = request.postDataJSON();
     const invoice = {...body, id: state.nextInvoiceId++, status: {id: 902, realStatus: 'closed', status: 'paid'}};
     state.invoices.push(invoice);
     return route.fulfill({status: 200, headers: jsonHeaders(), body: JSON.stringify(invoice)});
    }
    const cancel = pathname.match(/^orders\/(\d+)\/cancel$/);
    if (cancel && request.method() === 'POST') {
     const order = state.orders.find(x => x.id === Number(cancel[1]));
     if (order.orderType !== 'cart' || request.postDataJSON().draft_only !== true) throw new Error('Only guarded draft cancellation is expected.');
     order.status = {realStatus: 'canceled', status: 'canceled'};
     return route.fulfill({status: 200, headers: jsonHeaders(), body: JSON.stringify({result: {errno: 0, data: {order}}})});
    }
    const delivered = pathname.match(/^orders\/(\d+)\/delivered$/);
    if (delivered && request.method() === 'POST') {
     const id = Number(delivered[1]);
     state.deliveredOrderIds.push(id);
     state.orders.find(order => order.id === id).status = {realStatus: 'closed', status: 'closed'};
     return route.fulfill({status: 200, headers: jsonHeaders(), body: JSON.stringify({result: {errno: 0}})});
    }
    return handler(route);
   }),
  };
  state = await createWaiterPosChargeMock(proxyPage);
  const config = JSON.parse(state.deviceConfig.configs);
  config['check-order-type'] = 'tab'; config['pos-local-charge-enabled'] = false; config['order-charge-enabled'] = true;
  state.deviceConfig.configs = JSON.stringify(config);
  const root = {...state.orders[0], id: 501, provider: '/people/3', orderType: 'tab', externalCode: 'Jorge', price: 80, chargeCapability: {enabled: true, local: true, remote: true}, orderProducts: []};
  const product = (id, name, parent = null) => ({id, quantity: 1, total: id === 10 ? 80 : 0,
   ...(parent ? {orderProduct: `/order_products/${parent}`, showInParentQueue: false,
    productGroup: {id: 8, productGroup: 'Escolha sua batata'}} : {}),
   product: {id, product: name, type: parent || id === 10 ? 'custom' : 'simple'}});
  const sale = {id: 502, provider: '/people/3', mainOrderId: 501, orderType: 'sale', price: 80,
    status: {status: 'preparing', realStatus: 'open'}, orderProducts: [product(10, 'Combo'), product(11, 'Batata', 10)]};
  const draft = {...sale, id: 503, orderType: 'cart', price: 0, status: {status: 'open', realStatus: 'open'}, orderProducts: []};
  state.orders = [root, sale, draft];
  state.company.configs['shop-loyalty-coupons-enabled'] = false;
  page.on('dialog', dialog => dialog.accept());
  await page.addInitScript(() => {
   const device = JSON.parse(localStorage.getItem('device') || '{}');
   device.configs = {...device.configs, 'check-order-type': 'tab', 'pos-local-charge-enabled': false};
   localStorage.setItem('device', JSON.stringify(device));
  });
  await page.goto(`${url}linked-order-settlement-page?rootOrderId=501&orderType=tab`);
  await expect(page.getByText('Comanda Jorge', {exact: true}).last()).toBeVisible({timeout: 30000});
  await expect(page.getByRole('button', {name: 'Novo lançamento'})).toBeEnabled();
  await expect(page.getByText('Lançamentos enviados (1)', {exact: true})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Rascunhos (1)', exact: true})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Descartar rascunho'})).toHaveCount(0);
  await expect(page.getByText('Batata', {exact: true})).toBeVisible();
  await page.getByRole('button', {name: 'Fechar comanda'}).last().click();
  await expect(page.getByText('Dinheiro', {exact: true}).first()).toBeVisible({timeout: 20000});
  await page.getByText('Receber em dinheiro', {exact: true}).last().click();
  await page.getByPlaceholder('Ex.: 50,00').fill('20,00');
  await page.getByText(/^(Confirmar|Confirm)$/i).click();
  await expect(page.getByText('Comanda Jorge', {exact: true}).last()).toBeVisible({timeout: 20000});
  await expect(page.getByText(/Pendente:.*60,00/).last()).toBeVisible();
  expect(state.invoices).toHaveLength(1);
  expect(state.invoices[0].order).toBe('/orders/501');
  expect(state.invoices[0].price).toBe(20);
  expect(state.orders.find(order => order.id === 503).status.realStatus).toBe('open');
  expect(state.deliveredOrderIds).toHaveLength(0);
  await page.getByRole('button', {name: 'Fechar comanda'}).last().click();
  await page.getByText('Receber em dinheiro', {exact: true}).last().click();
  await expect(page.getByText(/Total a cobrar:.*60,00/)).toBeVisible();
  await page.getByPlaceholder('Ex.: 50,00').fill('60,00');
  await page.getByText(/^(Confirmar|Confirm)$/i).click();
  await expect.poll(() => state.deliveredOrderIds.length, {timeout: 20000, message: 'Closure: ' + await page.url()}).toBe(2);
  expect(state.invoices).toHaveLength(2);
  expect(state.invoices[1].price).toBe(60);
  expect(state.orders.find(order => order.id === 503).status.realStatus).toBe('canceled');
  await page.screenshot({path: '/tmp/pos-waiter-unified-close.png', fullPage: true});
  expect(calls.filter(call => call.path === 'invoices' && call.method === 'POST')).toHaveLength(2);
  expect(calls.some(call => call.path === 'invoices' && call.method === 'GET')).toBe(true);
  expect(calls.some(call => call.path === 'invoice')).toBe(false);
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(JSON.stringify({passed: true, apiRequests: calls.length, interceptedWrites: calls.filter(x => !['GET', 'OPTIONS'].includes(x.method)).length, commercialWrites: calls.filter(x => x.method === 'POST' && /^(invoices|orders\/\d+\/(cancel|delivered))$/.test(x.path)).length, screenshot: '/tmp/pos-waiter-unified-close.png'}));
 } finally {await browser.close();}
})().catch(error => {console.error(error.message); process.exitCode = 1;});
