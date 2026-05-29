# CI/CD Pipeline

All automation runs on GitHub Actions. Workflows are in `.github/workflows/`.

## Workflow Overview

| Workflow | File | Trigger | Description |
|----------|------|---------|-------------|
| Build Check | `ci.yml` | Manual, push to `main`/`lynx-migration`, PR to `main` | Type-check and build Lynx bundles; no unit-test framework is configured yet |
| CodeQL | `codeql.yml` | Push/PR to `main`, weekly | Security and quality analysis |
| Deploy Web | `deploy.yml` | Push to `main`, manual | Build and deploy the Astro `docs/` site to GitHub Pages via the shared Pages workflow |
| Build Android | `build-android.yml` | Push to `main`, `v*` tags, manual | Build release APK, sign when secrets are configured, create GitHub Release |
| Build iOS | `build-ios.yml` | `v*` tags, manual | Build iOS archive (unsigned) |
| Release | `release.yml` | `v*` tags, manual | Full release pipeline with all artifacts |

## Build Check

Runs on manual dispatch, pushes to `main`/`lynx-migration`, and pull requests targeting `main`. Validates the codebase compiles and builds:

1. `bun install --frozen-lockfile` — install dependencies
2. `bunx tsc --noEmit` — TypeScript type-checking
3. `bun run build` — build Lynx and web bundles
4. Upload bundles as artifact (14-day retention)

Current quality gates are TypeScript type-checking, production bundle builds, CodeQL, and Pages deployment. Unit tests, browser smoke tests, and lint/format checks are not configured yet.

## Deploy Web

Deploys the Astro site in `docs/` to GitHub Pages on pushes to `main` or manual dispatch. The repository delegates deployment to the shared reusable workflow `jonathanperis/.github/.github/workflows/pages-docs-deploy.yml@main`; that shared workflow installs dependencies, uses Node.js 22 for Astro 6.4+, builds the docs site, and publishes the static output.

## Build Android

The main production workflow. On every push to `main`:

1. **Version computation** — from git tag (`v1.2.3` → `1.2.3`) or short SHA (`0.0.0-a1b2c3d`)
2. **Build Lynx bundle** — `bun run build`
3. **Copy bundle** — into `android/app/src/main/assets/`
4. **Decode keystore when configured** — from `KEYSTORE_BASE64` secret
5. **Gradle build** — `./gradlew assembleRelease`, signed only when the signing env vars are present
6. **Git tag** — creates `build/<version>` tag on `main` pushes
7. **GitHub Release** — creates a release with APK attached

### Android Signing Secrets

| Secret | Purpose |
|--------|---------|
| `KEYSTORE_BASE64` | Base64-encoded release keystore |
| `KEYSTORE_PASSWORD` | Keystore password |
| `KEY_ALIAS` | Key alias name |
| `KEY_PASSWORD` | Key password |

### Android Artifact Matrix

| Artifact | Trigger/path | Signing/status |
|----------|--------------|----------------|
| Local debug APK | `cd android && ./gradlew assembleDebug` after copying `dist/main.lynx.bundle` into assets | Debug-signed by Android tooling |
| CI main-build APK | `build-android.yml` on push to `main` or manual dispatch | Release build; signed only when keystore secrets are configured |
| Tagged release APK | `build-android.yml` or `release.yml` on `v*` tags | Attached to the GitHub Release; signed when `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, and `KEY_PASSWORD` are present |

### Versioning

| Trigger | Version Name | Version Code | Release Type |
|---------|-------------|-------------|-------------|
| Push to `main` | `0.0.0-<sha>` | Epoch-based | Automated build release (`build/<version>` tag) |
| Tag `v1.2.3` | `1.2.3` | Epoch-based | Full release |

## Build iOS

Scaffolded but requires manual setup:

1. Create Xcode project (see [Native Host Apps](/speedy-bird-lynx/docs/native-host-apps/))
2. Enroll in Apple Developer Program ($99/year)
3. Configure signing secrets

Currently builds an unsigned archive only after an Xcode project exists. The checked-in `ios/` directory contains Swift/CocoaPods source files, not a generated `.xcodeproj`; local developers must create the Xcode project and add the source files before building. TestFlight/App Store distribution requires Apple Developer Program signing assets and workflow secrets. See the workflow file header for detailed setup instructions.

## Release

Triggered by version tags (`v*`) or manual dispatch. Builds Lynx bundles and conditionally builds Android/iOS if their native projects exist. Creates a GitHub Release with all available artifacts and auto-generated release notes.
