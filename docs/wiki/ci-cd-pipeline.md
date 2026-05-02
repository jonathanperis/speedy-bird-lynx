# CI/CD Pipeline

All automation runs on GitHub Actions. Workflows are in `.github/workflows/`.

## Workflow Overview

| Workflow | File | Trigger | Description |
|----------|------|---------|-------------|
| Build Check | `ci.yml` | Push/PR to `main` | Type-check and build Lynx bundles |
| CodeQL | `codeql.yml` | Push/PR to `main`, weekly | Security and quality analysis |
| Deploy Web | `deploy.yml` | Push to `main` | Deploy `docs/` to GitHub Pages |
| Build Android | `build-android.yml` | Push to `main`, `v*` tags, manual | Build signed APK, create GitHub Release |
| Build iOS | `build-ios.yml` | `v*` tags, manual | Build iOS archive (unsigned) |
| Release | `release.yml` | `v*` tags, manual | Full release pipeline with all artifacts |

## Build Check

Runs on every push and pull request. Validates the codebase compiles and builds:

1. `bun install --frozen-lockfile` — install dependencies
2. `bunx tsc --noEmit` — TypeScript type-checking
3. `bun run build` — build Lynx and web bundles
4. Upload bundles as artifact (14-day retention)

## Deploy Web

Deploys the `docs/` directory (standalone canvas game) to GitHub Pages on every push to `main`. Uses `actions/deploy-pages`.

## Build Android

The main production workflow. On every push to `main`:

1. **Version computation** — from git tag (`v1.2.3` → `1.2.3`) or short SHA (`0.0.0-a1b2c3d`)
2. **Build Lynx bundle** — `bun run build`
3. **Copy bundle** — into `android/app/src/main/assets/`
4. **Decode keystore** — from `KEYSTORE_BASE64` secret
5. **Gradle build** — `./gradlew assembleRelease` with signing env vars
6. **Git tag** — creates `build/<version>` tag on `main` pushes
7. **GitHub Release** — creates a release with APK attached

### Android Signing Secrets

| Secret | Purpose |
|--------|---------|
| `KEYSTORE_BASE64` | Base64-encoded release keystore |
| `KEYSTORE_PASSWORD` | Keystore password |
| `KEY_ALIAS` | Key alias name |
| `KEY_PASSWORD` | Key password |

### Versioning

| Trigger | Version Name | Version Code | Release Type |
|---------|-------------|-------------|-------------|
| Push to `main` | `0.0.0-<sha>` | Epoch-based | Pre-release |
| Tag `v1.2.3` | `1.2.3` | Epoch-based | Full release |

## Build iOS

Scaffolded but requires manual setup:

1. Create Xcode project (see [Native Host Apps](native-host-apps))
2. Enroll in Apple Developer Program ($99/year)
3. Configure signing secrets

Currently builds an unsigned archive. See the workflow file header for detailed setup instructions.

## Release

Triggered by version tags (`v*`) or manual dispatch. Builds Lynx bundles and conditionally builds Android/iOS if their native projects exist. Creates a GitHub Release with all available artifacts and auto-generated release notes.
