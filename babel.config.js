const path = require('path');
const packageConfig = require('./package.json');
const moduleRoot = path.resolve(
  __dirname,
  process.env.APP_ENV === 'dev'
    ? packageConfig.moduleResolution.source
    : packageConfig.moduleResolution.published
);

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
          '@env': './config/env.local.js',
          '@package': './package.json',
          '@store': './src/store',
          '@stores': './src/store/stores.js',
        },
      },
    ],
  ],
};
