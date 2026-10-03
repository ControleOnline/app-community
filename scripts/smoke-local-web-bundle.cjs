const {chromium} = require('playwright');
const url = process.argv[2];
if (!url || !/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(url)) {
  throw new Error('Pass the URL of the local exported web bundle.');
}
(async () => {
  const browser = await chromium.launch({headless: true});
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // This bootstrap smoke makes no requests to a shared API or payment service.
    await page.route('**/*', route => {
      const requestUrl = new URL(route.request().url());
      if (requestUrl.origin === new URL(url).origin || requestUrl.href === 'https://cdn.jsdelivr.net/npm/jsqr@1.2.0/dist/jsQR.min.js') return route.continue();
      return route.fulfill({status: 200, contentType: 'application/json', body: '{}'});
    });
    await page.goto(url, {waitUntil: 'networkidle'});
    await page.waitForFunction(() => document.body.innerText.trim().length > 0);
    if (errors.length) throw new Error(errors.join('\n'));
    console.log(JSON.stringify({url, pageErrors: errors.length, renderedText: await page.locator('body').innerText()}));
  } finally {
    await browser.close();
  }
})().catch(error => {console.error(error.message); process.exitCode = 1;});
