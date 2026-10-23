// Exact dependency overlays for the audited core fixes; validate all before writing.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),changes=[];
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
for(const file of [...require('../patches/manager-audit-fixes.json').files,...require('../patches/manager-package-reconciliation.json').files]){
 const moduleRoot=path.join(root,'node_modules',file.package);
 if(JSON.parse(fs.readFileSync(path.join(moduleRoot,'package.json'))).version!==file.version)
  throw Error(`Review audit overlay: ${file.package} version changed.`);
 const target=path.join(moduleRoot,file.file),current=fs.existsSync(target)?hash(fs.readFileSync(target)):null;
 const payload=fs.readFileSync(path.join(root,'patches',file.payload));
 if(hash(payload)!==file.after)throw Error('Audit overlay payload checksum differs.');
 const bootstrap=require('../patches/admin-bootstrap.json').files.find(item=>item.package===file.package && item.file===file.file && item.before===file.after);
 if(current===file.after || (bootstrap && current===bootstrap.after))continue;
 if(current!==file.before)throw Error(`Unrelated changes in ${file.package}/${file.file}; no files overwritten.`);
 changes.push({target,payload});
}
for(const {target,payload} of changes){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,payload);}
console.log(`Audit overlays verified; ${changes.length} files applied.`);
