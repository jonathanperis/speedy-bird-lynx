# Native Host Apps

Lynx bundles do not run standalone — they need a thin native shell that embeds the Lynx runtime and loads the bundle. This project includes a ready-to-build Android host app and iOS source files that must be added to a locally created Xcode project before building.

## Android

The Android host app is a minimal Kotlin application in `android/`.

### Key Files

| File | Purpose |
|------|---------|
| `SpeedyBirdApplication.kt` | Initializes Lynx engine, Fresco (image loading), and registers services |
| `MainActivity.kt` | Creates a `LynxView` and loads `main.lynx.bundle` from assets |
| `AssetTemplateProvider.kt` | Implements `AbsTemplateProvider` to read bundles from APK assets |
| `AndroidManifest.xml` | Fullscreen, portrait-only, internet permission |
| `build.gradle.kts` | Lynx SDK 4.1.0 dependencies, generated bundle assets, and signing config from env vars |
| `proguard-rules.pro` | Keep rules for Lynx SDK classes during R8 minification |

### Dependencies

| Artifact | Purpose |
|----------|---------|
| `org.lynxsdk.lynx:lynx` | Core rendering engine |
| `org.lynxsdk.lynx:lynx-jssdk` | JavaScript bridge |
| `org.lynxsdk.lynx:primjs` | JavaScript engine, version 4.1.1 as required by Lynx 4.1.0 |
| `org.lynxsdk.lynx:lynx-trace` | Performance tracing |
| `org.lynxsdk.lynx:lynx-service-image` | Image loading (wraps Fresco) |
| `org.lynxsdk.lynx:lynx-service-log` | Logging |
| `org.lynxsdk.lynx:lynx-service-http` | Network requests |
| `com.facebook.fresco:*` | Image loading and animated image support required by `lynx-service-image` |
| `com.squareup.okhttp3:okhttp` | HTTP client support for Lynx services |
| `com.google.code.gson:gson` | JSON (required by Lynx internals) |

### How It Works

1. `SpeedyBirdApplication.onCreate()` initializes Fresco, registers Lynx services, and calls `LynxEnv.inst().init()`
2. `MainActivity.onCreate()` builds a `LynxView` via `LynxViewBuilder`, attaches the `AssetTemplateProvider`, and calls `renderTemplateUrl("main.lynx.bundle", "")`
3. The `AssetTemplateProvider` reads the bundle bytes from `assets/main.lynx.bundle` and passes them to the Lynx engine

Run `bun run build` before Gradle. The `prepareLynxAssets` task stages that exact bundle from root `dist/` into `android/app/build/generated/lynxAssets/`. The APK assets source is this generated directory, not a manually populated source folder. Images are embedded in the bundle. After building, verify the packaged input from the repository root:

```bash
python3 scripts/verify_android_bundle.py android/app/build/outputs/apk/debug/app-debug.apk
```

The Android toolchain uses Java 21, AGP 9.4.0, Gradle 9.7.1, and Kotlin 2.4.20 through AGP's built-in Kotlin integration. Compile SDK is 37.2, target SDK is 37, and minimum device API is 21. Run `./gradlew lintDebug` to check API usage. See [Dependencies and Upgrades](dependency-updates.md) for image-library compatibility holds.

### Signing

The `build.gradle.kts` reads signing configuration from environment variables:

- `KEYSTORE_FILE` — path to keystore file
- `KEYSTORE_PASSWORD` — keystore password
- `KEY_ALIAS` — key alias
- `KEY_PASSWORD` — key password

These are populated by CI from GitHub Secrets. For local release builds, export the same environment variables in your shell before running Gradle.

### Android Artifacts

