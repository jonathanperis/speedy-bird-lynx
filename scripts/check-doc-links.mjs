import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const output = fileURLToPath(new URL('../docs/out/', import.meta.url));
const site = new URL('https://jonathanperis.github.io/speedy-bird-lynx/');
async function pages(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => {
    const file = path.join(folder, entry.name);
    return entry.isDirectory() ? pages(file) : file.endsWith('.html') ? [file] : [];
  }))).flat();
}
let checked = 0;
for (const file of await pages(output)) {
  const html = await readFile(file, 'utf8');
  const page = new URL(path.relative(output, file), site);
  for (const [, raw] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = new URL(raw.replaceAll('&amp;', '&'), page);
    if (url.origin !== site.origin) continue;
    if (!url.pathname.startsWith(site.pathname) && /^https?:/.test(raw)) continue;
    assert.ok(url.pathname.startsWith(site.pathname), `${page.pathname}: link escapes project base: ${raw}`);
    let target = path.join(output, decodeURIComponent(url.pathname.slice(site.pathname.length)));
    const info = await stat(target).catch(() => null);
    assert.ok(info, `${page.pathname}: missing local target: ${raw}`);
    if (info.isDirectory()) target = path.join(target, 'index.html');
    const content = await readFile(target);
    if (url.hash && target.endsWith('.html')) {
      const id = decodeURIComponent(url.hash.slice(1));
      assert.ok(content.includes(Buffer.from(`id="${id}"`)), `${page.pathname}: missing anchor: ${raw}`);
    }
    checked++;
  }
}
console.log(`Verified ${checked} local documentation links, assets, and anchors.`);
