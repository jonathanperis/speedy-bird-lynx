// The home page plays the real ReactLynx build: `bun run build:site` (from the repository root)
// compiles main.web.bundle and the Lynx web runtime into public/play/. This module reads the
// runtime's hashed file names from the build manifest at build time.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const PLAY_DIR = path.resolve(process.cwd(), 'public/play');
const MANIFEST = path.join(PLAY_DIR, 'manifest.json');

interface RsbuildManifest {
  entries: Record<string, { initial?: { js?: string[]; css?: string[] } }>;
}

if (!existsSync(MANIFEST) || !existsSync(path.join(PLAY_DIR, 'main.web.bundle'))) {
  throw new Error('The Lynx game is missing from docs/public/play. Run `bun run build:site` in the repository root first.');
}

const runtime = (JSON.parse(readFileSync(MANIFEST, 'utf8')) as RsbuildManifest).entries.runtime?.initial;
if (!runtime?.js?.length) throw new Error(`${MANIFEST} has no "runtime" entry`);

/** Paths relative to the play/ directory. */
export const LYNX_RUNTIME = { js: runtime.js, css: runtime.css ?? [] };
