const http = require('node:http');
const PREFIX = '/__manager_api__/';
const local = host => ['localhost','127.0.0.1','[::1]','::1'].includes(host);
function createManagerApiMiddleware(target, next) {
  const base=new URL(target);
  if (!local(base.hostname) || base.protocol!=='http:') throw new Error('Preview proxy requires a loopback HTTP API.');
  return (req,res,nextMiddleware) => {
    if (!req.url.startsWith(PREFIX)) return next(req,res,nextMiddleware);
    if (!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress)) {res.statusCode=403;res.end();return;}
    // No caller-supplied authority, credentials, logs or cache. API permissions stay authoritative.
    const path='/'+req.url.slice(PREFIX.length);
    const headers={...req.headers,host:base.host};
    delete headers.connection;
    const upstream=http.request({hostname:base.hostname === 'localhost' ? '127.0.0.1' : base.hostname.replace(/^\[|\]$/g,''),port:base.port||80,path,method:req.method,headers},response=>{
      res.writeHead(response.statusCode,response.headers);response.pipe(res);
    });
    upstream.setTimeout(30000,()=>upstream.destroy(new Error('Local API timeout')));
    upstream.on('error',()=>{if(!res.headersSent)res.writeHead(502,{'Content-Type':'application/json'});res.end('{"message":"API local indisponível."}');});
    req.on('aborted',()=>upstream.destroy());req.pipe(upstream);
  };
}
// Production exports use the canonical fetch directly; the proxy is loopback-only.
function withManagerApiMiddleware(target, next) {
  const base = new URL(target);
  return local(base.hostname) && base.protocol === 'http:'
    ? createManagerApiMiddleware(target, next)
    : next;
}
module.exports={createManagerApiMiddleware,withManagerApiMiddleware};
