// Offline checks for the generated site. Usage: node scripts/check-site.mjs [outDir]
// Paths default to this package (not the working directory): docs/out and docs/wiki.
import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ELEMENT_NODE, parse, TEXT_NODE, walkSync } from 'ultrahtml';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const output = path.resolve(process.argv[2] ?? path.join(packageRoot, 'out'));
const wikiDir = path.join(packageRoot, 'wiki');
const site = new URL('https://jonathanperis.github.io/speedy-bird-lynx/');

async function filesIn(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) return filesIn(file, extension);
      return file.endsWith(extension) ? [file] : [];
    }),
  );
  return nested.flat();
}

const exists = async (file) => {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
};

const textOf = (node) => {
  let text = '';
  walkSync(node, (child) => {
    if (child.type === TEXT_NODE) text += child.value;
  });
  return text;
};

// Decode character references so an encoded "javascript:" cannot slip past the check.
const decodeEntities = (value) =>
  value
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);?/g, (_, decimal) => String.fromCodePoint(Number(decimal)))
    .replace(/&colon;/gi, ':')
    .replace(/&(tab|newline);/gi, '');
const isScriptUrl = (value) => /^(javascript|vbscript):/i.test(decodeEntities(value).replace(/[\u0000-\u0020]/g, ''));
const URL_ATTRIBUTES = ['href', 'src', 'action', 'formaction', 'poster', 'data', 'xlink:href'];

const pages = new Map();
const errors = [];
let references = 0;
let assets = 0;
let jsonLdBlocks = 0;

for (const file of await filesIn(output, '.html')) {
  const relative = path.relative(output, file).split(path.sep).join('/');
  const url = new URL(relative.replace(/index\.html$/, ''), site);
  const ids = new Set();
  const links = [];
  const assetRefs = [];
  const canonical = [];
  const ogUrls = [];
  const tree = parse(await readFile(file, 'utf8'));

  walkSync(tree, (node) => {
    if (node.type !== ELEMENT_NODE) return;
    const attrs = node.attributes;
    if (attrs.id) {
      if (ids.has(attrs.id)) errors.push(`${relative}: duplicate id "${attrs.id}"`);
      ids.add(attrs.id);
    }

    // No inline event handlers or script URLs anywhere on the site.
    for (const [name, value] of Object.entries(attrs)) {
      if (/^on[a-z]+$/i.test(name)) errors.push(`${relative}: inline event handler ${name} on <${node.name}>`);
      if (URL_ATTRIBUTES.includes(name.toLowerCase()) && typeof value === 'string' && isScriptUrl(value)) {
        errors.push(`${relative}: script URL in ${name} on <${node.name}>`);
      }
    }

    if (node.name === 'link' && attrs.rel === 'canonical') canonical.push(attrs.href);
    if (node.name === 'meta' && attrs.property === 'og:url') ogUrls.push(attrs.content);
    if (node.name === 'a' && attrs.href) links.push(attrs.href);

    // Assets the page loads: they must exist in the build output.
    if (attrs.src) assetRefs.push(attrs.src);
    if (attrs.srcset) for (const candidate of attrs.srcset.split(',')) assetRefs.push(candidate.trim().split(/\s+/)[0]);
    if (node.name === 'link' && attrs.href && attrs.rel !== 'canonical') assetRefs.push(attrs.href);
    if (node.name === 'meta' && /^(og:image(:secure_url)?|twitter:image)$/.test(attrs.property ?? attrs.name ?? '')) {
      assetRefs.push(attrs.content);
    }
    if (attrs['data-assets']) assetRefs.push(attrs['data-assets']);

    if (node.name === 'script' && attrs.type === 'application/ld+json') {
      jsonLdBlocks++;
      try {
        const data = JSON.parse(textOf(node));
        if (!data['@context']) errors.push(`${relative}: JSON-LD block without @context`);
      } catch (error) {
        errors.push(`${relative}: JSON-LD does not parse: ${error.message}`);
      }
    }

    // Guide content is Markdown: it must never carry scripts or embedded frames.
    if (node.name === 'section' && /\bdoc-section\b/.test(attrs.class ?? '')) {
      walkSync(node, (child) => {
        if (child.type === ELEMENT_NODE && ['script', 'iframe', 'object', 'embed'].includes(child.name)) {
          errors.push(`${relative}: <${child.name}> inside guide section #${attrs.id}`);
        }
      });
    }
  });

  if (canonical.length !== 1 || canonical[0] !== url.href) errors.push(`${relative}: canonical must be ${url.href}`);
  if (ogUrls.length !== 1 || ogUrls[0] !== url.href) errors.push(`${relative}: og:url must be ${url.href}`);
  pages.set(file, { relative, url, ids, links, assetRefs });
}

