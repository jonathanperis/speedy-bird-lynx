# Tasks: Lynx Port

## Task Dependency Graph

```
T1 (project init) ──→ T3 (constants) ──→ T5 (game engine) ──→ T8 (input) ──→ T10 (integration)
                  ──→ T4 (types)     ──→ T5                ──→ T9 (audio)  ──→ T10
T2 (sprites)      ──→ T6 (components)──→ T10
                  ──→ T7 (screens)   ──→ T10
```

T1 and T2 can run in parallel. T3+T4 depend on T1. T5 depends on T3+T4. T6+T7 depend on T2. T8+T9 depend on T5. T10 is final integration.

---

## T1: Initialize Lynx Project [R-SETUP-1, R-SETUP-2, R-SETUP-3]

**Do**: Scaffold a new Lynx ReactLynx project in `flappy-bird-lynx/` directory alongside the existing project.

**Steps**:
1. Run `npm create rspeedy@latest -- --template react-ts --dir flappy-bird-lynx`
2. Configure lynx.config.ts
3. Create directory structure: `src/components/`, `src/hooks/`, `src/audio/`, `assets/sprites/`, `assets/audio/`
4. Verify `npm run dev` starts without errors

**Verify**: Project builds and shows default Lynx template screen.

---

## T2: Extract & Prepare Sprites [R-ASSET-1, R-ASSET-2, R-ASSET-3]

**Do**: Extract individual sprites from the two sprite sheets and save as separate PNGs. Copy audio files.

**Sprites to extract from og-theme.png** (using coordinates from main.js):
- Background: imgX=0, imgY=0, w=276, h=228
- Ground: imgX=276, imgY=0, w=224, h=112
- Bird frame 0: imgX=276, imgY=114, w=34, h=24
- Bird frame 1: imgX=276, imgY=140, w=34, h=24
- Bird frame 2: imgX=276, imgY=166, w=34, h=24
- GetReady screen: imgX=0, imgY=228, w=174, h=160
- GameOver screen: imgX=174, imgY=228, w=226, h=158

**Sprites to extract from og-theme-2.png**:
- Top pipe: imgX=56, imgY=323, w=26, h=160
- Bottom pipe: imgX=84, imgY=323, w=26, h=160

**Steps**:
1. Write a Node.js script using `sharp` or `canvas` to slice sprites by coordinates
2. Run the script, output to `assets/sprites/`
3. Copy audio files to `assets/audio/`
4. Visually verify each sprite is correct

**Verify**: All PNGs exist and display correctly when opened.

---

## T3: Define Constants [R-PHYS-1, R-PHYS-2, R-PIPE-1 through R-PIPE-6, R-BG-1, R-GROUND-1]

**Do**: Create `src/constants.ts` with all game constants extracted from main.js.

**Values**:
- CANVAS: width=300, height=500
- BIRD: x=50, y_start=160, radius=12, fly=5.25, gravity=0.32, w=34, h=24
- PIPES: gap=85, dx=2, w=55, h=300, minY=-260, maxY=-40, spawn_interval=100
- GROUND: w=224, h=112, dx=2
- BG: w=276, h=228, dx=0.2
- ROTATION: up=-15, neutral=0, down=70 (in degrees)
- ANIMATION: getReady_interval=20, play_interval=4

**Verify**: File exports all constants with correct values matching main.js.

---

## T4: Define Types [R-STATE-1]

**Do**: Create `src/types.ts` with TypeScript types.

**Types**:
- `GameState = 0 | 1 | 2`
- `PipeData = { x: number; y: number; id: number }`
- `SoundName = 'flap' | 'score' | 'collision' | 'fall' | 'swoosh'`

**Verify**: Types compile without errors.

---

## T5: Game Engine Hook [R-STATE-1-5, R-BIRD-1-5, R-PHYS-1-5, R-PIPE-1-6, R-COLL-1-4, R-SCORE-1-4, R-BG-1-2, R-GROUND-1-2, R-PERF-1-3]

**Do**: Create `src/hooks/useGameEngine.ts` — the core game loop.

**Sections**:
1. All mutable state as `useRef()` (birdY, velocity, rotation, frame, pipes, score, bgX, groundX, gameState)
2. Element refs for all visual elements (birdRefs[4], pipeRefs, groundRef, bgRef, scoreRef, overlayRefs)
3. `tick()` function called via requestAnimationFrame:
   - updateBird(): apply gravity, velocity, clamp to bounds, update animation frame
   - updatePipes(): spawn at interval, scroll left, despawn off-screen, increment score
   - checkCollisions(): AABB for each pipe pair + ground
   - updateVisuals(): setNativeProps() on all element refs with new transforms
4. `handleTap()`: state machine transitions + flap
5. `start()`/`stop()`: manage RAF lifecycle
6. Return: refs object, handleTap, pipes array (React state for mount/unmount)

**Verify**: Hook compiles. Game loop starts/stops correctly. Physics values match original.

---

## T6: Visual Components [R-BIRD-1-4, R-PIPE-6, R-BG-2, R-GROUND-2, R-CONTAINER-1-2]

**Do**: Create all visual components that the engine manipulates.

**Components**:
1. `GameContainer.tsx` — 300x500 view, overflow:hidden, bg:#00bbc4, absolute positioning context
2. `Bird.tsx` — 4 stacked `<image>` elements (bird-0 through bird-2, plus bird-1 repeated), engine toggles via opacity
3. `Pipe.tsx` — receives ref, renders top + bottom `<image>` at correct offsets for gap
4. `Background.tsx` — 3 tiled background images, engine scrolls via translateX
5. `Ground.tsx` — 2 tiled ground images, engine scrolls via translateX
6. `ScoreDisplay.tsx` — `<text>` element for score during play, styled large white with shadow

**Verify**: Each component renders its image(s) at correct size when mounted statically.

---

## T7: Screen Overlays [R-STATE-2, R-STATE-4, R-SCORE-4]

**Do**: Create GetReady and GameOver overlay components.

1. `GetReadyScreen.tsx` — `<image>` centered in game area, shown when gameState=0
2. `GameOverScreen.tsx` — `<image>` centered, plus current/best score display, shown when gameState=2

**Verify**: Overlays show/hide correctly based on game state prop.

---

## T8: Input Handling [R-INPUT-1, R-INPUT-2]

**Do**: Wire tap and keyboard input to the game engine.

1. GameContainer receives `bindtap` calling engine's handleTap
2. For web: add global keydown listener for spacebar (keyCode 32)
3. Tap/spacebar triggers same logic: flap during play, state transition otherwise

**Verify**: Tapping and spacebar both trigger bird flap and state transitions.

---

## T9: Audio Module [R-AUDIO-1, R-AUDIO-2, R-AUDIO-3]

**Do**: Create audio interface and web fallback implementation.

1. `src/audio/audio.ts` — AudioModule interface with play(sound) method
2. `WebAudioModule` class — uses HTMLAudioElement for web target
3. `NativeAudioModule` stub — documents requireModule('AudioModule') pattern
4. Export a singleton based on platform detection

**Verify**: Audio plays on web target. Native stub compiles but logs warning.

---

## T10: Integration & Polish [all requirements]

**Do**: Wire everything together in App.tsx and verify full game flow.

1. App.tsx composes all components inside GameContainer
2. Engine hook connected to all component refs
3. Full game flow: getReady → tap → play → collision → gameOver → tap → getReady
4. Score tracking works across rounds, best score persists per session
5. Visual polish: title styling, description text, proper z-ordering
6. Test on Lynx Explorer (if available) and web

**Verify**: Complete game matches original gameplay. All acceptance criteria from spec.md pass.
