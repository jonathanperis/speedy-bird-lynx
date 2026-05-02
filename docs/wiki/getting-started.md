# Getting Started

## Prerequisites

- **Node.js** 18+ and **npm**
- **Java 17** and **Android SDK** (for Android builds)
- **Xcode 15+** and **CocoaPods** (for iOS builds)

## Quick Start

```bash
git clone https://github.com/jonathanperis/speedy-bird-lynx.git
cd speedy-bird-lynx
npm install
npm run dev
```

This starts the Rspeedy dev server with hot module replacement. The game is accessible at:

- **Web preview**: `http://localhost:3000/__web_preview?casename=main.web.bundle`
- **Lynx bundle**: `http://localhost:3000/main.lynx.bundle`

To view on a mobile device, open the Lynx bundle URL in [Lynx Explorer](https://github.com/lynx-family/lynx) or [Lynx Go](https://apps.apple.com/us/app/lynx-go-dev-explorer/id6743227790) (replace `localhost` with your machine's IP).

## Building for Production

```bash
npm run build
```

This outputs:

- `dist/main.lynx.bundle` — native bundle for Android/iOS
- `dist/main.web.bundle` — web bundle

## Android

```bash
npm run build
cp dist/main.lynx.bundle android/app/src/main/assets/
cd android && ./gradlew assembleDebug
```

The APK is at `android/app/build/outputs/apk/debug/app-debug.apk`. Install via `adb install` or transfer to your device.

For release builds with signing, see [CI/CD Pipeline](ci-cd-pipeline).

## iOS

> Requires Xcode and an Xcode project (.xcodeproj). See [Native Host Apps](native-host-apps) for setup instructions.

```bash
npm run build
cp dist/main.lynx.bundle ios/SpeedyBird/Resources/
cd ios && pod install
open SpeedyBird.xcworkspace
```

Build and run from Xcode on a simulator or device.

## Web (Standalone)

Open `docs/index.html` directly in any browser. This is a self-contained canvas-based version that requires no build step — the same version deployed to GitHub Pages.

## Project Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build (Lynx + Web bundles) |
| `cd android && ./gradlew assembleDebug` | Build debug Android APK |
| `cd android && ./gradlew assembleRelease` | Build release Android APK |
