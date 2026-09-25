const {chromium} = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

async function main() {
  const root = path.resolve(process.argv[2] || 'dist');
  const qrSource = await fetch('https://cdn.jsdelivr.net/npm/jsqr@1.2.0/dist/jsQR.min.js').then(response => {
    if (!response.ok) throw new Error('Unable to load QR worker dependency');
    return response.text();
  });
  let companyRequests = 0;
  const errors = [];
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const candidate = path.resolve(root, '.' + pathname);
    if (!candidate.startsWith(root + path.sep)) {
      if (pathname !== '/') { res.writeHead(403).end(); return; }
    }
    const file = fs.existsSync(candidate) && fs.statSync(candidate).isFile()
      ? candidate : path.join(root, 'index.html');
    res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' :
      file.endsWith('.html') ? 'text/html' : 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({headless: true});
  try {
    const page = await browser.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.hostname === '127.0.0.1') return route.continue();
      if (url.hostname === 'cdn.jsdelivr.net' && url.pathname.endsWith('/jsQR.min.js')) {
        return route.fulfill({contentType: 'text/javascript', body: qrSource, headers: {'access-control-allow-origin': '*'}});
      }
      if (url.pathname.includes('/people/company/default')) {
        companyRequests++;
        return route.fulfill({json: {response: {data: {id: 1, alias: 'Domain A', configs: {}, theme: {colors: {}}}, success: true}}});
      }
      if (url.pathname.endsWith('themes-colors.css')) return route.fulfill({contentType: 'text/css', body: ':root {}'});
      return route.fulfill({json: {member: [], totalItems: 0}});
    });
    await page.goto(`http://127.0.0.1:${server.address().port}`, {waitUntil: 'networkidle'});
    await page.waitForFunction(() => document.querySelectorAll('input').length > 0);
    assert.ok(companyRequests > 0, 'Login must call the domain-company action through the preserved HTTP route');
    assert.deepEqual(errors, [], 'Bootstrap must not produce JavaScript errors');
    console.log(JSON.stringify({result: 'passed', companyRequests, inputs: await page.locator('input').count(), pageErrors: errors}));
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => {console.error(error); process.exitCode = 1;});
