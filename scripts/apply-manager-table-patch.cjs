// Exact local dependency overlays; validate every payload before changing any file.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),changes=[];
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
for(const patch of [require('../patches/ui-default-read-ownership.json'),require('../patches/ui-default-read-refresh.json')]){
 const moduleRoot=path.join(root,'node_modules',patch.package);
 const installed=JSON.parse(fs.readFileSync(path.join(moduleRoot,'package.json'),'utf8'));
 if(installed.version!==patch.version)throw Error('ui-default version changed; review the local table overlay before applying.');
 const target=path.join(moduleRoot,patch.file),content=fs.readFileSync(target);
 const current=hash(patch.normalizeNewlines?Buffer.from(content.toString().replace(/\r\n/g,'\n')):content);
 if(current===patch.after)continue;
 if(current!==patch.before)throw Error('ui-default has unrelated local changes; no files were overwritten.');
 const payload=fs.readFileSync(path.join(root,'patches',patch.payload));
 if(hash(payload)!==patch.after)throw Error('Table overlay payload checksum differs; no files were changed.');
 changes.push({target,payload});
}
for(const {target,payload} of changes)fs.writeFileSync(target,payload);