/** Map a same-site URL to its file in the output, or report why it cannot be checked. */
function localFile(page, reference) {
  const target = new URL(reference, page.url);
  if (target.origin !== site.origin) return { skip: true };
  if (!target.pathname.startsWith(site.pathname)) {
    if (reference.startsWith('/')) errors.push(`${page.relative}: local URL omits project base: ${reference}`);
    return { skip: true };
  }
  const relative = decodeURIComponent(target.pathname.slice(site.pathname.length));
  const file = path.resolve(output, relative);
  if (!file.startsWith(`${output}${path.sep}`) && file !== output) {
    errors.push(`${page.relative}: target escapes output: ${reference}`);
    return { skip: true };
  }
  return { file, target };
}

// Each wiki source needs its individual route (index is the combined manual), and wiki
// Markdown must not embed scripts, event handlers, or script URLs.
for (const entry of await readdir(wikiDir)) {
  if (!entry.endsWith('.md')) continue;
  const route = entry === 'index.md' ? 'docs/index.html' : `docs/${entry.slice(0, -3)}/index.html`;
  if (!pages.has(path.join(output, route))) errors.push(`Missing wiki route: ${route}`);

  const source = await readFile(path.join(wikiDir, entry), 'utf8');
  // Ignore fenced and inline code, where these strings are documentation, not markup.
  const prose = source.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, '').replace(/`[^`\n]*`/g, '');
  if (/<\s*script\b/i.test(prose)) errors.push(`wiki/${entry}: contains a <script> tag`);
  if (/<[a-z][^>]*\son[a-z]+\s*=/i.test(prose)) errors.push(`wiki/${entry}: contains an inline event handler`);
  if (/(\]\(|=\s*["']?)\s*javascript:/i.test(prose)) errors.push(`wiki/${entry}: contains a javascript: URL`);
}

for (const page of pages.values()) {
  for (const link of page.links) {
    const resolved = localFile(page, link);
    if (resolved.skip) continue;
    references++;
    let { file } = resolved;
    try {
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      await stat(file);
    } catch {
      errors.push(`${page.relative}: missing target ${link}`);
      continue;
    }
    const destination = pages.get(file);
    const hash = resolved.target.hash;
    if (hash && destination && !destination.ids.has(decodeURIComponent(hash.slice(1)))) {
      errors.push(`${page.relative}: missing fragment ${link}`);
    }
  }

  for (const reference of page.assetRefs) {
    const resolved = localFile(page, reference);
    if (resolved.skip) continue;
    assets++;
    if (!(await exists(resolved.file))) errors.push(`${page.relative}: missing asset ${reference}`);
  }
}

// Files referenced from bundled CSS (fonts) and the game's sprite and sound lists.
for (const file of [...(await filesIn(output, '.css')), ...(await filesIn(output, '.js'))]) {
  const relative = path.relative(output, file).split(path.sep).join('/');
  const content = await readFile(file, 'utf8');
  const fileUrl = new URL(relative, site);
  const references = file.endsWith('.css')
    ? [...content.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)].map((match) => match[2]).filter((u) => !u.startsWith('data:'))
    : [...content.matchAll(/["'`]((?:sprites|audio)\/[\w./-]+\.(?:png|wav))["'`]/g)].map((match) => `assets/${match[1]}`);
  for (const reference of references) {
    const target = file.endsWith('.css') ? new URL(reference, fileUrl) : new URL(reference, site);
    if (target.origin !== site.origin) continue;
    assets++;
    const local = path.resolve(output, decodeURIComponent(target.pathname.slice(site.pathname.length)));
    if (!(await exists(local))) errors.push(`${relative}: missing asset ${reference}`);
  }
}

assert.ok(pages.size > 0, 'No generated HTML pages found; run npm run build first.');
assert.equal(errors.length, 0, errors.join('\n'));
console.log(
  `Site check passed: ${pages.size} pages, ${references} internal links, ${assets} asset references, ` +
    `${jsonLdBlocks} JSON-LD blocks, unique IDs, route-specific metadata, and no inline scripts in guide content.`,
);
