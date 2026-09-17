# Dependencies and Upgrades

Last reviewed: **2026-09-17**. Versions below describe this checkout, not a promise that every upstream package will remain at its latest release. The manifests and lockfiles are the source of truth.

## JavaScript toolchains

| Component | Version | Role |
|-----------|---------|------|
| ReactLynx | 0.126.1 | Game components and hooks |
| ReactLynx Rsbuild plugin | 0.20.2 | Coordinated compiler/runtime integration |
| Rspeedy | 0.17.2 | Native and web bundle builds; uses Rsbuild 2.2.4 internally |
| Rsbuild | 2.2.7 | Standalone web host |
| Lynx web core / elements | 0.26.1 / 0.12.11 | Browser runtime |
| Lynx core | 0.1.4 | Explicit runtime peer required by the standalone web host |
| React / React DOM / React types | 19.3.0 | Compatibility dependencies and typings; the game imports ReactLynx |
| Lynx TypeScript bindings | 4.2.1 | API declarations; host support must still be checked against the native SDK |
| App TypeScript | 6.0.3 | Latest release within Rspeedy's supported peer range |
| Docs TypeScript | 7.0.2 | Independent documentation toolchain |
| Astro | 7.3.3 | Static website and Rust-powered Markdown rendering |
| Tailwind CSS / Vite plugin | 4.3.3 | Documentation styling |

The ReactLynx, compiler plugin, and Rspeedy versions must be upgraded together. ReactLynx 0.126 moves to Preact 11 internally: effect cleanup on component removal is deferred until the after-paint flush; page destruction still drains cleanup synchronously. This app mounts one root game engine and cleans up its timer in its effect cleanup.

React 19 typings require `jsxImportSource: "@lynx-js/react"` so `<view>` and `<image>` are typed as Lynx elements. Web core now exports its browser entry at `@lynx-js/web-core/client`. Rspeedy 0.17 uses `.lynx` intermediate directories. These migrations are applied in this checkout.

The standalone host also requires `@lynx-js/lynx-core` 0.1.4 explicitly: web core marks it as an optional peer, but its background-thread loader imports `@lynx-js/lynx-core/web`. A previously populated `node_modules` directory can hide this missing declaration; the clean CI install verifies it is reproducible.

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

TypeScript 7.0.2 is not supported by Rspeedy 0.17.2, whose declared peer range ends at 6.0.x. The root stays on `~6.0.3`; the independent docs package can use TypeScript 7. Do not force an unsupported peer range to make a version table look newer.

Fresco was upgraded to 3.7.0 after Android compilation, R8 release processing, and API lint passed; its older native-library page-alignment warnings were eliminated. Lynx's image service was compiled upstream against Fresco 2.3.0, so device-level rendering remains part of future runtime verification. SDWebImage 5.21.7 and SDWebImageWebPCoder 0.15.0 were available, but the Podfile retains the exact older versions required by LynxService/Image 4.1.0. Unused XElement integrations were removed: the game uses only built-in view, image, and text elements.

iOS remains a source scaffold: this repository does not track an Xcode project. Dependency resolution, an unsigned app build, and an unsigned archive were verified in a temporary Xcode 27 project targeting iOS 15. Both artifacts contain the current game bundle and Lynx resources. This does not establish a checked-in project, device installation, signing, or native audio. See [Native Host Apps](native-host-apps.md).

The Podfile aligns older pod deployment targets to iOS 15. For the Lynx target only, Xcode 27's unused-result/deprecation diagnostics remain warnings instead of being promoted to errors by upstream flags. Its one pinned runtime resource bundle is copied through Xcode's native resource phase, keeping user-script sandboxing enabled. Revisit these narrowly scoped integration adjustments when upgrading Lynx or CocoaPods.

## Upgrade checklist

1. Read current stable release notes and peer dependencies. Check native POMs/podspecs as well as npm versions.
2. Update compatible packages and regenerate both Bun lockfiles. Re-run frozen installs to prove reproducibility.
3. Run `bun run check`, `bun run build`, and `bun run build:web-host` at the repository root, then `bun audit`.
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
