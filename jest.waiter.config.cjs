const path = require('node:path');
const moduleRoot = path.resolve(process.env.CONTROLEONLINE_MODULES_ROOT || path.join(__dirname, 'node_modules/@controleonline'));
module.exports = {
  rootDir: __dirname,
  roots: ['ui-orders', 'ui-products', 'ui-default'].map(name => path.join(moduleRoot, name)),
  testEnvironment: 'node',
  modulePaths: [path.join(__dirname, 'node_modules')],
  transform: {
    '^.+\\.[jt]sx?$': [require.resolve('babel-jest'), {
      babelrc: false, configFile: false,
      presets: [require.resolve('@babel/preset-env'), require.resolve('@babel/preset-react')],
    }],
  },
  transformIgnorePatterns: ['/node_modules/(?!@controleonline/)'],
  moduleNameMapper: {
    '^@controleonline/(ui-orders|ui-products|ui-default)/(.*)$': `${moduleRoot}/$1/$2`,
    '^@controleonline/../../src/(.*)$': '<rootDir>/src/$1',
    '^@controleonline/(.*)$': '<rootDir>/node_modules/@controleonline/$1',
    '^@appType$': '<rootDir>/src/appType.js',
    '^@store$': '<rootDir>/src/store',
    '^@stores$': '<rootDir>/src/store/stores.js',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@env$': '<rootDir>/src/tests/jest/waiterEnv.cjs',
    '\\.(gif|jpe?g|png|svg|webp|ttf|woff2?)$': '<rootDir>/src/tests/jest/fileMock.cjs',
  },
  testPathIgnorePatterns: ['/src/tests/browser/'],
};
