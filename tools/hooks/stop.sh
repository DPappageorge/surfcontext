#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# stop.sh — SurfContext ARDS v5.2 harness binding (Stop).
#
# Three jobs:
#   1. Print the write-path rule at the moment it is about to be violated: a
#      session that ends with durable facts only in chat has lost them. The
#      wording follows surfcontext.json `home` — a connector writes to the
#      workspace, a self-contained repo writes a local fragment.
#   2. Sum the harness transcript's tokens since the last marker and print the
#      one ards-tokens line, so the stage flip has a real number to carry.
#   3. Re-emit the conformance receipt, so a Core edit made during the session
#      cannot leave the root files silently stale.
#
# Contract: FAIL-OPEN. Always exits 0, output bounded, no blocking decision.
# Core extraction contract is identical to tools/surfcontext-sync.sh,
# tools/ards-lint.py and tools/hooks/session-start.sh.

set -u

ARDS_VERSION="5.2"
MAX_LINES=24

TOOLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." 2>/dev/null && pwd)" || TOOLS_DIR=""

ROOT=""
while [ $# -gt 0 ]; do
  case "$1" in
    --root)   ROOT="${2:-}"; shift 2 ;;
    --root=*) ROOT="${1#--root=}"; shift ;;
    *)        shift ;;
  esac
done
[ -n "$ROOT" ] || ROOT="$(pwd 2>/dev/null)" || ROOT=""

# The Stop hook is handed its JSON payload on stdin: session_id,
# transcript_path, cwd, hook_event_name, stop_hook_active.
HOOK_STDIN=""
if [ ! -t 0 ]; then
  HOOK_STDIN="$(cat 2>/dev/null)" || HOOK_STDIN=""
fi
TRANSCRIPT=""
SESSION_ID=""
if [ -n "$HOOK_STDIN" ]; then
  TRANSCRIPT="$(printf '%s' "$HOOK_STDIN" | python3 -c 'import json,sys
try: print(json.load(sys.stdin).get("transcript_path") or "")
except Exception: print("")' 2>/dev/null)" || TRANSCRIPT=""
  SESSION_ID="$(printf '%s' "$HOOK_STDIN" | python3 -c 'import json,sys
try: print(json.load(sys.stdin).get("session_id") or "")
except Exception: print("")' 2>/dev/null)" || SESSION_ID=""
fi

ards_sha256_16() {
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" 2>/dev/null | awk '{print substr($1,1,16)}'
  elif command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" 2>/dev/null | awk '{print substr($1,1,16)}'
  else
    echo "NO-SHA256-TOOL"
  fi
}

ards_core_sha() {
  local tmp
  tmp="$(mktemp "${TMPDIR:-/tmp}/ards-core.XXXXXX")" || { echo "NO-TMP"; return 0; }
  awk '
    $0 == "## Core" { inblk = 1; next }
    inblk && /^## / { exit }
    inblk { print }
  ' "$1" > "$tmp" 2>/dev/null
  if [ ! -s "$tmp" ]; then rm -f "$tmp"; echo "NO-CORE-SECTION"; return 0; fi
  ards_sha256_16 "$tmp"
  rm -f "$tmp"
}

ards_stop_report() {
  local connector=0
  if [ -n "$ROOT" ] && grep -q '"home"[[:space:]]*:[[:space:]]*"surfspace"' "$ROOT/surfcontext.json" 2>/dev/null; then
    connector=1
  fi

  echo "ards-write-path: durable facts do NOT survive in chat or in memory alone."
  if [ "$connector" -eq 1 ]; then
    echo "  1. Write the fact into the workspace: a doc tagged active-work with title: + answers:"
    echo "     (the questions it settles), attached to its card — the workspace is the canon."
    echo "  2. Only then write the memory entry, and give it an ANCHOR (workspace doc id or card id)."
  else
    echo "  1. Write the fact into the tree: a dated fragment in the active-work stream named in"
    echo "     surfcontext.json (frontmatter: title: + answers: — the questions it settles)."
    echo "  2. Only then write the memory entry, and give it an ANCHOR (repo path or .surf filename)."
  fi
  echo "  3. Memory is a pointer, never a source. Unanchored memory is a liability."

  [ -n "$ROOT" ] || return 0
  cd "$ROOT" 2>/dev/null || return 0

  # --- token sum since the marker -------------------------------------------
  if [ -n "$TRANSCRIPT" ] && [ -n "$TOOLS_DIR" ] && [ -f "$TOOLS_DIR/transcript-tokens.py" ]; then
    python3 "$TOOLS_DIR/transcript-tokens.py" --transcript "$TRANSCRIPT" \
      --root "$ROOT" --session "$SESSION_ID" --write 2>/dev/null | head -1
  fi

  # --- receipt --------------------------------------------------------------
  local sha stamp status tier
  sha="NO-CONTEXT"
  for ards_ctx in CONTEXT.surf CONTEXT.md; do   # .surf first, .md alias second (SPEC 45.3)
    [ -f "$ards_ctx" ] && { sha="$(ards_core_sha "$ards_ctx")"; break; }
  done
  stamp="$(sed -n 's/^<!-- ards-core: sha256:\([0-9a-f]*\),.*/\1/p' CLAUDE.md 2>/dev/null | head -1)"
  if [ -n "$stamp" ] && [ "$stamp" = "$sha" ]; then
    status="verified"
  else
    status="STALE-RUN-SYNC"
  fi
  tier="unknown"
  if [ -n "$TOOLS_DIR" ] && [ -f "$TOOLS_DIR/ards-lint.py" ]; then
    tier="$(python3 "$TOOLS_DIR/ards-lint.py" --root "$ROOT" --tier 2>/dev/null | head -1)"
    case "$tier" in
      guaranteed|injected|discovered) : ;;
      *) tier="unknown" ;;
    esac
  fi
  echo "ards-receipt: v${ARDS_VERSION} core sha256:${sha} tier:${tier} status:${status}"
}

{ ards_stop_report 2>/dev/null || true; } | head -n "$MAX_LINES"

exit 0
