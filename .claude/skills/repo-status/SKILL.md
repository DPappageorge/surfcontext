---
name: repo-status
description: Check git status across all CloudSurf repositories
allowed-tools: Bash
user-invocable: true
disable-model-invocation: false
---

Check git status across all CloudSurf repositories.

## Repo Registry

| Repo | Path |
|------|------|
| cloudsurf-strategy | /Users/brady/Projects/cloudsurf/repos/cloudsurf-strategy-staging |
| remote-flow-web (TaskSurf) | /Users/brady/Projects/cloudsurf/repos/remote-flow-web |
| wavesite | /Users/brady/Projects/cloudsurf/repos/wavesite |
| wavesite-mobile | /Users/brady/Projects/cloudsurf/repos/wavesite-mobile |
| cloudsurf-amplify-backend | /Users/brady/Projects/cloudsurf/repos/cloudsurf-amplify-backend |
| cloudsurf-web-26 | /Users/brady/Projects/cloudsurf/repos/cloudsurf-web-26 |
| cloudsurf-hq | /Users/brady/Projects/cloudsurf/repos/cloudsurf-hq |

## Instructions

1. If `$ARGUMENTS` is provided, match it to a specific repo (fuzzy match).
2. If no argument, check **all** repos.
3. For each repo that exists on disk, run:
   ```
   git -C <PATH> branch --show-current
   git -C <PATH> status --short
   git -C <PATH> log --oneline -3
   ```
4. Skip repos where the path doesn't exist.

## Output Format

```
## CloudSurf Repo Status

### [Repo Name]
- **Branch**: main
- **Status**: clean / X modified, Y untracked
- **Recent commits**:
  - abc1234 commit message
  - def5678 commit message
  - ghi9012 commit message
```

Flag any repos with uncommitted changes or repos on non-main branches.
