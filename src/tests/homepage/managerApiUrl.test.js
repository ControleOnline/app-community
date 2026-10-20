const resolve = require('../../../scripts/lib/manager-api-url.cjs');
it('proxies only opt-in loopback HTTP calls without modifying their query',()=>{
 expect(resolve('/people?page=1&link.company=3','http://localhost:8000','http://localhost:8081',true)).toBe('http://localhost:8081/__manager_api__/people?page=1&link.company=3');
 expect(resolve('orders','http://localhost:8000','http://localhost:8081',true)).toBe('http://localhost:8081/__manager_api__/orders');
 for(const [api,site,enabled]of [['https://production.test','http://localhost:8081',true],['http://localhost:8000','https://production.test',true],['http://localhost:8000','http://localhost:8081',false]])expect(resolve('people',api,site,enabled)).toBe('people');
 expect(resolve('https://external.test/a','http://localhost:8000','http://localhost:8081',true)).toBe('https://external.test/a');
});
