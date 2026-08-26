#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# ards-tests.sh — the SurfContext ARDS v5.2 tools battery.
#
# Every check prints PASS or FAIL on one line; the script exits non-zero if any
# check FAILs.
#
# SAFETY: every fixture is built FROM SCRATCH under mktemp -d out of this
# repository's own templates and tools — nothing is copied out of a live parent
# repository, and no tamper case ever touches the working tree.
#
# Local bash is 3.2, so: no associative arrays, no `readarray`, no `${var^^}`.
#
# Usage: bash tools/ards-tests.sh

set -u

TOOLS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$TOOLS/.." && pwd)"
TEMPLATES="$REPO/templates"

ARDS_BEGIN="<!-- ards-core: begin (generated from CONTEXT.surf ## Core - edit THERE, never here) -->"
ARDS_END="<!-- ards-core: end -->"
ARDS_POINTER="Full rules and context: CONTEXT.surf (canonical - this file is generated)."

# Constructed so this file carries no literal identifier the gate would flag.
FIX_WS_ID="00000000-0000-4000-8000-$(printf '%s%s' 000000 000000)"
FIX_HOST="build-box-one$(printf '%s' .loc)al"

FAILS=0
SANDBOX="$(mktemp -d "${TMPDIR:-/tmp}/ards-battery.XXXXXX")" || exit 1
FIXN=0

pass() { echo "PASS  $1"; }
fail() { echo "FAIL  $1${2:+ — $2}"; FAILS=$((FAILS + 1)); }

