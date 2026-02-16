module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@assets': './src/assets',
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
