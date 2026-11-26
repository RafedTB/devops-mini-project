# Git Branching Strategy

## Overview

This project follows a simplified **GitFlow** model with two long-lived branches and short-lived topic branches.

## Branch Model

```
main ──────────────────────────────────────────────► (production)
  │                           ▲
  │  (hotfix/* branches)      │  PR: release
  │                           │
develop ───────────────────────────────────────────► (integration)
  ▲         ▲         ▲         ▲
  │         │         │         │
feat/A   feat/B    fix/C    docs/D
```

## Workflow

### Feature / Fix
```
git checkout develop && git pull origin develop
git checkout -b feature/<name>
# ... commits ...
git push origin feature/<name>
gh pr create --base develop --title "feat: ..."
# → PR reviewed → squash merge into develop
```

### Release (develop → main)
```
gh pr create --base main --head develop --title "release: vX.Y.Z"
# → reviewed → squash merge into main
# → tag the release:
git tag -a vX.Y.Z -m "Release X.Y.Z"
git push origin vX.Y.Z
```

### Hotfix
```
git checkout main && git pull origin main
git checkout -b hotfix/<name>
# ... fix ...
# PR → main, then back-merge to develop
```

## Branch Protection (main)

- ✅ Require a pull request before merging (at least 1 approval)
- ✅ No force-push
- ✅ CI must pass before merge

See **Settings → Branches → Branch protection rules** on GitHub.
