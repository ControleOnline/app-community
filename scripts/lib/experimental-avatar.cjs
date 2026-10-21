const path = require('node:path');
const fs = require('node:fs');

// Off means the experiment does not have to exist, even at bundle time.
function resolveExperimentalAvatar({projectRoot, env = process.env}) {
  const enabled = env.EXPO_PUBLIC_MANAGER_PREVIEW === '1' && env.EXPO_PUBLIC_SHENLONG_EXPERIMENT === '1';
  if (!enabled) return {enabled: false, watchFolder: null,
    entry: path.join(projectRoot, 'src/components/manager-preview/DisabledAvatar.js')};
  const watchFolder = path.resolve(projectRoot, '../.codex/experiments/shenlong');
  const entry = path.join(watchFolder, 'src/index.js');
  if (!fs.existsSync(entry)) throw new Error('Local avatar experiment missing. Restore it or disable EXPO_PUBLIC_SHENLONG_EXPERIMENT.');
  return {enabled: true, watchFolder, entry};
}
module.exports = {resolveExperimentalAvatar};
