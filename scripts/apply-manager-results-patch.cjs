// Optional presentation/input props for the local preview; preflight every payload.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),patch=require('../patches/manager-results.json'),changes=[];
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
for(const file of patch.files){
 const moduleRoot=path.join(root,'node_modules',file.package);
 if(JSON.parse(fs.readFileSync(path.join(moduleRoot,'package.json'))).version!==file.version)
  throw Error('Dependency changed; review the Results overlay.');
 const target=path.join(moduleRoot,file.file),current=hash(fs.readFileSync(target,'utf8').replace(/\r\n/g,'\n'));
 const payload=fs.readFileSync(path.join(root,'patches',file.payload));
 if(hash(payload)!==file.after){console.warn('Results payload skip');continue;}
 if(current===file.after)continue;
 if(current!==file.before){console.warn('Results unrelated skip');continue;}
 changes.push({target,payload});
}
for(const {target,payload} of changes)fs.writeFileSync(target,payload);
