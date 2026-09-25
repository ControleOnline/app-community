const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { resolveModulePath } = require('./scripts/resolve-module-path.cjs');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

const appNodeModules = path.resolve(projectRoot, 'node_modules');
const workspaceNodeModules = path.resolve(projectRoot, '..', 'node_modules');
const productionModules = process.env.MODULE_RESOLUTION_MODE === 'production';

config.useWatchman = false;

config.resolver.nodeModulesPaths = [
  appNodeModules,
  workspaceNodeModules,
];

config.resolver.disableHierarchicalLookup = productionModules;

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@appType': path.resolve(projectRoot, 'src', 'appType.js'),
  // Production must resolve the exact published package, never mutable source.
  '@controleonline/ui-accounting': resolveModulePath(projectRoot, '@controleonline/ui-accounting', productionModules),
  react: path.resolve(appNodeModules, 'react'),
  'react-native': path.resolve(appNodeModules, 'react-native'),
};

module.exports = config;
