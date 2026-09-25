import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
const sourceRoot = path.resolve(root, manifest.moduleResolution.source);
const packageNames = Object.keys({ ...manifest.dependencies, ...manifest.devDependencies })
  .filter((name) => /^@controleonline\/ui-[a-z0-9-]+$/i.test(name));

await fs.mkdir(sourceRoot, { recursive: true });

for (const packageName of packageNames) {
  const repository = packageName.slice('@controleonline/'.length);
  const destination = path.join(sourceRoot, repository);
  try {
    await fs.access(path.join(destination, '.git'));
    console.log(`present ${repository}`);
    continue;
  } catch {
    // A missing checkout is cloned below.
  }

  try {
    const entries = await fs.readdir(destination);
    if (entries.length > 0) {
      throw new Error(`Refusing to replace non-Git source directory: ${destination}`);
    }
    await fs.rmdir(destination);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  await execFileAsync('git', [
    'clone', '--depth=1',
    `https://github.com/ControleOnline/${repository}.git`,
    destination,
  ], { cwd: root, stdio: 'inherit' });
  console.log(`cloned ${repository}`);
}
