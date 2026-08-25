#!/usr/bin/env node
/**
 * Publish (POST or PATCH) a flowchart JSON to the ControleOnline API.
 * Usage:
 *   API_TOKEN=... API_ENTRYPOINT=https://api.controleonline.com node scripts/publish-flowchart.cjs docs/flowcharts/agents-mcp-workflow.json
 *
 * Requires ROLE_SUPER. Idempotent on flowKey+appType: GET collection, PATCH if exists else POST.
 */
const fs = require('fs');
const path = require('path');

const entry = (process.env.API_ENTRYPOINT || 'https://api.controleonline.com').replace(/\/$/, '');
const token = process.env.API_TOKEN || process.env.API_KEY;
const file = process.argv[2];

if (!token) {
  console.error('Missing API_TOKEN (or API_KEY) with ROLE_SUPER');
  process.exit(1);
}
if (!file) {
  console.error('Usage: node scripts/publish-flowchart.cjs <path-to-json>');
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
const { flowKey, appType = 'ADMIN' } = payload;

async function api(method, urlPath, body) {
  const res = await fetch(`${entry}/${urlPath.replace(/^\//, '')}`, {
    method,
    headers: {
      Accept: 'application/ld+json',
      'Content-Type': 'application/ld+json',
      'API-TOKEN': token,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err = new Error(`${method} ${urlPath} → ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

(async () => {
  const qs = new URLSearchParams({ flowKey, appType, itemsPerPage: '5' });
  const col = await api('GET', `flowcharts?${qs}`);
  const members = col?.['hydra:member'] || col?.member || (Array.isArray(col) ? col : []);
  const existing = members.find(
    (m) => (m.flowKey || m.flow_key) === flowKey && (m.appType || m.app_type || 'ADMIN') === appType,
  );

  const body = {
    flowKey: payload.flowKey,
    appType: payload.appType || 'ADMIN',
    title: payload.title,
    summary: payload.summary || null,
    mermaid: payload.mermaid,
    checkpoints: payload.checkpoints || [],
    sortOrder: payload.sortOrder ?? 0,
    enabled: payload.enabled !== false,
  };

  let result;
  if (existing?.id) {
    result = await api('PATCH', `flowcharts/${existing.id}`, body);
    console.log(`Updated flowchart id=${existing.id} flowKey=${flowKey}`);
  } else {
    result = await api('POST', 'flowcharts', body);
    console.log(`Created flowchart id=${result?.id} flowKey=${flowKey}`);
  }
  console.log(JSON.stringify({ id: result?.id, flowKey, title: result?.title || body.title }, null, 2));
})().catch((e) => {
  console.error(e.message, e.data || '');
  process.exit(1);
});
