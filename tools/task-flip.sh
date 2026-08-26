#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# task-flip.sh — flip one board card to a new stage, carrying the tokens the
# stage actually cost.
#
# The only mid-run board write a session makes is the stage flip, and the flip
# is worth nothing without the number: stage_tokens is the harness transcript's
# token sum since the last marker (tools/transcript-tokens.py). After a real
# post the marker advances to the last consumed request, so the next flip counts
# the next stage and not the whole session again.
#
# Usage:
#   bash task-flip.sh TASK-nnn <stage> [--dry-run] [--root <dir>]
#                     [--transcript <path>] [--session <id>]
#                     [--key-env <VAR>] [--url <url>]
#
#   --dry-run  print exactly what would be posted; post nothing, advance nothing
#
# Contract: FAIL-OPEN. Always exits 0 and never blocks the harness. The
# workspace key is read from the environment variable named in
# surfcontext.json workspace.key_env (or --key-env); it is never echoed.

set -u

TOOLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd)" || TOOLS_DIR=""

TASK_ID=""
STAGE=""
ROOT=""
TRANSCRIPT=""
SESSION_ID=""
KEY_ENV=""
URL=""
DRY=0

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run)     DRY=1; shift ;;
    --root)        ROOT="${2:-}"; shift 2 ;;
    --transcript)  TRANSCRIPT="${2:-}"; shift 2 ;;
    --session)     SESSION_ID="${2:-}"; shift 2 ;;
    --key-env)     KEY_ENV="${2:-}"; shift 2 ;;
    --url)         URL="${2:-}"; shift 2 ;;
    -h|--help)     sed -n '2,24p' "$0"; exit 0 ;;
    -*)            shift ;;
    *)
      if [ -z "$TASK_ID" ]; then TASK_ID="$1"
      elif [ -z "$STAGE" ]; then STAGE="$1"
      fi
      shift ;;
  esac
done

[ -n "$ROOT" ] || ROOT="$(pwd 2>/dev/null)" || ROOT=""

if [ -z "$TASK_ID" ] || [ -z "$STAGE" ]; then
  echo "task-flip: need a card id and a stage — task-flip.sh TASK-nnn build"
  exit 0
fi

STATE="$ROOT/.context/.session-tokens.json"

# Recompute when asked, or when there is no recorded sum to read.
if [ -n "$TRANSCRIPT" ] || [ ! -f "$STATE" ]; then
  if [ -n "$TRANSCRIPT" ] && [ -n "$TOOLS_DIR" ] && [ -f "$TOOLS_DIR/transcript-tokens.py" ]; then
    python3 "$TOOLS_DIR/transcript-tokens.py" --transcript "$TRANSCRIPT" \
      --root "$ROOT" --session "$SESSION_ID" --write --quiet 2>/dev/null || true
  fi
fi

read_state() {  # $1 = json key
  [ -f "$STATE" ] || { echo ""; return 0; }
  python3 -c 'import json,sys
try:
    d = json.load(open(sys.argv[1]))
    v = d.get(sys.argv[2], "")
    print(v if v is not None else "")
except Exception:
    print("")' "$STATE" "$1" 2>/dev/null
}

STAGE_TOKENS="$(read_state total)"
[ -n "$STAGE_TOKENS" ] || STAGE_TOKENS=0
HEAD_RID="$(read_state head_request_id)"
HEAD_TS="$(read_state head_timestamp)"

if [ -z "$KEY_ENV" ] && [ -f "$ROOT/surfcontext.json" ]; then
  KEY_ENV="$(python3 -c 'import json,sys
try: print((json.load(open(sys.argv[1])).get("workspace") or {}).get("key_env") or "")
except Exception: print("")' "$ROOT/surfcontext.json" 2>/dev/null)"
fi
if [ -z "$URL" ] && [ -f "$ROOT/surfcontext.json" ]; then
  URL="$(python3 -c 'import json,sys
try: print((json.load(open(sys.argv[1])).get("workspace") or {}).get("url") or "")
except Exception: print("")' "$ROOT/surfcontext.json" 2>/dev/null)"
fi

echo "task-flip: update_task task_id=$TASK_ID stage=$STAGE stage_tokens=$STAGE_TOKENS"

if [ "$DRY" -eq 1 ]; then
  echo "task-flip: --dry-run — nothing posted, marker not advanced (head request ${HEAD_RID:-none})"
  exit 0
fi

if [ -z "$TOOLS_DIR" ] || [ ! -f "$TOOLS_DIR/surfspace-mcp.py" ]; then
  echo "task-flip: surfspace-mcp.py not found next to this script — not posted"
  exit 0
fi

ARGS="$(python3 -c 'import json,sys; print(json.dumps({"task_id": sys.argv[1], "stage": sys.argv[2], "stage_tokens": int(sys.argv[3] or 0)}))' \
  "$TASK_ID" "$STAGE" "$STAGE_TOKENS" 2>/dev/null)"
[ -n "$ARGS" ] || ARGS='{}'

MCP_ARGS=""
[ -n "$URL" ] && MCP_ARGS="--url $URL"
# shellcheck disable=SC2086
OUT="$(python3 "$TOOLS_DIR/surfspace-mcp.py" --key-env "${KEY_ENV:-SURFSPACE_KEY}" $MCP_ARGS \
       --timeout 10 update_task "$ARGS" 2>/dev/null)"
RC=$?

if [ "$RC" -ne 0 ]; then
  echo "task-flip: post failed — ${OUT:-no response}; marker NOT advanced, retry the flip"
  exit 0
fi

echo "task-flip: posted — ${OUT:-ok}"

if [ -n "$HEAD_RID" ] || [ -n "$HEAD_TS" ]; then
  python3 -c 'import json,os,sys
root, sid, rid, ts, task, stage = sys.argv[1:7]
p = os.path.join(root, ".context", ".token-marker.json")
try:
    os.makedirs(os.path.dirname(p), exist_ok=True)
    json.dump({"session_id": sid, "last_request_id": rid, "last_timestamp": ts,
               "task_id": task, "stage": stage,
               "updated": __import__("time").strftime("%Y-%m-%dT%H:%M:%SZ", __import__("time").gmtime())},
              open(p, "w"), indent=2)
except Exception:
    pass' "$ROOT" "$SESSION_ID" "$HEAD_RID" "$HEAD_TS" "$TASK_ID" "$STAGE" 2>/dev/null || true
  echo "task-flip: marker advanced to request ${HEAD_RID:-none}"
fi

exit 0
