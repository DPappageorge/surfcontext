#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# make-connector.sh — generate a SurfContext ARDS v5.1 connector directory.
#
# A connector is not a library. The workspace holds the prose canon; the
# directory holds only what must be local: the hand-authored "## Core", the
# generated harness root files, the manifest, the MCP server entry, the hook
# bindings, and a vendored copy of these tools so the connector is
# self-contained.
#
#   <dir>/
#     CONTEXT.surf            hand-authored ## Core (copied from --core)
#     CLAUDE.md, AGENTS.md    GENERATED from the Core, stamped, lint-checked
#     surfcontext.json        version 5.1, home surfspace, workspace + projects
#     .mcp.json               project-scoped MCP entry (env-var reference only)
#     .claude/settings.json   SessionStart + Stop bindings
#     .context/tools/         vendored copy of tools/
#     .context/skills/        regenerable skill cache (gitignored)
#     .gitignore              runtime state + the skill cache
#
# Usage:
#   bash make-connector.sh <dir> --workspace-id <id> --workspace-name <name>
#                          --key-env <VAR> --core <CONTEXT.core.surf>
#                          [--folder-id <id>] [--projects <projects.json>]
#                          [--url <mcp url>]
#
# Idempotent: every emitted file is compare-then-write and carries no timestamp,
# so a second run over the same inputs changes nothing on disk.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES="$(cd "$SCRIPT_DIR/.." && pwd)/templates"

DIR=""
WORKSPACE_ID=""
WORKSPACE_NAME=""
KEY_ENV=""
CORE=""
FOLDER_ID=""
PROJECTS_FILE=""
URL="https://surf.space/mcp"

die() { echo "make-connector: $1" >&2; exit 1; }

while [ $# -gt 0 ]; do
    case "$1" in
        --workspace-id)   WORKSPACE_ID="${2:-}"; shift 2 ;;
        --workspace-name) WORKSPACE_NAME="${2:-}"; shift 2 ;;
        --key-env)        KEY_ENV="${2:-}"; shift 2 ;;
        --core)           CORE="${2:-}"; shift 2 ;;
        --folder-id)      FOLDER_ID="${2:-}"; shift 2 ;;
        --projects)       PROJECTS_FILE="${2:-}"; shift 2 ;;
        --url)            URL="${2:-}"; shift 2 ;;
        -h|--help)        sed -n '2,30p' "$0"; exit 0 ;;
        -*)               die "unknown option '$1'" ;;
        *)                [ -z "$DIR" ] && DIR="$1"; shift ;;
    esac
done

[ -n "$DIR" ]            || die "need a target directory"
[ -n "$WORKSPACE_ID" ]   || die "--workspace-id is required"
[ -n "$WORKSPACE_NAME" ] || die "--workspace-name is required"
[ -n "$KEY_ENV" ]        || die "--key-env is required (the NAME of the env var, never the key)"
[ -n "$CORE" ]           || die "--core is required"
[ -f "$CORE" ]           || die "--core '$CORE' is not a file"
[ -d "$TEMPLATES" ]      || die "templates/ not found next to tools/ (looked in $TEMPLATES)"

# The sync refuses to inject without an exact '## Core' heading line; refuse the
# same way here, so a connector is never generated around a Core that cannot be
# extracted.
grep -qx '## Core' "$CORE" || die "--core '$CORE' has no exact '## Core' heading line — nothing to inject"

mkdir -p "$DIR"
DIR="$(cd "$DIR" && pwd)"

# --- compare-then-write ------------------------------------------------------
write_if_changed() {  # $1 = source temp file, $2 = destination
    mkdir -p "$(dirname "$2")"
    if [ -f "$2" ] && cmp -s "$1" "$2"; then
        echo "  = $(basename "$2") (unchanged)"
    else
        cp "$1" "$2"
        echo "  + $(basename "$2")"
    fi
}

render() {  # $1 = template, $2 = destination
    local tmp
    tmp="$(mktemp "${TMPDIR:-/tmp}/sc-render.XXXXXX")"
    SC_WORKSPACE_ID="$WORKSPACE_ID" SC_WORKSPACE_NAME="$WORKSPACE_NAME" \
    SC_KEY_ENV="$KEY_ENV" SC_FOLDER_ID="$FOLDER_ID" SC_URL="$URL" \
    SC_SERVER_NAME="$SERVER_NAME" SC_PROJECTS="$PROJECTS_JSON" \
    python3 -c '
import os, sys
src = open(sys.argv[1], encoding="utf-8").read()
for token, key in (("__WORKSPACE_ID__", "SC_WORKSPACE_ID"),
                   ("__WORKSPACE_NAME__", "SC_WORKSPACE_NAME"),
                   ("__KEY_ENV__", "SC_KEY_ENV"),
                   ("__FOLDER_ID__", "SC_FOLDER_ID"),
                   ("__MCP_URL__", "SC_URL"),
                   ("__SERVER_NAME__", "SC_SERVER_NAME"),
                   ("__HOME__", "SC_HOME")):
    src = src.replace(token, os.environ.get(key, ""))
src = src.replace("__PROJECTS__", os.environ.get("SC_PROJECTS", "[]"))
sys.stdout.write(src)
' "$1" > "$tmp"
    write_if_changed "$tmp" "$2"
    rm -f "$tmp"
}

