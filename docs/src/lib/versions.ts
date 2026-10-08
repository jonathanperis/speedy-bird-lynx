// Toolchain versions for the colophon, read from the manifests at build time.
import { readRepoFile } from './repo-files';

const pkg = JSON.parse(readRepoFile('package.json')) as {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const npm = (name: string) => {
  const range = deps[name];
  if (!range) throw new Error(`package.json has no ${name}`);
  return range.replace(/^[~^]/, '');
};

const catalog = readRepoFile('android/gradle/libs.versions.toml');
const gradle = (key: string) => {
  const match = new RegExp(`^${key}\\s*=\\s*"([^"]+)"`, 'm').exec(catalog);
  if (!match) throw new Error(`libs.versions.toml has no ${key}`);
  return match[1];
};

const podLock = readRepoFile('ios/Podfile.lock');
const pod = (name: string) => {
  const match = new RegExp(`^  - ${name} \\(([^)]+)\\)`, 'm').exec(podLock);
  if (!match) throw new Error(`Podfile.lock has no ${name}`);
  return match[1];
};

export const VERSIONS = [
  { name: 'ReactLynx', version: npm('@lynx-js/react'), source: 'package.json' },
  { name: 'Rspeedy', version: npm('@lynx-js/rspeedy'), source: 'package.json' },
  { name: 'TypeScript', version: npm('typescript'), source: 'package.json' },
  { name: 'Lynx SDK (Android)', version: gradle('lynx'), source: 'libs.versions.toml' },
  { name: 'Lynx SDK (iOS)', version: pod('Lynx'), source: 'Podfile.lock' },
  { name: 'PrimJS', version: gradle('primjs'), source: 'libs.versions.toml' },
] as const;
