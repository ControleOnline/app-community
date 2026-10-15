const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const packageConfig = require('./package.json');

const projectRoot = __dirname;
const moduleRoot = process.env.APP_ENV === 'dev'
  ? packageConfig.moduleResolution.source
  : packageConfig.moduleResolution.published;
const config = getDefaultConfig(projectRoot);

const appNodeModules = path.resolve(projectRoot, 'node_modules');
const workspaceNodeModules = path.resolve(projectRoot, '..', 'node_modules');
const productionModules = process.env.APP_ENV !== 'dev';

config.useWatchman = false;

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

// Published @controleonline/ui-manager (CompanyFilter) still imports
// '@controleonline/../../src/components/homeAvatar' (lowercase) for the URL
// resolver, while the component lives in HomeAvatar.js. Both names differ only
// by case, which breaks checkouts on macOS/Windows. The resolver file is now
// resolveHomeAvatarUrl.js; this redirects the legacy lowercase request to it.
// Remove this alias once ui-manager imports resolveHomeAvatarUrl directly.
const homeAvatarResolverFile = path.resolve(
  projectRoot,
  'src',
  'components',
  'resolveHomeAvatarUrl.js',
);
const previousResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (/(^|\/)src\/components\/homeAvatar$/.test(moduleName)) {
    return {type: 'sourceFile', filePath: homeAvatarResolverFile};
  }

  return (previousResolveRequest || context.resolveRequest)(
    context,
    moduleName,
    platform,
  );
};

module.exports = config;
