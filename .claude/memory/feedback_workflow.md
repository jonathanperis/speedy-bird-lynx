---
name: Git Workflow Preferences
description: Branch+PR strategy, rebase-only merges, gh CLI required, no repo-wide files in this repo
type: feedback
---

All changes to this repo must use a branch + PR strategy. Never commit directly to main.

**Why:** User enforces clean git history and code review on all changes.

**How to apply:** Always create a feature/fix/docs branch, push it, and open a PR via `gh pr create`. Never push directly to main.

---

PRs are rebase-only. Do not use merge commits or squash merges.

**Why:** User preference for linear git history.

**How to apply:** When merging or advising on PRs, always use rebase strategy. The repo has `required_linear_history` enabled on main branch protection.

---

Always use `gh` CLI for all GitHub operations (repos, PRs, checks, merges, releases, issues, etc.) instead of curl/HTTP API calls or web UI.

**Why:** User preference — consistent, scriptable, and auditable.

**How to apply:** For any GitHub operation (create PR, check status, list issues, create release), use `gh` commands.

---

Repo-wide files (SECURITY.md, CODE_OF_CONDUCT.md, CONTRIBUTING.md, FUNDING.yml, issue templates, PR templates, CODEOWNERS) live in the user's `.github` repo, not in individual project repos.

**Why:** GitHub automatically inherits these from the `.github` community health repo. Duplicating them creates maintenance burden and was already cleaned up once (commit 5c4f1d7).

**How to apply:** Never create SECURITY.md, CODE_OF_CONDUCT.md, CONTRIBUTING.md, FUNDING.yml, issue/PR templates, or CODEOWNERS in this repo. If the user needs these, suggest updating the `.github` repo instead.
