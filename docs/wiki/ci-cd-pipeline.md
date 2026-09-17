# CI/CD Pipeline

All automation runs on GitHub Actions. Workflows are in `.github/workflows/`.

## Workflow Overview

| Workflow | File | Trigger | Description |
|----------|------|---------|-------------|
| Build Check | `ci.yml` | Manual, push to `main`/`lynx-migration`, PR to `main` | Audit dependencies, type-check/build bundles and docs, compile the unsigned Android host |
| CodeQL | `codeql.yml` | Push/PR to `main`, weekly, manual | JavaScript/TypeScript and Actions security analysis |
| Deploy Web | `deploy.yml` | Push to `main`, manual | Build and deploy the Astro `docs/` site to GitHub Pages via the shared Pages workflow |
| Build Android | `build-android.yml` | Push to `main`, manual from `main` | Read-only build/signing job followed by a separate build-release publisher |
| Build iOS | `build-ios.yml` | `v*` tags, manual | Build iOS archive (unsigned) |
| Release | `release.yml` | `v*` tags, manual | Full release pipeline with all artifacts |

## Build Check

Runs on manual dispatch, pushes to `main`/`lynx-migration`, and pull requests targeting `main`. Validates the codebase compiles and builds:

1. `bun install --frozen-lockfile` — install dependencies
2. `bun audit` — fail on known dependency advisories
3. `bunx tsc --noEmit` — TypeScript type-checking
4. `bun run build` — build Lynx and web bundles
5. Upload bundles as artifact (14-day retention)
6. Compile the Android debug host against those bundles in a read-only job without signing secrets
7. Install the frozen docs lockfile, audit it, and build the docs site

Quality gates include dependency audits, TypeScript checks, bundle/docs builds, unsigned Android compilation, and CodeQL. Unit tests, browser smoke tests, and lint/format checks are not configured yet.

## Deploy Web

Deploys the Astro site in `docs/` to GitHub Pages on pushes to `main` or manual dispatch from `main`. The repository calls `jonathanperis/.github/.github/workflows/pages-docs-deploy.yml` at the full commit SHA recorded in `deploy.yml`. Only the optional public analytics ID is passed as a secret. The shared workflow installs frozen dependencies, uses Node.js 22 for Astro 7, builds the docs site, and publishes the static output.

## Build Android

The main production workflow. On every push to `main`:

1. **Version computation** — from the short SHA (`0.0.0-a1b2c3d`)
2. **Build Lynx bundle** — `bun run build`
3. **Copy bundle** — into `android/app/src/main/assets/`
4. **Decode keystore when configured** — from `KEYSTORE_BASE64` secret
5. **Gradle build** — `./gradlew assembleRelease`, signed only when the signing env vars are present
6. **Artifact handoff** — upload the versioned APK from the read-only build job
7. **Immutable publication** — a separate write-enabled job creates `build/<version>` at the verified commit, uploads the APK to a draft, then publishes it

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
| Tagged release APK | `release.yml` on `v*` tags | Attached to the GitHub Release; signed when `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, and `KEY_PASSWORD` are present |

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

Triggered by version tags (`v*`) or manual dispatch from `main` or a version tag. This is the sole publisher for versioned releases, avoiding concurrent publishers racing an immutable release. Builds Lynx bundles and conditionally builds Android/iOS when their native projects exist; a failed build blocks publication. The publishing job uploads all available assets to a draft, then publishes the immutable release. Subsequent corrections require a new release instead of replacing published assets.
