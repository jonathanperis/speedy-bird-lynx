# speedy-bird-lynx

> A Flappy Bird-inspired arcade game and cross-platform learning sandbox: one deterministic TypeScript simulation, ReactLynx and Canvas renderers, native bridges, and verifiable build artifacts.

[![Build Check](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/ci.yml/badge.svg)](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/ci.yml)
[![CodeQL](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/codeql.yml/badge.svg)](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[Play](https://jonathanperis.github.io/speedy-bird-lynx/)** · **[Manual](https://jonathanperis.github.io/speedy-bird-lynx/docs/)** · **[Learning labs](https://jonathanperis.github.io/speedy-bird-lynx/docs/learning-labs/)**

## Learn by changing something observable

Fly through pipes; each pipe that leaves the screen adds a point and increases world speed by 1%. Bronze/silver/gold/platinum medals unlock at 10/25/50/100 points.

Open the learning controls to pause, single-step, replay a run, enable hitboxes, inspect velocity/tick timing, or try a slower, wider-gap practice mode. The Canvas cabinet also accepts a random seed. Best score and preferences persist locally through the host adapter.

This project explores rendering, simulation, native interoperability, assets, accessibility, and delivery. The engine stays small enough to read; experiments have explicit boundaries and verification commands.

## Toolchain

| Component | Version |
|---|---|
| ReactLynx | **0.126.1** |
| ReactLynx build plugin / Rspeedy | **0.20.2 / 0.17.2** |
| Lynx for Web / web elements | **0.26.1 / 0.12.11** |
| Native Lynx SDK / PrimJS | **4.1.0 / 4.1.1** |
| Bundle engineVersion | **3.9**, current compiler's supported maximum |
| TypeScript | **6.0.3**, within Rspeedy's supported range |
| Astro | **7.3.3** |
| Bun | **1.3.12** |
| Node | `.node-version` (26.0.0); tools require >=22.12 |

See [ReactLynx upgrade notes](docs/wiki/reactlynx-upgrade.md) for breaking changes and applicability decisions. Framework, native engine, and bundle-format versions are separate contracts.

## Quick start

```sh
bun install --frozen-lockfile
bun run check
bun run test
bun run build
bun run assets:check
```

### Choose a game surface

| Surface | Command | Purpose |
|---|---|---|
| Native bundle / built-in Lynx preview | `bun run dev` | HMR server on :3000; Explorer must support engine >=3.9 |
| Complete standalone Lynx web host | `bun run build`, then `bun run dev:web` | :4000, including worker-to-browser sound/storage bridge and keyboard controls |
| Public Canvas cabinet and manual | Commands below | Astro site with learning panel, same simulation, 400×600 world |

```sh
# From docs/
bun install --frozen-lockfile
npm run dev
npm run check
npm run build
npm run preview
```

Use Node to execute Astro. The production site lives under `/speedy-bird-lynx/` and builds to `docs/out/`.

The native/Lynx world is 400×750 and scales to fit its host. For a strict renderer comparison, use identical world configurations. Explorer's generic host does not provide this app's audio/storage module; the UI reports that capability gap. The standalone host can load another bundle using `?bundle=http://localhost:3000/main.web.bundle`.

## Native hosts

### Android — Java 17+, Android SDK 34

```sh
bun run build
# From android/
./gradlew lintDebug assembleDebug
# From the repository root
python3 scripts/verify-apk.py android/app/build/outputs/apk/debug/app-debug.apk
```

Debug APKs are signed and installable. Release signing uses `KEYSTORE_FILE`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, and `KEY_PASSWORD`; release publishing distinguishes those builds from sandbox debug signing. SDK-generated debug keys may differ between CI runs.

### iOS — iOS 15+, Xcode, Ruby 3.3+, Bundler

```sh
bun run build
# From ios/
bundle install
bundle exec ruby ../scripts/generate-ios-project.rb
bundle exec pod install --deployment
open SpeedyBird.xcworkspace
```

The host project and shared scheme are generated from checked-in Ruby configuration; `Gemfile.lock` and `Podfile.lock` pin dependencies. Audio resources and the game bundle are packaged by the root build. An unsigned archive is useful for inspection and subsequent signing, but is not an installable IPA.

## Architecture

```text
src/game/             framework-independent physics, geometry, clock, replay, preferences
src/hooks/            ReactLynx scheduling and native lifecycle integration
src/components/       native-element sprite renderer and learning controls
src/platform/         browser audio/storage and required image loading
docs/src/game/        Canvas renderer + accessible browser controller
web-host/             Lynx web runtime and worker/host native-module bridge
android/ and ios/     host initialization, sound, storage, lifecycle
scripts/              deterministic packaging, artifact checks, iOS project generation
tests/                behavior and delivery-contract tests
```

Sprites are embedded in both bundles. Native WAVs are packaged by deterministic name. `assets/` is canonical; `bun run assets:sync` copies game resources into the public site, and `assets:check` verifies parity and bundle inclusion. See [asset notes](docs/wiki/assets-and-sprites.md) for extraction/provenance.

## Verification and delivery

- **Build Check:** frozen installs, core type checks/tests, native/web bundle build, asset checks, standalone web-host build, docs type check/build.
- **Android:** PR/API compatibility lint, reusable builds, debug or explicitly configured release signing, APK signature/resource validation.
- **iOS:** reproducible project generation and a real unsigned archive build; missing artifacts fail the workflow.
- **Release:** the sole publisher, after checks and both native builds succeed. Manual snapshots are prereleases. Archives include the complete resource payload.
- **Pages:** pinned-toolchain static deployment after game tests and docs checks. **CodeQL:** JavaScript/TypeScript analysis.

Build success is distinct from device playtesting and performance measurement. [Learning labs](docs/wiki/learning-labs.md) explain replay-based profiling and platform checks.

## License and credits

Application source: [MIT](LICENSE). Sprites/audio originate from third-party Flappy Bird resource collections; see [asset provenance](docs/wiki/assets-and-sprites.md). Historical migration specifications are retained under `.specs/` with archive notices; the maintained behavior contract is code, tests, and the manual.
