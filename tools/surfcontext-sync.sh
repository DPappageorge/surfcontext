#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# surfcontext-sync.sh — SurfContext ARDS v5.1 reference sync (surfcontext.org)
#
# Generates the root files every harness auto-loads (CLAUDE.md for Claude Code,
# AGENTS.md for Codex) from the hand-authored "## Core" section of CONTEXT.surf,
# and materializes user-invocable skills into .claude/commands/.
#
# Tenet 12: pushed context is the only guaranteed context. A root file that
# merely POINTS at CONTEXT.surf is non-conformant — the rules must live in the
# file the harness actually loads, stamped so drift is detectable.
#
# EXTRACTION CONTRACT (shared byte-for-byte with tools/ards-lint.py and both
# hooks in tools/hooks/):
#   body  = the bytes AFTER the newline terminating the line exactly equal to
#           "## Core", up to but EXCLUDING the first later line starting "## ".
#   stamp = sha256 of exactly those bytes, truncated to 16 hex chars.
# Anchor on the EXACT line "## Core": a later "## Core Principles" must never
# match.
#
# The rendered block is idempotent: no timestamps, byte-identical on re-run.
#
# Usage: bash tools/surfcontext-sync.sh [--root <dir>] [--smoke] [--quiet]

set -euo pipefail

ROOT=""
SMOKE=0
QUIET=0

while [ $# -gt 0 ]; do
    case "$1" in
        --root)   ROOT="${2:-}"; shift 2 ;;
        --root=*) ROOT="${1#--root=}"; shift ;;
        --smoke)  SMOKE=1; shift ;;
        --quiet)  QUIET=1; shift ;;
        -h|--help)
            sed -n '2,26p' "$0"
            exit 0 ;;
        *)
            echo "surfcontext-sync: unknown argument '$1'" >&2
            exit 2 ;;
    esac
done

if [ -z "$ROOT" ]; then
    ROOT="$(pwd)"
fi
if [ ! -d "$ROOT" ]; then
    echo "surfcontext-sync: --root '$ROOT' is not a directory" >&2
    exit 2
fi
ROOT="$(cd "$ROOT" && pwd)"
cd "$ROOT"

say() { [ "$QUIET" -eq 1 ] || echo "$@"; }

ARDS_VERSION="5.1"

say "SurfContext Sync — ARDS v${ARDS_VERSION}"
say "root: $ROOT"

# --- Ensure the canonical .context/ structure exists -------------------------
say ""
say "[Setup] Verifying .context/ canonical structure..."
for d in .context .context/skills; do
    if [ ! -d "$d" ]; then
        say "  Creating $d/"
        mkdir -p "$d"
    fi
done

# --- .claude/commands generation from .context/skills ------------------------
# .context/ is the sole source of truth. .claude/commands/ is GENERATED.
say ""
say "[Skills] Syncing .context/skills/ -> .claude/commands/..."
mkdir -p .claude/commands
rm -f .claude/commands/*.md
SKILL_COUNT=0
for skill_dir in .context/skills/*/; do
    [ -f "${skill_dir}SKILL.surf" ] || continue
    skill_name="$(basename "$skill_dir")"
    if grep -q "user-invocable: true" "${skill_dir}SKILL.surf" 2>/dev/null; then
        cat > ".claude/commands/${skill_name}.md" <<SKILLEOF
Read and execute the skill defined at .context/skills/${skill_name}/SKILL.surf

\$ARGUMENTS
SKILLEOF
        SKILL_COUNT=$((SKILL_COUNT + 1))
    fi
done
say "  Synced $SKILL_COUNT skill(s) to .claude/commands/"

# --- ARDS v5.1 Core injection ------------------------------------------------
ARDS_BEGIN="<!-- ards-core: begin (generated from CONTEXT.surf ## Core - edit THERE, never here) -->"
ARDS_END="<!-- ards-core: end -->"
ARDS_POINTER="Full rules and context: CONTEXT.surf (canonical - this file is generated)."
ARDS_LEGACY_RE='All project rules, context, and instructions live in CONTEXT\.surf\.|Read CONTEXT\.surf before starting any work\.'

ards_sha256_16() {  # portable: macOS ships shasum, most Linux ships sha256sum
    if command -v shasum >/dev/null 2>&1; then
        shasum -a 256 "$1" | awk '{print substr($1,1,16)}'
    elif command -v sha256sum >/dev/null 2>&1; then
        sha256sum "$1" | awk '{print substr($1,1,16)}'
    else
        echo "NO-SHA256-TOOL"
    fi
}

