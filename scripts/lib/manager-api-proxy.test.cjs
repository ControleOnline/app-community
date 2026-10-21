const {test}=require('node:test');const assert=require('node:assert/strict');const http=require('node:http');
const {createManagerApiMiddleware,withManagerApiMiddleware}=require('./manager-api-proxy.cjs');
const listen=s=>new Promise(r=>s.listen(0,'127.0.0.1',r));
test('loopback proxy preserves the HTTP response, query and authentication header',async t=>{
 const upstream=http.createServer((req,res)=>{assert.equal(req.url,'/people?page=1');assert.equal(req.headers['api-token'],'synthetic');res.writeHead(401,{'Content-Type':'application/json'});res.end('{"message":"denied"}');});await listen(upstream);t.after(()=>upstream.close());
 const proxy=http.createServer(createManagerApiMiddleware('http://127.0.0.1:'+upstream.address().port,(_,res)=>{res.statusCode=404;res.end();}));await listen(proxy);t.after(()=>proxy.close());
 const result=await fetch('http://127.0.0.1:'+proxy.address().port+'/__manager_api__/people?page=1',{headers:{'API-TOKEN':'synthetic'}});assert.equal(result.status,401);assert.deepEqual(await result.json(),{message:'denied'});
});
test('does not permit remote upstreams or clients',()=>{assert.throws(()=>createManagerApiMiddleware('https://production.test',()=>{}));let code,ended=false;createManagerApiMiddleware('http://localhost:8000',()=>{})({url:'/__manager_api__/people',socket:{remoteAddress:'192.0.2.1'}},{set statusCode(c){code=c},end(){ended=true}});assert.equal(code,403);assert.equal(ended,true);});
test('production and HTTPS builds retain the canonical middleware without a proxy',()=>{
 const next=()=>{};
 for(const target of ['https://api.controleonline.com','http://production.test','https://localhost:8000']) assert.equal(withManagerApiMiddleware(target,next),next);
 assert.notEqual(withManagerApiMiddleware('http://localhost:8000',next),next);
 assert.throws(()=>withManagerApiMiddleware('invalid',next));
});
