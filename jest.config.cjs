const appTests = {
  moduleNameMapper: {
    '\\.(gif|jpe?g|png|svg|webp|ttf|woff2?)$': '<rootDir>/src/tests/jest/fileMock.cjs',
  },
  testPathIgnorePatterns: ['/node_modules/', '/src/tests/browser/', '/src/tests/onboarding/'],
};

module.exports = {
  projects: [
    {...appTests, displayName: 'app'},
    {...require('./jest.onboarding.config.cjs'), displayName: 'onboarding'},
  ],
};
