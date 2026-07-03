const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.resolve(
  projectRoot,
  process.env.PLAYWRIGHT_WEB_OUTPUT_DIR || '.playwright-web',
);
const envLocalFile = path.join(projectRoot, 'config/env.local.js');
const envLocalSampleFile = path.join(projectRoot, 'config/env.local.sample.js');

const ensureEnvLocalFile = () => {
  if (fs.existsSync(envLocalFile)) {
    return;
  }

  if (!fs.existsSync(envLocalSampleFile)) {
    throw new Error(
      'config/env.local.js is missing and config/env.local.sample.js was not found.',
    );
  }

  fs.copyFileSync(envLocalSampleFile, envLocalFile);
};

const overrideEnvLocalAppType = appType => {
  const normalizedAppType = String(appType || '').trim().toUpperCase();

  if (!normalizedAppType) {
    return null;
  }

  const originalEnvLocal = fs.readFileSync(envLocalFile, 'utf8');
  const appTypePattern = /APP_TYPE:\s*['"]([^'"]+)['"]/;
  const appTypeMatch = originalEnvLocal.match(appTypePattern);

  if (!appTypeMatch) {
    throw new Error(
      'Unable to override APP_TYPE in ' + envLocalFile + '. The file format may have changed.',
    );
  }

  if (appTypeMatch[1].trim().toUpperCase() === normalizedAppType) {
    return null;
  }

  const nextEnvLocal = originalEnvLocal.replace(
    appTypePattern,
    `APP_TYPE: '${normalizedAppType}'`,
  );

  fs.writeFileSync(envLocalFile, nextEnvLocal);

  return () => {
    fs.writeFileSync(envLocalFile, originalEnvLocal);
  };
};

const buildWebExport = () => {
  fs.rmSync(outputDir, { recursive: true, force: true });
  ensureEnvLocalFile();

  const restoreEnvLocal = overrideEnvLocalAppType(process.env.PLAYWRIGHT_APP_TYPE);

  try {
    const command = 'npx';

    const result = spawnSync(
      command,
      ['expo', 'export', '--platform', 'web', '--output-dir', outputDir],
      {
        cwd: projectRoot,
        env: {
          ...process.env,
          EXPO_NO_TELEMETRY: '1',
        },
        stdio: 'inherit',
        shell: process.platform === 'win32',
      },
    );

    if (result.status !== 0) {
      throw new Error(
        'Expo web export failed with exit code ' + (result.status || 1) + '.',
      );
    }
  } finally {
    if (restoreEnvLocal) {
      restoreEnvLocal();
    }
  }
};
buildWebExport();
