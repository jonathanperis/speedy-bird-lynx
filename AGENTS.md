# Speedy Bird Lynx — Agent Guide

Harness-neutral operating guide for automated coding agents working in this repository.

Cross-platform Flappy Bird clone built with ReactLynx + TypeScript. Runs natively on iOS, Android, and Web from a single codebase.

**Play online:** https://jonathanperis.github.io/speedy-bird-lynx/

**Docs:** https://jonathanperis.github.io/speedy-bird-lynx/docs/

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| ReactLynx | 0.119.0 | Cross-platform native UI framework |
| React | 18.3.1 | Component model and hooks |
| TypeScript | 6.0.3 | Type-safe source code |
| RSpeedy / Rspack | 0.14.3 | Lynx bundler with HMR |
| Rsbuild | 2.0.0 | Web build target |
| Lynx SDK | 3.7.0 | Native runtime types and Android/iOS hosts |

---

## Build Commands

Use Bun for installs and command examples because the lockfiles and CI use Bun.

```sh
bun install --frozen-lockfile       # Install exact dependencies
bun run dev                         # Dev server with HMR on :3000
bunx tsc --noEmit                   # Type check only
bun run build                       # Production build
```

`bun run build` emits `dist/main.lynx.bundle` for native hosts and `dist/main.web.bundle` for web-preview tooling.

### Android

```sh
bun run build
cp dist/main.lynx.bundle android/app/src/main/assets/
cd android && ./gradlew assembleDebug
cd android && ./gradlew assembleRelease
```

The Android workflow signs release builds only when signing secrets are configured.

### iOS

```sh
bun run build
cp dist/main.lynx.bundle ios/SpeedyBird/Resources/
cd ios && pod install
# Open SpeedyBird.xcworkspace in Xcode when a local Xcode project is present.
```

The iOS workflow currently guards on the presence of an Xcode project and builds unsigned unless signing is configured.

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
- **Audio abstraction**: Web `HTMLAudioElement` implementation plus native module stubs.
- **Controls**: ReactLynx app uses tap/click to flap. The GitHub Pages canvas demo also supports Space.

---

## Project Structure

```text
speedy-bird-lynx/
├── src/
│   ├── index.tsx                    # Entry point
│   ├── App.tsx                      # Root component + tap/click handler
│   ├── types.ts                     # GameState enum, PipeData, SoundName
│   ├── constants.ts                 # Physics, dimensions, colors
│   ├── hooks/useGameEngine.ts       # Core game loop + physics
│   ├── components/                  # Bird, Pipe, Background, Ground, etc.
│   └── audio/audio.ts               # Audio abstraction layer
├── android/                         # Native Android host (Kotlin)
├── ios/                             # Native iOS host (Swift/CocoaPods scaffold)
├── assets/sprites/                  # PNG sprites (bird, pipes, medals, digits)
├── assets/audio/                    # WAV sound effects
├── docs/                            # Astro GitHub Pages site + playable canvas demo
├── web-host/                        # Web preview host tooling
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
| Build Check | `ci.yml` | Manual, push to `main`/`lynx-migration`, PR to `main` | `bunx tsc --noEmit` + `bun run build` |
| CodeQL | `codeql.yml` | Push/PR to `main`, weekly | Security & quality analysis |
| Deploy Web | `deploy.yml` | Push to `main`, manual | Reusable GitHub Pages docs deploy for `docs/` |
| Build Android | `build-android.yml` | Push to `main`, `v*` tags, manual | Build release APK, sign if secrets exist, create release |
| Build iOS | `build-ios.yml` | `v*` tags, manual | Build unsigned archive when Xcode project exists |
| Release | `release.yml` | `v*` tags, manual | Full artifact/release pipeline |

---

## Git & GitHub Conventions

- **Branch + PR workflow**: All changes go through a branch and PR. Never push directly to main.
- **Rebase-only merges**: Linear history is enforced. Do not use merge commits or squash merges.
- **Use `gh` CLI**: Prefer `gh` for repository, PR, issue, release, and checks operations.
- **Repo-wide files**: `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, issue/PR templates, `CODEOWNERS`, and `FUNDING.yml` live in the centralized `.github` repo; do not create duplicates here.
- **Branch protection**: `main` has required linear history enabled and force pushes disabled.
- **Release tags**: Semver `v*` tags trigger the release pipeline.
- **Build tags**: `build/0.0.0-{sha}` tags are created by Android CI on main pushes.

---

## Code Quality Notes

- **TypeScript strict mode**: Enabled; all code must pass `bunx tsc --noEmit`.
- **No test framework yet**: Vitest is a natural fit if tests are added.
- **No linter/formatter yet**: Biome is a good fit if formatting/linting is added.
- **CodeQL**: Runs on every push/PR and weekly for security analysis.
- **Dependabot**: Weekly updates for npm packages and GitHub Actions.
