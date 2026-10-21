import {webcrypto} from 'node:crypto';
import {createPdvImageCache,createCatalogThumbnail} from '../../experience/pdvImageCache';
const store=()=>{const rows=new Map();return {rows,get:async(_,id)=>rows.get(id),clear:async()=>rows.clear(),transaction:()=>({store:{put:async row=>rows.set(row.id,row),getAll:async()=>[...rows.values()],delete:async id=>rows.delete(id)},done:Promise.resolve()})};};
it('deduplicates concurrent loads, reuses after remount and restores persisted blobs without storing session text',async()=>{
 const db=store(),options={open:async()=>db,cryptoProvider:webcrypto},cache=createPdvImageCache(options);
 const blob={size:20},load=jest.fn().mockResolvedValue(blob),headers={'API-TOKEN':'synthetic-session'};
 await Promise.all([cache.load(3,'/files/1',headers,load),cache.load(3,'/files/1',headers,load)]);expect(load).toHaveBeenCalledTimes(1);
 await cache.load(3,'/files/1',headers,load);expect(load).toHaveBeenCalledTimes(1);
 await cache.flush();await createPdvImageCache(options).load(3,'/files/1',headers,load);expect(load).toHaveBeenCalledTimes(1);
 expect(JSON.stringify([...db.rows.values()])).not.toContain('synthetic-session');
 await cache.load(4,'/files/1',headers,load);await cache.load(3,'/files/1',{'API-TOKEN':'another-session'},load);expect(load).toHaveBeenCalledTimes(3);
});
it('bounds storage, expires old images and clears before a new session',async()=>{
 let time=0;const db=store(),cache=createPdvImageCache({open:async()=>db,cryptoProvider:webcrypto,now:()=>time,maxBytes:30,maxEntries:2,maxAge:10}),load=jest.fn().mockResolvedValue({size:20});
 await cache.load(3,'one',{},load);await cache.load(3,'two',{},load);await cache.flush();expect(db.rows.size).toBe(1);
 time=20;await cache.load(3,'two',{},load);expect(load).toHaveBeenCalledTimes(3);
 await cache.clear();expect(db.rows.size).toBe(0);await cache.load(3,'two',{},load);expect(load).toHaveBeenCalledTimes(4);
});
it('does not cache failures or refill after logout and still works without storage',async()=>{
 let resolve;const db=store(),cache=createPdvImageCache({open:async()=>db,cryptoProvider:webcrypto});
 const request=cache.load(3,'slow',{},()=>new Promise(r=>{resolve=r;}));
 while(!resolve)await new Promise(r=>setTimeout(r,1));await cache.clear();resolve({size:20});await request;expect(db.rows.size).toBe(0);
 const load=jest.fn().mockRejectedValueOnce(Error('network')).mockResolvedValue({size:20});
 const memory=createPdvImageCache({open:async()=>{throw Error('unavailable');},cryptoProvider:webcrypto});
 await expect(memory.load(3,'one',{},load)).rejects.toThrow('network');await memory.load(3,'one',{},load);await memory.load(3,'one',{},load);expect(load).toHaveBeenCalledTimes(2);
});

it('presents a downloaded image before slow persistent writes finish',async()=>{
 const db=store();let release,started=false;
 const original=db.transaction;db.transaction=()=>{const tx=original();const put=tx.store.put;tx.store.put=async row=>{started=true;await new Promise(resolve=>{release=resolve;});return put(row);};return tx;};
 const cache=createPdvImageCache({open:async()=>db,cryptoProvider:webcrypto});
 const blob={size:20};expect(await cache.load(3,'image',{},async()=>blob)).toBe(blob);
 while(!started)await new Promise(resolve=>setTimeout(resolve,1));
 expect(db.rows.size).toBe(0);release();await cache.flush();expect(db.rows.size).toBe(1);
});

it('bounds the cached preview and preserves aspect ratio without changing the original',async()=>{
 const priorBitmap=global.createImageBitmap,priorCanvas=global.OffscreenCanvas;
 const close=jest.fn(),draw=jest.fn(),preview={size:5000,type:'image/webp'},original={size:3000000,type:'image/png'};
 global.createImageBitmap=jest.fn(async()=>({width:2048,height:1024,close}));
 global.OffscreenCanvas=class {constructor(width,height){this.width=width;this.height=height;}getContext(){return{drawImage:draw};}async convertToBlob(){return preview;}};
 try{expect(await createCatalogThumbnail(original)).toBe(preview);expect(draw).toHaveBeenCalledWith(expect.any(Object),0,0,256,128);expect(close).toHaveBeenCalled();}
 finally{global.createImageBitmap=priorBitmap;global.OffscreenCanvas=priorCanvas;}
});
it('shares the transformed image across card remounts and keeps original data if conversion fails',async()=>{
 const original={size:3000000},preview={size:5000},download=jest.fn(async()=>original),transform=jest.fn(async()=>preview);
 const cache=createPdvImageCache({cryptoProvider:null,transform});
 expect(await cache.load(3,'photo',{},download)).toBe(preview);expect(await cache.load(3,'photo',{},download)).toBe(preview);expect(download).toHaveBeenCalledTimes(1);
 const fallback=createPdvImageCache({cryptoProvider:null,transform:async()=>{throw Error('unsupported');}});
 expect(await fallback.load(3,'photo',{},download)).toBe(original);
});
