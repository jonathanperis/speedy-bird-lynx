---
name: Speedy Bird
description: A retro arcade ReactLynx Flappy Bird variant where every pipe makes the game faster.
colors:
  sky-deep: "#04111e"
  sky-mid: "#0a2a4a"
  sky-surface: "#0d1e3a"
  sky-dawn: "#0d4a7a"
  arcade-gold: "#ffd166"
  speed-orange: "#ff6b35"
  pipe-green: "#2d6a4f"
  pipe-highlight: "#4a9e6f"
  text-bright: "#e8f8ff"
  text-dim: "#6ba8c8"
  panel-blue: "#0a1e3c"
  stroke-dark: "#07131f"
typography:
  display:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "clamp(3.5rem, 10vw, 8rem)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 4rem)"
    fontWeight: 900
    lineHeight: 1.05
  title:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.2
  body:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.12em"
rounded:
  pixel: "4px"
  panel: "16px"
  pill: "999px"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2.5rem"
  xl: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.arcade-gold}"
    textColor: "{colors.stroke-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "1rem 2.5rem"
  card-panel:
    backgroundColor: "{colors.panel-blue}"
    textColor: "{colors.text-bright}"
    rounded: "{rounded.panel}"
    padding: "1.5rem"
  hud-chip:
    backgroundColor: "{colors.sky-surface}"
    textColor: "{colors.arcade-gold}"
    rounded: "{rounded.pixel}"
    padding: "0.75rem 1rem"
---

# Design System: Speedy Bird

## 1. Overview

**Creative North Star: "The Night Arcade Cabinet"**

Speedy Bird is a playable night-sky arcade cabinet, not a generic project page with game decoration. The system should feel like a familiar Flappy-style world sharpened around one escalating mechanic: every pipe makes the run faster. The page uses deep sky blues, pipe greens, arcade gold, and speed orange to stage a small but energetic game world.

The design should keep the current retro arcade and pixel-game aesthetic, then make it more structural. Pipes should divide space. Medals should become achievement slots. Documentation should feel like a builder's manual or service panel. HUD elements should explain the game faster than paragraphs can.

The system explicitly rejects generic SaaS landing pages, decorative glassmorphism, gradient-text hero shortcuts, dark-mode glows as the main visual idea, and identical card grids. If a section could belong to any modern developer landing page after changing the colors, it is not Speedy Bird enough.

**Key Characteristics:**

- Deep night-sky surfaces with arcade gold and speed orange accents.
- Pixel-inspired outlines, tactile buttons, HUD chips, scoreboards, and medal slots.
- Play-first hierarchy: the run, multiplier, controls, and medals come before explanatory density.
- Technical credibility framed as an in-world builder's manual.
- Motion that suggests speed, but stops cleanly for reduced-motion users.

## 2. Colors

The palette is a committed night arcade palette: saturated enough to feel like a game, disciplined enough to support documentation and code reading.

### Primary

- **Deep Night Sky** (`sky-deep`): the page background and outermost atmosphere.
- **Arcade Gold** (`arcade-gold`): primary action, medals, key HUD highlights, and scarce emphasis.
- **Speed Orange** (`speed-orange`): multiplier, danger, acceleration, and the visual language of increasing difficulty.

### Secondary

- **Pipe Green** (`pipe-green`): pipes, obstacle framing, progress dividers, and mechanical section separators.
- **Pipe Highlight** (`pipe-highlight`): bevels, sprite highlights, and active pipe accents.

### Neutral

- **Sky Mid** (`sky-mid`): large surface gradients and intermediate atmospheric depth.
- **Sky Surface** (`sky-surface`): HUD chips, panels, and quieter containers.
- **Text Bright** (`text-bright`): primary text on dark surfaces.
- **Text Dim** (`text-dim`): secondary explanations and metadata.
- **Stroke Dark** (`stroke-dark`): pixel outlines and button shadows. Use it instead of pure black for large fills.

### Named Rules

**The Gold Is the Button Rule.** Arcade Gold is reserved for action, achievement, and critical HUD state. Do not use it as generic decoration across every card.

**The Orange Means Speed Rule.** Speed Orange means acceleration, danger, or multiplier. If orange appears, it should teach the player something about intensity.

**The No Pure Fill Rule.** Pure black and pure white are allowed only as tiny sprite-like strokes when preserving pixel-art language. Large surfaces must use tinted night-sky tokens.

## 3. Typography

**Display Font:** Nunito with system sans fallback.  
**Body Font:** Space Grotesk with system sans fallback.  
**Label/Mono Font:** Use Nunito labels or a deliberately chosen arcade/scoreboard face in a future pass; do not add casual monospace by reflex.

**Character:** The current pairing is rounded, approachable, and readable. It works for a playful game, but the overhaul should strengthen the title, numbers, and medals with a more arcade-specific display treatment rather than leaning on generic modern sans styling.

### Hierarchy

- **Display** (900, `clamp(3.5rem, 10vw, 8rem)`, 1): hero title and rare marquee moments only.
- **Headline** (900, `clamp(2rem, 5vw, 4rem)`, 1.05): major sections such as Rules, Medal Cabinet, Builder's Manual.
- **Title** (800, `1.25rem`, 1.2): component titles, docs entries, HUD module headings.
- **Body** (400, `1rem`, 1.6): explanatory text, capped at 65-75ch.
- **Label** (800, `0.75rem`, 0.12em tracking): short HUD labels, nav labels, stat captions, and medal metadata.

