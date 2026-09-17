# CI/CD Pipeline

The release workflow is the single publisher. Platform workflows build and validate artifacts; they do not create competing tags/releases.

## Workflows

| Workflow | Trigger | Contract |
|---|---|---|
| Build Check | PR/main/manual/reusable | Type checks, behavior tests, root/docs builds, asset checks, complete browser distributions |
| Build Android | PR/main/manual/reusable | Full API lint, debug-signed sandbox APK or explicitly requested release-signed APK; signature/resource validation |
| Build iOS | Manual/reusable | Generate project, install locked pods, build actual unsigned device archive |
| Release | `v*` tag/manual | Wait for checks and both platform builds, verify all files, then publish |
| Deploy Pages | Main/manual | Pinned-toolchain game/docs checks and static Astro deployment |
| CodeQL | PR/main/weekly | JavaScript/TypeScript analysis |

Node comes from `.node-version`; Bun is pinned to 1.3.12. Java is 17 in CI. Ruby/CocoaPods tooling and native dependencies are pinned for iOS. Installs use frozen lockfiles or deployment mode.

## Artifact contracts

- `lynx-bundles.tar.gz`: both bundles with embedded sprites, native audio files, and an asset manifest.
- `web-host.tar.gz`: HTML, runtime chunks, WASM, compiled game, browser audio, and worker bridge.
- `speedy-bird-debug.apk` or `speedy-bird-release.apk`: installable signed Android artifact with validated embedded sprites and WAV resources.
- `speedy-bird-ios-unsigned.tar.gz`: a built Xcode archive for inspection/signing, not an installable IPA.

`scripts/assets.mjs check` validates all 30 game resources and current native bundle copies. `scripts/verify-apk.py` inspects the current bundle, package payload and signing markers; CI also runs Android's `apksigner verify`. `scripts/verify-ios.py` validates the built app's executable and current offline resource payload.

## Release behavior

Tagged releases use the tag name. Manual runs produce a `sandbox-*` prerelease. Semver prerelease tags also remain prereleases. Debug signing is the default sandbox output; manual `signed-release` requires all configured Android signing secrets and fails if they are missing.

Publishing requires successful checks, Android, and iOS jobs. A missing Xcode project is no longer a green skip: the project is generated, and the archive must exist. The iOS archive directory is compressed before release upload.

No workflow silently converts a failed native build into a successful multiplatform release. Apple distribution signing and app-store upload are separate future work.

## Local equivalents

```sh
bun install --frozen-lockfile
bun run check
bun run test
bun run build
bun run assets:check
bun run build:web-host
```

From `docs/`, run `bun install --frozen-lockfile`, `npm run check`, and `npm run build`. Native commands are in the host guide. Publishing workflows are not exercised merely by running local build equivalents.
