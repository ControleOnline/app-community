'use strict';

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const modulesRoot = path.join(projectRoot, 'modules', 'controleonline');

function normalizePathValue(value) {
  return String(value || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
}

function stripTestSuffix(value) {
  const normalized = normalizePathValue(value);
  return normalized
    .replace(/\.(?:spec|test|e2e|smoke)\.(?:js|cjs|mjs|jsx|tsx|ts)$/i, '')
    .replace(/\.(?:[cm]js|jsx|tsx|ts)$/i, '');
}

function encodeSuiteId(suitePath) {
  return Buffer.from(normalizePathValue(suitePath), 'utf8').toString('base64url');
}

function humanizeLabel(value) {
  return String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ') || 'Sem nome';
}

function walk(dir, result = []) {
  if (!fs.existsSync(dir)) return result;

  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, result);
    } else {
      result.push(fullPath);
    }
  }

  return result;
}

function browserTestFiles() {
  return walk(modulesRoot)
    .filter(filePath => /[\\/]src[\\/]tests[\\/]browser[\\/]/.test(filePath))
    .filter(filePath => /\.spec\.js$/i.test(filePath))
    .sort((left, right) => left.localeCompare(right));
}

function extractTestTitles(source) {
  const titles = [];
  const expression = /\b(?:test|it)\s*\(\s*(['"`])([\s\S]*?)\1\s*,/g;
  let match;

  while ((match = expression.exec(source))) {
    const title = match[2].trim();
    if (title) titles.push(title);
  }

  return titles;
}

function extractFlowchartIds(source) {
  const ids = new Set();
  const listExpression = /flowchartIds?\s*[:=]\s*\[([^\]]*)\]/gi;
  const singleExpression = /FLOWCHART_ID\s*[:=]\s*(\d+)/g;

  for (const expression of [listExpression, singleExpression]) {
    let match;
    while ((match = expression.exec(source))) {
      for (const value of String(match[1] || '').matchAll(/\d+/g)) {
        ids.add(Number(value[0]));
      }
    }
  }

  return [...ids].sort((left, right) => left - right);
}

function suitePathForFile(filePath) {
  const normalized = normalizePathValue(path.relative(projectRoot, filePath));
  const marker = 'src/tests/browser/';
  const markerIndex = normalized.indexOf(marker);
  const browserPath = markerIndex >= 0 ? normalized.slice(markerIndex + marker.length) : path.basename(filePath);
  return `browser-smoke/${stripTestSuffix(browserPath)}`;
}

function buildCatalogTest(title, flowchartIds) {
  return {
    title,
    status: 'pending',
    error: null,
    screenshots: [],
    steps: [],
    cataloged: true,
    flowchartIds,
  };
}

function buildBrowserCatalog() {
  const suites = [];

  for (const filePath of browserTestFiles()) {
    const source = fs.readFileSync(filePath, 'utf8');
    const suitePath = suitePathForFile(filePath);
    const flowchartIds = extractFlowchartIds(source);
    const tests = extractTestTitles(source).map(title => buildCatalogTest(title, flowchartIds));
    const suiteName = path.basename(suitePath);
    const suiteId = encodeSuiteId(suitePath);

    suites.push({
      type: 'browser-smoke',
      typeDisplayName: 'Browser Smoke',
      suite: suiteName,
      suitePath,
      suiteId,
      displayName: humanizeLabel(suiteName),
      generatedAt: null,
      updatedAt: null,
      status: 'pending',
      summary: {
        total: tests.length,
        passed: 0,
        failed: 0,
        pending: tests.length,
      },
      tests,
      flowchartIds,
      cataloged: true,
      links: {
        source: `/${normalizePathValue(path.relative(projectRoot, filePath))}`,
        report: null,
      },
    });
  }

  return suites;
}

function buildFlowchartCatalog(suites) {
  const byId = new Map();

  for (const suite of suites) {
    for (const id of Array.isArray(suite.flowchartIds) ? suite.flowchartIds : []) {
      if (!byId.has(id)) {
        byId.set(id, {id, name: `Flowchart ${id}`, suiteCount: 0, testCount: 0, status: 'pending'});
      }

      const flowchart = byId.get(id);
      flowchart.suiteCount += 1;
      flowchart.testCount += Array.isArray(suite.tests) ? suite.tests.filter(test =>
        Array.isArray(test.flowchartIds) && test.flowchartIds.includes(id),
      ).length : 0;
    }
  }

  return [...byId.values()].sort((left, right) => left.id - right.id);
}

module.exports = {
  buildBrowserCatalog,
  buildFlowchartCatalog,
  encodeSuiteId,
  extractFlowchartIds,
  extractTestTitles,
  suitePathForFile,
};
