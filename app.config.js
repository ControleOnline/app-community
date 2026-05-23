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

const resolveGoogleMapsApiKey = () => {
  const localEnvKey = readEnvValue(
    path.resolve(__dirname, '../api-community/.env.local'),
    'GMAPS_KEY',
  );

  return (
    process.env.GMAPS_KEY ||
    process.env.EXPO_PUBLIC_GMAPS_KEY ||
    localEnvKey
  );
};

module.exports = () => {
  const expo = appJson.expo || {};
  const googleMapsApiKey = resolveGoogleMapsApiKey();
  const plugins = Array.isArray(expo.plugins) ? [...expo.plugins] : [];
  const nextPlugins = plugins.map(plugin => {
    if (plugin === 'react-native-maps') {
      return googleMapsApiKey
        ? [
            'react-native-maps',
            {
              androidGoogleMapsApiKey: googleMapsApiKey,
            },
          ]
        : plugin;
    }

    if (!Array.isArray(plugin) || plugin[0] !== 'react-native-maps') {
      return plugin;
    }

    if (!googleMapsApiKey) {
      return plugin;
    }

    return [
      'react-native-maps',
      {
        ...(plugin[1] || {}),
        androidGoogleMapsApiKey: googleMapsApiKey,
      },
    ];
  });

  if (
    googleMapsApiKey &&
    !nextPlugins.some(
      plugin =>
        plugin === 'react-native-maps' ||
        (Array.isArray(plugin) && plugin[0] === 'react-native-maps'),
    )
  ) {
    nextPlugins.push([
      'react-native-maps',
      {
        androidGoogleMapsApiKey: googleMapsApiKey,
      },
    ]);
  }

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
    plugins: nextPlugins,
  };
};
