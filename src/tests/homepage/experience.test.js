import {createJourney} from '../../experience/journey';
import {createReadCoordinator} from '../../experience/reads';

it('correlates navigation, interrupts an unfinished journey and bounds event metadata', () => {
  let now = 0;
  const j = createJourney({now: () => now, maxEvents: 5});
  j.setContext({application: 'MANAGER', company: '3', principal: 'a', session: 'secret'});
  const first = j.begin('ClientsIndex', 'click'); now = 30; j.present('ClientsIndex');
  expect(j.snapshot().events.at(-1)).toMatchObject({journeyId: first, type: 'screen.committed', durationMs: 30});
  j.begin('ProfilePage', 'command'); now = 50; j.begin('HomePage', 'trigger');
  expect(j.snapshot().events.some(e => e.type === 'journey.interrupted')).toBe(true);
  for (let i = 0; i < 9; i++) j.record('observation', {body: 'private', token: 'secret', route: 'HomePage'});
  expect(j.snapshot().events).toHaveLength(5);
  expect(JSON.stringify(j.snapshot())).not.toMatch(/private|secret/);
  j.setContext({application: 'SHOP', company: '3', principal: 'a', session: 'secret'});
  expect(j.snapshot().events).toHaveLength(0);
});

it('deduplicates reads, clones cache values and expires by time', async () => {
  let now = 0;
  const fetch = jest.fn(async () => ({items: [{id: 1}]}));
  const r = createReadCoordinator({fetch, getScope: () => 'a', now: () => now, policy: () => 100});
  const [a,b] = await Promise.all([r.read('people', {}), r.read('people', {})]);
  a.items[0].id = 999;
  expect(b.items[0].id).toBe(1);
  expect((await r.read('people', {})).items[0].id).toBe(1);
  expect(fetch).toHaveBeenCalledTimes(1);
  now = 101; await r.read('people', {});
  expect(fetch).toHaveBeenCalledTimes(2);
});

it('rejects old context responses and never warms a new scope with them', async () => {
  let scope = 'a', resolve;
  const fetch = jest.fn(() => new Promise(done => {resolve = done;}));
  const r = createReadCoordinator({fetch, getScope: () => scope, policy: () => 100});
  const pending = r.read('people'); scope = 'b'; resolve({items: ['old']});
  await expect(pending).rejects.toMatchObject({name: 'AbortError'});
  expect(r.stats().entries).toBe(0);
});

it('invalidates on writes, prevents stale in-flight refill, and does not cache failures', async () => {
  let resolve;
  const fetch = jest.fn(() => new Promise(done => {resolve = done;}));
  const r = createReadCoordinator({fetch, getScope: () => 'a', policy: () => 100});
  const pending = r.read('people'); r.invalidate(); resolve({items: ['stale']});
  await expect(pending).rejects.toMatchObject({name: 'AbortError'});
  expect(r.stats().entries).toBe(0);
  fetch.mockRejectedValueOnce(new Error('network'));
  await expect(r.read('people')).rejects.toThrow('network');
  expect(r.stats().entries).toBe(0);
});

it('limits prediction to GET and reuses its result for a real request', async () => {
  const fetch = jest.fn(async () => ({items: [1]}));
  const r = createReadCoordinator({fetch, getScope: () => 'a', policy: () => 100});
  expect(await r.prefetch('people', {method: 'POST', body: {}})).toBe(false);
  expect(fetch).not.toHaveBeenCalled();
  await r.prefetch('people', {params: {page: 1}});
  await r.read('people', {params: {page: 1}});
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(r.stats().predictionHits).toBe(1);
});

it('expires observations when inspected after an idle period', () => {
  let now = 0;
  const j = createJourney({now:()=>now,maxAgeMs:100});
  j.begin('HomePage'); now = 101;
  expect(j.snapshot().events).toHaveLength(0);
});

it('links each consuming journey to a shared in-flight request', async () => {
  let resolve;
  const j = createJourney();
  j.setContext({application:'MANAGER'});
  const r = createReadCoordinator({fetch:()=>new Promise(done=>{resolve=done;}), getScope:()=> 'a', journal:j, policy:()=>1000});
  j.begin('ClientsIndex'); const first=r.read('people');
  j.begin('HomePage'); j.present('HomePage'); const secondId=j.begin('ClientsIndex');
  const second=r.read('people'); resolve({items:[]}); await Promise.all([first,second]);
  const returned=j.snapshot().events.find(e=>e.type==='read.returned');
  const dedup=j.snapshot().events.find(e=>e.type==='read.deduplicated');
  expect(dedup).toMatchObject({journeyId:secondId,requestId:returned.requestId});
});

it('refreshes a repeated read in the same journey while reusing it for a new navigation', async () => {
  const j=createJourney(); j.setContext({application:'MANAGER'});
  const fetch=jest.fn(async()=>({items:[1]}));
  const r=createReadCoordinator({fetch,getScope:()=> 'a',journal:j,policy:()=>1000});
  j.begin('ClientsIndex'); await r.read('people'); await r.read('people');
  expect(fetch).toHaveBeenCalledTimes(2);
  j.begin('HomePage'); j.begin('ClientsIndex'); await r.read('people');
  expect(fetch).toHaveBeenCalledTimes(2);
});

it('does not call ordinary navigation away from an already presented idle screen an interruption', () => {
  const j=createJourney(); j.begin('ConfiguratorPage'); j.present('ConfiguratorPage'); j.begin('HomePage');
  expect(j.snapshot().events.some(e=>e.type==='journey.interrupted')).toBe(false);
});

it('marks navigation interrupted when a presented screen still awaits a read', () => {
  const j=createJourney(); const id=j.begin('ClientsIndex'); j.present('ClientsIndex');
  j.record('read.started',{requestId:'r1',journeyId:id,source:'read'}); j.begin('HomePage');
  expect(j.snapshot().events.some(e=>e.type==='journey.interrupted')).toBe(true);
});
it('does not mark an idle screen interrupted because of speculative work', () => {
  const j=createJourney(); const id=j.begin('HomePage'); j.present('HomePage');
  j.record('read.started',{requestId:'r1',journeyId:id,source:'prediction'}); j.begin('ClientsIndex');
  expect(j.snapshot().events.some(e=>e.type==='journey.interrupted')).toBe(false);
});

it('keeps a live read usable when a background POST only invalidates cached copies', async () => {
  let resolveRead;
  const fetch=jest.fn((uri)=>uri==='people'?new Promise(done=>{resolveRead=done;}):Promise.resolve({ok:true}));
  const r=createReadCoordinator({fetch,getScope:()=> 'same-company-session',policy:()=>1000});
  const request=r.read('people');
  await r.read('translates/resolve',{method:'POST',body:{keys:['clients']}});
  resolveRead({items:[{id:1}]});
  await expect(request).resolves.toEqual({items:[{id:1}]});
  expect(r.stats().entries).toBe(0);
});
