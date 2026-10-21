const base = require('./jest.waiter.config.cjs');
module.exports = {...base, roots: ['<rootDir>/src/tests/homepage'],
  moduleNameMapper: {
    '^@experimental-avatar$': process.env.SHENLONG_TESTS === '1'
      ? '<rootDir>/../.codex/experiments/shenlong/src/index.js'
      : '<rootDir>/src/components/manager-preview/DisabledAvatar.js',
    ...(process.env.CONTROLEONLINE_HOME_MODULES_ROOT ? {
    '^@controleonline/(ui-common|ui-layout|ui-manager)/(.*)$': `${process.env.CONTROLEONLINE_HOME_MODULES_ROOT}/$1/$2`,
  } : {}), ...base.moduleNameMapper},
  moduleFileExtensions: ['web.js', 'js', 'json', 'node'],
  testMatch: ['**/*.test.js'],
};
