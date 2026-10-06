const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
test('financial store collection agrees with the locally installed API resource', () => {
 const source = fs.readFileSync(path.join(process.env.CONTROLEONLINE_MODULES_ROOT || path.resolve(__dirname, '../node_modules/@controleonline'), 'ui-financial/src/store/invoice/index.js'), 'utf8');
 const endpoint = source.match(/resourceEndpoint:\s*["']([^"']+)["']/)[1];
 const api = fs.readFileSync(path.resolve(__dirname, '../../api-community/vendor/controleonline/financial/src/Entity/Invoice.php'), 'utf8');
 assert.equal(endpoint, 'invoices');
 assert.match(api, new RegExp('new GetCollection\\([\\s\\S]*?uriTemplate:\\s*["\']/' + endpoint + '["\']'));
});
