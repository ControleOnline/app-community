const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '../app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

const appType = (process.env.APP_TYPE || 'MANAGER').toUpperCase();
const appLower = appType.toLowerCase();
const assetsBasePath = `./src/assets/${appLower}/`;

const updateAssetPath = (currentPath) => {
  if (typeof currentPath === 'string' && currentPath.startsWith('./src/assets/')) {
    return currentPath.replace(
      /^\.\/src\/assets\/([^/]+)\//,
      `./src/assets/${appLower}/`
    );
  }
  return currentPath;
};

if (appJson.expo?.icon) {
  appJson.expo.icon = updateAssetPath(appJson.expo.icon);
}

if (appJson.expo?.splash?.image) {
  appJson.expo.splash.image = updateAssetPath(appJson.expo.splash.image);
}

if (appJson.expo?.android?.adaptiveIcon?.foregroundImage) {
  appJson.expo.android.adaptiveIcon.foregroundImage = updateAssetPath(
    appJson.expo.android.adaptiveIcon.foregroundImage
  );
}

if (appJson.expo?.web?.favicon) {
  appJson.expo.web.favicon = updateAssetPath(appJson.expo.web.favicon);
}

if (appJson.expo?.ios?.icon) {
  appJson.expo.ios.icon = updateAssetPath(appJson.expo.ios.icon);
}

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

console.log(`✓ Assets configured for APP_TYPE: ${appType}`);
console.log(`✓ Asset path: ${assetsBasePath}`);