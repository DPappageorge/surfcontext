#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# sync-skills.sh — fill the per-harness skill cache at .context/skills/.
#
# The cache is regenerable and gitignored: the workspace (or a local source
# directory) is the canon. Each skill lands as .context/skills/<name>/SKILL.surf
# with its bytes preserved exactly.
#
# Order of preference:
#   1. MCP. Probe the server ONCE with tools/list and cache the advertised
#      roster for the run. `list_skills` and `read_skill` do not exist on the
#      workspace server yet; the probe is there to find them ABSENT and fall
#      through silently, so this tool keeps working before and after they ship.
#   2. --from <dir>. Copy every immediate-child <name>/SKILL.surf that opens
#      with YAML frontmatter.
#
# This tool NEVER deletes a file it did not write in this run. A stale skill is
# a smaller problem than a blanket wipe of a directory someone put work in.
#
# Usage:
#   bash sync-skills.sh [--root <dir>] [--from <skills dir>]
#                       [--key-env <VAR>] [--url <url>]

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd)" || SCRIPT_DIR="."

ROOT=""
FROM=""
KEY_ENV=""
URL=""

while [ $# -gt 0 ]; do
    case "$1" in
        --root)     ROOT="${2:-}"; shift 2 ;;
        --root=*)   ROOT="${1#--root=}"; shift ;;
        --from)     FROM="${2:-}"; shift 2 ;;
        --from=*)   FROM="${1#--from=}"; shift ;;
        --key-env)  KEY_ENV="${2:-}"; shift 2 ;;
        --url)      URL="${2:-}"; shift 2 ;;
        -h|--help)  sed -n '2,26p' "$0"; exit 0 ;;
        *)          echo "sync-skills: unknown argument '$1'" >&2; exit 2 ;;
    esac
done

[ -n "$ROOT" ] || ROOT="$(pwd)"
[ -d "$ROOT" ] || { echo "sync-skills: --root '$ROOT' is not a directory" >&2; exit 2; }
ROOT="$(cd "$ROOT" && pwd)"
DEST="$ROOT/.context/skills"
mkdir -p "$DEST"

read_cfg() {  # $1 = dotted key under workspace
    [ -f "$ROOT/surfcontext.json" ] || { echo ""; return 0; }
    python3 -c 'import json,sys
try: print((json.load(open(sys.argv[1])).get("workspace") or {}).get(sys.argv[2]) or "")
except Exception: print("")' "$ROOT/surfcontext.json" "$1" 2>/dev/null
}

[ -n "$KEY_ENV" ] || KEY_ENV="$(read_cfg key_env)"
[ -n "$URL" ] || URL="$(read_cfg url)"

WRITTEN=0
SOURCE="none"
MANIFEST="$DEST/.sync-manifest.json"

# --- 1. probe the server once for the skill verbs ---------------------------
ROSTER=""
HAS_SKILL_VERBS=0
if [ -n "$KEY_ENV" ] && [ -n "${!KEY_ENV:-}" ] && [ -f "$SCRIPT_DIR/surfspace-mcp.py" ]; then
    MCP_URL_ARG=""
    [ -n "$URL" ] && MCP_URL_ARG="--url $URL"
    # shellcheck disable=SC2086
    ROSTER="$(python3 "$SCRIPT_DIR/surfspace-mcp.py" --key-env "$KEY_ENV" $MCP_URL_ARG \
              --timeout 8 --retries 2 --list 2>/dev/null || true)"
    case "$ROSTER" in
        *'"list_skills"'*) HAS_SKILL_VERBS=1 ;;
    esac
    case "$ROSTER" in
        *'"read_skill"'*) : ;;
        *) HAS_SKILL_VERBS=0 ;;
    esac
fi

if [ "$HAS_SKILL_VERBS" -eq 1 ]; then
    MCP_URL_ARG=""
    [ -n "$URL" ] && MCP_URL_ARG="--url $URL"
    # shellcheck disable=SC2086
    NAMES="$(python3 "$SCRIPT_DIR/surfspace-mcp.py" --key-env "$KEY_ENV" $MCP_URL_ARG \
             --timeout 10 list_skills '{}' 2>/dev/null \
             | python3 -c 'import json,sys
try:
    d = json.load(sys.stdin)
    rows = d.get("skills") or d.get("items") or (d if isinstance(d, list) else [])
    for r in rows:
        n = r.get("name") if isinstance(r, dict) else r
        if n: print(n)
except Exception:
    pass' 2>/dev/null || true)"
    for name in $NAMES; do
        # shellcheck disable=SC2086
        BODY="$(python3 "$SCRIPT_DIR/surfspace-mcp.py" --key-env "$KEY_ENV" $MCP_URL_ARG \
                --timeout 10 read_skill "{\"name\": \"$name\"}" 2>/dev/null \
                | python3 -c 'import json,sys
try:
    d = json.load(sys.stdin)
    if isinstance(d, dict):
        sys.stdout.write(d.get("content") or d.get("body") or d.get("text") or "")
    elif isinstance(d, str):
        sys.stdout.write(d)
except Exception:
    pass' 2>/dev/null || true)"
        [ -n "$BODY" ] || continue
        mkdir -p "$DEST/$name"
        printf '%s' "$BODY" > "$DEST/$name/SKILL.surf"
        WRITTEN=$((WRITTEN + 1))
    done
    SOURCE="mcp"
fi

# --- 2. local fallback -------------------------------------------------------
if [ "$WRITTEN" -eq 0 ] && [ -n "$FROM" ]; then
    if [ -d "$FROM" ]; then
        FROM="$(cd "$FROM" && pwd)"
        for d in "$FROM"/*/; do
            src="${d}SKILL.surf"
            [ -f "$src" ] || continue
            head -1 "$src" | grep -qx -- '---' || continue   # YAML frontmatter required
            name="$(basename "$d")"
            mkdir -p "$DEST/$name"
            cp "$src" "$DEST/$name/SKILL.surf"               # bytes preserved exactly
            WRITTEN=$((WRITTEN + 1))
        done
        SOURCE="local"
    else
        echo "sync-skills: --from '$FROM' is not a directory" >&2
    fi
fi

python3 -c 'import json,sys,time
json.dump({"source": sys.argv[2], "count": int(sys.argv[3]),
           "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())},
          open(sys.argv[1], "w"), indent=2)' \
    "$MANIFEST" "$SOURCE" "$WRITTEN" 2>/dev/null || true

if [ "$WRITTEN" -eq 0 ] && [ "$SOURCE" = "none" ]; then
    echo "sync-skills: source=none count=0 — no workspace skill verbs and no --from directory"
else
    echo "sync-skills: source=$SOURCE count=$WRITTEN -> .context/skills/"
fi
exit 0
