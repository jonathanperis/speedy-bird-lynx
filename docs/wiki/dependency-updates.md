# Dependencies and Upgrades

Last reviewed: **2026-10-07**. Versions below describe this checkout, not a promise that every upstream package will remain at its latest release. The manifests and lockfiles are the source of truth.

## JavaScript toolchains

| Component | Version | Role |
|-----------|---------|------|
| ReactLynx | 0.126.2 | Game components and hooks |
| ReactLynx Rsbuild plugin | 0.20.3 | Coordinated compiler/runtime integration |
| Rspeedy | 0.18.0 | Native and web bundle builds; uses Rsbuild 2.2.9 internally |
| Rsbuild | 2.2.12 | Standalone web host |
| Lynx web core / elements | 0.26.2 / 0.12.12 | Browser runtime |
| Lynx core | 0.1.4 | Explicit runtime peer required by the standalone web host |
| React types | 19.3.0 | JSX typings required by ReactLynx; no `react` or `react-dom` runtime is installed |
| Lynx TypeScript bindings | 4.3.0 | API declarations; host support must still be checked against the native SDK |
| App TypeScript | 6.0.3 | Latest release within Rspeedy's supported peer range |
| Docs TypeScript | 7.0.2 | Independent documentation toolchain |
| Biome | 2.5.15 | Lint and format checks for app, web host, tests, and scripts |
| Bun | 1.3.12 | Pinned by `packageManager` in both packages; CI installs that exact version |
| Astro | 7.3.6 | Static website and Rust-powered Markdown rendering |
| Tailwind CSS / Vite plugin | 4.3.3 | Documentation styling |

The ReactLynx, compiler plugin, and Rspeedy versions must be upgraded together. Rspeedy 0.18 removed `entries` from its exposed plugin API, follows Rsbuild's default CSS Modules class names in development, and no longer forces the progress bar on; none of these affect this app, which uses no CSS Modules or custom Rspeedy plugins. ReactLynx 0.126.2 and web core 0.26.2 are patch releases. ReactLynx 0.126 moves to Preact 11 internally: effect cleanup on component removal is deferred until the after-paint flush; page destruction still drains cleanup synchronously. This app mounts one root game engine and cleans up its timer in its effect cleanup.

React 19 typings require `jsxImportSource: "@lynx-js/react"` so `<view>` and `<image>` are typed as Lynx elements. Web core now exports its browser entry at `@lynx-js/web-core/client`. Rspeedy 0.17 uses `.lynx` intermediate directories. These migrations are applied in this checkout.

The standalone host also requires `@lynx-js/lynx-core` 0.1.4 explicitly: web core marks it as an optional peer, but its background-thread loader imports `@lynx-js/lynx-core/web`. A previously populated `node_modules` directory can hide this missing declaration; the clean CI install verifies it is reproducible.

## Security overrides and update automation

Both packages use `overrides` only to lift vulnerable transitive dependencies to their first patched releases, so `bun audit` stays clean without forcing unsupported direct upgrades:

| Package | Override | Pulled in by |
|---------|----------|--------------|
| `dompurify` | `^3.4.16` | Lynx web elements (standalone web host runtime) |
| `serialize-javascript` | `^7.1.2` | Rspack/Rsbuild build tooling |
| `shell-quote` | `^1.12.0` | Rsdoctor's `launch-editor` (dev tooling) |
| `source-map-js` | `^1.2.2` | Build and docs tooling |
| `http-cache-semantics`, `sharp`, `postcss` (docs) | `^4.3.0`, `^0.35.5`, `^8.5.29` | Astro |

Remove an override once every dependent declares the patched range. Renovate (`renovate.json`) groups Lynx npm packages and the native Lynx SDK/PrimJS releases (ignoring nightly builds), keeps the root TypeScript below 7, disables the Lynx-pinned SDWebImage pods, groups Fresco, and groups the Android Gradle Plugin with Kotlin and the Gradle wrapper. None of these groups automerge.

## Native toolchains and compatibility holds

