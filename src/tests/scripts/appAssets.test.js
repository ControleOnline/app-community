const {
  resolveAssetsFolder,
  updateAssetPath,
} = require('../../../scripts/app-assets.cjs');

describe('app assets resolution', () => {
  test('resolves root Expo assets to APP_TYPE folders when the file exists', () => {
    expect(updateAssetPath('./src/assets/logo.png', 'crm')).toBe(
      './src/assets/crm/logo.png',
    );
    expect(updateAssetPath('./src/assets/splash.png', 'pos')).toBe(
      './src/assets/pos/splash.png',
    );
  });

  test('replaces an existing app folder with the current assets variant', () => {
    expect(updateAssetPath('./src/assets/manager/logo.png', 'ppc')).toBe(
      './src/assets/ppc/logo.png',
    );
  });

  test('preserves the current asset when a variant file does not exist', () => {
    expect(updateAssetPath('./src/assets/logo.png', 'mkt')).toBe(
      './src/assets/logo.png',
    );
  });

  test('maps ADMIN to manager unless ASSETS_VARIANT overrides it', () => {
    expect(resolveAssetsFolder('ADMIN')).toBe('manager');
    expect(resolveAssetsFolder('ADMIN', 'shop_lavego')).toBe('shop_lavego');
  });
});
