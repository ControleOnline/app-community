const {withAndroidManifest, withDangerousMod} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const TEMPLATE_DIR = path.join(
  __dirname,
  'plugins',
  'background-runtime',
  'templates',
);

const FOREGROUND_SERVICE_PERMISSION =
  'android.permission.FOREGROUND_SERVICE_DATA_SYNC';
const BACKGROUND_SERVICE_NAME = '.background.BackgroundRuntimeService';

const ensureFileContents = (filePath, contents) => {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});

  const currentContents = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, 'utf8')
    : null;

  if (currentContents !== contents) {
    fs.writeFileSync(filePath, contents);
  }
};

const readTemplate = (templateName, packageName) =>
  fs
    .readFileSync(path.join(TEMPLATE_DIR, templateName), 'utf8')
    .replace(/__PACKAGE__/g, packageName);

const ensurePermission = (manifest, permissionName) => {
  manifest.manifest['uses-permission'] = manifest.manifest['uses-permission'] || [];

  const alreadyPresent = manifest.manifest['uses-permission'].some(
    item => item?.$?.['android:name'] === permissionName,
  );

  if (!alreadyPresent) {
    manifest.manifest['uses-permission'].push({
      $: {'android:name': permissionName},
    });
  }
};

const ensureService = application => {
  application.service = application.service || [];

  const alreadyPresent = application.service.some(
    item => item?.$?.['android:name'] === BACKGROUND_SERVICE_NAME,
  );

  if (!alreadyPresent) {
    application.service.push({
      $: {
        'android:name': BACKGROUND_SERVICE_NAME,
        'android:enabled': 'true',
        'android:exported': 'false',
        'android:foregroundServiceType': 'dataSync',
        'android:process': ':backgroundRuntime',
        'android:stopWithTask': 'false',
      },
    });
  }
};

const patchMainApplication = (filePath, packageName) => {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let contents = fs.readFileSync(filePath, 'utf8');
  const importLine = `import ${packageName}.background.BackgroundRuntimePackage`;

  if (!contents.includes(importLine)) {
    contents = contents.replace(
      /^package\s+[^\n]+\n/m,
      match => `${match}\n${importLine}\n`,
    );
  }

  if (!contents.includes('add(BackgroundRuntimePackage())')) {
    contents = contents.replace(
      /(PackageList\(this\)\.packages\.apply\s*\{\n)/,
      `$1              add(BackgroundRuntimePackage())\n`,
    );
  }

  fs.writeFileSync(filePath, contents);
};

module.exports = function withBackgroundRuntime(config) {
  const packageName = config?.android?.package;

  if (!packageName) {
    return config;
  }

  config = withAndroidManifest(config, currentConfig => {
    const manifest = currentConfig.modResults;
    const application = manifest.manifest.application?.[0];

    if (!application) {
      return currentConfig;
    }

    ensurePermission(manifest, FOREGROUND_SERVICE_PERMISSION);
    ensureService(application);

    return currentConfig;
  });

  config = withDangerousMod(config, [
    'android',
    async currentConfig => {
      const androidRoot = currentConfig.modRequest.platformProjectRoot;
      const javaRoot = path.join(androidRoot, 'app', 'src', 'main', 'java');
      const packagePath = packageName.split('.');
      const backgroundRoot = path.join(javaRoot, ...packagePath, 'background');

      ensureFileContents(
        path.join(backgroundRoot, 'BackgroundRuntimePackage.kt'),
        readTemplate('BackgroundRuntimePackage.kt.template', packageName),
      );
      ensureFileContents(
        path.join(backgroundRoot, 'BackgroundRuntimeModule.kt'),
        readTemplate('BackgroundRuntimeModule.kt.template', packageName),
      );
      ensureFileContents(
        path.join(backgroundRoot, 'BackgroundRuntimeService.kt'),
        readTemplate('BackgroundRuntimeService.kt.template', packageName),
      );

      patchMainApplication(
        path.join(javaRoot, ...packagePath, 'MainApplication.kt'),
        packageName,
      );

      return currentConfig;
    },
  ]);

  return config;
};
