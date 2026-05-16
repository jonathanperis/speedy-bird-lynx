---
target: docs/src/pages/index.astro
total_score: 27
p0_count: 0
p1_count: 3
timestamp: 2026-05-16T22-24-28Z
slug: docs-src-pages-index-astro
---
# Speedy Bird Website Critique and Overhaul Plan

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 3 | Speed multiplier is visible, but users may not know whether it is live, decorative, or gameplay state. |
| 2 | Match System / Real World | 3 | Retro arcade metaphors mostly work, but glass/pill/card UI drifts toward generic modern landing-page language. |
| 3 | User Control and Freedom | 3 | Inline play is reachable, but CTA destination semantics are mixed between scroll-to-play and start-game. |
| 4 | Consistency and Standards | 2 | Two homepage implementations and duplicated CSS create inconsistent design source of truth. |
| 5 | Error Prevention | 2 | Canvas/game controls lack strong accessible labeling and reduced-motion safeguards. |
| 6 | Recognition Rather Than Recall | 3 | Navigation and sections are understandable, but Docs vs Full Docs and speed mechanic details could be clearer. |
| 7 | Flexibility and Efficiency | 3 | Space/click/tap instructions help, but primary route for play is not optimized. |
| 8 | Aesthetic and Minimalist Design | 2 | Strong theme above the fold; lower sections rely on repeated card grids and sparse scroll rhythm. |
| 9 | Error Recovery | 2 | Game/canvas states are not communicated well outside visual play. |
| 10 | Help and Documentation | 4 | Docs links and repo links are prominent and useful. |
| **Total** | | **27/40** | **Solid foundation, needs identity hardening and structural cleanup.** |

## Anti-Patterns Verdict

The site does not look like generic SaaS, which is good. It has a recognizable Speedy Bird world: night sky, pipes, bird, yellow arcade CTA, embedded playable canvas, medals, and docs. But it still carries common AI/landing-page tells: gradient text, dark glows, backdrop-blur glass, overused fonts, repeated feature/doc card grids, bounce easing, and layout-property transitions. The right move is not a new aesthetic. It is to make the existing aesthetic more committed: arcade title screen, HUD panels, scoreboards, medal cabinet, pixel/stroke language, and a more intentional scroll journey.

## Overall Impression

The first fold works: the name, premise, and play CTA are clear. The largest opportunity is to transform the page from "Flappy Bird-themed project page" into "playable arcade cabinet plus builder manual." The current page explains the game, but the overhaul should let the game system explain itself.

## What's Working

1. **Immediate recognizability:** bird, pipes, sky, and yellow CTA instantly communicate Flappy Bird-inspired arcade play.
2. **Playable proof:** embedding the canvas makes the page more than a marketing page.
3. **Technical credibility:** documentation, GitHub, architecture, engine, and asset links are accessible and useful.

## Priority Issues

### [P1] The core speed mechanic is under-dramatized
**Why it matters:** The differentiator is not "Flappy Bird clone," it is "every pipe makes it faster." Current treatment is a badge, paragraph, and bar.
**Fix:** Create an arcade HUD/difficulty timeline: 1.00x Normal, 1.25x Panic, 1.50x Gold, 2.00x Platinum, with pipe ticks and medals.

### [P1] CTA intent is ambiguous
**Why it matters:** `TAP TO PLAY ↓` reads as both a click action and a scroll instruction; on desktop, "tap" is less natural.
**Fix:** Use `START RUN` or `PLAY NOW`, with a sublabel `Space / Click / Tap`. Separate scroll and play actions if testing a dedicated play route.

### [P1] Visual language is split between retro arcade and modern soft UI
**Why it matters:** Smooth gradient title, glass nav, glows, and rounded cards weaken the pixel arcade identity.
**Fix:** Replace with solid title color plus pixel outline/shadow, sharper panels, deep navy fills, pipe-green/gold strokes, and sprite-like button states.

### [P2] Repeated card grids flatten the narrative
**Why it matters:** Feature cards and docs cards are understandable, but they feel templated and reduce the game-world illusion.
**Fix:** Replace with varied modules: medal cabinet, controls panel, builder manual, difficulty meter, engine schematic, and docs map.

### [P2] Implementation structure blocks clean A/B testing
**Why it matters:** `docs/src/pages/index.astro` is a 1,500+ line standalone page with duplicated CSS and unused componentized homepage files. Variant work will be brittle.
**Fix:** Pick one source of truth, ideally `BaseLayout + home/*` components or a dedicated `home.css`, then remove dead/duplicated CSS.

