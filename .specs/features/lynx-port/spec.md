# Feature: Lynx Port — Flappy Bird

## Overview
Port the canvas-based Flappy Bird to a ReactLynx app using element-based rendering, preserving all gameplay mechanics and visual fidelity.

## Requirements

### Project Setup
- **R-SETUP-1**: Initialize a Lynx project with ReactLynx + TypeScript using `create rspeedy` template
- **R-SETUP-2**: Configure lynx.config.ts with @lynx-js/react-rsbuild-plugin
- **R-SETUP-3**: Establish project structure with components/, hooks/, assets/ directories

### Asset Preparation
- **R-ASSET-1**: Extract all individual sprites from og-theme.png (background, ground, bird frames, getReady screen, gameOver screen)
- **R-ASSET-2**: Extract all individual sprites from og-theme-2.png (top pipe, bottom pipe, digit sprites 0-9)
- **R-ASSET-3**: Copy audio files (sfx_wing.wav, sfx_point.wav, sfx_hit.wav, sfx_die.wav, sfx_swooshing.wav)

### Game Container
- **R-CONTAINER-1**: Root game view with fixed dimensions (300x500 logical pixels), overflow hidden
- **R-CONTAINER-2**: Background color #00bbc4 matching original
- **R-CONTAINER-3**: Centered on screen with title "FLAPPY BIRD" above

### Game States
- **R-STATE-1**: Three states: getReady (0), play (1), gameOver (2)
- **R-STATE-2**: Game starts in getReady state showing "get ready" overlay
- **R-STATE-3**: First tap transitions getReady → play
- **R-STATE-4**: Collision transitions play → gameOver, showing game over panel with scores
- **R-STATE-5**: Tap on gameOver transitions → getReady, resetting pipes and score

### Bird
- **R-BIRD-1**: Yellow bird with 4-frame wing animation (up, mid, down, mid cycle)
- **R-BIRD-2**: Positioned at x=50 with absolute positioning
- **R-BIRD-3**: Animation speed: every 20 frames on getReady, every 4 frames on play
- **R-BIRD-4**: Bird rotation: -15deg when rising, 0deg at neutral, 70deg when falling fast
- **R-BIRD-5**: On getReady, bird sits at y=160 with slow wing animation, no gravity

### Physics
- **R-PHYS-1**: Gravity constant: 0.32 per frame added to velocity
- **R-PHYS-2**: Flap sets velocity to -5.25
- **R-PHYS-3**: Bird y-position updated by velocity each frame
- **R-PHYS-4**: Bird cannot go above canvas top (y clamped to radius)
- **R-PHYS-5**: Bird hitting ground triggers gameOver

### Pipes
- **R-PIPE-1**: Pipes spawn every 100 frames off the right edge
- **R-PIPE-2**: Each pipe pair has a constant gap of 85px
- **R-PIPE-3**: Pipe y-position randomized between -260 and -40
- **R-PIPE-4**: Pipes scroll left at 2px per frame
- **R-PIPE-5**: Pipes removed when they exit left edge (x < -pipe_width)
- **R-PIPE-6**: Pipe dimensions: 55px wide, 300px tall

### Collision Detection
- **R-COLL-1**: AABB collision between bird (center ± radius) and top pipe bounds
- **R-COLL-2**: AABB collision between bird and bottom pipe bounds
- **R-COLL-3**: Collision with ground (bird bottom >= canvas_height - ground_height)
- **R-COLL-4**: On collision: set gameOver state, update best score if needed

### Score
- **R-SCORE-1**: Score increments by 1 when pipe exits left edge
- **R-SCORE-2**: Score displayed centered near top during play (using digit sprite images or <text>)
- **R-SCORE-3**: Best score tracked per session (not persisted to storage)
- **R-SCORE-4**: Current and best score shown on gameOver panel

### Background & Ground
- **R-BG-1**: Background image scrolls slowly (0.2px/frame) during play, static on getReady
- **R-BG-2**: Background tiles to fill 300px width (repeat)
- **R-GROUND-1**: Ground scrolls at pipe speed (2px/frame) during play
- **R-GROUND-2**: Ground tiles to fill width, continuous loop

### Input
- **R-INPUT-1**: Tap anywhere on game area triggers flap (during play) or state transition
- **R-INPUT-2**: Spacebar triggers same actions as tap

### Audio (Stubs)
- **R-AUDIO-1**: Audio module interface defined for: flap, score, collision, fall, swoosh
- **R-AUDIO-2**: Web platform implementation using HTML5 Audio as fallback
- **R-AUDIO-3**: Native module stubs documented for Android (Java) and iOS (ObjC)

### Performance
- **R-PERF-1**: Game loop via requestAnimationFrame (not setInterval)
- **R-PERF-2**: Element positions updated via setNativeProps() or refs, not React state
- **R-PERF-3**: Maintain 60fps on target devices

## Acceptance Criteria
1. Game plays identically to the original canvas version
2. All 3 game states work with correct transitions
3. Bird physics feel identical (same gravity, flap strength, rotation)
4. Pipes spawn, scroll, and despawn correctly
5. Collision detection works for all cases (pipes, ground, ceiling)
6. Score tracks and displays correctly
7. App runs on Lynx Explorer (Android/iOS) and web
