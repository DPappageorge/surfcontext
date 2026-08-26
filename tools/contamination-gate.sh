#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# contamination-gate.sh — the commit door for a PUBLIC tree.
#
# This repository is public. Everything committed under tools/, templates/ and
# playbooks/ is read by strangers, so anything that identifies a private
# machine, workspace, customer, price or credential must never reach it. This
# gate greps the tree for those classes and BLOCKS: exit 1 with every hit named
# by file and line, exit 0 clean.
#
# The classes live in tools/.contamination-terms, not here, so a private repo
# can point the same gate at its own roster:
#   bash contamination-gate.sh --terms /path/to/private-nicknames
#
# Two self-exemptions are structural, not convenience: the pattern definitions
# and any --terms file are the description of the contamination, not an
# instance of it, and would otherwise report themselves on every run.
#
# Usage:
#   bash contamination-gate.sh [paths...]           default: tools templates playbooks
#                              [--terms <file>]     extra rule file (repeatable)
#                              [--allow <file>]     exact permitted lines
#                              [--quiet]
#
# Rule file format (see tools/.contamination-terms):
#   <label> <extended-regex>   a hit
#   !<extended-regex>          an allow — a line matching this is never a hit
#   # comment

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd)" || SCRIPT_DIR="."
REPO_ROOT="$(cd "$SCRIPT_DIR/.." 2>/dev/null && pwd)" || REPO_ROOT="."

DEFAULT_TERMS="$SCRIPT_DIR/.contamination-terms"
TERM_FILES="$DEFAULT_TERMS"
ALLOW_FILE=""
QUIET=0
TARGETS=""

while [ $# -gt 0 ]; do
    case "$1" in
        --terms)  TERM_FILES="$TERM_FILES
${2:-}"; shift 2 ;;
        --allow)  ALLOW_FILE="${2:-}"; shift 2 ;;
        --quiet)  QUIET=1; shift ;;
        -h|--help) sed -n '2,36p' "$0"; exit 0 ;;
        -*)       echo "contamination-gate: unknown option '$1'" >&2; exit 2 ;;
        *)        TARGETS="$TARGETS
$1"; shift ;;
    esac
done

if [ -z "$(printf '%s' "$TARGETS" | tr -d '[:space:]')" ]; then
    TARGETS="$REPO_ROOT/tools
$REPO_ROOT/templates
$REPO_ROOT/playbooks"
fi

[ -f "$DEFAULT_TERMS" ] || { echo "contamination-gate: missing $DEFAULT_TERMS" >&2; exit 2; }

# --- collect the files to scan ----------------------------------------------
FILE_LIST="$(mktemp "${TMPDIR:-/tmp}/cg-files.XXXXXX")"
EXEMPT_LIST="$(mktemp "${TMPDIR:-/tmp}/cg-exempt.XXXXXX")"
HITS="$(mktemp "${TMPDIR:-/tmp}/cg-hits.XXXXXX")"
trap 'rm -f "$FILE_LIST" "$EXEMPT_LIST" "$HITS"' EXIT

printf '%s\n' "$TERM_FILES" | while IFS= read -r tf; do
    [ -n "$tf" ] || continue
    d="$(cd "$(dirname "$tf")" 2>/dev/null && pwd)" || continue
    printf '%s/%s\n' "$d" "$(basename "$tf")"
done > "$EXEMPT_LIST"
echo "$SCRIPT_DIR/contamination-gate.sh" >> "$EXEMPT_LIST"

printf '%s\n' "$TARGETS" | while IFS= read -r t; do
    [ -n "$t" ] || continue
    if [ -d "$t" ]; then
        find "$t" -type f ! -name '.DS_Store' -print
    elif [ -f "$t" ]; then
        printf '%s\n' "$t"
    fi
done | sort -u | while IFS= read -r f; do
    grep -qxF "$f" "$EXEMPT_LIST" 2>/dev/null && continue
    # binary files carry no reviewable prose; the gate is a text door
    if LC_ALL=C grep -qI . "$f" 2>/dev/null; then printf '%s\n' "$f"; fi
done > "$FILE_LIST"

FILE_COUNT="$(wc -l < "$FILE_LIST" | tr -d ' ')"

# --- assemble the rules ------------------------------------------------------
ALLOW_RE=""
RULES="$(mktemp "${TMPDIR:-/tmp}/cg-rules.XXXXXX")"
: > "$RULES"
printf '%s\n' "$TERM_FILES" | while IFS= read -r tf; do
    [ -n "$tf" ] && [ -f "$tf" ] && cat "$tf"
done > "$RULES.raw" 2>/dev/null || true

while IFS= read -r line; do
    case "$line" in
        ''|'#'*) continue ;;
        '!'*)
            re="${line#!}"
            if [ -z "$ALLOW_RE" ]; then ALLOW_RE="$re"; else ALLOW_RE="$ALLOW_RE|$re"; fi
            ;;
        *)
            label="${line%%[[:space:]]*}"
            re="${line#"$label"}"
            re="$(printf '%s' "$re" | sed -e 's/^[[:space:]]*//')"
            [ -n "$re" ] || continue
            printf '%s\t%s\n' "$label" "$re" >> "$RULES"
            ;;
    esac
done < "$RULES.raw"
rm -f "$RULES.raw"

# --- scan --------------------------------------------------------------------
: > "$HITS"
if [ "$FILE_COUNT" -gt 0 ]; then
    while IFS=$'\t' read -r label re; do
        [ -n "$label" ] || continue
        while IFS= read -r f; do
            grep -nE -- "$re" "$f" 2>/dev/null | while IFS= read -r m; do
                text="${m#*:}"   # grep -n on ONE file: lineno:text — strip once, or a colon in the line eats its own prefix
                if [ -n "$ALLOW_RE" ] && printf '%s' "$text" | grep -qE -- "$ALLOW_RE" 2>/dev/null; then
                    continue
                fi
                if [ -n "$ALLOW_FILE" ] && [ -f "$ALLOW_FILE" ] && grep -qxF -- "$text" "$ALLOW_FILE" 2>/dev/null; then
                    continue
                fi
                lineno="${m%%:*}"
                rel="${f#$REPO_ROOT/}"
                printf '%s:%s: [%s] %s\n' "$rel" "$lineno" "$label" "$(printf '%s' "$text" | cut -c1-140)" >> "$HITS"
            done
        done < "$FILE_LIST"
    done < "$RULES"
fi
rm -f "$RULES"

HIT_COUNT="$(wc -l < "$HITS" | tr -d ' ')"
if [ "$HIT_COUNT" -gt 0 ]; then
    sort -u "$HITS"
    echo "contamination-gate: $HIT_COUNT hit(s) across $FILE_COUNT file(s) — BLOCKED"
    exit 1
fi

[ "$QUIET" -eq 1 ] || echo "contamination-gate: clean — $FILE_COUNT file(s) scanned"
exit 0
