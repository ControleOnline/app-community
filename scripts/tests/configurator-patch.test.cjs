const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
test('configurator overlay applies once and rejects unrecognized source or payload',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'configurator-overlay-'));
 try {
  const script=path.join(root,'scripts/apply-manager-configurator-patch.cjs');
  fs.mkdirSync(path.dirname(script),{recursive:true});
  fs.copyFileSync(path.resolve(__dirname,'../apply-manager-configurator-patch.cjs'),script);
  const target=path.join(root,'node_modules/@controleonline/ui-config/page.js');
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.mkdirSync(path.join(root,'patches'));
  fs.writeFileSync(path.join(path.dirname(target),'package.json'),JSON.stringify({version:'1'}));
  const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
  fs.writeFileSync(path.join(root,'patches/manager-configurator.json'),JSON.stringify({package:'@controleonline/ui-config',version:'1',files:[{file:'page.js',before:hash('original'),after:hash('updated'),payload:'payload.js'}]}));
  const payload=path.join(root,'patches/payload.js');fs.writeFileSync(payload,'updated');
  const run=()=>spawnSync(process.execPath,[script],{encoding:'utf8'});
  fs.writeFileSync(target,'original');assert.equal(run().status,0);assert.equal(fs.readFileSync(target,'utf8'),'updated');
  assert.equal(run().status,0);
  fs.writeFileSync(target,'unrelated');assert.notEqual(run().status,0);assert.equal(fs.readFileSync(target,'utf8'),'unrelated');
  fs.writeFileSync(target,'original');fs.writeFileSync(payload,'corrupt');assert.notEqual(run().status,0);assert.equal(fs.readFileSync(target,'utf8'),'original');
 } finally {fs.rmSync(root,{recursive:true,force:true});}
});
