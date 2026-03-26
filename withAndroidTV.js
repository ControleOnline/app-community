const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidTV(config) {
  return withAndroidManifest(config, config => {
    const manifest = config.modResults;

    // Garante o uses-feature leanback
    manifest.manifest['uses-feature'] = [
      ...(manifest.manifest['uses-feature'] || []),
      {
        $: {
          'android:name': 'android.software.leanback',
          'android:required': 'false'
        }
      }
    ];

    const app = manifest.manifest.application[0];

    if (!app.activity) return config;

    const mainActivity = app.activity.find(
      a => a.$['android:name'] === '.MainActivity'
    );

    if (!mainActivity) return config;

    // Garante intent para Android TV
    mainActivity['intent-filter'] = [
      ...(mainActivity['intent-filter'] || []),
      {
        action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
        category: [
          { $: { 'android:name': 'android.intent.category.LEANBACK_LAUNCHER' } }
        ]
      }
    ];

    return config;
  });
};