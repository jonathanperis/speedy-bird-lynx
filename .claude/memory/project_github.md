---
name: GitHub Repo Configuration
description: Branch protection, rulesets, topics, releases, and CI/CD status for speedy-bird-lynx
type: project
---

## Branch Protection (main)

- `required_linear_history`: enabled (rebase-only merges)
- `allow_force_pushes`: disabled
- `allow_deletions`: disabled
- `enforce_admins`: disabled
- Active ruleset: "main" (ID 14604954, enforcement: active)

**Why:** Linear history for clean git log, no force pushes to protect main.

**How to apply:** Always rebase before merge. Never force-push to main.

## Repository Topics

android, bytedance, cross-platform, flappy-bird, game, ios, lynx, native-ui, reactlynx, rspeedy, typescript

## Release Strategy

- Semver tags: v1.0.0, v1.1.0
- Auto-build tags: build/0.0.0-{sha} (created by CI on every main push)
- Release assets: APK, Lynx bundle, web bundle, iOS xcarchive

## CI/CD Workflows (7 total)

| File | Purpose |
|------|---------|
| ci.yml | Type check + build (push/PR to main) |
| codeql.yml | Security analysis (push/PR to main + weekly) |
| deploy-web.yml | GitHub Pages deployment |
| deploy-docs.yml | Wiki-to-HTML docs generation via PR |
| build-android.yml | Signed APK build + GitHub Release |
| build-ios.yml | iOS archive (unsigned, v* tags) |
| release.yml | Full release pipeline (v* tags) |

## Notable Config

- Dependabot: weekly npm + github-actions updates
- GitHub Pages: deploys docs/ directory
- Wiki: exists with 8 pages, auto-generated to docs/docs/
