import {openDB} from 'idb';

// Optional binary cache for the Manager catalog. Keys at rest are SHA-256 digests.
export function createPdvImageCache({open=openDB,cryptoProvider=globalThis.crypto,now=()=>Date.now(),maxBytes=64000000,maxEntries=32,maxAge=86400000,transform=async blob=>blob}={}) {
 let opening,generation=0,writes=Promise.resolve();const memory=new Map(),pending=new Map();
 const database=()=>opening||(opening=open('OnManagerImageCache',1,{upgrade:db=>db.createObjectStore('images',{keyPath:'id'})}).catch(error=>{opening=null;throw error;}));
 const digest=async key=>Array.from(new Uint8Array(await cryptoProvider.subtle.digest('SHA-256',new TextEncoder().encode(key))),n=>n.toString(16).padStart(2,'0')).join('');
 const remember=(key,entry)=>{
  memory.delete(key);memory.set(key,entry);
  let size=[...memory.values()].reduce((sum,item)=>sum+item.blob.size,0);
  while(memory.size>maxEntries||size>maxBytes){const oldest=memory.keys().next().value;size-=memory.get(oldest).blob.size;memory.delete(oldest);}
 };
 return {
  async load(scope,uri,headers,loadBlob){
   const key=JSON.stringify([scope,uri,Object.entries(headers||{}).sort(([a],[b])=>a.localeCompare(b))]);
   const existing=memory.get(key);
   if(existing&&now()-existing.at<maxAge){remember(key,existing);return existing.blob;}
   if(pending.has(key))return pending.get(key);
   const started=generation;
   const request=(async()=>{
    let id,db;
    try{
     if(cryptoProvider?.subtle){id=await digest(key);db=await database();const saved=await db.get('images',id);
      if(saved&&now()-saved.at<maxAge&&saved.blob?.size>0&&saved.blob.size<=maxBytes){if(started===generation)remember(key,saved);return saved.blob;}}
    }catch{/* Storage failure must not block authenticated online reads. */}
    const original=await loadBlob();
    let blob=original;try{blob=await transform(original);}catch{/* Preserve the original when preview conversion fails. */}
    if(started!==generation||!blob?.size||blob.size>maxBytes)return blob;
    const entry={at:now(),blob};remember(key,entry);
    if(db&&id)writes=writes.then(async()=>{
     if(started!==generation)return;
     try{
     const tx=db.transaction('images','readwrite');await tx.store.put({id,...entry});
     const rows=(await tx.store.getAll()).sort((a,b)=>a.at-b.at);let bytes=rows.reduce((sum,row)=>sum+row.blob.size,0);
     while(rows.length>maxEntries||bytes>maxBytes||rows[0]&&now()-rows[0].at>=maxAge){const row=rows.shift();bytes-=row.blob.size;await tx.store.delete(row.id);}
     await tx.done;
     }catch{/* Keep bounded memory reuse if persistence is unavailable. */}
    });
    return blob;
   })();pending.set(key,request);
   try{return await request;}finally{if(pending.get(key)===request)pending.delete(key);}
  },
  flush:()=>writes,
  async clear(){generation++;memory.clear();pending.clear();await writes;try{await (await database()).clear('images');}catch{}},
 };
}
export const pdvImageCache=createPdvImageCache({maxEntries:128,transform:createCatalogThumbnail});

// Catalog views display small covers; keep a bounded preview rather than megabytes
// per card. The original file and its download route remain unchanged.
export async function createCatalogThumbnail(blob) {
 if(!/^image\/(png|jpe?g|webp)$/i.test(blob?.type||'')||typeof createImageBitmap!=='function'||typeof OffscreenCanvas!=='function')return blob;
 let bitmap;
 try{
  bitmap=await createImageBitmap(blob);
  const scale=Math.min(1,256/Math.max(bitmap.width,bitmap.height));
  if(scale===1)return blob;
  const canvas=new OffscreenCanvas(Math.max(1,Math.round(bitmap.width*scale)),Math.max(1,Math.round(bitmap.height*scale)));
  const context=canvas.getContext('2d');if(!context)return blob;
  context.drawImage(bitmap,0,0,canvas.width,canvas.height);
  const preview=await canvas.convertToBlob({type:'image/webp',quality:.85});
  return preview.size>0&&preview.size<blob.size?preview:blob;
 }catch{return blob;}finally{bitmap?.close?.();}
}
