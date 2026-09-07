const fs = require('fs');
const path = require('path');
const {resolveAssetsFolder, updateAssetPath} = require('./app-assets.cjs');

const appJsonPath = path.join(__dirname, '../app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

const appType = (process.argv[2] || process.env.APP_TYPE || 'MANAGER').toUpperCase();
const appLower = appType.toLowerCase();
const assetsFolder = resolveAssetsFolder(appType, process.env.ASSETS_VARIANT);

const assetsBasePath = `./src/assets/${assetsFolder}/`;

if (appJson.expo?.icon) {
  appJson.expo.icon = updateAssetPath(appJson.expo.icon, assetsFolder);
}

if (appJson.expo?.splash?.image) {
  appJson.expo.splash.image = updateAssetPath(appJson.expo.splash.image, assetsFolder);
}

if (appJson.expo?.android?.adaptiveIcon?.foregroundImage) {
  appJson.expo.android.adaptiveIcon.foregroundImage = updateAssetPath(
    appJson.expo.android.adaptiveIcon.foregroundImage,
    assetsFolder,
  );
}

if (appJson.expo?.web?.favicon) {
  appJson.expo.web.favicon = updateAssetPath(appJson.expo.web.favicon, assetsFolder);
}

if (appJson.expo?.ios?.icon) {
  appJson.expo.ios.icon = updateAssetPath(appJson.expo.ios.icon, assetsFolder);
}

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

console.log(`✓ Assets configured for APP_TYPE: ${appType}`);
console.log(`✓ Asset path: ${assetsBasePath}`);
