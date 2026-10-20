// Opt-in palette props for the local Manager preview; validate all files before writing.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),changes=[];
for(const patch of [require('../patches/manager-products.json'),require('../patches/manager-products-default.json')]){
const moduleRoot=path.join(root,'node_modules',patch.package);
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
if(JSON.parse(fs.readFileSync(path.join(moduleRoot,'package.json'))).version!==patch.version)
  throw Error('ui-products version changed; review the product presentation overlay.');
for(const file of patch.files){
 const target=path.join(moduleRoot,file.file),current=fs.existsSync(target)?hash(fs.readFileSync(target,'utf8').replace(/\r\n/g,'\n')):null;
 const payload=fs.readFileSync(path.join(root,'patches',file.payload));
 if(hash(payload)!==file.after)throw Error('Product presentation payload changed; no files were overwritten.');
 if(current===file.after)continue;
 if(current!==file.before)throw Error('Product presentation has unrelated changes; no files were overwritten.');
 changes.push({target,payload});
}
}
for(const {target,payload} of changes){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,payload);}
