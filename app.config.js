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

const resolveEnvValue = (keys, filePath) => {
  for (const key of keys) {
    const envValue = process.env[key];
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

const resolveGoogleMapsApiKey = () =>
  resolveEnvValue(
    [
      'GMAPS_GOOGLE_CLIENT_ID',
      'EXPO_PUBLIC_GMAPS_GOOGLE_CLIENT_ID',
      'GMAPS_KEY',
      'EXPO_PUBLIC_GMAPS_KEY',
    ],
    path.resolve(__dirname, '../api-community/.env.local'),
  );

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
