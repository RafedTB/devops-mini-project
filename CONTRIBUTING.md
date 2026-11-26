# Contributing Guide

## Branch Strategy

| Branch | Role | Direct push |
|---|---|---|
| `main` | **Production** – stable, protected | ❌ Never |
| `develop` | Integration – merges from feature branches | ❌ Never |
| `feature/<name>` | New feature | ✅ |
| `fix/<name>` | Bug fix | ✅ |
| `hotfix/<name>` | Urgent production fix (branches from `main`) | ✅ |
| `docs/<name>` | Documentation only | ✅ |

> **Rule: no direct push to `main` or `develop`.** All changes go through a Pull Request.

Normal flow: `feature/my-feature` → PR → `develop` → PR → `main`  
Hotfix flow: `hotfix/my-fix` → PR → `main` + back-merge to `develop`

---

## Conventional Commits

Format: `type(scope): short imperative message`

| Type | Use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `ci` | CI/CD pipeline changes |
| `chore` | Build scripts, dependencies |
| `refactor` | Code change, no behavior change |
| `test` | Adding or fixing tests |

**Examples:**
```
feat(auth): add JWT refresh token endpoint
fix(orders): prevent duplicate order on double-click
ci(jenkins): add smoke test stage after deployment
```

Message rules:
- Lowercase, imperative mood ("add" not "added")
- No period at the end
- Max ~72 characters

---

## Opening a Pull Request

1. **Create your branch** from `develop` (or `main` for hotfixes):
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```
2. **Make commits** following Conventional Commits.
3. **Push** your branch:
   ```bash
   git push origin feature/my-feature
   ```
4. **Open a PR** targeting `develop` on GitHub (or use `gh pr create`).
5. **Fill the PR template**: description, type of change, checklist.
6. **Request a review** from at least one teammate (or the project owner).
7. **Fix review comments**, then the reviewer merges (squash preferred).

---

## Rules

- ❌ No direct push to `main` or `develop`
- ❌ No force-push to shared branches
- ❌ No secrets, passwords, or tokens in commits
- ✅ All PRs must pass the CI pipeline before merging
- ✅ At least one review before merging into `develop`
- ✅ PRs into `main` must come from `develop` only
