const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const [directory,mode]=process.argv.slice(2);
assert(directory && ['on','off'].includes(mode),'Usage: node verify-avatar-bundle.cjs <export-directory> <on|off>');
function files(root){return fs.readdirSync(root,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(root,entry.name)):[path.join(root,entry.name)]);}
const sources=files(directory).filter(f=>f.endsWith('.map')).flatMap(f=>JSON.parse(fs.readFileSync(f,'utf8')).sources || []);
assert(sources.length,'No source maps found');
const experimental=sources.filter(s=>s.includes('.codex/experiments/shenlong/'));
assert.equal(experimental.length>0,mode==='on','Experimental avatar bundle inclusion mismatch');
if(mode==='off') {
 assert(sources.some(s=>s.endsWith('/DisabledAvatar.js')),'Missing inert boundary');
 for(const name of ['useExperienceRuntime.js','collectionCache.js','pdvImageCache.js'])
  assert(sources.some(s=>s.endsWith('/'+name)),`ERP capability missing: ${name}`);
}
console.log(JSON.stringify({mode,sourceCount:sources.length,experimentalSources:experimental.length}));
