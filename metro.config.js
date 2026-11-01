const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const packageConfig = require('./package.json');

const projectRoot = __dirname;
require('./scripts/apply-admin-bootstrap-patch.cjs');
require('./scripts/apply-single-item-patch.cjs');
require('./scripts/apply-manager-header-patch.cjs');
const moduleRoot = process.env.APP_ENV === 'dev'
  ? packageConfig.moduleResolution.source
  : packageConfig.moduleResolution.published;
const config = getDefaultConfig(projectRoot);

const appNodeModules = path.resolve(projectRoot, 'node_modules');
const workspaceNodeModules = path.resolve(projectRoot, '..', 'node_modules');
const productionModules = process.env.APP_ENV !== 'dev';

config.useWatchman = false;

const avatarModule = require('./scripts/lib/experimental-avatar.cjs').resolveExperimentalAvatar({projectRoot});
if (avatarModule.watchFolder) config.watchFolders = [...(config.watchFolders || []), avatarModule.watchFolder];

config.resolver.nodeModulesPaths = [
  appNodeModules,
  workspaceNodeModules,
];

config.resolver.disableHierarchicalLookup = productionModules;

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@appType': path.resolve(projectRoot, 'src', 'appType.js'),
  // Published UI packages still reference the previous native-payment scope.
  '@controleonline-rn/react-native-cielo-payment': path.resolve(appNodeModules, '@controleonline/react-native-cielo-payment'),
  '@controleonline-rn/react-native-infinitepay-payment': path.resolve(appNodeModules, '@controleonline/react-native-infinitepay-payment'),
  react: path.resolve(appNodeModules, 'react'),
  'react-native': path.resolve(appNodeModules, 'react-native'),
};

// Standard Expo uses the approved Manager layout; legacy remains an explicit override.
const {resolveManagerLayout} = require('./scripts/lib/manager-layout.cjs');
const managerLayout = resolveManagerLayout(process.env.EXPO_PUBLIC_MANAGER_LAYOUT);
const managerWebPreview = managerLayout !== 'legacy' && (managerLayout === 'modern' || process.env.EXPO_PUBLIC_MANAGER_PREVIEW === '1');
const managerNativePreview = managerLayout !== 'legacy' && (managerLayout === 'modern' || process.env.EXPO_PUBLIC_MANAGER_NATIVE_PREVIEW === '1');
if (managerWebPreview || managerNativePreview) {
  const {withManagerApiMiddleware} = require('./scripts/lib/manager-api-proxy.cjs');
  const originalEnhance = config.server.enhanceMiddleware;
  if (managerWebPreview) config.server.enhanceMiddleware = (middleware, server) => withManagerApiMiddleware(
    require('./config/env.local.js').env.API_ENTRYPOINT,
    originalEnhance ? originalEnhance(middleware,server) : middleware,
  );
  const previousResolve = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (managerWebPreview && platform === 'web' && moduleName === '@controleonline/ui-common/src/api/fetch')
      return {type:'sourceFile',filePath:path.join(projectRoot,'src/components/manager-preview/ManagerApiFetch.web.js')};
    if (((managerWebPreview && platform === 'web') || (managerNativePreview && platform === 'android')) && moduleName === '@controleonline/ui-common/src/react/components/RuntimeInfoFooter')
      return {type: 'sourceFile', filePath: path.join(projectRoot, 'src/components/manager-preview/ManagerRuntimeFooter.js')};
    if (((managerWebPreview && platform === 'web') || (managerNativePreview && platform === 'android')) && moduleName === '@controleonline/ui-default/src/react/components/table/DefaultTable')
      return {type: 'sourceFile', filePath: path.join(projectRoot, 'src/components/manager-preview/ManagerDefaultTable.js')};
    return previousResolve ? previousResolve(context, moduleName, platform) : context.resolveRequest(context, moduleName, platform);
  };
}

const resolveBeforeAvatar = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Legacy host path still present in some published UI packages during migration to ui-layout.
  if (moduleName === '@controleonline/../../src/styles/colors')
    return {type: 'sourceFile', filePath: path.join(appNodeModules, '@controleonline/ui-layout/src/styles/colors.js')};
  if (moduleName === '@controleonline/../../src/styles/branding')
    return {type: 'sourceFile', filePath: path.join(appNodeModules, '@controleonline/ui-layout/src/styles/branding.js')};
  if (moduleName === '@controleonline/ui-common/src/react/components/AppTypeSwitcher')
    return {type: 'sourceFile', filePath: path.join(projectRoot, 'src/components/AuthenticatedAppTypeSwitcher.js')};
  if (moduleName === '@experimental-avatar') return {type: 'sourceFile', filePath: avatarModule.entry};
  return resolveBeforeAvatar ? resolveBeforeAvatar(context, moduleName, platform) : context.resolveRequest(context, moduleName, platform);
};
module.exports = config;
