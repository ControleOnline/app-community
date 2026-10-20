import {openDB} from 'idb';
// Separate query snapshots from the legacy entity database and all offline write queues.
export function createCollectionStorage({open=openDB,cryptoProvider=globalThis.crypto,maxEntries=40,maxBytes=2000000}={}){
 let opening,generation=0;
 const database=()=>opening||(opening=open('OnManagerReadCache',1,{upgrade:db=>db.createObjectStore('pages',{keyPath:'id'})}).catch(error=>{opening=null;throw error;}));
 const digest=async key=>{
  if(!cryptoProvider?.subtle)throw Error('Private cache fingerprint unavailable');
  const result=await cryptoProvider.subtle.digest('SHA-256',new TextEncoder().encode(key));
  return Array.from(new Uint8Array(result),n=>n.toString(16).padStart(2,'0')).join('');
 };
 return {
  async get(key){return (await database()).get('pages',await digest(key)).then(row=>row?.entry);},
  async put(key,entry){
   const started=generation,id=await digest(key),bytes=JSON.stringify(entry).length*2;if(bytes>maxBytes||started!==generation)return;
   const db=await database();if(started!==generation)return;const tx=db.transaction('pages','readwrite');
   await tx.store.put({id,entry,bytes});const rows=(await tx.store.getAll()).sort((a,b)=>a.entry.at-b.entry.at);
   let total=rows.reduce((n,row)=>n+row.bytes,0);
   while(rows.length>maxEntries||total>maxBytes){const row=rows.shift();total-=row.bytes;await tx.store.delete(row.id);}
   await tx.done;
  },
  async clear(){generation++;await (await database()).clear('pages');},
 };
}
