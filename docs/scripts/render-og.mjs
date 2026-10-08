// Render public/og-image.png (1200x630) from scripts/og-template.html with the real sprites and
// the self-hosted fonts. Needs Google Chrome installed. Usage: node scripts/render-og.mjs
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const template = new URL('./og-template.html', import.meta.url);
const output = fileURLToPath(new URL('../public/og-image.png', import.meta.url));

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(template.href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: output });
await browser.close();
console.log(`Wrote ${output}`);
