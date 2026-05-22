const { withAndroidManifest } = require('@expo/config-plugins');

const CALLBACK_SCHEME = 'ControleOnline';
const CALLBACK_HOST = 'POS';
const OPTIONAL_TV_FEATURES = [
  'android.hardware.microphone',
  'android.hardware.location',
  'android.hardware.location.gps',
  'android.hardware.location.network',
];

const ensureUsesFeature = (manifest, featureName, required) => {
  manifest.manifest['uses-feature'] = manifest.manifest['uses-feature'] || [];

  const nextUsesFeatures = manifest.manifest['uses-feature'].filter(
    item => item?.$?.['android:name'] !== featureName,
  );

  nextUsesFeatures.push({
    $: {
      'android:name': featureName,
      'android:required': required ? 'true' : 'false',
    },
  });

  manifest.manifest['uses-feature'] = nextUsesFeatures;
};

const hasAction = (filter, actionName) =>
  (filter?.action || []).some(
    item => item?.$?.['android:name'] === actionName,
  );

const hasCategory = (filter, categoryName) =>
  (filter?.category || []).some(
    item => item?.$?.['android:name'] === categoryName,
  );

const isLauncherIntentFilter = filter =>
  hasAction(filter, 'android.intent.action.MAIN') &&
  (
    hasCategory(filter, 'android.intent.category.LAUNCHER') ||
    hasCategory(filter, 'android.intent.category.LEANBACK_LAUNCHER')
  );

const buildLauncherIntentFilter = () => ({
  action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
  category: [
    { $: { 'android:name': 'android.intent.category.LAUNCHER' } },
    { $: { 'android:name': 'android.intent.category.LEANBACK_LAUNCHER' } },
  ],
});

const applyAndroidTVManifest = (manifest, appScheme) => {
  const existingUsesFeatures = manifest.manifest['uses-feature'] || [];

  // Garante as features de TV sem duplicar itens no manifest final.
  manifest.manifest['uses-feature'] = existingUsesFeatures.filter(
    item =>
      item?.$?.['android:name'] !== 'android.software.leanback' &&
      item?.$?.['android:name'] !== 'android.hardware.touchscreen',
  );

  ensureUsesFeature(manifest, 'android.software.leanback', false);
  ensureUsesFeature(manifest, 'android.hardware.touchscreen', false);
  OPTIONAL_TV_FEATURES.forEach(featureName => {
    ensureUsesFeature(manifest, featureName, false);
  });

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

  if (!app.activity) return;

  const mainActivity = app.activity.find(
    a => a.$['android:name'] === '.MainActivity'
  );

  if (!mainActivity) return;
  mainActivity.$['android:launchMode'] = 'singleTask';

  const hasGenericSchemeFilter = (mainActivity['intent-filter'] || []).some(filter => {
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
    const hasGenericScheme = data.some(
      item =>
        item?.$?.['android:scheme'] === appScheme &&
        !item?.$?.['android:host']
    );

    return hasViewAction && hasBrowsableCategory && hasDefaultCategory && hasGenericScheme;
  });

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

  const existingIntentFilters = mainActivity['intent-filter'] || [];
  const nonLauncherIntentFilters = existingIntentFilters.filter(
    filter => !isLauncherIntentFilter(filter),
  );

  // Garante intent para Android TV sem empilhar duplicados.
  mainActivity['intent-filter'] = [
    ...nonLauncherIntentFilters,
    ...(!hasGenericSchemeFilter
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
                  'android:scheme': appScheme
                }
              }
            ]
          }
        ]
      : []),
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
    buildLauncherIntentFilter(),
  ];
};

module.exports = function withAndroidTV(config) {
  return withAndroidManifest(config, config => {
    const APP_SCHEME = config.scheme || CALLBACK_SCHEME;
    applyAndroidTVManifest(config.modResults, APP_SCHEME);
    return config;
  });
};

module.exports.__private__ = {
  applyAndroidTVManifest,
  buildLauncherIntentFilter,
  ensureUsesFeature,
  isLauncherIntentFilter,
};
