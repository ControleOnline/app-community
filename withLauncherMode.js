const {withDangerousMod} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const TEMPLATE_DIR = path.join(__dirname, 'plugins', 'launcher-mode', 'templates');

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

const patchMainApplication = (filePath, packageName) => {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let contents = fs.readFileSync(filePath, 'utf8');
  const importLine = `import ${packageName}.launcher.LauncherModePackage`;

  if (!contents.includes(importLine)) {
    contents = contents.replace(
      /^package\s+[^\n]+\n/m,
      match => `${match}\n${importLine}\n`,
    );
  }

  if (!contents.includes('add(LauncherModePackage())')) {
    contents = contents.replace(
      /(PackageList\(this\)\.packages\.apply\s*\{\n)/,
      `$1              add(LauncherModePackage())\n`,
    );
  }

  fs.writeFileSync(filePath, contents);
};

const patchMainActivity = (filePath, packageName) => {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let contents = fs.readFileSync(filePath, 'utf8');
  const intentImport = 'import android.content.Intent';
  const importLine = `import ${packageName}.launcher.LauncherModeState`;

  if (!contents.includes(intentImport)) {
    contents = contents.replace(
      /^package\s+[^\n]+\n/m,
      match => `${match}\n${intentImport}\n`,
    );
  }

  if (!contents.includes(importLine)) {
    contents = contents.replace(
      /^package\s+[^\n]+\n/m,
      match => `${match}\n${importLine}\n`,
    );
  }

  if (!contents.includes('override fun onUserLeaveHint()')) {
    const onUserLeaveHintBlock = `  override fun onUserLeaveHint() {
    super.onUserLeaveHint()

    if (!LauncherModeState.launcherEnabled) {
      return
    }

    try {
      val launchIntent =
        packageManager.getLaunchIntentForPackage(packageName) ?: return

      launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      launchIntent.addFlags(Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED)
      startActivity(launchIntent)
    } catch (_: Exception) {
    }
  }

`;

    contents = contents.replace(
      '\n  /**\n    * Align the back button behavior with Android S',
      `\n${onUserLeaveHintBlock}  /**\n    * Align the back button behavior with Android S`,
    );
  }

  fs.writeFileSync(filePath, contents);
};

module.exports = function withLauncherMode(config) {
  const packageName = config?.android?.package;

  if (!packageName) {
    return config;
  }

  config = withDangerousMod(config, [
    'android',
    async currentConfig => {
      const androidRoot = currentConfig.modRequest.platformProjectRoot;
      const javaRoot = path.join(androidRoot, 'app', 'src', 'main', 'java');
      const packagePath = packageName.split('.');
      const launcherRoot = path.join(javaRoot, ...packagePath, 'launcher');

      ensureFileContents(
        path.join(launcherRoot, 'LauncherModeState.kt'),
        readTemplate('LauncherModeState.kt.template', packageName),
      );
      ensureFileContents(
        path.join(launcherRoot, 'LauncherModePackage.kt'),
        readTemplate('LauncherModePackage.kt.template', packageName),
      );
      ensureFileContents(
        path.join(launcherRoot, 'LauncherModeModule.kt'),
        readTemplate('LauncherModeModule.kt.template', packageName),
      );

      patchMainApplication(
        path.join(javaRoot, ...packagePath, 'MainApplication.kt'),
        packageName,
      );
      patchMainActivity(
        path.join(javaRoot, ...packagePath, 'MainActivity.kt'),
        packageName,
      );

      return currentConfig;
    },
  ]);

  return config;
};
