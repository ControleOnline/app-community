const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const packageConfig = require('./package.json');

const projectRoot = __dirname;
require('./scripts/generate-theme-contract.cjs');
require('./scripts/apply-theme-system-patch.cjs');
require('./scripts/apply-integrations-catalog-patch.cjs');
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
  const original=require('./scripts/lib/theme-original-modules.cjs')[moduleName];
  if(original)return {type:'sourceFile',filePath:path.resolve(projectRoot,moduleRoot,...original)};
  const dependencyOrigin=/[\\/]node_modules[\\/]@controleonline[\\/]|[\\/]modules[\\/]controleonline[\\/]/.test(context.originModulePath);
  const matches=(name,file)=> moduleName===`@controleonline/${name}/${file.replace(/\.js$/,'')}` || moduleName===`@controleonline/${name}/${file}`
    || (dependencyOrigin && moduleName.startsWith('.') && path.resolve(path.dirname(context.originModulePath),moduleName).replace(/\.js$/,'').endsWith(`/${name}/${file.replace(/\.js$/,'')}`));
  const bridge=(file)=>({type:'sourceFile',filePath:path.join(projectRoot,'src',file)});
  if(matches('ui-layout','src/styles/colors.js'))return bridge('styles/ThemeColors.js');
  if(matches('ui-layout','src/styles/branding.js'))return bridge('styles/branding.js');
  if(matches('ui-common','src/react/components/DefaultProvider.web.configuration.js'))return bridge('styles/ThemeProviderConfiguration.web.js');
  if(matches('ui-common','src/react/components/DefaultProvider.native.configuration.js'))return bridge('styles/ThemeProviderConfiguration.native.js');
  if(moduleName==='@controleonline/ui-common/src/utils/storedSessionToken')return bridge('session/scopedStoredSessionToken.js');
  if(matches('ui-login','src/store/modules/auth/mutations.js'))return bridge('session/scopedAuthMutations.js');
  if(matches('ui-login','src/store/modules/auth/actions.js'))return bridge('session/scopedAuthActions.js');
  if(moduleName==='@controleonline/ui-common/src/api/fetch' && !(managerWebPreview && platform==='web'))return bridge('session/ScopedApiFetch.js');
  // Legacy host path still present in some published UI packages during migration to ui-layout.
  if (moduleName === '@controleonline/../../src/styles/colors')
    return {type: 'sourceFile', filePath: path.join(projectRoot, 'src/styles/ThemeColors.js')};
  if (moduleName === '@controleonline/../../src/styles/branding')
    return {type: 'sourceFile', filePath: path.join(projectRoot, 'src/styles/branding.js')};
  if (moduleName === '@controleonline/ui-common/src/react/components/AppTypeSwitcher')
    return {type: 'sourceFile', filePath: path.join(projectRoot, 'src/components/AuthenticatedAppTypeSwitcher.js')};
  if (moduleName === '@experimental-avatar') return {type: 'sourceFile', filePath: avatarModule.entry};
  return resolveBeforeAvatar ? resolveBeforeAvatar(context, moduleName, platform) : context.resolveRequest(context, moduleName, platform);
};
module.exports = config;
