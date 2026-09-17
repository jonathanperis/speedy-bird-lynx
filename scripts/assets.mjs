import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const mode = process.argv[2];
if (!['docs', 'native', 'check'].includes(mode)) throw new Error('Usage: node scripts/assets.mjs docs|native|check');
async function files(folder) {
  const entries = await readdir(path.join(root, folder), { withFileTypes: true });
  return (await Promise.all(entries.filter(entry => entry.name !== 'unused').map(entry => {
    const name = `${folder}/${entry.name}`;
    return entry.isDirectory() ? files(name) : [name];
  }))).flat().sort();
}
const assets = [...await files('assets/sprites'), ...await files('assets/audio')];
const digest = data => createHash('sha256').update(data).digest('hex');
async function copy(source, destination) {
  await mkdir(path.dirname(path.join(root, destination)), { recursive: true });
  await copyFile(path.join(root, source), path.join(root, destination));
}
if (mode === 'docs') {
  for (const file of assets) await copy(file, `docs/public/${file}`);
  console.log(`Synced ${assets.length} canonical game assets to docs.`);
} else if (mode === 'native') {
  const manifest = {};
  for (const file of assets) manifest[file] = digest(await readFile(path.join(root, file)));
  for (const target of ['android/app/src/main/assets', 'ios/SpeedyBird/Resources']) {
    await copy('dist/main.lynx.bundle', `${target}/main.lynx.bundle`);
    for (const file of assets.filter(file => file.endsWith('.wav'))) await copy(file, `${target}/audio/${path.basename(file)}`);
  }
  for (const file of assets.filter(file => file.endsWith('.wav'))) await copy(file, `dist/audio/${path.basename(file)}`);
  await writeFile(path.join(root, 'dist/assets-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log('Packaged native bundle and named audio resources for Android/iOS.');
} else {
  const bundles = await Promise.all(['main.lynx.bundle', 'main.web.bundle'].map(file => readFile(path.join(root, 'dist', file))));
  for (const folder of ['android/app/src/main/assets', 'ios/SpeedyBird/Resources']) {
    assert.equal(digest(await readFile(path.join(root, folder, 'main.lynx.bundle'))), digest(bundles[0]), `Stale native bundle: ${folder}`);
  }
  for (const file of assets) {
    const canonical = await readFile(path.join(root, file));
    assert.equal(digest(await readFile(path.join(root, 'docs/public', file))), digest(canonical), `Docs asset drift: ${file}`);
    if (file.endsWith('.png')) {
      for (const bundle of bundles) assert.ok(bundle.includes(Buffer.from(canonical.toString('base64'))), `Sprite is not embedded: ${file}`);
    } else {
      for (const folder of ['dist', 'android/app/src/main/assets', 'ios/SpeedyBird/Resources']) {
        assert.equal(digest(await readFile(path.join(root, folder, 'audio', path.basename(file)))), digest(canonical), `Audio missing/drifted: ${folder}/${file}`);
      }
    }
  }
  console.log(`Verified ${assets.length} assets: embedded sprites, native sounds, and docs parity.`);
}
