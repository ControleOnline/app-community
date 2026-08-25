const flows = require('./browser-smoke-flows.cjs');

const appTypes = [
  ['manager', 'MANAGER'],
  ['admin', 'ADMIN'],
  ['delivery', 'DELIVERY'],
  ['pos', 'POS'],
];

const unique = values => [...new Set(values.filter(Boolean))];

module.exports = appTypes.map(([name, appType]) => {
  const matchingFlows = flows.filter(flow => flow.appTypes.includes(appType));

  return {
    name,
    appType,
    flowIds: matchingFlows.map(flow => flow.id),
    testPaths: unique(matchingFlows.flatMap(flow => flow.testPaths)),
  };
});
