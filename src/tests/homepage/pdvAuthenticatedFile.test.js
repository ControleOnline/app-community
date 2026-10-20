import React from 'react';
import renderer,{act} from 'react-test-renderer';
import {createPdvImageCache} from '../../experience/pdvImageCache';
import DefaultFile,{DefaultFileCacheContext} from '@controleonline/ui-default/src/react/components/files/DefaultFile';
jest.mock('react-native',()=>({Platform:{OS:'web'},Image:'Image'}));
jest.mock('@store',()=>({useStore:()=>({getters:{mainCompany:{id:3,domain:'localhost:8081'}}})}));
jest.mock('@env',()=>({env:{API_ENTRYPOINT:'http://localhost:8000',DOMAIN:'http://localhost:8081'}}));
it.each(['', '__q_objt|'])('uses the shared file loader with %s session and releases the blob on unmount',async prefix=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;
 const fetchBefore=global.fetch,storageBefore=global.localStorage,createBefore=URL.createObjectURL,revokeBefore=URL.revokeObjectURL;
 const blob={size:40};global.localStorage={getItem:()=>prefix+JSON.stringify({api_key:'synthetic-session'})};
 global.fetch=jest.fn().mockResolvedValue({ok:true,headers:{get:()=> 'image/png'},blob:async()=>blob});
 URL.createObjectURL=jest.fn(()=> 'blob:category-preview');URL.revokeObjectURL=jest.fn();let tree;
 try{
  await act(async()=>{tree=renderer.create(<DefaultFile file={{id:6046,fileType:'image'}}/>);});
  expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/localhost%3A8081/files/6046/download',expect.objectContaining({method:'GET',headers:expect.objectContaining({'API-TOKEN':'synthetic-session','app-domain':'localhost:8081'})}));
  expect(tree.root.findByType('Image').props.source).toEqual({uri:'blob:category-preview'});
  act(()=>tree.unmount());expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:category-preview');
 }finally{global.fetch=fetchBefore;global.localStorage=storageBefore;URL.createObjectURL=createBefore;URL.revokeObjectURL=revokeBefore;}
});

it('reuses the binary through the real shared loader after card/table remounts',async()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;
 const oldFetch=global.fetch,oldStorage=global.localStorage,oldCreate=URL.createObjectURL,oldRevoke=URL.revokeObjectURL;
 global.localStorage={getItem:()=>JSON.stringify({api_key:'synthetic-session'})};
 global.fetch=jest.fn().mockResolvedValue({ok:true,headers:{get:()=> 'image/png'},blob:async()=>new Blob(['png'],{type:'image/png'})});
 URL.createObjectURL=jest.fn(()=> 'blob:cached-preview');URL.revokeObjectURL=jest.fn();
 const cache=createPdvImageCache({cryptoProvider:null}),adapter={load:(uri,headers,load)=>cache.load(3,uri,headers,load)};
 const view=()=> <DefaultFileCacheContext.Provider value={adapter}><DefaultFile file={{id:6046}}/></DefaultFileCacheContext.Provider>;
 let tree;
 try{
  await act(async()=>{tree=renderer.create(view());});act(()=>tree.unmount());
  await act(async()=>{tree=renderer.create(view());});expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(tree.root.findByType('Image').props.source.uri).toBe('blob:cached-preview');act(()=>tree.unmount());
 }finally{global.fetch=oldFetch;global.localStorage=oldStorage;URL.createObjectURL=oldCreate;URL.revokeObjectURL=oldRevoke;}
});
