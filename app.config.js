const appJson = require('./app.json');

module.exports = () => {
  const expo = appJson.expo || {};
  const plugins = Array.isArray(expo.plugins) ? [...expo.plugins] : [];
  const nextPlugins = plugins.filter(
    plugin =>
      plugin !== 'react-native-maps' &&
      (!Array.isArray(plugin) || plugin[0] !== 'react-native-maps'),
  );

  return {
    ...expo,
    plugins: nextPlugins,
  };
};
