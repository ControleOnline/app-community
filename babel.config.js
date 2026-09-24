module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        cwd: 'babelrc',
        alias: {
          '@assets': './src/assets',
          '@appType': './src/appType.js',
          '@controleonline/react-native-getnet-payment': './node_modules/@controleonline/react-native-getnet-payment',
          '@controleonline/ui-accounting': './modules/controleonline/ui-accounting',
          '@controleonline': './modules/controleonline',
          '@controleonline-rn': './node_modules/@controleonline',
          '@env': './config/env.local.js',
          '@package': './package.json',
          '@store': './src/store',
          '@stores': './src/store/stores.js',
        },
      },
    ],
  ],
};
