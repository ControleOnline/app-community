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

    // ALEMAC // 06/04/2026 // Garante meta-data para integração com Cielo
    app['meta-data'] = app['meta-data'] || [];

    const hasCieloIntegrationType = app['meta-data'].some(
      item => item?.$?.['android:name'] === 'cs_integration_type'
    );

    if (!hasCieloIntegrationType) {
      app['meta-data'].push({
        $: {
          'android:name': 'cs_integration_type',
          'android:value': 'uri'
        }
      });
    }
    // Fim ALEMAC // 06/04/2026



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