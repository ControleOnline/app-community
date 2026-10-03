const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const {browserEnvSource} = require('./browser-env.cjs');

const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.resolve(
  projectRoot,
  process.env.PLAYWRIGHT_WEB_OUTPUT_DIR || '.playwright-web',
);
const envLocalFile = path.join(projectRoot, 'config/env.local.js');
const envLocalSampleFiles = [
  path.join(projectRoot, 'config/env.local.sample.js'),
  path.join(projectRoot, 'config/env.local.sample'),
];

const ensureEnvLocalFile = () => {
  if (fs.existsSync(envLocalFile)) {
    return;
  }

  const envLocalSampleFile = envLocalSampleFiles.find(sampleFile =>
    fs.existsSync(sampleFile),
  );

  if (!envLocalSampleFile) {
    throw new Error(
      'config/env.local.js is missing and no env.local sample file was found.',
    );
  }

  fs.copyFileSync(envLocalSampleFile, envLocalFile);
};

const overrideBrowserEnvLocal = appType => {
  const originalEnvLocal = fs.readFileSync(envLocalFile, 'utf8');
  const browserApi = require(envLocalFile).env.API_PLAYWRIGHT;
  const nextEnvLocal = browserEnvSource(originalEnvLocal, String(appType || 'MANAGER').trim().toUpperCase(), browserApi);
  fs.writeFileSync(envLocalFile, nextEnvLocal);
  return () => fs.writeFileSync(envLocalFile, originalEnvLocal);
};

const buildWebExport = () => {
  fs.rmSync(outputDir, { recursive: true, force: true });
  ensureEnvLocalFile();

  const restoreEnvLocal = overrideBrowserEnvLocal(process.env.PLAYWRIGHT_APP_TYPE);

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