# --- derived values ----------------------------------------------------------
SLUG="$(printf '%s' "$WORKSPACE_NAME" | tr '[:upper:]' '[:lower:]' \
        | sed -e 's/[^a-z0-9]\{1,\}/-/g' -e 's/^-//' -e 's/-$//')"
[ -n "$SLUG" ] || SLUG="workspace"
SERVER_NAME="surfspace-$SLUG"
export SC_HOME="surfspace"

PROJECTS_JSON="[]"
if [ -n "$PROJECTS_FILE" ]; then
    [ -f "$PROJECTS_FILE" ] || die "--projects '$PROJECTS_FILE' is not a file"
    PROJECTS_JSON="$(python3 -c '
import json, sys
d = json.load(open(sys.argv[1], encoding="utf-8"))
assert isinstance(d, list), "projects file must hold a JSON array"
print(json.dumps(d, indent=2))
' "$PROJECTS_FILE")" || die "--projects '$PROJECTS_FILE' is not a JSON array"
fi

echo "make-connector: $DIR"
echo "  workspace: $WORKSPACE_NAME  server: $SERVER_NAME  key env: $KEY_ENV"

# --- CONTEXT.surf ------------------------------------------------------------
write_if_changed "$CORE" "$DIR/CONTEXT.surf"

# --- manifests and bindings --------------------------------------------------
render "$TEMPLATES/surfcontext.json" "$DIR/surfcontext.json"
render "$TEMPLATES/mcp.json"         "$DIR/.mcp.json"
render "$TEMPLATES/settings.json"    "$DIR/.claude/settings.json"
render "$TEMPLATES/gitignore"        "$DIR/.gitignore"

# --- vendor the tools tree ---------------------------------------------------
echo "  vendoring tools/ -> .context/tools/"
VENDOR="$DIR/.context/tools"
mkdir -p "$VENDOR"
( cd "$SCRIPT_DIR" && find . -type f -print ) | sed 's|^\./||' | sort | while read -r rel; do
    case "$rel" in
        .vendor-stamp) continue ;;
    esac
    src="$SCRIPT_DIR/$rel"
    dst="$VENDOR/$rel"
    mkdir -p "$(dirname "$dst")"
    if [ -f "$dst" ] && cmp -s "$src" "$dst"; then
        :
    else
        cp "$src" "$dst"
    fi
    if [ -x "$src" ]; then chmod +x "$dst"; fi
done

SC_SHA="unknown (source is not a git checkout)"
if git -C "$SCRIPT_DIR" rev-parse --git-dir >/dev/null 2>&1; then
    SC_SHA="$(git -C "$SCRIPT_DIR" rev-parse HEAD 2>/dev/null || echo 'unknown (no commit)')"
fi
STAMP_TMP="$(mktemp "${TMPDIR:-/tmp}/sc-stamp.XXXXXX")"
{
    echo "# SPDX-License-Identifier: MIT"
    echo "# Vendored SurfContext tools. Regenerate with tools/make-connector.sh;"
    echo "# do not edit in place — edits are overwritten on the next generation."
    echo "surfcontext-version: 5.1"
    echo "surfcontext-commit: $SC_SHA"
} > "$STAMP_TMP"
write_if_changed "$STAMP_TMP" "$VENDOR/.vendor-stamp"
rm -f "$STAMP_TMP"

# --- regenerable skill cache -------------------------------------------------
mkdir -p "$DIR/.context/skills"
SKILLS_TMP="$(mktemp "${TMPDIR:-/tmp}/sc-skills.XXXXXX")"
cat > "$SKILLS_TMP" <<'SKREADME'
<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->
---
title: "Skill cache"
type: note
status: generated
---

# Skill cache — regenerable, not canon

This directory is a CACHE. `.context/tools/sync-skills.sh` materializes the
workspace's skills here as `<name>/SKILL.surf`, and the connector's `.gitignore`
keeps the whole directory out of version control.

Do not hand-author a skill here: edit it in the workspace (or in the local
source directory passed to `--from`) and re-run the sync. Anything written here
by hand is lost the next time the cache is filled.
SKREADME
write_if_changed "$SKILLS_TMP" "$DIR/.context/skills/README.surf"
rm -f "$SKILLS_TMP"

# --- generate the root files and gate the tier -------------------------------
echo "  running sync"
bash "$SCRIPT_DIR/surfcontext-sync.sh" --root "$DIR" --quiet

echo "  running lint"
TIER="$(python3 "$SCRIPT_DIR/ards-lint.py" --root "$DIR" --tier 2>/dev/null || echo unknown)"
if [ "$TIER" != "guaranteed" ]; then
    echo "make-connector: conformance tier is '$TIER', expected 'guaranteed'" >&2
    python3 "$SCRIPT_DIR/ards-lint.py" --root "$DIR" --quiet >&2 || true
    exit 1
fi

echo "make-connector: connector ready at $DIR — conformance tier: $TIER"
