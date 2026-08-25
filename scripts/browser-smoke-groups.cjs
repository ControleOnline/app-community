const flows = require('./browser-smoke-flows.cjs');

const appTypes = [
  ['manager', 'MANAGER'],
  ['admin', 'ADMIN'],
  ['delivery', 'DELIVERY'],
  ['pos', 'POS'],
];

const unique = values => [...new Set(values.filter(Boolean))];
const pathMatchesGroup = (testPath, groupName) =>
  String(testPath || '').includes(`/src/tests/browser/${groupName}`);

module.exports = appTypes.map(([name, appType]) => {
  const matchingFlows = flows.filter(flow => flow.appTypes.includes(appType));
  const testPaths = unique(
    matchingFlows
      .flatMap(flow => flow.testPaths)
      .filter(testPath => pathMatchesGroup(testPath, name)),
  );

  return {
    name,
    appType,
    flowIds: matchingFlows.map(flow => flow.id),
    testPaths,
  };
});
