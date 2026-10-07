# Speedy Bird Lynx — Agent Guide

Harness-neutral operating guide for automated coding agents working in this repository.

Cross-platform Flappy Bird clone built with ReactLynx + TypeScript. The checked-in project runs on Android and Web from a single codebase; iOS host source is included, but an Xcode project/workspace must be created locally before building.

**Play online:** https://jonathanperis.github.io/speedy-bird-lynx/

**Docs:** https://jonathanperis.github.io/speedy-bird-lynx/docs/

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| ReactLynx | 0.126.2 | Game component model and hooks |
| React types | 19.3.0 | JSX typings consumed by ReactLynx |
| TypeScript | 6.0.3 app / 7.0.2 docs | Root limited by Rspeedy's supported peer range |
| Rspeedy / ReactLynx plugin | 0.18.0 / 0.20.3 | Coordinated Lynx bundler/compiler |
| Rsbuild | 2.2.12 | Standalone web host |
| Lynx SDK / PrimJS | 4.1.0 / 4.1.1 | Native hosts; TypeScript bindings use `@lynx-js/types` 4.3.0 |
| Biome | 2.5.15 | Lint and format |
| Astro / Tailwind | 7.3.6 / 4.3.3 | Documentation website |
| AGP / Gradle / Kotlin | 9.4.0 / 9.7.1 / 2.4.20 | Android; Java 21, compile SDK 37.2, target 37, min 21 |

---

## Build Commands

Use Bun for root ReactLynx/Rspeedy installs and command examples because the root lockfile and CI use Bun. Use Node.js >=22.12 with npm scripts for the Astro 7 docs site in `docs/`.

```sh
bun install --frozen-lockfile       # Install exact dependencies
bun run dev                         # Dev server with HMR on :3000
bun run check                       # Type check only
bun run lint                        # Biome lint + format check (CI mode)
bun run format                      # Apply Biome fixes and formatting
bun run build                       # Production build
bun run build:web-host              # Compile standalone development web host
```

`bun run build` emits `dist/main.lynx.bundle` for native hosts and `dist/main.web.bundle` for web-preview tooling.

### Android

```sh
bun run build
cd android && ./gradlew assembleDebug
cd android && ./gradlew assembleRelease
cd android && ./gradlew lintDebug
```

Gradle stages the current root bundle into generated APK assets. Use `scripts/verify_android_bundle.py` to compare each APK's bundle with `dist/main.lynx.bundle`. Sprites are embedded in the bundle. The Android workflow signs release builds only when signing secrets are configured.

### iOS

```sh
bun run build
cp dist/main.lynx.bundle ios/SpeedyBird/Resources/
cd ios && bundle install && bundle exec pod install
# Open SpeedyBird.xcworkspace in Xcode when a local Xcode project is present.
```

The iOS workflow guards on a tracked Xcode project and always builds unsigned; it does not consume Apple signing secrets. Ruby tooling is locked in `ios/Gemfile.lock`.

### Documentation checks

Run `npm run build` and `npm run check:site` in `docs/`. The latter verifies all wiki routes, internal links/fragments, unique IDs, and per-route canonical/OG URLs. The active homepage is `docs/src/pages/index.astro`; guide titles/navigation live in `docs/src/lib/docs-sidebar.config.ts`. See `docs/README.md` for authoring and asset maintenance.

---

## Architecture

```text
App (root, fullscreen, tap/click listener)
├── Background (z:0, parallax @ 0.2px/frame, tiled)
├── Pipe[] (z:1, tile-based, scroll @ 2.7px/frame + speed scaling)
├── Bird (z:2, animated sprite with rotation)
├── Ground (z:3, scroll matches pipe speed)
├── ScoreDisplay (z:4, sprite-based digits)
├── GetReadyScreen (z:5, overlay on STATE_READY)
└── GameOverScreen (z:5, overlay on STATE_OVER with medals)
```

ReactLynx runs React work off the main rendering thread. Keep per-frame physics in refs and push only render snapshots through React state.

---

## Key Patterns

- **`useGameEngine` hook**: Core game loop, physics, collision, scoring, and state transitions.
- **`useRef` for mutable state**: Physics engine state should not trigger every-frame React re-renders.
- **`useState` for render snapshots**: Keep render state minimal and explicit.
- **CSS transforms**: Movement uses `transform: translate(...)` rather than layout recalculation.
- **State machine**: `STATE_READY` → `STATE_PLAY` → `STATE_OVER`.
- **AABB collision**: Uses a circular bird hitbox approximation.
- **Audio abstraction**: `HTMLAudioElement` where available; native and web-worker contexts use an unimplemented placeholder. Canvas has separate browser audio.
- **Controls**: ReactLynx app uses tap/click to flap. The GitHub Pages canvas demo also supports Space.

---

## Project Structure

