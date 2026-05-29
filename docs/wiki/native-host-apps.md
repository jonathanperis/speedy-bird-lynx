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
| `build.gradle.kts` | Lynx SDK 3.7.0 dependencies, signing config from env vars |
| `proguard-rules.pro` | Keep rules for Lynx SDK classes during R8 minification |

### Dependencies

| Artifact | Purpose |
|----------|---------|
| `org.lynxsdk.lynx:lynx` | Core rendering engine |
| `org.lynxsdk.lynx:lynx-jssdk` | JavaScript bridge |
| `org.lynxsdk.lynx:primjs` | QuickJS JavaScript engine |
| `org.lynxsdk.lynx:lynx-trace` | Performance tracing |
| `org.lynxsdk.lynx:lynx-service-image` | Image loading (wraps Fresco) |
| `org.lynxsdk.lynx:lynx-service-log` | Logging |
| `org.lynxsdk.lynx:lynx-service-http` | Network requests |
| `org.lynxsdk.lynx:xelement` | Extended UI elements |
| `org.lynxsdk.lynx:xelement-input` | Extended input elements used by the Android Lynx runtime |
| `com.facebook.fresco:*` | Image loading and animated image support required by `lynx-service-image` |
| `com.squareup.okhttp3:okhttp` | HTTP client support for Lynx services |
| `com.google.code.gson:gson` | JSON (required by Lynx internals) |

### How It Works

1. `SpeedyBirdApplication.onCreate()` initializes Fresco, registers Lynx services, and calls `LynxEnv.inst().init()`
2. `MainActivity.onCreate()` builds a `LynxView` via `LynxViewBuilder`, attaches the `AssetTemplateProvider`, and calls `renderTemplateUrl("main.lynx.bundle", "")`
3. The `AssetTemplateProvider` reads the bundle bytes from `assets/main.lynx.bundle` and passes them to the Lynx engine

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
| Local debug | `bun run build`, copy `dist/main.lynx.bundle` into `android/app/src/main/assets/`, then `cd android && ./gradlew assembleDebug` | `android/app/build/outputs/apk/debug/app-debug.apk` | Debug-signed by Android tooling |
| Local release | Same bundle copy, then `cd android && ./gradlew assembleRelease` | `android/app/build/outputs/apk/release/` | Signed only when `KEYSTORE_FILE`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, and `KEY_PASSWORD` are exported |
| CI release | `build-android.yml` on `main`, `v*` tags, or manual dispatch | APK artifact and GitHub Release attachment | Signed only when `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, and `KEY_PASSWORD` GitHub Secrets are configured |

## Native Audio Status

The game audio abstraction in `src/audio/audio.ts` uses `HTMLAudioElement` on web. Native builds currently have stubs: if an Android or iOS `AudioModule` is not implemented and registered with the Lynx bridge, the game logs a warning and continues without sound. To enable native sound effects, implement the platform-specific module, expose the same play/preload contract used by the web implementation, and register it during app startup.

## iOS

The iOS host app source files are in `ios/`. An Xcode project must be created manually before the app can be built or archived.

### Included Files

| File | Purpose |
|------|---------|
| `Podfile` | Lynx 3.7.0, PrimJS, SDWebImage, XElement |
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
   - Language: Swift
2. Delete the auto-generated Swift files
3. Add all files from `ios/SpeedyBird/` to the project
4. Build Settings > Swift Compiler > Objective-C Bridging Header > set to `SpeedyBird/SpeedyBird-Bridging-Header.h`
5. Build Settings > User Script Sandboxing > set to **NO**
6. Terminal: `cd ios && pod install`
7. Open `SpeedyBird.xcworkspace` (not `.xcodeproj`)
8. Build Phases > Copy Bundle Resources > add `main.lynx.bundle`

### Apple Developer Program

| Feature | Free | Paid ($99/year) |
|---------|------|-----------------|
| Simulator builds | Yes | Yes |
| Sideload to own device | 7-day expiry | Unlimited |
| TestFlight | No | Yes |
| App Store distribution | No | Yes |
| CI signing (certificates) | No | Yes |

Without an Apple Developer Program configuration, CI/local workflows can only produce unsigned simulator or archive outputs after the Xcode project exists. TestFlight/App Store distribution requires signing certificates, provisioning profiles, and workflow secrets.
