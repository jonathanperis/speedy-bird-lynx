# Getting Started

## Prerequisites

- **Node.js** 18+ and **Bun** (CI and lockfiles use Bun; npm scripts also work)
- **Java 17** and **Android SDK** (for Android builds)
- **Xcode 15+** and **CocoaPods** (for iOS builds)

## Quick Start

```bash
git clone https://github.com/jonathanperis/speedy-bird-lynx.git
cd speedy-bird-lynx
bun install
bun run dev
```

This starts the Rspeedy dev server with hot module replacement. The game is accessible at:

- **Web preview**: `http://localhost:3000/__web_preview?casename=main.web.bundle`
- **Lynx bundle**: `http://localhost:3000/main.lynx.bundle`

To view on a mobile device, open the Lynx bundle URL in [Lynx Explorer](https://github.com/lynx-family/lynx) or [Lynx Go](https://apps.apple.com/us/app/lynx-go-dev-explorer/id6743227790) (replace `localhost` with your machine's IP).

## Building for Production

```bash
bun run build
```

This outputs:

- `dist/main.lynx.bundle` — native bundle for Android/iOS
- `dist/main.web.bundle` — web bundle

## Android

```bash
bun run build
cp dist/main.lynx.bundle android/app/src/main/assets/
cd android && ./gradlew assembleDebug
```

The APK is at `android/app/build/outputs/apk/debug/app-debug.apk`. Install via `adb install` or transfer to your device.

For release builds with signing, see [CI/CD Pipeline](/speedy-bird-lynx/docs/ci-cd-pipeline/).

## iOS

> Requires Xcode and an Xcode project (.xcodeproj). See [Native Host Apps](/speedy-bird-lynx/docs/native-host-apps/) for setup instructions.

```bash
bun run build
cp dist/main.lynx.bundle ios/SpeedyBird/Resources/
cd ios && pod install
open SpeedyBird.xcworkspace
```

Build and run from Xcode on a simulator or device.

## Web / GitHub Pages

The public web surface is the Astro site in `docs/`. It renders the landing page, embeds the playable canvas demo, and generates wiki pages from `docs/wiki/*.md`.

```bash
cd docs
bun install
bun run dev
```

For a production build:

```bash
bun run build
bun run preview
```

The static output is written to `docs/out/` and is deployed to GitHub Pages by the shared Pages workflow.

## Project Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Rspeedy dev server with HMR |
| `bun run build` | Production build (Lynx + Web bundles) |
| `cd docs && bun run dev` | Start Astro docs/dev site |
| `cd docs && bun run build` | Build Astro GitHub Pages output to `docs/out/` |
| `cd android && ./gradlew assembleDebug` | Build debug Android APK |
| `cd android && ./gradlew assembleRelease` | Build release Android APK |
