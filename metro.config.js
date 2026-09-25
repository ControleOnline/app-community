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
  '@controleonline/ui-accounting': path.resolve(projectRoot, moduleRoot, 'ui-accounting'),
  react: path.resolve(appNodeModules, 'react'),
  'react-native': path.resolve(appNodeModules, 'react-native'),
};

module.exports = config;
