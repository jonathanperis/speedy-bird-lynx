# Native Host Apps

Lynx bundles do not run standalone — they need a thin native shell that embeds the Lynx runtime and loads the bundle. This project includes host apps for Android (complete) and iOS (source files).

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

These are populated by CI from GitHub Secrets. For local release builds, set them in your shell or use a `local.properties` file.

## iOS

The iOS host app source files are in `ios/`. An Xcode project must be created manually.

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
