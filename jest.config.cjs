module.exports = {
  moduleNameMapper: {
    '\\.(gif|jpe?g|png|svg|webp|ttf|woff2?)$': '<rootDir>/src/tests/jest/fileMock.cjs',
  },
  testPathIgnorePatterns: ['/node_modules/', '/src/tests/browser/'],
};
