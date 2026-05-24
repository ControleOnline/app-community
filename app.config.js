const appJson = require('./app.json');

const APP_NAME_PREFIX = 'On';
const DEFAULT_APP_TYPE = 'MANAGER';
const DEFAULT_DISPLAY_NAME = 'Gestor';
const DEFAULT_SLUG_SUFFIX = 'controle-online';
const DEFAULT_PACKAGE_PREFIX = 'com.controleonline';

const clone = value => JSON.parse(JSON.stringify(value));

const removeNamePrefix = value =>
  typeof value === 'string' ? value.replace(/^On\s+/, '') : value;

const updateAssetPath = (currentPath, assetsFolder) => {
  if (typeof currentPath === 'string' && currentPath.startsWith('./src/assets/')) {
    return currentPath.replace(
      /^\.\/src\/assets\/([^/]+)\//,
      `./src/assets/${assetsFolder}/`,
    );
  }

  return currentPath;
};

module.exports = () => {
  const expo = clone(appJson.expo || {});
  const appType = (process.env.APP_TYPE || DEFAULT_APP_TYPE).toUpperCase();
  const appLower = appType.toLowerCase();
  const assetsFolder = (process.env.ASSETS_VARIANT || appType).toLowerCase();
  const displayName =
    process.env.APP_DISPLAY_NAME ||
    removeNamePrefix(expo.displayName) ||
    removeNamePrefix(expo.name) ||
    DEFAULT_DISPLAY_NAME;
  const packageName =
    process.env.PACKAGE_NAME || `${DEFAULT_PACKAGE_PREFIX}.${appLower}`;
  const slug = process.env.APP_SLUG || `${appLower}-${DEFAULT_SLUG_SUFFIX}`;

  expo.name = `${APP_NAME_PREFIX} ${displayName}`;
  expo.displayName = `${APP_NAME_PREFIX} ${displayName}`;
  expo.slug = slug;
  expo.icon = updateAssetPath(expo.icon, assetsFolder);

  if (expo.splash?.image) {
    expo.splash.image = updateAssetPath(expo.splash.image, assetsFolder);
  }

  expo.android = {
    ...(expo.android || {}),
    package: packageName,
  };

  if (expo.android.adaptiveIcon?.foregroundImage) {
    expo.android.adaptiveIcon.foregroundImage = updateAssetPath(
      expo.android.adaptiveIcon.foregroundImage,
      assetsFolder,
    );
  }

  if (expo.ios) {
    expo.ios.bundleIdentifier = packageName;

    if (expo.ios.icon) {
      expo.ios.icon = updateAssetPath(expo.ios.icon, assetsFolder);
    }
  }

  if (expo.web?.favicon) {
    expo.web.favicon = updateAssetPath(expo.web.favicon, assetsFolder);
  }

  const plugins = Array.isArray(expo.plugins) ? [...expo.plugins] : [];
  expo.plugins = plugins.filter(
    plugin =>
      plugin !== 'react-native-maps' &&
      (!Array.isArray(plugin) || plugin[0] !== 'react-native-maps'),
  );

  return expo;
};
