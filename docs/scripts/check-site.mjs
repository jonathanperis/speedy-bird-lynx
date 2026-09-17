import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { ELEMENT_NODE, parse, walkSync } from 'ultrahtml';

const output = path.resolve(process.argv[2] ?? 'out');
const site = new URL('https://jonathanperis.github.io/speedy-bird-lynx/');

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : file.endsWith('.html') ? [file] : [];
  }));
  return nested.flat();
}

const pages = new Map();
const errors = [];
let references = 0;
for (const file of await htmlFiles(output)) {
  const relative = path.relative(output, file).split(path.sep).join('/');
  const url = new URL(relative.replace(/index\.html$/, ''), site);
  const ids = new Set();
  const links = [];
  const canonical = [];
  const ogUrls = [];
  walkSync(parse(await readFile(file, 'utf8')), node => {
    if (node.type !== ELEMENT_NODE) return;
    const attrs = node.attributes;
    if (attrs.id) {
      if (ids.has(attrs.id)) errors.push(`${relative}: duplicate id "${attrs.id}"`);
      ids.add(attrs.id);
    }
    if (node.name === 'link' && attrs.rel === 'canonical') canonical.push(attrs.href);
    if (node.name === 'meta' && attrs.property === 'og:url') ogUrls.push(attrs.content);
    if (node.name === 'a' && attrs.href) links.push(attrs.href);
    if (attrs.src) links.push(attrs.src);
    if (node.name === 'link' && ['stylesheet', 'icon', 'apple-touch-icon'].includes(attrs.rel)) links.push(attrs.href);
  });
  if (canonical.length !== 1 || canonical[0] !== url.href) errors.push(`${relative}: canonical must be ${url.href}`);
  if (ogUrls.length !== 1 || ogUrls[0] !== url.href) errors.push(`${relative}: og:url must be ${url.href}`);
  pages.set(file, { relative, url, ids, links });
}

// Each wiki source needs its individual route (index is the combined manual).
for (const entry of await readdir('wiki')) {
  if (!entry.endsWith('.md')) continue;
  const route = entry === 'index.md' ? 'docs/index.html' : `docs/${entry.slice(0, -3)}/index.html`;
  if (!pages.has(path.join(output, route))) errors.push(`Missing wiki route: ${route}`);
}

for (const page of pages.values()) {
  for (const link of page.links) {
    const target = new URL(link, page.url);
    if (target.origin !== site.origin) continue;
    if (!target.pathname.startsWith(site.pathname)) {
      if (link.startsWith('/')) errors.push(`${page.relative}: local link omits project base: ${link}`);
      continue;
    }
    references++;
    const relative = decodeURIComponent(target.pathname.slice(site.pathname.length));
    let file = path.resolve(output, relative);
    if (!file.startsWith(`${output}${path.sep}`) && file !== output) {
      errors.push(`${page.relative}: target escapes output: ${link}`);
      continue;
    }
    try {
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      await stat(file);
    } catch {
      errors.push(`${page.relative}: missing target ${link}`);
      continue;
    }
    const destination = pages.get(file);
    if (target.hash && destination && !destination.ids.has(decodeURIComponent(target.hash.slice(1)))) {
      errors.push(`${page.relative}: missing fragment ${link}`);
    }
  }
}

assert.ok(pages.size > 0, 'No generated HTML pages found; run npm run build first.');
assert.equal(errors.length, 0, errors.join('\n'));
console.log(`Site check passed: ${pages.size} pages, ${references} internal references, unique IDs and route-specific metadata.`);
