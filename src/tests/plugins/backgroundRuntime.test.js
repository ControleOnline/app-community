const {describe, expect, it} = global;

const withBackgroundRuntime = require('../../../withBackgroundRuntime');

const {
  ensureBootReceiver,
  ensurePermission,
} = withBackgroundRuntime.__private__;

describe('withBackgroundRuntime helpers', () => {
  it('adds the boot receiver once with boot and package replacement hooks', () => {
    const application = {};

    ensureBootReceiver(application);
    ensureBootReceiver(application);

    expect(application.receiver).toHaveLength(1);
    expect(application.receiver[0].$['android:name']).toBe(
      '.background.BackgroundRuntimeBootReceiver',
    );
    expect(application.receiver[0].$['android:enabled']).toBe('true');
    expect(application.receiver[0].$['android:exported']).toBe('true');
    expect(application.receiver[0]['intent-filter'][0].action).toEqual([
      {
        $: {'android:name': 'android.intent.action.BOOT_COMPLETED'},
      },
      {
        $: {'android:name': 'android.intent.action.MY_PACKAGE_REPLACED'},
      },
    ]);
  });

  it('adds the boot permission once', () => {
    const manifest = {manifest: {}};

    ensurePermission(manifest, 'android.permission.RECEIVE_BOOT_COMPLETED');
    ensurePermission(manifest, 'android.permission.RECEIVE_BOOT_COMPLETED');

    expect(manifest.manifest['uses-permission']).toHaveLength(1);
    expect(manifest.manifest['uses-permission'][0].$['android:name']).toBe(
      'android.permission.RECEIVE_BOOT_COMPLETED',
    );
  });
});
