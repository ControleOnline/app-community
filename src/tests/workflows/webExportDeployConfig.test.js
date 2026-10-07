const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');

describe('web deploy environment config', () => {
  it('copies MANAGER_APP from the shared sample into generated env.local.js', () => {
    const action = fs.readFileSync(
      path.join(ROOT, '.github/actions/web-export-deploy/action.yml'),
      'utf8',
    );

    expect(action).toMatch(/env\.MANAGER_APP\s*\?\?\s*''/);
    expect(action).toMatch(/MANAGER_APP_LINE="MANAGER_APP: '\$\{MANAGER_APP\}',"/);
    expect(action).toMatch(/\$\{MANAGER_APP_LINE\}/);
  });

  it('installs native and webOS dependencies without requiring or creating a lockfile', () => {
    for (const actionName of ['android-build', 'lg-webos-build']) {
      const action = fs.readFileSync(
        path.join(ROOT, `.github/actions/${actionName}/action.yml`),
        'utf8',
      );
      expect(action).not.toMatch(/\bnpm ci\b/);
      expect(action).toMatch(/npm install[^\n]*--no-package-lock/);
    }
  });
});
