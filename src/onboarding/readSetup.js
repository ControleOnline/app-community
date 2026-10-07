const resources = [
  ['team', 'people_links', 'company'],
  ['products', 'products', 'company'],
  ['devices', 'device_configs', 'people'],
  ['queues', 'queues', 'company'],
  ['displays', 'displays', 'company'],
];
const entityId = value => String(value?.id ?? value?.['@id'] ?? value ?? '').match(/(?:^|\/)(\d+)$/)?.[1];
const collection = data => Array.isArray(data) ? data : data?.member || data?.['hydra:member'];

// Read only setup resources. Orders, invoices, activation and remote commands
// remain exclusively in their existing module flows.
export async function readSetup(fetch, companyId, {maxPages = 20} = {}) {
  if (!companyId) return {};
  const entries = await Promise.all(resources.map(async ([key, endpoint, tenantField]) => {
    const items = [];
    const seen = new Set();
    try {
      let complete = false;
      for (let page = 1; page <= maxPages; page += 1) {
        const data = await fetch(endpoint, {params: {[tenantField]: `/people/${companyId}`, page, itemsPerPage: 100, ...(key === 'team' ? {enable: true} : {})}});
        const rows = collection(data);
        if (!Array.isArray(rows)) throw new Error('Invalid collection');
        const total = Number(data?.totalItems ?? data?.['hydra:totalItems']);
        let added = 0;
        for (const row of rows) {
          const identity = entityId(row);
          if (!identity || seen.has(identity)) continue;
          seen.add(identity);
          added += 1;
          // Never display records from another company even when a filter is ignored.
          if (entityId(row[tenantField]) === String(companyId)) items.push(row);
        }
        const next = data?.view?.next || data?.['hydra:view']?.['hydra:next'];
        if (rows.length === 0 || (Number.isFinite(total) && seen.size >= total) || (!Number.isFinite(total) && !next && rows.length < 100)) {
          complete = true;
          break;
        }
        if (added === 0) break;
      }
      return [key, {available: true, complete, items}];
    } catch {
      return [key, {available: false, complete: false, items: []}];
    }
  }));
  return Object.fromEntries(entries);
}