say ""
say "[Core] Core injection — CONTEXT.surf '## Core' -> CLAUDE.md, AGENTS.md"
if [ ! -f "CONTEXT.surf" ]; then
    say "  [WARN] no CONTEXT.surf — skipping Core injection"
elif ! grep -qx '## Core' CONTEXT.surf; then
    say "  [WARN] CONTEXT.surf has no exact '## Core' heading — skipping Core injection"
else
    CORE_TMP="$(mktemp "${TMPDIR:-/tmp}/ards-core.XXXXXX")"
    awk '
      $0 == "## Core" { inblk = 1; next }
      inblk && /^## / { exit }
      inblk { print }
    ' CONTEXT.surf > "$CORE_TMP"
    CORE_STAMP="$(ards_sha256_16 "$CORE_TMP")"
    CORE_BYTES="$(wc -c < "$CORE_TMP" | tr -d ' ')"
    say "  Core body: ${CORE_BYTES} bytes · sha256:${CORE_STAMP}"

    for ards_target in CLAUDE.md AGENTS.md; do
        ARDS_EXTRA=""
        if [ -f "$ards_target" ]; then
            # Everything outside the block, minus pointer/legacy-pointer lines,
            # minus leading blank lines (trailing ones die in $( ) anyway).
            ARDS_EXTRA="$(awk -v b="$ARDS_BEGIN" -v e="$ARDS_END" '
                $0 == b { skip = 1; next }
                $0 == e { skip = 0; next }
                skip    { next }
                        { print }
            ' "$ards_target" \
              | grep -vxF "$ARDS_POINTER" \
              | grep -vxE "$ARDS_LEGACY_RE" \
              | sed -e '/./,$!d' || true)"
        fi

        ARDS_OUT="$(mktemp "${TMPDIR:-/tmp}/ards-root.XXXXXX")"
        {
            echo "$ARDS_BEGIN"
            cat "$CORE_TMP"
            echo "<!-- ards-core: sha256:${CORE_STAMP}, ards v${ARDS_VERSION} -->"
            echo "$ARDS_END"
            echo ""
            echo "$ARDS_POINTER"
            if [ -n "$ARDS_EXTRA" ]; then
                echo ""
                printf '%s\n' "$ARDS_EXTRA"
            fi
        } > "$ARDS_OUT"

        if [ -f "$ards_target" ] && cmp -s "$ARDS_OUT" "$ards_target"; then
            say "  $ards_target already current (sha256:${CORE_STAMP})"
        else
            cp "$ARDS_OUT" "$ards_target"
            say "  $ards_target regenerated (sha256:${CORE_STAMP})"
        fi
        rm -f "$ARDS_OUT"
    done
    rm -f "$CORE_TMP"
fi

# --- Optional live smoke: does the harness actually load the Core? -----------
# Runs one bounded turn and asserts the receipt line the SessionStart binding
# prints and the first absolute rule from the injected Core are both visible.
if [ "$SMOKE" -eq 1 ]; then
    say ""
    say "[Smoke] harness load check"
    if ! command -v claude >/dev/null 2>&1; then
        echo "SKIP  smoke: no 'claude' on PATH"
    else
        SMOKE_OUT="$(cd "$ROOT" && claude -p --max-turns 1 \
            'Reply with the ards-receipt line from your context, then quote absolute rule 1 verbatim.' \
            2>/dev/null || true)"
        SMOKE_RC=0
        printf '%s\n' "$SMOKE_OUT" | grep -q "ards-receipt: v${ARDS_VERSION}" \
            || { echo "FAIL  smoke: no 'ards-receipt: v${ARDS_VERSION}' in the harness reply"; SMOKE_RC=1; }
        printf '%s\n' "$SMOKE_OUT" | grep -qi 'never run .git add' \
            || { echo "FAIL  smoke: Core absolute rule 1 not present in the harness reply"; SMOKE_RC=1; }
        if [ "$SMOKE_RC" -eq 0 ]; then
            echo "PASS  smoke: receipt line and Core rule 1 both reached the model"
        else
            exit 1
        fi
    fi
fi

say ""
say "========================================"
say "Sync complete."
say ""
say "Source of truth (edit these):"
say "  CONTEXT.surf            (incl. the '## Core' section — the injected block)"
say "  .context/skills/*/SKILL.surf"
say ""
say "Generated (do not edit):"
say "  CLAUDE.md               (ards-core block + pointer)"
say "  AGENTS.md               (ards-core block + pointer)"
say "  .claude/commands/*.md"
