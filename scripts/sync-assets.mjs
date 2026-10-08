#!/usr/bin/env node
// Keep docs/public/assets an exact copy of the canonical sprites in assets/. The site plays
// sounds from the Lynx build (`bun run build:site` copies assets/audio to docs/public/play/).
// Usage: node scripts/sync-assets.mjs [--check]
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'assets');
const target = path.join(root, 'docs/public/assets');
const check = process.argv.includes('--check');
const SHIPPED = /\.png$/;

async function list(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = await Promise.all(
    entries
      .filter((entry) => entry.name !== 'unused' && !entry.name.startsWith('.'))
      .map((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return list(full, base);
        return SHIPPED.test(entry.name) ? [path.relative(base, full)] : [];
      }),
  );
  return files.flat().sort();
}

const digest = async (file) =>
  createHash('sha256')
    .update(await readFile(file))
    .digest('hex');

const wanted = await list(source);
const present = await list(target);
const problems = [];
for (const file of wanted) {
  const to = path.join(target, file);
  const same = present.includes(file) && (await digest(path.join(source, file))) === (await digest(to));
  if (same) continue;
  if (check) problems.push(`out of date: docs/public/assets/${file}`);
  else {
    await mkdir(path.dirname(to), { recursive: true });
    await copyFile(path.join(source, file), to);
  }
}
for (const file of present.filter((file) => !wanted.includes(file))) {
  if (check) problems.push(`not in assets/: docs/public/assets/${file}`);
  else await rm(path.join(target, file));
}

if (problems.length) {
  console.error(`${problems.join('\n')}\nRun: node scripts/sync-assets.mjs`);
  process.exit(1);
}
console.log(check ? `Docs assets match assets/ (${wanted.length} files).` : `Synced ${wanted.length} assets to docs.`);
