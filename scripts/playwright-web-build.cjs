const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

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

const overrideEnvLocalAppType = appType => {
  const normalizedAppType = String(appType || '').trim().toUpperCase();

  if (!normalizedAppType) {
    return null;
  }

  const originalEnvLocal = fs.readFileSync(envLocalFile, 'utf8');
  const appTypePattern = /APP_TYPE:\s*(?:resolveAppType\(\)|['"][^'"]+['"])/;
  const appTypeMatch = originalEnvLocal.match(appTypePattern);

  if (!appTypeMatch) {
    throw new Error(
      'Unable to override APP_TYPE in ' + envLocalFile + '. The file format may have changed.',
    );
  }

  const currentAppType = String(appTypeMatch[0] || '')
    .replace(/^APP_TYPE:\s*/, '')
    .replace(/^resolveAppType\(\)$/, 'MANAGER')
    .replace(/^['"]|['"]$/g, '')
    .trim()
    .toUpperCase();

  if (currentAppType === normalizedAppType) {
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

const overrideEnvLocalApiEntrypoint = apiEntrypoint => {
  const normalizedApiEntrypoint = String(apiEntrypoint || '').trim().replace(/\/$/, '');

  if (!normalizedApiEntrypoint) return null;

  const originalEnvLocal = fs.readFileSync(envLocalFile, 'utf8');
  const apiEntrypointPattern = /API_ENTRYPOINT:\s*(['"])[^'\"]+\1/;

  if (!apiEntrypointPattern.test(originalEnvLocal)) {
    throw new Error(`Unable to override API_ENTRYPOINT in ${envLocalFile}.`);
  }

  const nextEnvLocal = originalEnvLocal.replace(
    apiEntrypointPattern,
    `API_ENTRYPOINT: '${normalizedApiEntrypoint}'`,
  );

  if (nextEnvLocal === originalEnvLocal) return null;
  fs.writeFileSync(envLocalFile, nextEnvLocal);
  return () => fs.writeFileSync(envLocalFile, originalEnvLocal);
};

const buildWebExport = () => {
  fs.rmSync(outputDir, { recursive: true, force: true });
  ensureEnvLocalFile();

  const restoreEnvLocal = overrideEnvLocalAppType(process.env.PLAYWRIGHT_APP_TYPE);
  const restoreEnvLocalApiEntrypoint = overrideEnvLocalApiEntrypoint(
    process.env.PLAYWRIGHT_API_ENTRYPOINT,
  );

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
    if (restoreEnvLocalApiEntrypoint) restoreEnvLocalApiEntrypoint();
    if (restoreEnvLocal) {
      restoreEnvLocal();
    }
  }
};
buildWebExport();