### [P2] Motion/accessibility baseline is incomplete
**Why it matters:** Clouds, particles, bird, pipe sway, CTA pulse, reveal transitions, and width transitions run without a visible reduced-motion strategy.
**Fix:** Add `prefers-reduced-motion`, explicit focus-visible states, canvas labels, and transform-based animation for meters.

## A/B and Variant Testing Plan

### Test 1: CTA wording and destination
- **Hypothesis:** A game-native CTA will improve first play starts.
- **A/control:** `TAP TO PLAY ↓` scrolls to embedded canvas.
- **B:** `START RUN` with `Space / Click / Tap` sublabel, scrolls to embedded canvas.
- **C:** `PLAY NOW` opens/links to a dedicated play route; secondary `See how it works` scrolls.
- **Primary metric:** CTA click rate, game start rate, first flap rate.
- **Recommendation:** Try B first because it preserves current inline-play architecture while clarifying intent.

### Test 2: Hero identity treatment
- **Hypothesis:** A harder arcade title screen will feel more distinctive than modern gradient text.
- **A/control:** Current centered hero with gradient title and glowing CTA.
- **B:** Solid pale-cyan/off-white title, dark pixel outline, gold offset shadow, chunky arcade button.
- **C:** Full cabinet marquee: title in a framed sign, bird fly-by, HUD chips for `+1% / pipe`, `100 = platinum`.
- **Primary metric:** CTA click rate, bounce rate, qualitative brand-fit review.
- **Recommendation:** B first. C is stronger but more implementation-heavy.

### Test 3: Speed mechanic comprehension
- **Hypothesis:** A visual difficulty track will make the unique mechanic clear faster than paragraph copy.
- **A/control:** Paragraph + speed meter + medal row.
- **B:** Horizontal difficulty track with pipe ticks, bird marker, multiplier zones, medal thresholds.
- **C:** Vertical Flappy path where each content section is a milestone: Bronze, Silver, Gold, Platinum.
- **Primary metric:** Scroll depth to About, post-About play clicks, users who can describe the mechanic in feedback.
- **Recommendation:** B first for clearer comprehension and lower layout risk.

### Test 4: Medal motivation
- **Hypothesis:** Making medals feel like locked achievements will increase repeat starts.
- **A/control:** Static medal row.
- **B:** `MEDAL CABINET` with four slots, score/multiplier threshold, locked/unlocked visual states.
- **C:** Challenge prompt after first game over: `Try for Silver`, `Try for Gold`, `Try for Platinum`.
- **Primary metric:** second-run rate, time on page, play restarts.
- **Recommendation:** B during landing overhaul; C later if instrumentation exists in-game.

### Test 5: Docs presentation
- **Hypothesis:** A builder-manual metaphor will preserve technical credibility without leaving the arcade world.
- **A/control:** Current docs card grid.
- **B:** `BUILDER'S MANUAL` with 4 grouped routes: Play, Engine, Native Hosts, Ship/CI.
- **C:** Arcade service-panel layout with tabs and short command snippets.
- **Primary metric:** docs click-through, GitHub click-through, depth into docs pages.
- **Recommendation:** B first. It is clearer and less gimmicky.

### Test 6: Motion intensity
- **Hypothesis:** Less decorative motion plus better attract-mode moments will feel more polished and reduce fatigue.
- **A/control:** Current clouds, particles, bird, sway, pulse, reveals.
- **B:** Reduced baseline: keep bird/cloud parallax, remove CTA pulse and pipe sway, add reduced-motion support.
- **C:** Attract mode: orchestrated hero entrance and idle bird/pipes only, no constant section motion.
- **Primary metric:** engagement, scroll depth, performance, reduced-motion compliance.
- **Recommendation:** B as the accessibility baseline; C as the polish variant.

## Implementation Shape

1. Sync source of truth: choose the live `index.astro` path or migrate to `BaseLayout + home components`.
2. Extract tokens and home CSS; remove duplicated/dead styles.
3. Normalize fonts and loading; avoid stray unloaded Inter/JetBrains references.
4. Replace generic soft UI with arcade system pieces: HUD chips, medal cabinet, builder manual, pixel buttons.
5. Add accessibility and motion baselines.
6. Then implement A/B variants with class/data-attribute toggles instead of one-off inline edits.

## Source Notes

- Build passed with `mise exec -- bun run build` in `docs/`.
- Local visual inspection used `http://127.0.0.1:4330/`.
- Detector found overused fonts, gradient text, pure black fills, bounce easing, layout transitions, and dark glow warnings.
- Impeccable live overlay server was unavailable in this environment: `Warning: cannot access live`.
