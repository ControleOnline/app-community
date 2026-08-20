const appJson = require('./app.json');

const APP_NAME_PREFIX = 'On';
const DEFAULT_APP_TYPE = 'MANAGER';
const DEFAULT_DISPLAY_NAME = 'Gestor';
const DEFAULT_SLUG_SUFFIX = 'controle-online';
const DEFAULT_PACKAGE_PREFIX = 'com.controleonline';
const APP_JSON_IDENTITY_SOURCE = 'app-json';

const DEFAULT_DISPLAY_NAMES = {
  ADMIN: 'Admin',
  CHECKOUT: 'Checkout',
  CRM: 'CRM',
  DELIVERY: 'Delivery',
  MANAGER: DEFAULT_DISPLAY_NAME,
  MENU: 'Menu',
  POS: 'PDV',
  PPC: 'PCP',
  SERVICE: 'Service',
  SHOP: 'Shop',
  MKT: 'Marketing',
};

const clone = value => JSON.parse(JSON.stringify(value));

const resolveLocalEnv = () => {
  try {
    return require('./config/env.local')?.env || {};
  } catch {
    return {};
  }
};

const normalizeIdentitySource = value =>
  String(value || '')
    .trim()
    .toLowerCase();

const resolveDefaultDisplayName = appType =>
  DEFAULT_DISPLAY_NAMES[appType] || DEFAULT_DISPLAY_NAME;

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
  const localEnv = resolveLocalEnv();

  const identitySource = normalizeIdentitySource(process.env.EXPO_IDENTITY_SOURCE);
  if (identitySource === APP_JSON_IDENTITY_SOURCE) {
    return expo;
  }

  const appType = String(
    localEnv.APP_TYPE || process.env.APP_TYPE || DEFAULT_APP_TYPE,
  ).toUpperCase();
  const appLower = appType.toLowerCase();
  const assetsFolder = String(
    process.env.ASSETS_VARIANT ||
      (appType === 'ADMIN' ? 'manager' : appType),
  ).toLowerCase();
  const displayName =
    localEnv.APP_DISPLAY_NAME ||
    process.env.APP_DISPLAY_NAME ||
    resolveDefaultDisplayName(appType);
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

  const firebaseAndroidGoogleServicesFile =
    process.env.FIREBASE_ANDROID_GOOGLE_SERVICES_FILE ||
    localEnv.FIREBASE_ANDROID_GOOGLE_SERVICES_FILE;

  if (firebaseAndroidGoogleServicesFile) {
    expo.android.googleServicesFile =
      firebaseAndroidGoogleServicesFile;
  }

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

  // ===== INÍCIO DA MODIFICAÇÃO =====
  // Quando for export web/LG, removemos plugins nativos.
  // Esses plugins são usados apenas em Android/iOS e podem quebrar o `expo export --platform web`.

  const isWeb = process.env.EXPO_OS === 'web';

  const getPluginName = plugin => Array.isArray(plugin) ? plugin[0] : plugin;

  const nativeOnlyPlugins = [
    'react-native-maps',
    'react-native-nfc-manager',
    'react-native-iap',
    'expo-notifications',
    'expo-camera',
    'expo-audio',
    'expo-build-properties',
    './withAndroidTV',
    './withKioskMode',
    './withLauncherMode',
    './withBackgroundRuntime',
    './withVectorIconsFonts',
  ];

  const plugins = Array.isArray(expo.plugins) ? [...expo.plugins] : [];

  expo.plugins = plugins.filter(plugin => {
    const pluginName = getPluginName(plugin);

    if (isWeb) {
      return !nativeOnlyPlugins.includes(pluginName);
    }

    return pluginName !== 'react-native-maps';
  });

  // ===== FIM DA MODIFICAÇÃO =====

  return expo;
};