### Named Rules

**The Scoreboard Number Rule.** Multipliers, scores, medal thresholds, and pipe counts must be visually stronger than their labels. The game is understood through numbers.

**The No Costume Mono Rule.** Do not use monospace as a lazy signal for technical credibility. Use it only for real code or command snippets in the builder manual.

## 4. Elevation

Speedy Bird should use a hybrid of flat pixel layering and rare responsive shadows. Resting surfaces are mostly flat: depth comes from strokes, bevel-like color steps, pipe geometry, and sprite shadows. Shadows appear for active controls, cabinet depth, and playable-device framing, not as generic dark-mode glow.

### Shadow Vocabulary

- **Button Press Shadow** (`0 4px 0 #07131f`): tactile arcade buttons and pressed states.
- **Cabinet Depth** (`0 24px 60px rgba(4, 17, 30, 0.55)`): the embedded play device or major cabinet panel only.
- **HUD Glow** (`0 0 0 3px rgba(255, 209, 102, 0.18)`): focus-visible rings and selected HUD state, never decorative ambient glow.

### Named Rules

**The No Ambient Glow Rule.** Glows must explain state: focus, active, selected, or danger. Decorative glow on dark surfaces is prohibited.

**The Pixel Layer Rule.** Prefer hard offsets, strokes, and stepped color ramps over blurred glass and floating cards.

## 5. Components

### Buttons

- **Shape:** tactile arcade controls, currently pill-shaped (`999px`), but overhaul variants should test chunkier pixel buttons (`4px`) with hard outlines.
- **Primary:** Arcade Gold background with Stroke Dark text, uppercase label, heavy weight, generous horizontal padding.
- **Hover / Focus:** move by transform only; focus uses an explicit HUD Glow ring. Do not animate padding, width, or layout properties.
- **Pressed:** shift down into its hard shadow like an arcade cabinet button.

### HUD Chips

- **Style:** compact panels with Sky Surface background, Arcade Gold or Speed Orange numbers, and short uppercase labels.
- **State:** active/danger chips use Speed Orange; achievement chips use Arcade Gold; inactive chips use Text Dim.
- **Usage:** speed multiplier, `+1% / pipe`, current score, controls, and medal thresholds.

### Cards / Containers

- **Corner Style:** panel radius (`16px`) for current surfaces; pixel-panel variants may use small radius (`4px`) with a visible stroke.
- **Background:** Panel Blue or Sky Surface. Avoid translucent glass as the default.
- **Shadow Strategy:** flat at rest, hard offset or cabinet depth only for signature modules.
- **Border:** pipe-green, arcade-gold, or dark pixel stroke, chosen for meaning rather than decoration.
- **Internal Padding:** `1.5rem` to `2.5rem`, with varied rhythm instead of identical grids.

### Inputs / Fields

The landing page has no form fields. If fields are added later, they should look like arcade service-panel controls: dark navy fill, clear stroke, large focus ring, and non-color-only validation.

### Navigation

Navigation should feel like a HUD or cabinet tab bar. The current glass pill should be treated as transitional. Preferred variants use a dark navy panel, gold active indicator, pipe/coin separators, and visible focus states. Keep labels short: Play, Rules, Build, Docs, GitHub.

### Play Surface

The embedded canvas is a protected game subsystem. Style the frame, controls, labels, and surrounding panel without changing gameplay logic unless explicitly scoped. The canvas requires an accessible label and clear keyboard/mouse/touch instructions.

### Medal Cabinet

Medals should read as achievements, not badges floating in a row. Use locked/unlocked slots, score thresholds, multiplier context, and a challenge CTA such as `Try for Platinum`.

### Builder's Manual

Technical docs should appear as a builder's manual or arcade service panel: grouped routes, short descriptions, source links, and occasional real command snippets. Do not bury technical credibility under generic cards.

## 6. Do's and Don'ts

### Do:

- **Do** keep the night-sky, bird, pipe, medal, and arcade-gold identity intact.
- **Do** make the speed multiplier visually central through HUD chips, timelines, and threshold markers.
- **Do** use pipes, scoreboards, medals, and cabinet panels as structure, not decoration.
- **Do** cap body copy at 65-75ch and let numbers carry the game mechanic.
- **Do** add `prefers-reduced-motion` behavior for clouds, particles, CTA pulse, pipe sway, and reveal animations.
- **Do** use focus-visible rings that are as intentional as hover states.
- **Do** keep docs and GitHub links visible, but frame them as a builder's manual.

### Don't:

- **Don't** turn the page into a generic SaaS landing page wearing game colors.
- **Don't** use gradient text for the hero title or major headings.
- **Don't** use glassmorphism as the default surface treatment.
- **Don't** rely on dark glows as the main source of visual energy.
- **Don't** repeat identical feature-card grids when a game-native module would communicate better.
- **Don't** use pure black or pure white as large fills; reserve them for tiny sprite strokes only.
- **Don't** animate layout properties such as width, padding, or margin.
- **Don't** hide primary play or contact actions behind novelty interactions.
- **Don't** use monospace as developer cosplay; use it for real code only.
