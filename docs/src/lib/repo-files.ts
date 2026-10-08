// Read files from the repository root at build time (the docs package lives in docs/).
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

// Astro bundles this module before running it, so import.meta.url does not point at the
// source tree. The docs scripts always run from docs/, whose parent is the repository root.
const ROOT = path.resolve(process.cwd(), '..');
if (!existsSync(path.join(ROOT, 'src/game/engine.ts'))) {
  throw new Error(`Run the docs build from docs/ (repository root not found at ${ROOT})`);
}

export const repoPath = (file: string) => path.join(ROOT, file);
export const repoFileExists = (file: string) => existsSync(repoPath(file));

export function readRepoFile(file: string): string {
  return readFileSync(repoPath(file), 'utf8');
}

export const REPOSITORY_URL = 'https://github.com/jonathanperis/speedy-bird-lynx';
export const sourceUrl = (path: string, line?: number) =>
  `${REPOSITORY_URL}/blob/main/${path}${line ? `#L${line}` : ''}`;

export interface Excerpt {
  path: string;
  code: string;
  startLine: number;
  url: string;
}

/**
 * Return the code between `// #region <name>` and `// #endregion <name>` in a repository file,
 * dedented. The build fails if the markers are missing, so the excerpt cannot go stale silently.
 */
export function excerpt(path: string, name: string): Excerpt {
  const lines = readRepoFile(path).split('\n');
  const start = lines.findIndex((line) => line.trim() === `// #region ${name}`);
  const end = lines.findIndex((line, index) => index > start && line.trim() === `// #endregion ${name}`);
  if (start < 0 || end < 0) throw new Error(`Missing "// #region ${name}" markers in ${path}`);
  const body = lines.slice(start + 1, end);
  const indent = Math.min(...body.filter((line) => line.trim()).map((line) => line.match(/^ */)?.[0].length ?? 0));
  return {
    path,
    code: body.map((line) => line.slice(indent)).join('\n'),
    startLine: start + 2,
    url: sourceUrl(path, start + 2),
  };
}
