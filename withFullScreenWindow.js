const {withAndroidManifest} = require('@expo/config-plugins');

// Very large value so Android never letterboxes the window (blank band at the
// bottom on tablets/tall displays) because of a legacy max aspect ratio.
const MAX_ASPECT_RATIO = '3.0';
const MAX_ASPECT_RATIO_META = 'android.max_aspect_ratio';

const applyFullScreenWindow = manifest => {
  const app = manifest.manifest.application?.[0];
  if (!app) {
    return manifest;
  }

  app['meta-data'] = app['meta-data'] || [];
  const meta = app['meta-data'].find(
    item => item?.$?.['android:name'] === MAX_ASPECT_RATIO_META,
  );
  if (meta) {
    meta.$['android:value'] = MAX_ASPECT_RATIO;
  } else {
    app['meta-data'].push({
      $: {
        'android:name': MAX_ASPECT_RATIO_META,
        'android:value': MAX_ASPECT_RATIO,
      },
    });
  }

  const mainActivity = (app.activity || []).find(
    item => item?.$?.['android:name'] === '.MainActivity',
  );
  if (mainActivity) {
    mainActivity.$['android:resizeableActivity'] = 'true';
    mainActivity.$['android:maxAspectRatio'] = MAX_ASPECT_RATIO;
  }

  return manifest;
};

module.exports = function withFullScreenWindow(config) {
  return withAndroidManifest(config, config => {
    applyFullScreenWindow(config.modResults);
    return config;
  });
};

module.exports.__private__ = {applyFullScreenWindow};
