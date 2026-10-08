export const SECTION_CATEGORIES = [
  { label: "", ids: ["home"] },
  { label: "Overview", ids: ["about-lynx", "architecture"] },
  { label: "Engine", ids: ["game-engine", "assets-and-sprites"] },
  { label: "Deploy", ids: ["getting-started", "native-host-apps", "ci-cd-pipeline"] },
  { label: "Maintenance", ids: ["dependency-updates"] },
] as const;

export const SECTION_ORDER = SECTION_CATEGORIES.flatMap(({ ids }) => ids);

export const PAGE_META: Record<string, { title: string; description: string }> = {
  home: { title: 'Start here', description: 'How Speedy Bird is built: a ReactLynx game for Android, iOS, and the Web, its engine, its hosts, and its release pipeline.' },
  'about-lynx': { title: 'About Lynx', description: 'ReactLynx concepts used by Speedy Bird: native rendering, built-in elements, CSS, threads, and native modules.' },
  architecture: { title: 'Architecture', description: 'Speedy Bird component hierarchy, ref-based physics, render snapshots, and the three web surfaces.' },
  'assets-and-sprites': { title: 'Assets and Sprites', description: 'Sprite loading, tile-based pipes, embedded native images, browser audio, asset synchronization, and credits.' },
  'ci-cd-pipeline': { title: 'CI/CD Pipeline', description: 'Build checks, documentation validation, Android artifacts, conditional iOS archives, and immutable GitHub releases.' },
  'game-engine': { title: 'Game Engine', description: 'The pure rules engine, main-thread frame loop, physics, collisions, scoring, restart lock, and host bridge.' },
  'getting-started': { title: 'Getting Started', description: 'Install dependencies and run the ReactLynx app, Canvas demo, documentation site, and native hosts.' },
  'native-host-apps': { title: 'Native Host Apps', description: 'Build and test the Kotlin Android and Swift iOS hosts: native bridge, lifecycle, UI tests, and signing.' },
  'dependency-updates': { title: 'Dependencies and Upgrades', description: 'Verified dependency versions, native toolchain requirements, compatibility holds, and the upgrade verification process.' },
};

/** Repository files each guide documents, linked from its page header. */
export const PAGE_SOURCES: Record<string, string[]> = {
  home: ['README.md'],
  'about-lynx': ['lynx.config.ts', 'src/hooks/useGame.ts', 'src/platform/host.ts'],
  architecture: ['src/App.tsx', 'src/hooks/useGame.ts', 'src/game/engine.ts'],
  'game-engine': ['src/game/engine.ts', 'src/constants.ts', 'src/hooks/useGame.ts'],
  'assets-and-sprites': ['assets/', 'src/components/PipeSlot.tsx', 'scripts/sync-assets.mjs'],
  'getting-started': ['package.json', 'docs/package.json'],
  'native-host-apps': [
    'android/app/src/main/kotlin/com/jonathanperis/speedybird/MainActivity.kt',
    'ios/SpeedyBird/ViewController.swift',
    'scripts/generate-ios-project.rb',
  ],
  'ci-cd-pipeline': ['.github/workflows/ci.yml', '.github/workflows/release.yml'],
  'dependency-updates': ['package.json', 'android/gradle/libs.versions.toml', 'ios/Podfile', 'renovate.json'],
};

/** Article numbers: categories are 1, 2, ...; guides inside them 1.1, 1.2, ... Home has none. */
export const ARTICLE_NUMBERS: Record<string, string> = Object.fromEntries(
  SECTION_CATEGORIES.filter((category) => category.label).flatMap((category, chapter) =>
    category.ids.map((id, index) => [id, `${chapter + 1}.${index + 1}`]),
  ),
);
