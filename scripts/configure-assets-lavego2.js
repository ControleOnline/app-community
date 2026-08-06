const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '../app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

const assetsFolder = 'shop_lavego';
const rootDir = path.join(__dirname, '..');

const updateAssetPath = (currentPath, label) => {
  if (typeof currentPath !== 'string') return currentPath;

  if (!currentPath.startsWith('./src/assets/')) {
    console.warn(`⚠  ${label}: caminho fora do padrão esperado → "${currentPath}" (não alterado)`);
    return currentPath;
  }

  const newPath = currentPath.replace(
    /^\.\/src\/assets\/([^/]+)\//,
    `./src/assets/${assetsFolder}/`
  );

  if (newPath === currentPath) {
    console.error(`✗  ${label}: regex não casou com → "${currentPath}"`);
    return currentPath;
  }

  const absolutePath = path.join(rootDir, newPath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`✗  ${label}: arquivo não encontrado → "${absolutePath}"`);
    process.exit(1);
  }

  console.log(`✓  ${label}: "${currentPath}" → "${newPath}"`);
  return newPath;
};

const fields = [
  {
    get: () => appJson.expo?.icon,
    set: (v) => { appJson.expo.icon = v; },
    label: 'expo.icon',
  },
  {
    get: () => appJson.expo?.splash?.image,
    set: (v) => { appJson.expo.splash.image = v; },
    label: 'expo.splash.image',
  },
  {
    get: () => appJson.expo?.android?.adaptiveIcon?.foregroundImage,
    set: (v) => { appJson.expo.android.adaptiveIcon.foregroundImage = v; },
    label: 'expo.android.adaptiveIcon.foregroundImage',
  },
  {
    get: () => appJson.expo?.web?.favicon,
    set: (v) => { appJson.expo.web.favicon = v; },
    label: 'expo.web.favicon',
  },
  {
    get: () => appJson.expo?.ios?.icon,
    set: (v) => { appJson.expo.ios.icon = v; },
    label: 'expo.ios.icon',
  },
];

let changed = 0;
for (const field of fields) {
  const current = field.get();
  if (current) {
    field.set(updateAssetPath(current, field.label));
    changed++;
  }
}

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

console.log('');
console.log(`✓  ${changed} campo(s) atualizado(s)`);
console.log(`✓  Assets configurados para Lave-Go Shop`);
console.log(`✓  Asset path: ./src/assets/${assetsFolder}/`);