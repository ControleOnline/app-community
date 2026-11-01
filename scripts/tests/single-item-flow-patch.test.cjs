const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const {applySingleItemFlow} = require('../apply-single-item-flow-patch.cjs');
const hash = s => crypto.createHash('sha256').update(s).digest('hex');
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'single-item-flow-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  fs.mkdirSync(path.join(root,'patches'),{recursive:true});
  fs.mkdirSync(path.join(root,'node_modules/test'),{recursive:true});
  fs.writeFileSync(path.join(root,'node_modules/test/package.json'),JSON.stringify({version:'1.0.0'}));
  const files=['a','b'].map(name=>{
    fs.writeFileSync(path.join(root,'node_modules/test',name),'before');
    fs.writeFileSync(path.join(root,'patches',name),'after');
    return {package:'test',version:'1.0.0',file:name,payload:name,before:hash('before'),after:hash('after')};
  });
  fs.writeFileSync(path.join(root,'patches/single-item-flow.json'),JSON.stringify({files}));
  return root;
}
test('applies reviewed sources once and is idempotent',t=>{
  const root=fixture(t);assert.equal(applySingleItemFlow(root),2);assert.equal(applySingleItemFlow(root),0);
  assert.equal(fs.readFileSync(path.join(root,'node_modules/test/a'),'utf8'),'after');
});
test('rejects unknown changes before writing any file',t=>{
  const root=fixture(t);fs.writeFileSync(path.join(root,'node_modules/test/b'),'unrelated');
  assert.throws(()=>applySingleItemFlow(root),/Unrelated/);
  assert.equal(fs.readFileSync(path.join(root,'node_modules/test/a'),'utf8'),'before');
});
