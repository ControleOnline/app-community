const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const manifest=path.join(root,'patches/theme-system.json');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const patches=fs.existsSync(manifest)?JSON.parse(fs.readFileSync(manifest,'utf8')):[];
const writes=[];
for(const patch of patches)for(const base of [`node_modules/@controleonline/${patch.package}`,`modules/controleonline/${patch.package}`]){
  const target=path.join(root,base,patch.path);
  if(!fs.existsSync(target))continue;
  const source=fs.readFileSync(target,'utf8');
  if(hash(source)===patch.afterHash)continue;
  if(hash(source)!==patch.beforeHash)throw new Error(`Theme integration needs review: ${target}`);
  let next=source;
  for(const change of patch.replacements){
    if(next.split(change.before).length!==2)throw new Error(`Ambiguous theme integration: ${target}`);
    next=next.replace(change.before,change.after);
  }
  if(hash(next)!==patch.afterHash)throw new Error(`Invalid theme integration: ${target}`);
  writes.push({target,next});
}
for(const {target,next} of writes)fs.writeFileSync(target,next);
