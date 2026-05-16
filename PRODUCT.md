# Product

## Register

brand

## Users

Speedy Bird serves two overlapping audiences:

- **Players** who arrive from GitHub Pages or a shared link and want a fast, instantly understandable browser game with low setup friction.
- **Developers and technical reviewers** who want to understand how a complete ReactLynx game is built, shipped, and documented across Web, iOS, and Android.

The page should work first as a playable arcade surface and second as a credible technical artifact. A visitor should be able to play within seconds, then discover the engine, source code, platform story, and documentation without leaving the visual world.

## Product Purpose

Speedy Bird is a Flappy Bird-inspired arcade game built with ReactLynx and TypeScript. Its product hook is simple: every pipe cleared increases the game speed, turning a familiar side-scroller into an escalating reflex challenge.

The website exists to:

1. get visitors playing quickly;
2. communicate the speed-scaling mechanic;
3. prove the project is a real cross-platform ReactLynx implementation;
4. guide developers into docs, source, builds, and architecture notes.

Success looks like users starting a run, understanding the `+1% per pipe` mechanic, trying for higher medals, and clicking through to documentation or GitHub when they want implementation details.

## Brand Personality

Playful, fast, technical, and arcade-native.

Speedy Bird should feel like a late-night arcade cabinet wrapped around a serious open-source build artifact. It can be charming and kinetic, but it should not become childish, noisy, or gimmicky. The tone is confident and direct: a familiar game with one sharp twist, implemented as a real cross-platform case study.

## Anti-references

- Generic SaaS landing pages wearing game colors.
- Glassmorphism as the default surface treatment.
- Gradient text as a hero shortcut.
- Dark mode with decorative glows as the only source of energy.
- Identical feature-card grids that flatten the arcade story.
- Terminal/developer cosplay that hides the playable game.
- Overly literal Flappy Bird cloning without a distinct Speedy Bird identity.
- Dense documentation pages that make the game feel secondary.

## Design Principles

1. **Play first, explain second.** The first action should be to start a run; documentation and architecture are supporting proof, not the initial burden.
2. **Make speed visible.** The increasing multiplier is the product’s unique idea. Treat it as a first-class visual system: HUD, timeline, thresholds, and medals.
3. **Use arcade structure, not arcade decoration.** Pipes, medals, scoreboards, cabinets, HUD panels, and manuals should organize content, not merely ornament it.
4. **Keep technical credibility in-world.** Docs, source, build notes, and architecture should feel like a builder’s manual or service panel from the same arcade cabinet.
5. **Commit to tactile pixels.** Prefer sharp panels, solid color, sprite-like shadows, and explicit state changes over soft glass, blurred surfaces, and generic glows.
6. **Respect motion sensitivity.** Motion should sell speed and play, not exhaust the user. Reduced-motion support is mandatory.

## Accessibility & Inclusion

Target WCAG AA for text contrast, keyboard navigation, focus visibility, and link/button affordances.

The game surface should provide accessible labels and instructions for keyboard, mouse, and touch. Decorative clouds, birds, particles, and pipe ornaments should be hidden from assistive technology. Motion-heavy treatments must honor `prefers-reduced-motion`; the page should remain understandable and playable without continuous animation.
