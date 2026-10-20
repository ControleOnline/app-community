// Opt-in palette props for the local Manager preview; validate all files before writing.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),patch=require('../patches/manager-pdv.json');
const moduleRoot=path.join(root,'node_modules',patch.package),changes=[];
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
if(JSON.parse(fs.readFileSync(path.join(moduleRoot,'package.json'))).version!==patch.version)
  throw Error('ui-products version changed; review the PDV catalog overlay.');
for(const file of patch.files){
 const targetRoot=file.package ? path.join(root,'node_modules',file.package) : moduleRoot;
 if(file.package && JSON.parse(fs.readFileSync(path.join(targetRoot,'package.json'))).version!==file.version)throw Error('PDV cache dependency changed.');
 const target=path.join(targetRoot,file.file),current=fs.existsSync(target)?hash(fs.readFileSync(target,'utf8').replace(/\r\n/g,'\n')):null;
 const payload=fs.readFileSync(path.join(root,'patches',file.payload));
 if(hash(payload)!==file.after)throw Error('PDV catalog payload changed; no files were overwritten.');
 if(current===file.after)continue;
 if(current!==file.before)throw Error('PDV catalog has unrelated changes; no files were overwritten.');
 changes.push({target,payload});
}
for(const {target,payload} of changes){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,payload);}