| Build path | Command/workflow | Output | Signing |
|------------|------------------|--------|---------|
| Local debug | `bun run build`, then `cd android && ./gradlew assembleDebug` | `android/app/build/outputs/apk/debug/app-debug.apk` | Debug-signed by Android tooling |
| Local release | Same bundle build, then `cd android && ./gradlew assembleRelease` | `android/app/build/outputs/apk/release/` | Signed only when `KEYSTORE_FILE`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, and `KEY_PASSWORD` are exported |
| CI main-build release | `build-android.yml` on `main` or manual dispatch from `main` | APK artifact followed by separate immutable build-release publication | Signed only when `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, and `KEY_PASSWORD` GitHub Secrets are configured |
| Tagged release | `release.yml` on `v*` tags | Sole versioned-release publisher; assets uploaded before publication | Signed only when the same keystore secrets are configured |

## Native Audio Status

The adapter in `src/audio/audio.ts` uses `HTMLAudioElement` only in JavaScript contexts where `Audio` exists. Native and worker-based web runtimes currently use a placeholder and continue without sound. The current interface is `play(sound)` only; there is no preload bridge method. A future implementation must replace the optional internal lookup with Lynx's supported background-thread `NativeModules` API, implement and register platform modules, and package their sound resources. The separate Canvas demo already uses browser audio.

## iOS

The iOS host app source files are in `ios/`. An Xcode project must be created manually before the app can be built or archived.

### Included Files

| File | Purpose |
|------|---------|
| `Podfile` | Lynx 4.1.0, PrimJS 4.1.1, and the image versions required by LynxService |
| `Gemfile` / `Gemfile.lock` | Reproducible CocoaPods 1.17.0 and xcodeproj 1.28.1 tooling |
| `AppDelegate.swift` | Initializes `LynxEnv` |
| `SceneDelegate.swift` | Creates window with `ViewController` |
| `ViewController.swift` | Fullscreen `LynxView`, portrait-only, hidden status bar |
| `BundleTemplateProvider.swift` | Loads `main.lynx.bundle` from the app bundle |
| `SpeedyBird-Bridging-Header.h` | Objective-C bridge for Lynx SDK headers |
| `Info.plist` | App metadata, scene configuration |

### Setup Steps

1. Open Xcode > File > New > Project > App
   - Product Name: `SpeedyBird`
   - Bundle Identifier: `com.jonathanperis.speedybird`
   - Language: Swift; the verified scaffold uses Swift 5 language mode
   - iOS Deployment Target: 15.0 or newer
2. Delete the auto-generated Swift files
3. Add the files from `ios/SpeedyBird/`; set the target's Info.plist file to `SpeedyBird/Info.plist` instead of generating one
4. Build Settings > Swift Compiler > Objective-C Bridging Header > set to `SpeedyBird/SpeedyBird-Bridging-Header.h`
5. Build the root bundle and copy `dist/main.lynx.bundle` into `ios/SpeedyBird/Resources/`
6. With Ruby >=3.2 and Bundler: `cd ios && bundle install && bundle exec pod install`
7. Open `SpeedyBird.xcworkspace` (not `.xcodeproj`)
8. Build Phases > Copy Bundle Resources > add `main.lynx.bundle`

The Podfile uses both CocoaPods trunk and the official `lynx-family/Specs` repository. Its image-library versions are exact upstream requirements. It sets deployment target iOS 15 for the app and pods to match Xcode 27's supported range, and uses a native resource-copy phase so script sandboxing stays enabled. Dependency resolution, an unsigned app build, and an unsigned archive were verified in a temporary project; configure your own shared `SpeedyBird` scheme because that verification project is not distributed. See [Dependencies and Upgrades](dependency-updates.md) for the scoped upstream compiler adjustments.

### Apple Developer Program

| Feature | Free | Paid ($99/year) |
|---------|------|-----------------|
| Simulator builds | Yes | Yes |
| Sideload to own device | Personal Team restrictions, including short-lived provisioning | Development/ad hoc provisioning subject to Apple's limits |
| TestFlight | No | Yes |
| App Store distribution | No | Yes |
| CI signing (certificates) | No | Yes |

Simulator builds and unsigned archives do not require paid membership. TestFlight/App Store distribution requires membership and signing configuration. The checked-in workflows always pass `CODE_SIGNING_ALLOWED=NO` and skip without an Xcode project. They do not import signing certificates or consume Apple signing secrets, so adding secrets alone does not enable a signed iOS release.
