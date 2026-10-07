module.exports = {
  rootDir: __dirname,
  roots: ['<rootDir>/src/tests/onboarding'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/tests/onboarding/setup.js'],
  transform: {
    '^.+\\.[jt]sx?$': [require.resolve('babel-jest'), {
      babelrc: false, configFile: false,
      presets: [require.resolve('@babel/preset-env'), require.resolve('@babel/preset-react')],
    }],
  },
  transformIgnorePatterns: ['/node_modules/(?!@controleonline/)'],
  moduleNameMapper: {
    '^@controleonline/(.*)$': '<rootDir>/node_modules/@controleonline/$1',
    '^@store$': '<rootDir>/src/store',
    '^@appType$': '<rootDir>/src/appType.js',
    '^@env$': '<rootDir>/src/tests/jest/waiterEnv.cjs',
  },
};
