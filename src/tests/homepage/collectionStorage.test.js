import {webcrypto} from 'node:crypto';
import {createCollectionStorage} from '../../experience/collectionStorage';
jest.mock('idb',()=>({openDB:jest.fn()}));
it('persists only hashed query keys, bounds storage and restores pages across instances',async()=>{
 const rows=new Map();const store={put:async row=>rows.set(row.id,structuredClone(row)),getAll:async()=>[...rows.values()],delete:async id=>rows.delete(id)};
 const db={get:async(_,id)=>rows.get(id),clear:async()=>rows.clear(),transaction:()=>({store,done:Promise.resolve()})};
 const open=jest.fn(async()=>db),args={open,cryptoProvider:webcrypto,maxEntries:2};
 const first=createCollectionStorage(args);
 await first.put('private-session:one',{at:1,items:[{id:1}]});await first.put('private-session:two',{at:2,items:[]});await first.put('private-session:three',{at:3,items:[]});
 expect(rows.size).toBe(2);expect(JSON.stringify([...rows.values()])).not.toContain('private-session');
 const second=createCollectionStorage(args);expect(await second.get('private-session:two')).toMatchObject({at:2});expect(await second.get('private-session:one')).toBeUndefined();
 await second.clear();expect(rows.size).toBe(0);
});
it('does not refill storage when logout occurs while key hashing is pending',async()=>{
 let finish;const put=jest.fn(),clear=jest.fn(async()=>{});
 const storage=createCollectionStorage({cryptoProvider:{subtle:{digest:()=>new Promise(resolve=>{finish=resolve;})}},open:async()=>({clear,transaction:()=>({store:{put},done:Promise.resolve()})})});
 const work=storage.put('session',{at:1,items:[]});await storage.clear();finish(new Uint8Array(32).buffer);await work;expect(put).not.toHaveBeenCalled();
});
