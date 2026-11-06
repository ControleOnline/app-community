const base=require('./jest.waiter.config.cjs');
module.exports={...base,roots:['<rootDir>/src/tests/theme-system'],testMatch:['**/*.test.js'],
  setupFilesAfterEnv:['<rootDir>/src/tests/theme-system/setup.cjs'],
  moduleFileExtensions:['web.js','js','json','node'],
  moduleNameMapper:{
    ...Object.fromEntries(Object.entries(require('./scripts/lib/theme-original-modules.cjs')).map(([name,parts])=>['^'+name+'$','<rootDir>/node_modules/@controleonline/'+parts.join('/')])),
    '^react-native$':'<rootDir>/src/tests/theme-system/nativeMock.cjs',
    '^@env$':'<rootDir>/src/tests/theme-system/env.cjs',
    '^@store$':'<rootDir>/src/tests/theme-system/store.cjs',
    '^@appType$':'<rootDir>/src/tests/theme-system/appType.cjs',
    '^@controleonline/ui-common/src/utils/storedSessionToken$':'<rootDir>/src/session/scopedStoredSessionToken.js',
    '^@controleonline/ui-common/src/api/fetch$':'<rootDir>/src/session/ScopedApiFetch.js',
    '^@controleonline/ui-layout/src/styles/colors$':'<rootDir>/src/styles/ThemeColors.js',
    '^@controleonline/../../src/styles/branding$':'<rootDir>/src/styles/branding.js',
    ...Object.fromEntries(Object.entries(base.moduleNameMapper).filter(([key])=>!['^@env$','^@store$','^@appType$'].includes(key))),
  },
};
