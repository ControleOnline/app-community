const {describe, expect, it} = global;

const withVectorIconsFonts = require('../../../withVectorIconsFonts');

const {
  ensureVectorIconsFontsGradle,
  VECTOR_ICONS_FONTS_GRADLE,
} = withVectorIconsFonts.__private__;

describe('withVectorIconsFonts helpers', () => {
  it('injects the vector icons gradle import after the React plugin', () => {
    const contents = [
      'apply plugin: "com.android.application"',
      'apply plugin: "org.jetbrains.kotlin.android"',
      'apply plugin: "com.facebook.react"',
      '',
      'android {',
      '}',
      '',
    ].join('\n');

    const nextContents = ensureVectorIconsFontsGradle(contents);

    expect(nextContents).toContain('apply plugin: "com.facebook.react"');
    expect(nextContents).toContain(VECTOR_ICONS_FONTS_GRADLE);
    expect(nextContents.indexOf('apply plugin: "com.facebook.react"')).toBeLessThan(
      nextContents.indexOf(VECTOR_ICONS_FONTS_GRADLE),
    );
  });

  it('does not duplicate the vector icons gradle import', () => {
    const contents = [
      'apply plugin: "com.android.application"',
      'apply plugin: "org.jetbrains.kotlin.android"',
      'apply plugin: "com.facebook.react"',
      VECTOR_ICONS_FONTS_GRADLE,
      '',
      'android {',
      '}',
      '',
    ].join('\n');

    const nextContents = ensureVectorIconsFontsGradle(contents);
    const matches = nextContents.match(
      new RegExp(
        VECTOR_ICONS_FONTS_GRADLE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'g',
      ),
    );

    expect(matches).toHaveLength(1);
  });
});
