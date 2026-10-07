---
name: GitHub Repo Configuration
description: Branch protection, rulesets, topics, releases, and CI/CD status for speedy-bird-lynx
type: project
---

## Branch Protection (main)

- `required_linear_history`: enabled (rebase-only merges)
- `allow_force_pushes`: disabled
- `allow_deletions`: disabled
- Active ruleset: `main` (required checks: `build`, `android`, `docs`, `Analyze (javascript-typescript)`, `Analyze (actions)`, `CodeQL`; renaming those jobs requires updating the ruleset)

Always rebase before merge. Never force-push to `main`.

## Repository Topics

Read current topics and About metadata with `gh repo view --json description,homepageUrl,repositoryTopics`. Avoid maintaining a second mutable topic list here.

## Release Strategy

- Semver tags: `v*`
- Auto-build tags: `build/0.0.0-{sha}` created after Build Check passes on main pushes; published as prereleases that never become "Latest"
- Release assets can include APK, Lynx bundle, web bundle, and iOS archive when available

## CI/CD Workflows

| File | Purpose |
|------|---------|
| `ci.yml` | Audits, Biome, type check, bundles/web host/docs, site validation, Android build/lint, APK bundle verification; calls `build-android.yml` after main pushes pass |
| `codeql.yml` | Security analysis for JS/TS, Actions, Python, Kotlin (push/PR to main + weekly) |
| `deploy.yml` | GitHub Pages deployment through shared reusable workflow |
| `build-android.yml` | Build prerelease (`build/*`), called by CI or dispatched from main |
| `build-ios.yml` | Manual unsigned iOS archive |
| `release.yml` | Versioned release pipeline for `v*` tags on main/manual dispatch from main |
| `reusable-android-apk.yml`, `reusable-ios-archive.yml` | Shared APK/archive builds |

## Notable Config

- Renovate (`renovate.json`, shared preset + repo holds) opens dependency PRs; GitHub Dependabot security alerts are also enabled
- GitHub Pages: deploys the Astro site in `docs/`
- Wiki pages: Markdown lives in `docs/wiki/` and renders into the `docs/` route tree
