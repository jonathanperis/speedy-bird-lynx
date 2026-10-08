# Product

## Register

brand

## Users

Speedy Bird serves two overlapping audiences:

- **Players** who arrive from GitHub Pages or a shared link and want a fast, instantly understandable browser game with low setup friction.
- **Developers and technical reviewers** who want to understand how a complete ReactLynx game is built, shipped, and documented: a browser build on GitHub Pages, an Android host, and an iOS host app built from source in Xcode (it is not distributed through an app store).

The page should work first as a playable game and second as a credible technical artifact. A visitor should be able to play within seconds, then discover the engine, source code, platform story, and documentation without leaving the game's world.

## Product Purpose

Speedy Bird is a Flappy Bird-inspired arcade game built with ReactLynx and TypeScript. Its product hook is simple: every pipe cleared increases the game speed, turning a familiar side-scroller into an escalating reflex challenge.

The website exists to:

1. get visitors playing quickly;
2. communicate the speed-scaling mechanic;
3. prove the project is a real cross-platform ReactLynx implementation;
4. guide developers into docs, source, builds, and architecture notes.

Success looks like users starting a run, understanding the `+1% per pipe` mechanic, trying for higher medals, and clicking through to documentation or GitHub when they want implementation details.

## Brand Personality

Playful, fast, precise.

Speedy Bird is a bright daytime game with one sharp twist, documented like the timing sheet of a race: real numbers, plain sentences, nothing invented. It can be charming, but it should not become childish, noisy, or gimmicky. The tone is confident and direct, written in the first person by the person who built it.

## Anti-references

- Generic SaaS landing pages wearing game colors.
- Glassmorphism as the default surface treatment.
- Gradient text as a hero shortcut.
- Dark navy with decorative glows, eyebrow badges, and stat cards (the previous "night arcade cabinet" site).
- Identical feature-card grids that flatten the arcade story.
- Terminal/developer cosplay, or in-world jargon ("service manual", "cabinet") that hides what the page is.
- Overly literal Flappy Bird cloning without a distinct Speedy Bird identity.
- Dense documentation pages that make the game feel secondary.

## Design Principles

1. **Play first, explain second.** The game is the first screen, on every device; documentation and architecture are supporting proof.
2. **Make speed visible as data.** The `+1% per pipe` mechanic is shown as a live timing panel and as a speed table computed from the engine, not as slogans.
3. **Build the site from the game.** Colors, marks, and dividers come from the real sprites; nothing decorative is invented.
4. **Show the engineering.** Real source excerpts and diagrams of what runs where replace marketing paragraphs; every number says where it comes from.
5. **Editorial, not promotional.** Sentence case, numbered sheets and articles, ruled tables, underlined links, square corners, no glows or gradients.
6. **Respect motion sensitivity.** Only the game moves; reduced-motion support is mandatory.

See `DESIGN.md` for the visual system and the rollout plan.

## Accessibility & Inclusion

Target WCAG AA for text contrast, keyboard navigation, focus visibility, and link/button affordances.

The game surface should provide accessible labels and instructions for keyboard, mouse, and touch. Decorative clouds, birds, particles, and pipe ornaments should be hidden from assistive technology. Motion-heavy treatments must honor `prefers-reduced-motion`; the page should remain understandable and playable without continuous animation.