| Component | Version / requirement | Compatibility note |
|-----------|-----------------------|--------------------|
| Lynx Android/iOS SDK | 4.1.0 | Latest stable native release checked |
| PrimJS | 4.1.1 | Required by Lynx 4.1.0; not the same version as the SDK |
| Android Gradle Plugin | 9.4.0 | Uses built-in Kotlin support |
| Gradle | 9.7.1 | Wrapper distribution is checksum-pinned |
| Kotlin Gradle plugin | 2.4.20 | Supplies the compiler used by AGP's built-in integration |
| Java | 21 recommended | Used by the verified local Android build and CI |
| Android SDK | compile 37.2, target 37, minimum 21 | OkHttp 5.5 requires compile API 37 or newer |
| OkHttp / Gson | 5.5.0 / 2.14.0 | Native HTTP and JSON support |
| Fresco family | 3.7.0 | Coordinated image modules; Android debug/release and API lint checked with Lynx 4.1.0 |
| SDWebImage / WebP coder | 5.15.5 / 0.11.0 | Exact dependencies in the LynxService/Image 4.1.0 podspec |

TypeScript 7.0.2 is not supported by Rspeedy 0.18.0, whose declared peer range ends at 6.0.x. The root stays on `~6.0.3`; the independent docs package can use TypeScript 7. Do not force an unsupported peer range to make a version table look newer.

Fresco was upgraded to 3.7.0 after Android compilation, R8 release processing, and API lint passed; its older native-library page-alignment warnings were eliminated. Lynx's image service was compiled upstream against Fresco 2.3.0, so device-level rendering remains part of future runtime verification. SDWebImage 5.21.7 and SDWebImageWebPCoder 0.15.0 were available, but the Podfile retains the exact older versions required by LynxService/Image 4.1.0. Unused XElement integrations were removed: the game uses only built-in view, image, and text elements.

iOS remains a source scaffold: this repository does not track an Xcode project. Dependency resolution, an unsigned app build, and an unsigned archive were verified in a temporary Xcode 27 project targeting iOS 15. Both artifacts contain the current game bundle and Lynx resources. This does not establish a checked-in project, device installation, signing, or native audio. See [Native Host Apps](native-host-apps.md).

The Podfile aligns older pod deployment targets to iOS 15. For the Lynx target only, Xcode 27's unused-result/deprecation diagnostics remain warnings instead of being promoted to errors by upstream flags. Its one pinned runtime resource bundle is copied through Xcode's native resource phase, keeping user-script sandboxing enabled. Revisit these narrowly scoped integration adjustments when upgrading Lynx or CocoaPods.

## Upgrade checklist

1. Read current stable release notes and peer dependencies. Check native POMs/podspecs as well as npm versions.
2. Update compatible packages and regenerate both Bun lockfiles. Re-run frozen installs to prove reproducibility.
3. Run `bun run lint`, `bun run check`, `bun run build`, and `bun run build:web-host` at the repository root, then `bun audit`.
4. In `docs/`, run `npm run build`, `npm run check:site`, and `bun audit` using Node.js >=22.12.
5. After the bundle build, run `./gradlew assembleDebug assembleRelease lintDebug` in `android/`. Inspect signing status rather than assuming a release APK is signed.
6. Resolve the iOS pods and build from a configured Xcode project when available. Report compilation, signing, simulator, and device evidence separately.
7. Update this page, setup instructions, workflow pins, and the platform matrix. Keep historical migration plans marked as historical.

## Sources

- [ReactLynx changelog](https://github.com/lynx-family/lynx-stack/blob/main/packages/react/CHANGELOG.md)
- [Rspeedy changelog](https://github.com/lynx-family/lynx-stack/blob/main/packages/rspeedy/core/CHANGELOG.md)
- [ReactLynx compiler plugin changelog](https://github.com/lynx-family/lynx-stack/blob/main/packages/rspeedy/plugin-react/CHANGELOG.md)
- [Lynx native releases](https://github.com/lynx-family/lynx/releases)
- [Lynx image-service Android dependencies](https://github.com/lynx-family/lynx/blob/4.1.0/platform/android/lynx_service/lynx_service_image/build.gradle)
- [LynxService 4.1.0 podspec](https://github.com/lynx-family/Specs/blob/master/LynxService/4.1.0/LynxService.podspec.json)
