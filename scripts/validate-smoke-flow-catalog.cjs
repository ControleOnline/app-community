const fs = require('fs');
const path = require('path');
const flows = require('./browser-smoke-flows.cjs');
const groups = require('./browser-smoke-groups.cjs');

const projectRoot = path.resolve(__dirname, '..');
const requiredFlows = [
  'produto-cadastro',
  'compra-fluxo',
  'device-configuracao',
  'pedido-criacao',
  'producao-fluxo',
];
const validAppTypes = new Set(['MANAGER', 'ADMIN', 'DELIVERY', 'POS']);
const ids = new Set();

for (const flow of flows) {
  if (ids.has(flow.id)) {
    throw new Error(`Duplicate smoke flow id: ${flow.id}`);
  }

  ids.add(flow.id);

  if (!flow.evidence || flow.evidence.screenshots !== 'required-per-step') {
    throw new Error(`Flow ${flow.id} must require screenshots per step`);
  }

  if (!Array.isArray(flow.steps) || flow.steps.length < 3) {
    throw new Error(`Flow ${flow.id} must declare at least three steps`);
  }

  for (const appType of flow.appTypes) {
    if (!validAppTypes.has(appType)) {
      throw new Error(`Flow ${flow.id} has invalid app type: ${appType}`);
    }
  }
}

for (const flowId of requiredFlows) {
  if (!ids.has(flowId)) {
    throw new Error(`Missing required smoke flow: ${flowId}`);
  }
}

for (const group of groups) {
  if (!Array.isArray(group.flowIds) || group.flowIds.length === 0) {
    throw new Error(`Browser smoke group ${group.name} must be backed by flow ids`);
  }
}

const gitmodules = fs.readFileSync(path.join(projectRoot, '.gitmodules'), 'utf8');
if (!/path\s*=\s*docs\/wiki/.test(gitmodules)) {
  throw new Error('docs/wiki must be configured as the app-community wiki submodule');
}

if (!/url\s*=\s*https:\/\/github\.com\/ControleOnline\/app-community\.wiki\.git/.test(gitmodules)) {
  throw new Error('docs/wiki must point to https://github.com/ControleOnline/app-community.wiki.git');
}

console.log(`Validated ${flows.length} browser smoke flows.`);
