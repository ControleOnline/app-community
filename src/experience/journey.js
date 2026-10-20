// Portable observation contract. Never attach request bodies, credentials or people.
const fields = ['route', 'resource', 'durationMs', 'source', 'outcome', 'requestId', 'journeyId', 'cache'];
export function createJourney({now = () => performance.now(), maxEvents = 160, maxAgeMs = 600000} = {}) {
  let events = [], active = null, context = '', generation = 0, sequence = 0, version = 0;
  let snapshot = {version, events, active};
  const pendingReads = new Set();
  const listeners = new Set();
  const emit = (notify = true) => {
    const cutoff = now() - maxAgeMs;
    events = events.filter(event => event.at >= cutoff).slice(-maxEvents);
    snapshot = Object.freeze({version: ++version, events: Object.freeze([...events]), active: active && Object.freeze({...active})});
    if (notify) listeners.forEach(listener => listener());
  };
  const record = (type, data = {}) => {
    const event = {schema: 'co.experience.v1', seq: ++sequence, at: now(), type,
      journeyId: active?.id || null, application, generation};
    fields.forEach(key => {if (data[key] !== undefined) event[key] = data[key];});
    if (event.journeyId === active?.id && event.source !== 'prediction') {
      if (type === 'read.started' || type === 'read.deduplicated') pendingReads.add(event.requestId);
      if (['read.returned', 'read.shared-returned', 'read.failed', 'read.shared-failed'].includes(type)) pendingReads.delete(event.requestId);
    }
    Object.freeze(event); events.push(event); emit(); return event;
  };
  let application = '';
  const api = {
    record,
    setContext(value) {
      const key = JSON.stringify(value);
      if (key === context) return;
      context = key; generation++; application = value.application || '';
      events = []; active = null; pendingReads.clear(); emit();
    },
    begin(route, source = 'trigger') {
      if (active && !active.finished && (active.presentedAt === undefined || pendingReads.size > 0)) record('journey.interrupted', {route: active.route});
      pendingReads.clear();
      active = {id: `j${generation}-${++sequence}`, route, source, startedAt: now(), application, finished: false};
      record('navigation.requested', {route, source}); return active.id;
    },
    present(route) {
      if (active?.route !== route) api.begin(route);
      if (active.presentedAt !== undefined) return;
      active.presentedAt = now();
      record('screen.committed', {route, durationMs: now() - active.startedAt});
    },
    finish(route) {
      if (active?.route !== route || active.finished) return;
      active.finished = true; record('view.data-committed', {route, durationMs: now() - active.startedAt});
    },
    snapshot: () => {if (events.some(event => event.at < now() - maxAgeMs)) emit(false); return snapshot;},
    subscribe(listener) {listeners.add(listener); return () => listeners.delete(listener);},
    reset() {context = ''; generation++; events = []; active = null; pendingReads.clear(); emit();},
  };
  return api;
}