cleanup() {
  case "$SANDBOX" in
    /*ards-battery*) rm -rf "$SANDBOX" ;;
  esac
}
trap cleanup EXIT

# Build a connector fixture from scratch. Echoes its path.
make_fixture() {
  FIXN=$((FIXN + 1))
  local d="$SANDBOX/fx$FIXN"
  bash "$TOOLS/make-connector.sh" "$d" \
      --workspace-id "$FIX_WS_ID" \
      --workspace-name "Battery Fixture" \
      --key-env ARDS_BATTERY_KEY \
      --core "$TEMPLATES/CONTEXT.core.surf" >/dev/null 2>&1 || { echo ""; return 0; }
  git -C "$d" init -q >/dev/null 2>&1
  echo "$d"
}

tree_manifest() {  # $1 = dir -> stable sha manifest of every file
  ( cd "$1" && find . -type f ! -path './.git/*' -print | sort | while IFS= read -r f; do
      if command -v shasum >/dev/null 2>&1; then
        printf '%s  %s\n' "$(shasum -a 256 "$f" | awk '{print $1}')" "$f"
      else
        printf '%s  %s\n' "$(sha256sum "$f" | awk '{print $1}')" "$f"
      fi
    done )
}

py_core_sha() {  # $1 = CONTEXT.surf path
  python3 - "$1" <<'EOF'
import hashlib, sys
from pathlib import Path
raw = Path(sys.argv[1]).read_bytes()
m = b"\n## Core\n"
i = raw.find(m)
if i == -1:
    print("")
else:
    i += len(m)
    j = raw.find(b"\n## ", i)
    print(hashlib.sha256(raw[i:] if j == -1 else raw[i:j + 1]).hexdigest()[:16])
EOF
}

echo "SurfContext ARDS v5.2 tools battery — repo: $REPO"
echo "----------------------------------------------------------------------"

# ── 1. connector generation lints guaranteed ─────────────────────────────────
F1="$(make_fixture)"
if [ -n "${F1:-}" ] && [ -d "$F1" ]; then
  T="$(python3 "$TOOLS/ards-lint.py" --root "$F1" --tier 2>/dev/null)"
  if [ "$T" = "guaranteed" ]; then
    pass "make-connector: generated connector lints tier 'guaranteed'"
  else
    fail "make-connector tier" "got '$T'"
  fi
else
  fail "make-connector" "fixture could not be generated"
fi

# ── 2. sync stamps BOTH root files with the live Core sha ────────────────────
if [ -n "${F1:-}" ]; then
  SHA="$(py_core_sha "$F1/CONTEXT.surf")"
  STAMP_OK=1; LAST=""
  for f in CLAUDE.md AGENTS.md; do
    s="$(sed -n 's/^<!-- ards-core: sha256:\([0-9a-f]*\), ards v5\.2 -->$/\1/p' "$F1/$f" 2>/dev/null | head -1)"
    [ "$s" = "$SHA" ] || { STAMP_OK=0; LAST="$f carries ${s:-none}"; }
  done
  if [ -n "$SHA" ] && [ "$STAMP_OK" -eq 1 ]; then
    pass "sync: CLAUDE.md and AGENTS.md both stamped v5.2 sha256:$SHA"
  else
    fail "sync stamps both roots" "${LAST:-no sha computed}"
  fi

  PTR_OK=1; LASTP=""
  for f in CLAUDE.md AGENTS.md; do
    n="$(grep -cxF "$ARDS_POINTER" "$F1/$f" 2>/dev/null || echo 0)"
    e="$(grep -nxF "$ARDS_END" "$F1/$f" 2>/dev/null | head -1 | cut -d: -f1)"
    p="$(grep -nxF "$ARDS_POINTER" "$F1/$f" 2>/dev/null | head -1 | cut -d: -f1)"
    if [ "$n" != "1" ] || [ -z "$e" ] || [ -z "$p" ] || [ "$p" -le "$e" ]; then
      PTR_OK=0; LASTP="$f: count=$n end=$e pointer=$p"
    fi
  done
  if [ "$PTR_OK" -eq 1 ]; then
    pass "sync: exactly one pointer line per root file, placed after the block"
  else
    fail "pointer line placement" "${LASTP:-}"
  fi
fi

# ── 3. extraction contract: bash awk and python agree ────────────────────────
if [ -n "${F1:-}" ]; then
  PY_SHA="$(py_core_sha "$F1/CONTEXT.surf")"
  BASH_SHA="$(awk '$0=="## Core"{b=1;next} b&&/^## /{exit} b{print}' "$F1/CONTEXT.surf" \
    | { if command -v shasum >/dev/null 2>&1; then shasum -a 256; else sha256sum; fi; } \
    | awk '{print substr($1,1,16)}')"
  if [ -n "$PY_SHA" ] && [ "$PY_SHA" = "$BASH_SHA" ]; then
    pass "extraction contract agrees: awk sha256:$BASH_SHA == python sha256:$PY_SHA"
  else
    fail "extraction contract agrees" "bash=$BASH_SHA python=$PY_SHA"
  fi
fi

# ── 4. make-connector is idempotent (byte-identical second run) ──────────────
FID="$SANDBOX/idem"
if bash "$TOOLS/make-connector.sh" "$FID" --workspace-id "$FIX_WS_ID" \
      --workspace-name "Battery Fixture" --key-env ARDS_BATTERY_KEY \
      --core "$TEMPLATES/CONTEXT.core.surf" >/dev/null 2>&1; then
  tree_manifest "$FID" > "$SANDBOX/idem.run1"
  bash "$TOOLS/make-connector.sh" "$FID" --workspace-id "$FIX_WS_ID" \
      --workspace-name "Battery Fixture" --key-env ARDS_BATTERY_KEY \
      --core "$TEMPLATES/CONTEXT.core.surf" >/dev/null 2>&1
  tree_manifest "$FID" > "$SANDBOX/idem.run2"
  if cmp -s "$SANDBOX/idem.run1" "$SANDBOX/idem.run2"; then
    pass "make-connector: second run is byte-identical across the whole tree"
  else
    fail "make-connector idempotency" "$(diff "$SANDBOX/idem.run1" "$SANDBOX/idem.run2" | head -3 | tr '\n' ' ')"
  fi
else
  fail "make-connector idempotency" "first generation failed"
fi

# ── 5. make-connector refuses a core with no '## Core' heading ───────────────
BADCORE="$SANDBOX/bad-core.surf"
printf -- '---\ntitle: "no core"\n---\n\n## Core Principles\n\nnot the anchor\n' > "$BADCORE"
if bash "$TOOLS/make-connector.sh" "$SANDBOX/badconn" --workspace-id x --workspace-name y \
      --key-env Z --core "$BADCORE" >/dev/null 2>&1; then
  fail "make-connector guard" "accepted a core with no exact '## Core' heading"
else
  pass "make-connector: refuses a --core with no exact '## Core' heading line"
fi

# ── 6. hook scripts are fail-open and bounded ────────────────────────────────
if [ -n "${F1:-}" ]; then
  SS_OUT="$(cd "$F1" && bash .context/tools/hooks/session-start.sh 2>/dev/null)"; SS_RC=$?
  SS_LINES="$(printf '%s\n' "$SS_OUT" | wc -l | tr -d ' ')"
  if [ "$SS_RC" -eq 0 ] && [ "$SS_LINES" -le 60 ]; then
    pass "session-start.sh: exit 0, $SS_LINES lines of stdout (<= 60)"
  else
    fail "session-start.sh bounds" "exit=$SS_RC lines=$SS_LINES"
  fi
  if printf '%s\n' "$SS_OUT" | grep -q '^ards-receipt: v5\.2 core sha256:[0-9a-f]* tier:guaranteed status:verified$'; then
    pass "session-start.sh: v5.2 receipt line, tier guaranteed, status verified"
  else
    fail "session-start.sh receipt" "no verified v5.2 receipt line"
  fi
  if printf '%s\n' "$SS_OUT" | grep -q '^ards-digest: NO-DIGEST'; then
    pass "session-start.sh: NO-DIGEST offline line when the key env var is unset"
  else
    fail "session-start.sh offline digest" "expected a NO-DIGEST line"
  fi

  ST_OUT="$(cd "$F1" && printf '%s' '{"session_id":"s1","transcript_path":"","cwd":".","hook_event_name":"Stop"}' \
            | bash .context/tools/hooks/stop.sh 2>/dev/null)"; ST_RC=$?
  if [ "$ST_RC" -eq 0 ] \
     && printf '%s\n' "$ST_OUT" | grep -q '^ards-write-path:' \
     && printf '%s\n' "$ST_OUT" | grep -q '^ards-receipt: v5\.2 core sha256:'; then
    pass "stop.sh: exit 0, write-path reminder + v5.2 receipt printed"
  else
    fail "stop.sh" "exit=$ST_RC or missing reminder/receipt"
  fi
  if printf '%s\n' "$ST_OUT" | grep -q 'workspace is the canon'; then
    pass "stop.sh: connector wording (workspace write path, not a local fragment path)"
  else
    fail "stop.sh connector wording" "expected the workspace write-path wording"
  fi
fi

# ── 7. TAMPER: stale stamp is caught ─────────────────────────────────────────
F2="$(make_fixture)"
if [ -n "${F2:-}" ]; then
  perl -i -pe 's/^<!-- ards-core: sha256:[0-9a-f]{16},/<!-- ards-core: sha256:0000000000000000,/' "$F2/CLAUDE.md" 2>/dev/null
  OUT="$(python3 "$TOOLS/ards-lint.py" --root "$F2" 2>&1)"; RC=$?
  if [ "$RC" -ne 0 ] && printf '%s\n' "$OUT" | grep -q 'FAIL CLAUDE.md: stamp sha256:0000000000000000'; then
    pass "tamper (stale stamp): lint exits $RC and names the mismatch"
  else
    fail "tamper (stale stamp)" "rc=$RC"
  fi
fi

# ── 8. TAMPER: truncated block is caught ─────────────────────────────────────
F3="$(make_fixture)"
if [ -n "${F3:-}" ]; then
  grep -vxF "$ARDS_END" "$F3/AGENTS.md" > "$F3/.tmp" 2>/dev/null && mv "$F3/.tmp" "$F3/AGENTS.md"
  OUT="$(python3 "$TOOLS/ards-lint.py" --root "$F3" 2>&1)"; RC=$?
  if [ "$RC" -ne 0 ] && printf '%s\n' "$OUT" | grep -qE 'FAIL AGENTS.md: (pointer-only|no ards-core block)'; then
    pass "tamper (truncated block): lint exits $RC and flags the incomplete block"
  else
    fail "tamper (truncated block)" "rc=$RC"
  fi
fi

# ── 9. TAMPER: hand-edited block body is caught ──────────────────────────────
F4="$(make_fixture)"
if [ -n "${F4:-}" ]; then
  perl -i -pe 's/^1\. \*\*Git & deploy/1. **Git and deploy/' "$F4/CLAUDE.md" 2>/dev/null
  OUT="$(python3 "$TOOLS/ards-lint.py" --root "$F4" 2>&1)"; RC=$?
  if [ "$RC" -ne 0 ] && printf '%s\n' "$OUT" | grep -q 'FAIL CLAUDE.md: injected body differs'; then
    pass "tamper (hand-edited block body): lint exits $RC and flags the drift"
  else
    fail "tamper (hand-edited block body)" "rc=$RC"
  fi
fi

# ── 10. TAMPER: non-executable hook is caught ────────────────────────────────
F5="$(make_fixture)"
if [ -n "${F5:-}" ]; then
  chmod -x "$F5/.context/tools/hooks/stop.sh" 2>/dev/null
  OUT="$(python3 "$TOOLS/ards-lint.py" --root "$F5" 2>&1)"; RC=$?
  if [ "$RC" -ne 0 ] && printf '%s\n' "$OUT" | grep -q 'FAIL .context/tools/hooks/stop.sh: hook script not executable'; then
    pass "tamper (hook not executable): lint exits $RC and names the script"
  else
    fail "tamper (hook not executable)" "rc=$RC"
  fi
fi

# ── 11. TAMPER: bare .claude/ ignore is caught (real git) ────────────────────
F6="$(make_fixture)"
if [ -n "${F6:-}" ]; then
  perl -i -pe 's{^\.claude/\*$}{.claude/}; s{^!\.claude/settings\.json$}{}' "$F6/.gitignore" 2>/dev/null
  OUT="$(python3 "$TOOLS/ards-lint.py" --root "$F6" 2>&1)"; RC=$?
  if [ "$RC" -ne 0 ] && printf '%s\n' "$OUT" | grep -q 'FAIL .claude/settings.json is gitignored'; then
    pass "tamper (bare .claude/ ignore): lint exits $RC and flags the un-shippable binding"
  else
    fail "tamper (bare .claude/ ignore)" "rc=$RC"
  fi
fi

# ── 12. TAMPER: hooks removed -> tier drops to 'injected' ────────────────────
F7="$(make_fixture)"
if [ -n "${F7:-}" ]; then
  python3 - "$F7/.claude/settings.json" <<'EOF' 2>/dev/null
import json, sys
p = sys.argv[1]
d = json.load(open(p))
d.pop("hooks", None)
json.dump(d, open(p, "w"), indent=2)
EOF
  T="$(python3 "$TOOLS/ards-lint.py" --root "$F7" --tier 2>/dev/null)"
  if [ "$T" = "injected" ]; then
    pass "tamper (hooks removed): --tier drops from guaranteed to injected"
  else
    fail "tamper (hooks removed) --tier" "got '$T', expected 'injected'"
  fi
fi

# ── 13. TAMPER: connector without .mcp.json cannot be guaranteed ─────────────
F8="$(make_fixture)"
if [ -n "${F8:-}" ]; then
  rm -f "$F8/.mcp.json"
  OUT="$(python3 "$TOOLS/ards-lint.py" --root "$F8" 2>&1)"; RC=$?
  T="$(python3 "$TOOLS/ards-lint.py" --root "$F8" --tier 2>/dev/null)"
  if [ "$RC" -ne 0 ] && [ "$T" != "guaranteed" ] && printf '%s\n' "$OUT" | grep -q 'FAIL .mcp.json: missing'; then
    pass "connector: no .mcp.json -> lint FAILs and tier is '$T', not guaranteed"
  else
    fail "connector .mcp.json requirement" "rc=$RC tier=$T"
  fi
fi

# ── 14. connector: local .surf prose under .context/docs/ is a WARN ──────────
F9="$(make_fixture)"
if [ -n "${F9:-}" ]; then
  mkdir -p "$F9/.context/docs"
  printf -- '---\ntitle: "stale copy"\n---\n' > "$F9/.context/docs/stale-copy.surf"
  OUT="$(python3 "$TOOLS/ards-lint.py" --root "$F9" 2>&1)"; RC=$?
  if [ "$RC" -eq 0 ] && printf '%s\n' "$OUT" | grep -q 'WARN connector mode: 1 .surf file'; then
    pass "connector: local .surf prose warns without failing the gate"
  else
    fail "connector local-prose warn" "rc=$RC"
  fi
fi

# ── 15. contamination gate: seeded hostname blocks, clean input passes ───────
SEED="$SANDBOX/seeded.txt"
printf 'reachable at %s over the tailnet\n' "$FIX_HOST" > "$SEED"
OUT="$(bash "$TOOLS/contamination-gate.sh" "$SEED" 2>&1)"; RC=$?
if [ "$RC" -ne 0 ] && printf '%s\n' "$OUT" | grep -q '\[local-hostname\]'; then
  pass "contamination gate: seeded hostname blocks (exit $RC) and names the class"
else
  fail "contamination gate on a seeded hostname" "rc=$RC"
fi

CLEAN="$SANDBOX/clean.txt"
printf 'a perfectly ordinary line of documentation prose\n' > "$CLEAN"
if bash "$TOOLS/contamination-gate.sh" "$CLEAN" >/dev/null 2>&1; then
  pass "contamination gate: clean input exits 0"
else
  fail "contamination gate on clean input" "exited non-zero"
fi

# ── 15b. contamination gate: a colon in the line must not eat the allow match ─
# Regression (2026-08-26): grep -n output was stripped twice, so any line with
# a colon lost its own prefix, the exact-line --allow never matched, and the
# report showed a truncated line. Seed a colon-bearing hit and allow it.
COLON="$SANDBOX/colon.txt"; COLON_ALLOW="$SANDBOX/colon.allow"
printf 'host: %s is the fixture\n' "$FIX_HOST" > "$COLON"
cp "$COLON" "$COLON_ALLOW"
if bash "$TOOLS/contamination-gate.sh" "$COLON" --allow "$COLON_ALLOW" >/dev/null 2>&1; then
  pass "contamination gate: exact-line allow matches a line containing a colon"
else
  fail "contamination gate allow on a colon-bearing line" "allowed line still reported"
fi

# ── 16. contamination gate: the whole public tree this lane produces ─────────
GOUT="$(bash "$TOOLS/contamination-gate.sh" 2>&1)"; GRC=$?
if [ "$GRC" -eq 0 ]; then
  pass "contamination gate: tools/, templates/ and playbooks/ are clean"
else
  fail "contamination gate on the lane tree" "$(printf '%s\n' "$GOUT" | head -6 | tr '\n' ' ')"
fi

# ── 17. transcript tokens: a streamed request is counted ONCE ────────────────
TR="$SANDBOX/transcript.jsonl"
cat > "$TR" <<'EOF'
{"type":"assistant","requestId":"req-A","timestamp":"2026-08-26T00:00:01Z","message":{"model":"m1","usage":{"input_tokens":100,"output_tokens":10,"cache_creation_input_tokens":0,"cache_read_input_tokens":0}}}
{"type":"assistant","requestId":"req-A","timestamp":"2026-08-26T00:00:02Z","message":{"model":"m1","usage":{"input_tokens":100,"output_tokens":10,"cache_creation_input_tokens":0,"cache_read_input_tokens":0}}}
{"type":"assistant","requestId":"req-B","timestamp":"2026-08-26T00:00:03Z","message":{"model":"m1","usage":{"input_tokens":5,"output_tokens":1,"cache_creation_input_tokens":0,"cache_read_input_tokens":0}}}
EOF
TOUT="$(python3 "$TOOLS/transcript-tokens.py" --transcript "$TR" --root "$SANDBOX" --session s1 2>/dev/null)"
if printf '%s\n' "$TOUT" | grep -q 'requests=2 in=105 out=11 '; then
  pass "transcript tokens: two lines sharing one requestId count as ONE request (requests=2, in=105)"
else
  fail "transcript per-requestId sum" "got '$TOUT'"
fi

# ── 18. task-flip --dry-run posts nothing and advances nothing ───────────────
FT="$(make_fixture)"
if [ -n "${FT:-}" ]; then
  python3 "$TOOLS/transcript-tokens.py" --transcript "$TR" --root "$FT" --session s1 --write --quiet >/dev/null 2>&1
  DOUT="$(bash "$TOOLS/task-flip.sh" TASK-nnn build --dry-run --root "$FT" 2>&1)"; DRC=$?
  if [ "$DRC" -eq 0 ] \
     && printf '%s\n' "$DOUT" | grep -q 'stage_tokens=116' \
     && printf '%s\n' "$DOUT" | grep -q 'dry-run' \
     && [ ! -f "$FT/.context/.token-marker.json" ]; then
    pass "task-flip --dry-run: reports stage_tokens=116, posts nothing, leaves no marker"
  else
    fail "task-flip --dry-run" "rc=$DRC out='$(printf '%s' "$DOUT" | tr '\n' ' ')'"
  fi
fi

# ── 19. sync-skills local fallback ───────────────────────────────────────────
SRC="$SANDBOX/skill-src"
mkdir -p "$SRC/alpha" "$SRC/beta" "$SRC/gamma"
printf -- '---\nname: alpha\ndescription: first\nuser-invocable: true\n---\n\n# Alpha\n' > "$SRC/alpha/SKILL.surf"
printf -- '---\nname: beta\ndescription: second\nuser-invocable: true\n---\n\n# Beta\n' > "$SRC/beta/SKILL.surf"
printf 'no frontmatter here\n' > "$SRC/gamma/SKILL.surf"
FS="$(make_fixture)"
if [ -n "${FS:-}" ]; then
  SOUT="$(bash "$TOOLS/sync-skills.sh" --root "$FS" --from "$SRC" 2>&1)"
  N="$(ls -1 "$FS/.context/skills"/*/SKILL.surf 2>/dev/null | wc -l | tr -d ' ')"
  if printf '%s\n' "$SOUT" | grep -q 'source=local count=2' \
     && [ "$N" = "2" ] \
     && [ -f "$FS/.context/skills/.sync-manifest.json" ] \
     && cmp -s "$SRC/alpha/SKILL.surf" "$FS/.context/skills/alpha/SKILL.surf"; then
    pass "sync-skills: local fallback cached 2 skills byte-exact plus the manifest"
  else
    fail "sync-skills local fallback" "count=$N out='$SOUT'"
  fi
fi

# ── 20. every playbook carries valid frontmatter ─────────────────────────────
PB_OK=1; PB_N=0; PB_LAST=""
for f in "$REPO"/playbooks/*/SKILL.surf; do
  [ -f "$f" ] || continue
  PB_N=$((PB_N + 1))
  head -1 "$f" | grep -qx -- '---' || { PB_OK=0; PB_LAST="$(basename "$(dirname "$f")"): line 1 is not ---"; continue; }
  for k in name description allowed-tools user-invocable disable-model-invocation; do
    grep -q "^$k:" "$f" || { PB_OK=0; PB_LAST="$(basename "$(dirname "$f")"): missing $k:"; }
  done
done
if [ "$PB_OK" -eq 1 ] && [ "$PB_N" -ge 5 ]; then
  pass "playbooks: all $PB_N carry the frontmatter contract"
else
  fail "playbook frontmatter" "${PB_LAST:-only $PB_N found}"
fi

echo "----------------------------------------------------------------------"
if [ "$FAILS" -eq 0 ]; then
  echo "ards-tests: ALL PASS"
else
  echo "ards-tests: $FAILS FAIL(s)"
fi
exit "$FAILS"
