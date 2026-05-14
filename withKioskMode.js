const {withAndroidManifest, withDangerousMod} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const TEMPLATE_DIR = path.join(__dirname, 'plugins', 'kiosk-mode', 'templates');

const RECEIVE_BOOT_COMPLETED_PERMISSION =
  'android.permission.RECEIVE_BOOT_COMPLETED';
const KIOSK_BOOT_RECEIVER_NAME = '.kiosk.KioskBootReceiver';

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
  manifest.manifest['uses-permission'] =
    manifest.manifest['uses-permission'] || [];

  const alreadyPresent = manifest.manifest['uses-permission'].some(
    item => item?.$?.['android:name'] === permissionName,
  );

  if (!alreadyPresent) {
    manifest.manifest['uses-permission'].push({
      $: {'android:name': permissionName},
    });
  }
};

const hasMainAction = filter =>
  (filter?.action || []).some(
    item => item?.$?.['android:name'] === 'android.intent.action.MAIN',
  );

const hasCategory = (filter, categoryName) =>
  (filter?.category || []).some(
    item => item?.$?.['android:name'] === categoryName,
  );

const ensureKioskHomeIntentFilter = mainActivity => {
  mainActivity['intent-filter'] = mainActivity['intent-filter'] || [];

  const hasHomeFilter = mainActivity['intent-filter'].some(
    filter =>
      hasMainAction(filter) &&
      hasCategory(filter, 'android.intent.category.HOME') &&
      hasCategory(filter, 'android.intent.category.DEFAULT'),
  );

  if (!hasHomeFilter) {
    mainActivity['intent-filter'].push({
      action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
      category: [
        { $: { 'android:name': 'android.intent.category.HOME' } },
        { $: { 'android:name': 'android.intent.category.DEFAULT' } },
      ],
    });
  }
};

const ensureBootReceiver = application => {
  application.receiver = application.receiver || [];

  const alreadyPresent = application.receiver.some(
    item => item?.$?.['android:name'] === KIOSK_BOOT_RECEIVER_NAME,
  );

  if (!alreadyPresent) {
    application.receiver.push({
      $: {
        'android:name': KIOSK_BOOT_RECEIVER_NAME,
        'android:directBootAware': 'true',
        'android:enabled': 'true',
        'android:exported': 'true',
      },
      'intent-filter': [
        {
          action: [
            { $: { 'android:name': 'android.intent.action.BOOT_COMPLETED' } },
            {
              $: {
                'android:name': 'android.intent.action.LOCKED_BOOT_COMPLETED',
              },
            },
          ],
        },
      ],
    });
  }
};

const patchMainApplication = (filePath, packageName) => {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let contents = fs.readFileSync(filePath, 'utf8');
  const importLine = `import ${packageName}.kiosk.KioskModePackage`;

  if (!contents.includes(importLine)) {
    contents = contents.replace(
      /^package\s+[^\n]+\n/m,
      match => `${match}\n${importLine}\n`,
    );
  }

  if (!contents.includes('add(KioskModePackage())')) {
    contents = contents.replace(
      /(PackageList\(this\)\.packages\.apply\s*\{\n)/,
      `$1              add(KioskModePackage())\n`,
    );
  }

  fs.writeFileSync(filePath, contents);
};

module.exports = function withKioskMode(config) {
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

    ensurePermission(manifest, RECEIVE_BOOT_COMPLETED_PERMISSION);
    ensureBootReceiver(application);

    const mainActivity = application.activity?.find(
      activity => activity?.$?.['android:name'] === '.MainActivity',
    );

    if (mainActivity) {
      mainActivity.$['android:lockTaskMode'] = 'if_whitelisted';
      ensureKioskHomeIntentFilter(mainActivity);
    }

    return currentConfig;
  });

  config = withDangerousMod(config, [
    'android',
    async currentConfig => {
      const androidRoot = currentConfig.modRequest.platformProjectRoot;
      const javaRoot = path.join(androidRoot, 'app', 'src', 'main', 'java');
      const packagePath = packageName.split('.');
      const kioskRoot = path.join(javaRoot, ...packagePath, 'kiosk');

      ensureFileContents(
        path.join(kioskRoot, 'KioskModePackage.kt'),
        readTemplate('KioskModePackage.kt.template', packageName),
      );
      ensureFileContents(
        path.join(kioskRoot, 'KioskModeModule.kt'),
        readTemplate('KioskModeModule.kt.template', packageName),
      );
      ensureFileContents(
        path.join(kioskRoot, 'KioskBootReceiver.kt'),
        readTemplate('KioskBootReceiver.kt.template', packageName),
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
