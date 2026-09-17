export const SECTION_CATEGORIES = [
  { label: "", ids: ["home"] },
  { label: "Overview", ids: ["about-lynx", "architecture"] },
  { label: "Engine", ids: ["game-engine", "assets-and-sprites"] },
  { label: "Deploy", ids: ["getting-started", "native-host-apps", "ci-cd-pipeline"] },
  { label: "Maintenance", ids: ["dependency-updates"] },
] as const;

export const SECTION_ORDER = SECTION_CATEGORIES.flatMap(({ ids }) => ids);

export const PAGE_META: Record<string, { title: string; description: string }> = {
  home: { title: 'Home', description: 'Speedy Bird overview and guide to the ReactLynx game, Canvas demo, native hosts, and documentation.' },
  'about-lynx': { title: 'About Lynx', description: 'ReactLynx concepts used by Speedy Bird: native rendering, built-in elements, CSS, threads, and native modules.' },
  architecture: { title: 'Architecture', description: 'Speedy Bird component hierarchy, ref-based physics, render snapshots, and the three web surfaces.' },
  'assets-and-sprites': { title: 'Assets and Sprites', description: 'Sprite loading, tile-based pipes, embedded native images, browser audio, asset synchronization, and credits.' },
  'ci-cd-pipeline': { title: 'CI/CD Pipeline', description: 'Build checks, documentation validation, Android artifacts, conditional iOS archives, and immutable GitHub releases.' },
  'game-engine': { title: 'Game Engine', description: 'The 17ms game loop, physics constants, collisions, offscreen-pipe scoring, speed scaling, and medals.' },
  'getting-started': { title: 'Getting Started', description: 'Install dependencies and run the ReactLynx app, Canvas demo, documentation site, and native hosts.' },
  'native-host-apps': { title: 'Native Host Apps', description: 'Build the Kotlin Android host and configure the Swift iOS scaffold, with explicit audio and signing limitations.' },
  'dependency-updates': { title: 'Dependencies and Upgrades', description: 'Verified dependency versions, native toolchain requirements, compatibility holds, and the upgrade verification process.' },
};
