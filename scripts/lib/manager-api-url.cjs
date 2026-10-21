const local = host => ['localhost','127.0.0.1','[::1]','::1'].includes(host);
module.exports = function resolvePreviewApiUrl(resource, entrypoint, origin, enabled) {
  if (!enabled) return resource;
  try {
    const target=new URL(entrypoint),site=new URL(origin);
    if(!local(target.hostname)||!local(site.hostname)||target.protocol!=='http:'||site.protocol!=='http:')return resource;
    const requested=new URL(resource,target.href.endsWith('/')?target.href:target.href+'/');
    if(requested.origin!==target.origin)return resource;
    return site.origin+'/__manager_api__/'+requested.pathname.replace(/^\//,'')+requested.search;
  }catch{return resource;}
};
