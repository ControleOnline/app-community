const fs = require('fs');
const path = require('path');

const appJson = require('./app.json');

const readEnvValue = (filePath, key) => {
  if (!fs.existsSync(filePath)) {
    return '';
  }

  const line = fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .find(entry => entry.trim().startsWith(`${key}=`));

  if (!line) {
    return '';
  }

  const rawValue = line.slice(line.indexOf('=') + 1).trim();
  if (!rawValue) {
    return '';
  }

  return rawValue.replace(/^['"]|['"]$/g, '');
};

const normalizeConfigValue = value => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const readJsEnvValue = (filePath, key) => {
  if (!fs.existsSync(filePath)) {
    return '';
  }

  try {
    const fileModule = require(filePath);
    return normalizeConfigValue(fileModule?.env?.[key]);
  } catch {
    return '';
  }
};

const resolveEnvValue = (keys, filePath) => {
  for (const key of keys) {
    const envValue = normalizeConfigValue(process.env[key]);
    if (envValue) {
      return envValue;
    }
  }

  for (const key of keys) {
    const fileValue = readEnvValue(filePath, key);
    if (fileValue) {
      return fileValue;
    }
  }

  return '';
};

const resolveGoogleMapsApiKey = () => {
  const keys = [
    'GMAPS_GOOGLE_CLIENT_ID',
    'EXPO_PUBLIC_GMAPS_GOOGLE_CLIENT_ID',
    'GMAPS_KEY',
    'EXPO_PUBLIC_GMAPS_KEY',
  ];

  const appEnvPath = path.resolve(__dirname, './config/env.local.js');
  const apiEnvLocalPath = path.resolve(__dirname, '../api-community/.env.local');
  const apiEnvPath = path.resolve(__dirname, '../api-community/.env');

  for (const key of keys) {
    const jsEnvValue = readJsEnvValue(appEnvPath, key);
    if (jsEnvValue) {
      return jsEnvValue;
    }
  }

  return (
    resolveEnvValue(keys, apiEnvLocalPath) ||
    resolveEnvValue(keys, apiEnvPath)
  );
};

module.exports = () => {
  const expo = appJson.expo || {};
  const googleMapsApiKey = resolveGoogleMapsApiKey();
  const plugins = Array.isArray(expo.plugins) ? [...expo.plugins] : [];
  const nextPlugins = plugins.filter(plugin =>
    plugin !== 'react-native-maps' &&
    (!Array.isArray(plugin) || plugin[0] !== 'react-native-maps'),
  );

  return {
    ...expo,
    android: {
      ...(expo.android || {}),
      config: {
        ...((expo.android || {}).config || {}),
        ...(googleMapsApiKey
          ? {
              googleMaps: {
                apiKey: googleMapsApiKey,
              },
            }
          : {}),
      },
    },
    ios: {
      ...(expo.ios || {}),
      config: {
        ...((expo.ios || {}).config || {}),
        ...(googleMapsApiKey
          ? {
              googleMapsApiKey,
            }
          : {}),
      },
    },
    plugins: nextPlugins,
  };
};
