---
name: check-deployment
description: Check AWS Amplify deployment status for a CloudSurf app
allowed-tools: Bash
argument-hint: [app-name]
user-invocable: true
disable-model-invocation: false
---

Check the AWS Amplify deployment status for a CloudSurf app.

## App Registry

| App Name | Amplify App ID | Branch | Repo | Region |
|----------|---------------|--------|------|--------|
| TaskSurf | dj0ge89b3sux | main | remote-flow-web | us-west-2 |
| Wavesite | d2q3eceb4k0m7f | main | wavesite | us-west-2 |
| CloudSurf Web | d2s55yqar56k3k | main | cloudsurf-web-26 | us-west-2 |
| SurfCloud HQ | d13dqxc440m2xv | main | cloudsurf-hq | us-west-1 |
| Sin City | d1em6sfjqgb6tv | main | sin-city | us-west-2 |
| SurfContext | d1ngtv56vr5ldb | main | surfcontext | us-west-1 |

## AWS Config

- **Profile**: `default`
- **Default Region**: `us-west-2` (use per-app region from registry when specified)

## Instructions

1. If `$ARGUMENTS` is provided, match it to an app in the registry above (fuzzy match is fine — "tasksurf", "task", "ts" all match TaskSurf).
2. If no argument, check **all** apps.
3. For each app, run (using the app's region from the registry):
   ```
   aws amplify list-jobs --app-id <APP_ID> --branch-name main --max-items 3 --profile default --region <REGION> --output json
   ```
4. Parse and report:
   - **Status**: RUNNING / SUCCEED / FAILED
   - **Commit message** (first 80 chars)
   - **Started**: timestamp
   - **Duration**: if ended, calculate duration; if running, show elapsed time

## Output Format

```
## [App Name] Deployment Status

| Field | Value |
|-------|-------|
| Status | SUCCEED / RUNNING / FAILED |
| Job ID | # |
| Commit | message |
| Started | timestamp |
| Duration | Xm Ys |
| Branch | main |

Previous 2 builds: [status] [date], [status] [date]
```

If FAILED, also run:
```
aws amplify get-job --app-id <APP_ID> --branch-name main --job-id <JOB_ID> --profile default
```
and report the failure reason from the build steps.
