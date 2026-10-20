const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {resolveExperimentalAvatar}=require('./experimental-avatar.cjs');
const projectRoot=path.resolve(__dirname,'../..');
test('default and non-preview builds resolve only the inert host implementation',()=>{
 for(const env of [{},{EXPO_PUBLIC_SHENLONG_EXPERIMENT:'1'},{EXPO_PUBLIC_MANAGER_PREVIEW:'1'}]){
  const result=resolveExperimentalAvatar({projectRoot,env});
  assert.equal(result.enabled,false); assert.equal(result.watchFolder,null);
  assert.equal(result.entry,path.join(projectRoot,'src/components/manager-preview/DisabledAvatar.js'));
 }
});
test('explicit preview opt-in loads the external local package',()=>{
 const result=resolveExperimentalAvatar({projectRoot,env:{EXPO_PUBLIC_MANAGER_PREVIEW:'1',EXPO_PUBLIC_SHENLONG_EXPERIMENT:'1'}});
 assert.equal(result.enabled,true);
 assert.equal(result.watchFolder,path.resolve(projectRoot,'../.codex/experiments/shenlong'));
 assert.equal(result.entry,path.join(result.watchFolder,'src/index.js'));
});

test('disabled ERP does not require the experiment or its directory to exist',()=>{
 const result=resolveExperimentalAvatar({projectRoot:'/nonexistent/standalone-erp',env:{EXPO_PUBLIC_MANAGER_PREVIEW:'1',EXPO_PUBLIC_SHENLONG_EXPERIMENT:'0'}});
 assert.equal(result.enabled,false);
 assert.equal(result.entry,'/nonexistent/standalone-erp/src/components/manager-preview/DisabledAvatar.js');
});
