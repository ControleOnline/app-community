const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '../app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

const appType = (process.env.APP_TYPE || 'MANAGER').toUpperCase();
//const assetSubdir = appType === 'MANAGER' ? '' : `${appType.toLowerCase()}/`;
const assetSubdir = `${appType.toLowerCase()}/`;
const assetsBasePath = `./src/assets/${assetSubdir}`;

// Função para atualizar caminhos de assets
const updateAssetPath = (currentPath) => {
  if (typeof currentPath === 'string' && currentPath.includes('./src/assets/')) {
    return currentPath.replace('./src/assets/', assetsBasePath);
  }
  return currentPath;
};

// Atualizar assets no nível raiz
appJson.expo.icon = updateAssetPath(appJson.expo.icon);
appJson.expo.splash.image = updateAssetPath(appJson.expo.splash.image);

// Atualizar assets do Android
if (appJson.expo.android?.adaptiveIcon) {
  appJson.expo.android.adaptiveIcon.foregroundImage = updateAssetPath(
    appJson.expo.android.adaptiveIcon.foregroundImage
  );
}

// Atualizar assets do Web
if (appJson.expo.web?.favicon) {
  appJson.expo.web.favicon = updateAssetPath(appJson.expo.web.favicon);
}

// Atualizar assets do iOS (se houver)
if (appJson.expo.ios?.icon) {
  appJson.expo.ios.icon = updateAssetPath(appJson.expo.ios.icon);
}

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
console.log(`✓ Assets configured for APP_TYPE: ${appType}`);
console.log(`✓ Asset path: ${assetsBasePath}`);