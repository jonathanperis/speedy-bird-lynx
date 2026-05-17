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
- Auto-build tags: `build/0.0.0-{sha}` created by CI on main pushes
- Release assets can include APK, Lynx bundle, web bundle, and iOS archive when available

## CI/CD Workflows

| File | Purpose |
|------|---------|
| `ci.yml` | Type check + build (manual, push/PR paths) |
| `codeql.yml` | Security analysis (push/PR to main + weekly) |
| `deploy.yml` | GitHub Pages deployment through shared reusable workflow |
| `build-android.yml` | Release APK build + GitHub Release |
| `build-ios.yml` | iOS archive when Xcode project exists |
| `release.yml` | Full release pipeline for `v*` tags/manual dispatch |

## Notable Config

- Dependabot: weekly npm and GitHub Actions updates
- GitHub Pages: deploys the Astro site in `docs/`
- Wiki pages: Markdown lives in `docs/wiki/` and renders into the `docs/` route tree
