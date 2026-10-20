// Opt-in preview console view of the existing in-memory journal. No business payloads.
const reported = new Set(['navigation.requested','screen.committed','view.data-committed','read.cache-hit','read.failed','read.shared-failed']);
export function attachJourneyConsole(journal, write = console.info) {
  let lastSequence = 0;
  return journal.subscribe(() => {
    const event = journal.snapshot().events.at(-1);
    if (!event || event.seq <= lastSequence) return;
    lastSequence = event.seq;
    if (!reported.has(event.type)) return;
    const safe = {type:event.type};
    for (const key of ['route','source','outcome','cache']) if (event[key] !== undefined) safe[key] = event[key];
    if (event.durationMs !== undefined) safe.durationMs = Math.round(event.durationMs);
    if (event.resource) safe.resource = String(event.resource).split('?')[0].replace(/\d+/g, ':id');
    write('On Manager timing', JSON.stringify(safe));
  });
}
