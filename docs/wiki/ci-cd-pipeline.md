# CI/CD Pipeline

All automation runs on GitHub Actions. Workflows are in `.github/workflows/`.

## Workflow Overview

| Workflow | File | Trigger | Description |
|----------|------|---------|-------------|
| Build Check | `ci.yml` | Manual, push to `main`, PR to `main`, weekly | Audit dependencies, lint/format, check bundles/web host/docs, validate site links/metadata, compile/lint Android, verify APK bundle; calls Build Android after `main` pushes pass |
| CodeQL | `codeql.yml` | Push/PR to `main`, weekly, manual | JavaScript/TypeScript, Actions, Python, and Kotlin security analysis |
| Deploy Web | `deploy.yml` | Push to `main`, manual | Build and deploy the Astro `docs/` site to GitHub Pages via the shared Pages workflow |
| Build Android | `build-android.yml` | Called by Build Check on `main`, manual from `main` | Read-only APK build followed by a separate build-prerelease publisher |
| Build iOS | `build-ios.yml` | Manual | Skip without an Xcode project; otherwise build an unsigned archive |
| Release | `release.yml` | `v*` tags on `main`, manual from `main` | Full release pipeline with all artifacts |

Shared steps live in composite actions: `.github/actions/setup-js` installs Node.js 24, the Bun version pinned by each package's `packageManager` field, restores Bun's package cache, and runs a frozen install; `.github/actions/setup-android` installs JDK 21, the Android SDK platform, and Gradle caching. The release APK and unsigned iOS archive are reusable workflows (`reusable-android-apk.yml`, `reusable-ios-archive.yml`) shared by the build and release pipelines. Every job declares `timeout-minutes`, and only publishing jobs receive `contents: write`.

## Build Check

Runs on manual dispatch, pushes to `main`, pull requests targeting `main`, and weekly. Pull-request runs cancel superseded runs; `main` runs queue so every verified commit can publish. Validates the codebase compiles and builds:

1. `bun install --frozen-lockfile` — install dependencies
2. `bun audit --audit-level=high` — fail on high or critical advisories; the weekly run reports every severity
3. `bun run lint` — Biome lint and formatting check
4. `bun run check` — TypeScript type-checking
5. `bun run build` and `bun run build:web-host` — build Lynx/web bundles and the development host
6. Upload bundles as artifact (14-day retention)
7. Compile and lint the Android debug host in a read-only job without signing secrets, then verify the APK contains the current bundle
8. Install the frozen docs lockfile, audit it, build the site, and check every generated page's local links, fragments, unique IDs, and canonical/OG URL

Successful builds and static checks do not establish device behavior or accessibility conformance.

## Deploy Web

Deploys the Astro site in `docs/` to GitHub Pages on pushes to `main` or manual dispatch from `main`. The repository calls `jonathanperis/.github/.github/workflows/pages-docs-deploy.yml` at the full commit SHA recorded in `deploy.yml`. Only the optional public analytics ID is passed as a secret. The shared workflow installs frozen dependencies, uses Node.js 24 for Astro 7, builds the docs site, and publishes the static output.

## Build Android

The main production workflow. Build Check calls it only after its `build`, `android`, and `docs` jobs pass for a push to `main`, so an unverified commit never publishes:

1. **Version computation** — from the short SHA (`0.0.0-a1b2c3d`)
2. **Build Lynx bundle** — `bun run build`
3. **Stage bundle** — Gradle copies the current `dist/main.lynx.bundle` into generated APK assets
4. **Decode keystore when configured** — from `KEYSTORE_BASE64` secret
5. **Gradle build and package verification** — `./gradlew assembleRelease`, signed only when the signing env vars are present; verify that the APK contains the exact current bundle
6. **Artifact handoff** — upload the versioned APK from the read-only build job
7. **Immutable publication** — a separate write-enabled job creates `build/<version>` at the verified commit, uploads the APK to a draft, then publishes it as a prerelease that is never marked "Latest"

The signing step learns only whether `KEYSTORE_BASE64` is configured (secrets cannot be read in step conditions), decodes the keystore when present, and deletes it after the Gradle build.

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
| Local debug APK | `cd android && ./gradlew assembleDebug` after the root bundle build | Debug-signed by Android tooling |
| CI main-build APK | `build-android.yml` after Build Check passes on `main`, or manual dispatch from `main` | Release build; signed only when keystore secrets are configured |
| Tagged release APK | `release.yml` on `v*` tags | Attached to the GitHub Release; signed when `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, and `KEY_PASSWORD` are present |

### Versioning

| Trigger | Version Name | Version Code | Release Type |
|---------|-------------|-------------|-------------|
| Push to `main` | `0.0.0-<sha>` | Epoch-based | Automated build prerelease (`build/<version>` tag) |
| Tag `v1.2.3` | `1.2.3` | Epoch-based | Full release, marked "Latest" |
| Tag `v1.2.3-rc.1` | `1.2.3-rc.1` | Epoch-based | Prerelease |
| Manual release from `main` | `0.0.0-<sha>` (`v0.0.0-<sha>` tag) | Epoch-based | Prerelease |

## Build iOS

Scaffolded but requires manual setup:

1. Create and track an Xcode project with a shared `SpeedyBird` scheme (see [Native Host Apps](native-host-apps.md)).
2. Build/package the bundle and install the locked Ruby/CocoaPods dependencies.
3. Build an unsigned archive. Paid membership is not needed for this operation.

The checked-in `ios/` directory contains a Swift/CocoaPods scaffold, not a generated `.xcodeproj`. The workflows always disable code signing; Apple secrets are not read. Signed device distribution would require additional workflow implementation as well as Apple signing assets. Dependency resolution alone is not an app/archive build.

## Release

Triggered by version tags (`v*`) or manual dispatch from `main`. The tagged commit must be on `main`; the pipeline audits, lints, and type-checks before building. This is the sole publisher for versioned releases, avoiding concurrent publishers racing an immutable release. Builds Lynx bundles and conditionally builds Android/iOS when their native projects exist; a failed build blocks publication. The publishing job uploads all available assets to a draft, then publishes the immutable release. Subsequent corrections require a new release instead of replacing published assets.
