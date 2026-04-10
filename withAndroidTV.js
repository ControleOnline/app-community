const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidTV(config) {
  return withAndroidManifest(config, config => {
    const CALLBACK_SCHEME = 'ControleOnline';
    const CALLBACK_HOST = 'POS';
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
    mainActivity.$['android:launchMode'] = 'singleTask';

    const hasCieloCallbackFilter = (mainActivity['intent-filter'] || []).some(filter => {
      const actions = filter?.action || [];
      const categories = filter?.category || [];
      const data = filter?.data || [];

      const hasViewAction = actions.some(
        item => item?.$?.['android:name'] === 'android.intent.action.VIEW'
      );
      const hasBrowsableCategory = categories.some(
        item => item?.$?.['android:name'] === 'android.intent.category.BROWSABLE'
      );
      const hasDefaultCategory = categories.some(
        item => item?.$?.['android:name'] === 'android.intent.category.DEFAULT'
      );
      const hasCallbackData = data.some(
        item =>
          item?.$?.['android:scheme'] === CALLBACK_SCHEME &&
          item?.$?.['android:host'] === CALLBACK_HOST
      );

      return hasViewAction && hasBrowsableCategory && hasDefaultCategory && hasCallbackData;
    });

    // Garante intent para Android TV
    mainActivity['intent-filter'] = [
      ...(mainActivity['intent-filter'] || []),
      ...(!hasCieloCallbackFilter
        ? [
            {
              action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
              category: [
                { $: { 'android:name': 'android.intent.category.DEFAULT' } },
                { $: { 'android:name': 'android.intent.category.BROWSABLE' } }
              ],
              data: [
                {
                  $: {
                    'android:scheme': CALLBACK_SCHEME,
                    'android:host': CALLBACK_HOST
                  }
                }
              ]
            }
          ]
        : []),
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
