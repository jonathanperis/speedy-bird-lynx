---
name: GitHub Repo Configuration
description: Branch protection, rulesets, topics, releases, and CI/CD status for speedy-bird-lynx
type: project
---

## Branch Protection (main)

- `required_linear_history`: enabled (rebase-only merges)
- `allow_force_pushes`: disabled
- `allow_deletions`: disabled
- Active ruleset: `main`

Always rebase before merge. Never force-push to `main`.

## Repository Topics

android, bytedance, cross-platform, flappy-bird, game, ios, lynx, native-ui, reactlynx, rspeedy, typescript

## Release Strategy

- Semver tags: `v*`
- Only `release.yml` publishes; manual runs create `sandbox-*` prereleases.
- Publishing requires checks, signed Android artifact validation, and an actual unsigned iOS archive.
- Complete bundle/web-host distributions include required resource payloads.

## CI/CD Workflows

| File | Purpose |
|------|---------|
| `ci.yml` | Root/docs checks, behavior tests, builds, assets, distributions |
| `codeql.yml` | Security analysis (push/PR to main + weekly) |
| `deploy.yml` | Pinned-toolchain game/docs checks followed by Pages deployment |
| `build-android.yml` | Reusable debug-signed or explicitly release-signed APK build |
| `build-ios.yml` | Reproducible generated host project and real unsigned archive |
| `release.yml` | Full release pipeline for `v*` tags/manual dispatch |

## Notable Config

- Dependabot: weekly npm and GitHub Actions updates
- GitHub Pages: deploys the Astro site in `docs/`
- Wiki pages: Markdown lives in `docs/wiki/` and renders into the `docs/` route tree
