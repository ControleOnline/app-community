module.exports = {
  moduleNameMapper: {
    '\\.(gif|jpe?g|png|svg|webp|ttf|woff2?)$': '<rootDir>/src/tests/jest/fileMock.cjs',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/src/tests/browser/',
    // Submodule test has duplicate-import syntax error (fixed in ui-default repo);
    // equivalent coverage lives in src/tests/react/geocodeMiss.test.js
    '/modules/controleonline/ui-default/src/tests/react/hooks/usePostalCodeLookup.test.js',
  ],
};
