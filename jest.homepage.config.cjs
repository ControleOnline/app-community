const base = require('./jest.waiter.config.cjs');
module.exports = {...base, roots: ['<rootDir>/src/tests/homepage'],
  moduleNameMapper: {...(process.env.CONTROLEONLINE_HOME_MODULES_ROOT ? {
    '^@controleonline/(ui-common|ui-layout|ui-manager)/(.*)$': `${process.env.CONTROLEONLINE_HOME_MODULES_ROOT}/$1/$2`,
  } : {}), ...base.moduleNameMapper},
  moduleFileExtensions: ['web.js', 'js', 'json', 'node'],
  testMatch: ['**/*.test.js'],
};