```text
speedy-bird-lynx/
├── src/
│   ├── index.tsx                    # Entry point
│   ├── App.tsx                      # Root component + tap/click handler
│   ├── types.ts                     # State constants/types, PipeData, SoundName
│   ├── constants.ts                 # Physics, dimensions, colors
│   ├── hooks/useGameEngine.ts       # Core game loop + physics
│   ├── components/                  # Bird, Pipe, Background, Ground, etc.
│   └── audio/audio.ts               # Audio adapter and native placeholder
├── android/                         # Native Android host (Kotlin)
├── ios/                             # Native iOS host (Swift/CocoaPods scaffold)
├── assets/sprites/                  # PNG sprites (bird, pipes, medals, digits)
├── assets/audio/                    # WAV sound effects
├── docs/                            # Astro GitHub Pages site + playable canvas demo
├── web-host/                        # Advanced/dev-only standalone <lynx-view> host
├── lynx.config.ts                   # Lynx build config
├── rsbuild.web-host.config.ts       # Web host build config
├── tsconfig.json                    # strict: true, react-jsx
├── AGENTS.md                        # Standardized agent instructions
├── .agents/                         # Standardized agent memory/instrumentation
└── .github/workflows/               # CI/CD workflows
```

---

## Game Constants

| Constant | Value | Purpose |
|---------|-------|---------|
| `BIRD_FLAP` | `7.25` | Upward velocity impulse |
| `BIRD_GRAVITY` | `0.28` | Downward acceleration |
| `PIPE_DX` | `2.7` | Base pipe scroll speed |
| `PIPE_GAP` | `150` | Space between top and bottom pipes |
| `PIPE_SPAWN_INTERVAL` | `77` frames | Pipe spawn cadence |
| `BG_DX` | `0.2` | Parallax background speed |
| Medal thresholds | 10/25/50/100 | Bronze/Silver/Gold/Platinum |

---

## CI/CD

| Workflow | File | Trigger | Actions |
|----------|------|---------|---------|
| Build Check | `ci.yml` | Manual, push to `main`, PR to `main`, weekly | Audits, Biome, type-check, bundles/web-host/docs builds, site validation, Android compilation/lint and APK bundle verification; calls Build Android after `main` pushes pass |
| CodeQL | `codeql.yml` | Push/PR to `main`, weekly, manual | JavaScript/TypeScript, Actions, Python, and Kotlin analysis |
| Deploy Web | `deploy.yml` | Push to `main`, manual | Reusable GitHub Pages docs deploy for `docs/` |
| Build Android | `build-android.yml` | Called by Build Check on `main`, manual from `main` | Read-only APK build; separate job publishes an immutable `build/*` prerelease |
| Build iOS | `build-ios.yml` | Manual | Unsigned archive when the Xcode project exists |
| Release | `release.yml` | `v*` tags on `main`, manual from `main` | Sole versioned-release publisher; upload all assets before immutable publication |

Shared setup lives in `.github/actions/setup-js` (Node.js, the Bun version pinned by `packageManager`, cached frozen install) and `.github/actions/setup-android`. APK and iOS archive builds are reusable workflows (`reusable-android-apk.yml`, `reusable-ios-archive.yml`). Required status checks match job names (`build`, `android`, `docs`, `Analyze (...)`); rename jobs only together with the ruleset.

---

## Git & GitHub Conventions

- **Branch + PR workflow**: All changes go through a branch and PR. Never push directly to main.
- **Rebase-only merges**: Linear history is enforced. Do not use merge commits or squash merges.
- **Use `gh` CLI**: Prefer `gh` for repository, PR, issue, release, and checks operations.
- **Repo-wide files**: `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, issue/PR templates, and `FUNDING.yml` live in the centralized `.github` repo; do not create duplicates here. `CODEOWNERS` is the exception: GitHub only reads it from this repository.
- **Branch protection**: `main` has required linear history enabled and force pushes disabled.
- **Release tags**: Semver `v*` tags trigger the release pipeline.
- **Build tags**: `build/0.0.0-{sha}` tags are created by Android CI on main pushes.

---

## Code Quality Notes

- **TypeScript strict mode**: Enabled; app code must pass `bun run check`. Set `jsxImportSource` to `@lynx-js/react` for Lynx element types.
- **Focused verification**: Generated-site and APK bundle checks exist. Gameplay unit tests and browser UI tests are not configured.
- **Biome**: `bun run lint` must pass; `biome.json` covers app, web host, tests, and scripts.
- **CodeQL**: Runs on every push/PR and weekly for security analysis.
- **Renovate**: `renovate.json` extends the shared preset and encodes the upgrade holds below (grouped Lynx packages, root TypeScript <7, Lynx-pinned pods). GitHub Dependabot security alerts remain enabled.

Dependency upgrades must preserve the coordinated ReactLynx/compiler versions and native pod constraints. See `docs/wiki/dependency-updates.md` for reviewed versions and holds; a newer registry version is not automatically a supported upgrade.
