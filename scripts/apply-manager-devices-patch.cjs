// Opt-in palette props for the local Manager preview; validate all files before writing.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),patch=require('../patches/manager-devices.json');
const moduleRoot=path.join(root,'node_modules',patch.package),changes=[];
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
if(JSON.parse(fs.readFileSync(path.join(moduleRoot,'package.json'))).version!==patch.version)
  throw Error('ui-common version changed; review the device-list overlay.');
for(const file of patch.files){
 const target=path.join(moduleRoot,file.file),current=hash(fs.readFileSync(target,'utf8').replace(/\r\n/g,'\n'));
 const payload=fs.readFileSync(path.join(root,'patches',file.payload));
 if(hash(payload)!==file.after){console.warn('Device-list payload checksum skip');continue;}
 if(current===file.after)continue;
 if(current!==file.before){console.warn('Device list unrelated skip '+file.file);continue;}
 changes.push({target,payload});
}
for(const {target,payload} of changes)fs.writeFileSync(target,payload);
