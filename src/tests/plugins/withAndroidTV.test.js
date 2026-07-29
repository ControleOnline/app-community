const {describe, expect, it} = global;

const withAndroidTV = require('../../../withAndroidTV');

const {
  applyAndroidTVManifest,
  ensureUsesFeature,
  isLauncherIntentFilter,
} = withAndroidTV.__private__;

const getFeature = (manifest, featureName) =>
  (manifest.manifest['uses-feature'] || []).find(
    item => item?.$?.['android:name'] === featureName,
  );

describe('withAndroidTV helpers', () => {
  it('adds optional TV hardware features once', () => {
    const manifest = {manifest: {}};

    ensureUsesFeature(manifest, 'android.hardware.microphone', false);
    ensureUsesFeature(manifest, 'android.hardware.microphone', false);

    expect(manifest.manifest['uses-feature']).toHaveLength(1);
    expect(getFeature(manifest, 'android.hardware.microphone').$).toEqual({
      'android:name': 'android.hardware.microphone',
      'android:required': 'false',
    });
  });

  it('marks TV-only hardware as optional and keeps the leanback launcher', () => {
    const manifest = {
      manifest: {
        application: [
          {
            activity: [
              {
                $: {'android:name': '.MainActivity'},
                'intent-filter': [],
              },
            ],
          },
        ],
      },
    };

    applyAndroidTVManifest(manifest, 'ControleOnline');
    applyAndroidTVManifest(manifest, 'ControleOnline');

    expect(getFeature(manifest, 'android.software.leanback').$).toEqual({
      'android:name': 'android.software.leanback',
      'android:required': 'false',
    });
    expect(getFeature(manifest, 'android.hardware.touchscreen').$).toEqual({
      'android:name': 'android.hardware.touchscreen',
      'android:required': 'false',
    });
    expect(getFeature(manifest, 'android.hardware.microphone').$).toEqual({
      'android:name': 'android.hardware.microphone',
      'android:required': 'false',
    });
    expect(getFeature(manifest, 'android.hardware.location').$).toEqual({
      'android:name': 'android.hardware.location',
      'android:required': 'false',
    });
    expect(getFeature(manifest, 'android.hardware.location.gps').$).toEqual({
      'android:name': 'android.hardware.location.gps',
      'android:required': 'false',
    });
    expect(getFeature(manifest, 'android.hardware.location.network').$).toEqual({
      'android:name': 'android.hardware.location.network',
      'android:required': 'false',
    });

    const mainActivity = manifest.manifest.application[0].activity[0];
    const launcherFilters = (mainActivity['intent-filter'] || []).filter(
      isLauncherIntentFilter,
    );

    expect(launcherFilters).toHaveLength(1);
    expect(launcherFilters[0].category).toEqual([
      { $: { 'android:name': 'android.intent.category.LAUNCHER' } },
      { $: { 'android:name': 'android.intent.category.LEANBACK_LAUNCHER' } },
    ]);
  });
});
