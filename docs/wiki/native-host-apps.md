# Native Host Apps

Lynx bundles do not run standalone. They need a thin native shell that embeds the Lynx runtime, loads the bundle, and supplies native modules. This project includes complete Android and iOS hosts. Both register the `SpeedyBirdModule` bridge (sound, saved best score, screen-reader announcements) and forward app lifecycle events to the game (see [Game Engine](game-engine.md#audio-and-host-bridge)).

## Android

The Android host is a small Kotlin app in `android/`.

### Key Files

| File | Purpose |
|------|---------|
| `SpeedyBirdApplication.kt` | Initializes Fresco, registers the Lynx image and log services, and initializes `LynxEnv` |
| `MainActivity.kt` | Creates the `LynxView`, registers `SpeedyBirdModule`, runs full-screen immersive mode, and forwards lifecycle events |
| `SpeedyBirdModule.kt` | `SoundPool` sound effects, `SharedPreferences` best score, and announcements |
| `AssetTemplateProvider.kt` | Reads bundles from APK assets on a background executor |
| `AndroidManifest.xml` | No permissions; backup rules for the saved score; adaptive and round icons; Android 12+ splash screen |
| `gradle/libs.versions.toml` | Version catalog for AGP, Kotlin, Lynx, PrimJS, Fresco, and support libraries |
| `app/build.gradle.kts` | Generated assets (bundle + sounds), R8 with resource shrinking, signing from environment variables |
| `proguard-rules.pro` | Keep rules for Lynx SDK classes and `@LynxMethod` module methods |

### Lifecycle and Display

- **Pause/resume:** `onPause` sends `SpeedyBirdPause` and calls `onEnterBackground()`; `onResume` calls `onEnterForeground()` and sends `SpeedyBirdResume`. A run in progress shows "PAUSED" and resumes on the next tap. `onDestroy` destroys the `LynxView`, which releases the module's `SoundPool`.
- **Configuration changes:** the activity handles size, density, UI mode, keyboard, and locale changes itself, so folding, multi-window, or a dark-mode switch never restarts a run.
- **Full screen:** system bars are hidden with `WindowInsetsController` (swipe to reveal them temporarily) and the game draws under display cutouts. The theme paints the sky color behind the window, so launch shows no white flash.
- **Orientation:** portrait on phones. Android 16+ ignores orientation locks on large screens; the game then letterboxes itself.
- **Accessibility:** announcements go to a 1-pixel polite live region next to the `LynxView`, the supported replacement for the deprecated `announceForAccessibility`.

### Dependencies

| Artifact | Version | Purpose |
|----------|---------|---------|
| `org.lynxsdk.lynx:lynx`, `lynx-jssdk`, `lynx-trace` | 4.1.0 | Engine, JavaScript bridge, tracing |
| `org.lynxsdk.lynx:primjs` | 4.1.1 | JavaScript engine required by Lynx 4.1.0 |
| `org.lynxsdk.lynx:lynx-service-image`, `lynx-service-log` | 4.1.0 | Image loading (Fresco) and logging |
| `com.facebook.fresco:fresco`, `animated-base` | 2.3.0 | The exact release `lynx-service-image` 4.1.0 is compiled against |
| `androidx.core:core` | 1.17.0 | Required by Fresco 2.x at runtime; newest release supporting API 21 |
| `com.google.code.gson:gson` | 2.14.0 | JSON (required by Lynx internals) |

The app does not request `INTERNET` and does not include the Lynx HTTP service or OkHttp: sprites are embedded in the bundle and sounds are packaged assets. Animated GIF/WebP decoders are omitted because the game shows only static PNGs.

### Build

```bash
bun run build
cd android
./gradlew assembleDebug assembleRelease lintDebug
cd .. && python3 scripts/verify_android_bundle.py android/app/build/outputs/apk/*/app-*.apk
```

The `prepareLynxAssets` task stages `dist/main.lynx.bundle` and `assets/audio/*.wav` into `android/app/build/generated/lynxAssets/`; nothing is copied into `src/`, so assets cannot go stale. Sounds are stored uncompressed so `SoundPool` can load them directly. The verification script fails if an APK is missing the current bundle or any sound.

The build runs on JDK 21 and compiles the app's own classes to Java 11 bytecode. Toolchain: AGP 9.4.1, Gradle 9.8.1 (checksum-pinned wrapper), Kotlin 2.4.20 through AGP's built-in Kotlin support, compile SDK 37.2, target SDK 37, minimum API 21. Configuration cache, build cache, and parallel execution are enabled.

### Signing

`build.gradle.kts` reads signing configuration from environment variables:

- `KEYSTORE_FILE` — path to keystore file
- `KEYSTORE_PASSWORD` — keystore password
- `KEY_ALIAS` — key alias
- `KEY_PASSWORD` — key password

CI populates these from GitHub Secrets. For local release builds, export the same variables before running Gradle.

### Android Artifacts

| Build path | Command/workflow | Output | Signing |
|------------|------------------|--------|---------|
| Local debug | `bun run build`, then `cd android && ./gradlew assembleDebug` | `android/app/build/outputs/apk/debug/app-debug.apk` | Debug-signed by Android tooling |
| Local release | Same bundle build, then `cd android && ./gradlew assembleRelease` | `android/app/build/outputs/apk/release/` | Signed only when `KEYSTORE_FILE`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, and `KEY_PASSWORD` are exported |
| CI main-build release | `build-android.yml` after Build Check passes on `main`, or manual dispatch from `main` | APK artifact followed by separate immutable build-release publication | Signed only when `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, and `KEY_PASSWORD` GitHub Secrets are configured |
| Tagged release | `release.yml` on `v*` tags | Sole versioned-release publisher; assets uploaded before publication | Signed only when the same keystore secrets are configured |

## iOS

The iOS host is in `ios/`, with a generated Xcode project and a committed `Podfile.lock`.

### Included Files

| File | Purpose |
|------|---------|
| `SpeedyBird.xcodeproj` | Generated by `scripts/generate-ios-project.rb`; app target, `SpeedyBirdUITests`, shared `SpeedyBird` scheme |
| `Podfile` / `Podfile.lock` | Lynx 4.1.0, PrimJS 4.1.1, and the image library versions LynxService requires, locked |
| `Gemfile` / `Gemfile.lock` | CocoaPods 1.17.0 and xcodeproj 1.28.1 |
| `AppDelegate.swift` | `@main` entry point; initializes `LynxEnv` |
| `SceneDelegate.swift` | Creates the window with `ViewController` |
| `ViewController.swift` | Edge-to-edge `LynxView` that follows every size change, registers `SpeedyBirdModule`, and forwards lifecycle events |
| `SpeedyBirdModule.swift` | `AVAudioPlayer` sounds (ambient session: respects the silent switch, mixes with music), `UserDefaults` best score, VoiceOver announcements |
| `BundleTemplateProvider.swift` | Loads `main.lynx.bundle` from the app bundle off the main thread |
| `Info.plist` | Launch screen, versions from build settings, orientations, export compliance |
| `PrivacyInfo.xcprivacy` | Privacy manifest: no tracking or collected data; declares `UserDefaults` access (reason `CA92.1`) |
| `Assets.xcassets` | App icon and launch background color |
| `SpeedyBirdUITests/` | XCUITest smoke tests that drive the real app through its accessibility label |

The app bundles `../dist/main.lynx.bundle` and the `../assets/audio` folder directly, so every build packages the current `bun run build` output and the canonical sounds. iPhone runs in portrait; iPad supports every orientation and window size (Split View, Stage Manager) because the game letterboxes itself. The status bar is hidden, the home indicator auto-hides, and taps near the bottom edge reach the game first.

### Build and Run

```bash
bun run build
cd ios
bundle install
bundle exec pod install
open SpeedyBird.xcworkspace   # or build and test from the command line:
xcodebuild test -workspace SpeedyBird.xcworkspace -scheme SpeedyBird \
  -destination 'platform=iOS Simulator,name=iPhone 15 Pro'
```

`xcodebuild test` builds the app and runs the UI smoke tests: start a run, crash, check the restart lock, and pause a run by backgrounding the app. To change the project structure (new files or targets), edit `scripts/generate-ios-project.rb`, then run `bundle exec ruby ../scripts/generate-ios-project.rb && bundle exec pod install` from `ios/`.

The Podfile uses both CocoaPods trunk and the official `lynx-family/Specs` repository. Its image-library versions are exact upstream requirements. It raises pod deployment targets to iOS 15 to match Xcode's supported range and uses a native resource-copy phase so user script sandboxing stays enabled. See [Dependencies and Upgrades](dependency-updates.md) for the scoped upstream compiler adjustments.

### Apple Developer Program

| Feature | Free | Paid ($99/year) |
|---------|------|-----------------|
| Simulator builds | Yes | Yes |
| Sideload to own device | Personal Team restrictions, including short-lived provisioning | Development/ad hoc provisioning subject to Apple's limits |
| TestFlight | No | Yes |
| App Store distribution | No | Yes |
| CI signing (certificates) | No | Yes |

Simulator builds and unsigned archives do not require paid membership. The workflows always pass `CODE_SIGNING_ALLOWED=NO` and never read Apple signing secrets, so adding secrets alone does not enable a signed iOS release.
