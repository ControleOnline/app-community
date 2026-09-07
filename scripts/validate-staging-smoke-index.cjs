'use strict';

const {chromium} = require('playwright');

const APP_URL = String(process.env.STAGING_APP_URL || 'https://staging.controleonline.com').replace(/\/$/, '');
const API_URL = String(process.env.STAGING_API_ENTRYPOINT || 'https://s.controleonline.com').replace(/\/$/, '');
const sessionJson = String(process.env.PLAYWRIGHT_SESSION_JSON || '').trim();
const minimumCatalogTests = Number(process.env.STAGING_EXPECTED_TESTS_MIN || 100);
const minimumFlowcharts = Number(process.env.STAGING_EXPECTED_FLOWCHARTS_MIN || 1);

if (!sessionJson) {
  throw new Error('PLAYWRIGHT_SESSION_JSON deve conter uma sessao real do staging.');
}

const findArtifact = value => {
  if (!value || typeof value !== 'object') return null;
  if (typeof value.url === 'string' && value.url.includes('/tests/artifacts/')) return value;

  for (const child of Array.isArray(value) ? value : Object.values(value)) {
    const artifact = findArtifact(child);
    if (artifact) return artifact;
  }

  return null;
};

const main = async () => {
  const browser = await chromium.launch({headless: true});
  try {
    const page = await browser.newPage();
    await page.addInitScript(({session}) => {
      localStorage.setItem('session', session);
      localStorage.setItem('config', JSON.stringify({language: 'pt-br'}));
      localStorage.setItem('app-type', 'ADMIN');
    }, {session: sessionJson});

    await page.goto(`${APP_URL}/tests-playground`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.getByText('Smoke Atlas', {exact: true}).waitFor({state: 'visible', timeout: 30000});

    const result = await page.evaluate(async ({apiUrl, appUrl}) => {
      const session = JSON.parse(localStorage.getItem('session') || '{}');
      const headers = {
        Accept: 'application/ld+json',
        'API-TOKEN': session.api_key || session.token || '',
        'App-Domain': new URL(appUrl).hostname,
      };
      const response = await fetch(`${apiUrl}/tests`, {headers});
      const body = await response.json();
      let artifact = null;

      const visit = value => {
        if (!value || typeof value !== 'object' || artifact) return;
        if (typeof value.url === 'string' && value.url.includes('/tests/artifacts/')) {
          artifact = value;
          return;
        }
        for (const child of Array.isArray(value) ? value : Object.values(value)) visit(child);
      };
      visit(body);

      let artifactResult = null;
      if (artifact?.url) {
        const artifactResponse = await fetch(new URL(artifact.url, apiUrl), {headers});
        const artifactBody = await artifactResponse.arrayBuffer();
        artifactResult = {
          status: artifactResponse.status,
          contentType: artifactResponse.headers.get('content-type') || '',
          bytes: artifactBody.byteLength,
        };
      }

      return {
        indexStatus: response.status,
        indexType: response.type,
        summary: body?.summary || {},
        suiteCount: Array.isArray(body?.suites) ? body.suites.length : 0,
        flowchartCount: Number(body?.summary?.flowcharts?.total || (Array.isArray(body?.flowcharts) ? body.flowcharts.length : 0)),
        artifactResult,
      };
    }, {apiUrl: API_URL, appUrl: APP_URL});

    if (result.indexStatus !== 200) throw new Error(`Indice /tests retornou HTTP ${result.indexStatus}.`);
    const testCount = Number(result.summary?.tests?.total || 0);
    const flowchartCount = Number(result.flowchartCount || result.summary?.flowcharts?.total || 0);
    if (testCount < minimumCatalogTests || result.suiteCount <= 0) {
      throw new Error(`Indice /tests incompleto: ${testCount} testes publicados; esperado >= ${minimumCatalogTests}.`);
    }
    if (flowchartCount < minimumFlowcharts) {
      throw new Error(`Indice /tests sem flowcharts publicados: ${flowchartCount}; esperado >= ${minimumFlowcharts}.`);
    }
    if (!result.artifactResult || result.artifactResult.status !== 200 || result.artifactResult.bytes <= 0) {
      throw new Error('Nenhum artefato publicado foi baixado com sucesso.');
    }

    console.log(JSON.stringify({
      page: `${APP_URL}/tests-playground`,
      index: `${API_URL}/tests`,
      indexStatus: result.indexStatus,
      corsType: result.indexType,
      suites: result.suiteCount,
      tests: testCount,
      flowcharts: flowchartCount,
      artifactStatus: result.artifactResult.status,
      artifactBytes: result.artifactResult.bytes,
    }));
  } finally {
    await browser.close();
  }
};

main().catch(error => {
  console.error(error?.message || error);
  process.exit(1);
});
