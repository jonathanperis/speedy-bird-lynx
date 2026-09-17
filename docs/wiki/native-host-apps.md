# Native Host Apps

Both hosts embed Lynx SDK 4.1.0 and PrimJS 4.1.1. Bundles target engineVersion 3.9 because that is the current stable encoder's supported maximum. The native engine may be newer than the bundle target.

## Shared host contract

`NativeModules.SpeedyBirdModule`, used only on the background thread:

| Method | Contract |
|---|---|
| `play(sound)` | Play flap, score, collision, fall, or swoosh |
| `stopAudio()` | Stop active sound effects |
| `loadPreferences(callback)` | Return serialized versioned preferences or an empty string |
| `savePreferences(value)` | Persist serialized preferences |

The UI parses persisted data and retains a valid default for missing/invalid fields. Host sound names map to packaged WAV filenames, not network URLs. Sprites are embedded in the bundle.

## Android

Prerequisites: Java 17+ and Android SDK 34. Run `bun run build` at the root, then `./gradlew lintDebug assembleDebug` in `android/`. Full API lint checks compatibility with the minimum Android API 21; successful compilation alone does not prove that contract.

- `SpeedyBirdApplication.kt`: initializes Lynx/Fresco and standard services.
- `MainActivity.kt`: owns the LynxView, registers the app module, forwards pause/foreground events, and destroys the view.
- `SpeedyBirdModule.kt`: SoundPool players, SharedPreferences, and resource cleanup.
- `AssetTemplateProvider.kt`: loads the local bundle.

Run `python3 scripts/verify-apk.py android/app/build/outputs/apk/debug/app-debug.apk` from the root to verify signatures and offline assets. A build is not a substitute for device playback/background-resume testing.

Release signing requires all four environment values: `KEYSTORE_FILE`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, and `KEY_PASSWORD`. CI offers explicit release signing; default sandbox builds use debug signing. Debug keys can differ across CI runs, so installing a replacement may require uninstalling the previous sandbox app.

## iOS

Prerequisites: iOS 15+ target, Xcode, Ruby 3.3+, and Bundler. The Xcode project is reproducibly generated rather than manually reconstructed.

```sh
# Repository root
bun run build
# From ios/
bundle install
bundle exec ruby ../scripts/generate-ios-project.rb
bundle exec pod install --deployment
open SpeedyBird.xcworkspace
```

`Gemfile.lock` pins CocoaPods/project tooling; `Podfile.lock` pins native libraries. The Podfile includes the official Lynx Specs repository. The generator includes Swift sources, the bridge header, a shared scheme, the bundle, and the audio folder. Script sandboxing remains enabled.

`SpeedyBirdModule.swift` owns AVAudioPlayer instances and UserDefaults. `ViewController` maps the safe-area layout into the LynxView and pauses on application inactivity. Resume remains an explicit game action.

New Xcode releases reject deployment targets below 15, including old pod targets. The Podfile aligns them with this application's minimum. For Lynx SDK 4.1 only, newly diagnosed discarded-future results and deprecated UIKit calls remain visible warnings rather than build-stopping warnings-as-errors. Other compiler errors still fail the build.

CI builds a real **unsigned device archive** and verifies its game bundle before upload. It is not an IPA and is not directly installable; device distribution requires Apple signing configuration.

## Platform status and verification

The hosts implement audio/storage and reproducible builds. Browser testing proves browser behavior; native compilation proves interface/build compatibility. Native sound, touch latency, background/resume, safe areas, and resource cleanup still need a device session on the target hardware. Do not infer those results from a green bundle build.
