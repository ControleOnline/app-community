const {describe, it} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const modelSource = fs.readFileSync(
  path.resolve(__dirname, '../model.js'),
  'utf8',
);
const overviewSource = fs.readFileSync(
  path.resolve(__dirname, '../ManagerOverview.js'),
  'utf8',
);

describe('manager home i18n (no hardcoded UI Portuguese)', () => {
  it('managerMenu prefers resolveRuntimeMenuLabel over route hardcodes', () => {
    assert.match(modelSource, /resolveRuntimeMenuLabel\(item, t\)/);
    assert.doesNotMatch(modelSource, /Minhas empresas/);
    assert.doesNotMatch(modelSource, /Configurações/);
    assert.doesNotMatch(modelSource, /Pedidos de venda/);
  });

  it('ManagerOverview section titles come from translate keys', () => {
    assert.match(overviewSource, /explore_modules/);
    assert.doesNotMatch(overviewSource, /Explore seus módulos/);
    assert.match(overviewSource, /configs', 'period'/);
  });
});
