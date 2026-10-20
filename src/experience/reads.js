const clone = value => value === undefined ? value : typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
const stable = value => Array.isArray(value) ? `[${value.map(stable)}]` : value && typeof value === 'object'
  ? `{${Object.keys(value).sort().map(key => `${key}:${stable(value[key])}`).join(',')}}` : JSON.stringify(value);
const stale = () => Object.assign(new Error('Contexto da leitura alterado.'), {name: 'AbortError'});
export function createReadCoordinator({fetch, getScope, journal, now = () => performance.now(), policy = () => 0, invalidates = () => true, maxEntries = 40, maxBytes = 2000000} = {}) {
  const cache = new Map(), pending = new Map(), activeReads = new Map();
  let scope = getScope(), epoch = 0, cacheRevision = 0, serial = 0, predicting = false, disposed = false;
  let hits = 0, misses = 0, predictionHits = 0, predictionWaste = 0;
  const resource = uri => String(uri).split('?')[0].replace(/\d+/g, ':id').slice(0, 90);
  const clear = ({cancelPending = true} = {}) => {
    cache.forEach(entry => {if (entry.predicted) predictionWaste++;});
    cache.clear(); pending.clear(); cacheRevision++;
    if (cancelPending) {activeReads.clear(); epoch++;}
  };
  const sync = () => {if (scope !== getScope()) {clear(); scope = getScope();}};
  const record = (type, data) => journal?.record(type, data);
  const read = (uri, options = {}, speculative = false) => {
    sync();
    if (disposed) return Promise.reject(stale());
    const method = String(options.method || 'GET').toUpperCase();
    if (method !== 'GET') {
      if (!invalidates(uri, options)) return Promise.resolve().then(() => fetch(uri, options));
      // Mutation invalidates reuse, not the identity of unrelated live reads.
      clear({cancelPending: false});
      return Promise.resolve().then(() => fetch(uri, options)).finally(() => clear({cancelPending: false}));
    }
    const ttl = policy(uri, options), key = stable([uri, options.params || {}]);
    const consumerId = journal?.snapshot().active?.id || null;
    const cached = ttl > 0 && cache.get(key);
    if (cached && now() - cached.at < ttl && (speculative || !consumerId || cached.consumedBy !== consumerId)) {
      hits++; if (!speculative) cached.consumedBy = consumerId;
      if (!speculative && cached.predicted) {predictionHits++; cached.predicted = false;}
      record('read.cache-hit', {resource: resource(uri), requestId: cached.requestId, cache: 'memory'});
      return Promise.resolve(clone(cached.value));
    }
    if (cached) {if (cached.predicted) predictionWaste++; cache.delete(key);}
    if (ttl > 0 && pending.has(key)) {
      const work = pending.get(key);
      if (!speculative && work.predicted) {predictionHits++; work.predicted = false;}
      const consumerJourney = consumerId, consumerStarted = now(), consumerScope = scope, consumerEpoch = epoch;
      record('read.deduplicated', {resource: resource(uri), requestId: work.meta.requestId});
      return work.promise.then(value => {
        if (disposed || consumerScope !== getScope() || consumerEpoch !== epoch) throw stale();
        record('read.shared-returned', {resource: resource(uri), requestId: work.meta.requestId, journeyId: consumerJourney, durationMs: now() - consumerStarted, cache: 'in-flight'});
        return clone(value);
      }).catch(error => {
        if (!disposed && consumerScope === getScope() && consumerEpoch === epoch)
          record('read.shared-failed', {resource: resource(uri), requestId: work.meta.requestId, journeyId: consumerJourney, outcome: 'error'});
        throw error;
      });
    }
    const started = now(), startedScope = scope, startedEpoch = epoch, startedRevision = cacheRevision;
    const journeyId = journal?.snapshot().active?.id || null;
    const requestId = `r${++serial}`;
    const meta = {resource: resource(uri), requestId, journeyId, source: speculative ? 'prediction' : 'read'};
    activeReads.set(requestId, meta); record('read.started', meta); misses++;
    const work = {meta, predicted: speculative, promise: null};
    let result;
    try {result = fetch(uri, options);} catch (error) {result = Promise.reject(error);}
    work.promise = Promise.resolve(result).then(value => {
      if (disposed || startedScope !== getScope() || startedEpoch !== epoch) throw stale();
      const bytes = ttl > 0 ? JSON.stringify(value ?? null).length * 2 : 0;
      if (ttl > 0 && bytes <= maxBytes && startedRevision === cacheRevision) {
        cache.set(key, {value: clone(value), at: now(), predicted: work.predicted, consumedBy: speculative ? null : consumerId, requestId, bytes});
        const size = () => [...cache.values()].reduce((total, entry) => total + entry.bytes, 0);
        while (cache.size > maxEntries || size() > maxBytes) {
          const first = cache.keys().next().value;
          if (cache.get(first)?.predicted) predictionWaste++;
          cache.delete(first);
        }
      }
      activeReads.delete(requestId);
      record('read.returned', {...meta, durationMs: now() - started, outcome: 'success'});
      return value;
    }).catch(error => {
      activeReads.delete(requestId);
      // A prior context must not reappear in the new context's observation log.
      if (startedScope === getScope() && startedEpoch === epoch && !disposed)
        record('read.failed', {...meta, durationMs: now() - started, outcome: error.name === 'AbortError' ? 'cancelled' : 'error'});
      throw error;
    }).finally(() => {if (pending.get(key) === work) pending.delete(key);});
    if (ttl > 0) pending.set(key, work);
    return work.promise.then(value => {
      if (disposed || startedScope !== getScope() || startedEpoch !== epoch) throw stale();
      return clone(value);
    });
  };
  return {
    read,
    async prefetch(uri, options = {}) {
      if (disposed || predicting || (options.method && options.method.toUpperCase() !== 'GET') || !policy(uri, options)) return false;
      predicting = true;
      try {await read(uri, options, true); return true;} catch {return false;} finally {predicting = false;}
    },
    invalidate: clear,
    stats() {sync(); return {entries: cache.size, pending: activeReads.size, hits, misses, predictionHits, predictionWaste};},
    dispose() {disposed = true; clear();},
  };
}
