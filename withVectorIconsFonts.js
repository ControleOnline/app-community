const {withAppBuildGradle} = require('@expo/config-plugins');

const VECTOR_ICONS_FONTS_GRADLE =
  'apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")';

const ensureVectorIconsFontsGradle = contents => {
  if (contents.includes(VECTOR_ICONS_FONTS_GRADLE)) {
    return contents;
  }

  const reactPluginPattern = /(apply plugin:\s*"com\.facebook\.react"\s*\n)/;

  if (reactPluginPattern.test(contents)) {
    return contents.replace(
      reactPluginPattern,
      `$1${VECTOR_ICONS_FONTS_GRADLE}\n`,
    );
  }

  const applyPluginBlockPattern = /((?:apply plugin:.*\n)+)/;

  if (applyPluginBlockPattern.test(contents)) {
    return contents.replace(
      applyPluginBlockPattern,
      `$1${VECTOR_ICONS_FONTS_GRADLE}\n`,
    );
  }

  return `${VECTOR_ICONS_FONTS_GRADLE}\n${contents}`;
};

module.exports = function withVectorIconsFonts(config) {
  return withAppBuildGradle(config, currentConfig => {
    if (currentConfig.modResults.language !== 'groovy') {
      return currentConfig;
    }

    currentConfig.modResults.contents = ensureVectorIconsFontsGradle(
      currentConfig.modResults.contents,
    );

    return currentConfig;
  });
};

module.exports.__private__ = {
  ensureVectorIconsFontsGradle,
  VECTOR_ICONS_FONTS_GRADLE,
};
