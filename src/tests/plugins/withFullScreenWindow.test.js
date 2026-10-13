const {describe, expect, it} = global;

const {
  __private__: {applyFullScreenWindow},
} = require('../../../withFullScreenWindow');

const buildManifest = () => ({
  manifest: {
    application: [{activity: [{$: {'android:name': '.MainActivity'}}]}],
  },
});

describe('withFullScreenWindow', () => {
  it('makes MainActivity resizeable with a relaxed max aspect ratio', () => {
    const manifest = applyFullScreenWindow(buildManifest());
    const activity = manifest.manifest.application[0].activity[0].$;

    expect(activity['android:resizeableActivity']).toBe('true');
    expect(activity['android:maxAspectRatio']).toBe('3.0');
  });

  it('adds the max aspect ratio meta-data only once', () => {
    const manifest = buildManifest();
    applyFullScreenWindow(manifest);
    applyFullScreenWindow(manifest);

    const metas = manifest.manifest.application[0]['meta-data'].filter(
      item => item.$['android:name'] === 'android.max_aspect_ratio',
    );
    expect(metas).toHaveLength(1);
    expect(metas[0].$['android:value']).toBe('3.0');
  });
});
