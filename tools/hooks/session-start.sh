#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# session-start.sh — SurfContext ARDS v5.1 harness binding (SessionStart).
#
# Two jobs, in order:
#   1. Emit the conformance receipt: recompute the CONTEXT.surf "## Core" sha,
#      compare it to the stamp actually injected into CLAUDE.md, and print the
#      tier that tools/ards-lint.py --tier measures.
#   2. When surfcontext.json declares home "surfspace", append a bounded digest
#      of the workspace canon: important docs, newest active-work, open cards,
#      and a repo roll-call for the projects the connector declares.
#
# Contract: FAIL-OPEN. Every step is wrapped; this script always exits 0 and a
# bug in it must never block a session. Total stdout is hard-capped at 60 lines
# and the whole run at 10 seconds of wall clock. The workspace key is read from
# the environment variable NAMED in surfcontext.json workspace.key_env; it is
# never echoed, never logged, never written to the cache.
#
# Core extraction contract (identical in tools/surfcontext-sync.sh,
# tools/ards-lint.py and tools/hooks/stop.sh): bytes after the newline
# terminating the line exactly equal to "## Core", up to but excluding the first
# later line starting "## ". Stamp = sha256 of those bytes, first 16 hex chars.

set -u

ARDS_VERSION="5.1"
MAX_LINES=60
WALL_SECONDS=10

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

ards_sha256_16() {
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" 2>/dev/null | awk '{print substr($1,1,16)}'
  elif command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" 2>/dev/null | awk '{print substr($1,1,16)}'
  else
    echo "NO-SHA256-TOOL"
  fi
}

ards_core_sha() {  # $1 = CONTEXT.surf path
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

ards_report() {
  [ -n "$ROOT" ] || { echo "ards-receipt: v${ARDS_VERSION} core sha256:UNKNOWN tier:discovered status:STALE-RUN-SYNC"; return 0; }
  cd "$ROOT" 2>/dev/null || return 0

  # --- 1. receipt -----------------------------------------------------------
  local sha stamp status tier
  sha="NO-CONTEXT"
  [ -f CONTEXT.surf ] && sha="$(ards_core_sha CONTEXT.surf)"
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
  [ "$status" = "verified" ] || \
    echo "ards-receipt: CLAUDE.md carries sha256:${stamp:-none} — run tools/surfcontext-sync.sh"

  # --- 2. workspace digest (connector mode only) ----------------------------
  grep -q '"home"[[:space:]]*:[[:space:]]*"surfspace"' surfcontext.json 2>/dev/null || return 0
  [ -n "$TOOLS_DIR" ] && [ -f "$TOOLS_DIR/surfspace-mcp.py" ] || return 0

  echo ""
  SURFCONTEXT_ROOT="$ROOT" \
  SURFCONTEXT_TOOLS="$TOOLS_DIR" \
  SURFCONTEXT_DEADLINE="$WALL_SECONDS" \
  python3 - <<'PYDIGEST' 2>/dev/null
import importlib.util, json, os, subprocess, time
from pathlib import Path

start = time.time()
root = Path(os.environ["SURFCONTEXT_ROOT"])
tools = Path(os.environ["SURFCONTEXT_TOOLS"])
deadline = start + float(os.environ.get("SURFCONTEXT_DEADLINE", "10")) - 1.0
cache_path = root / ".context" / ".digest-cache.json"
lines = []

def emit(s):
    if len(lines) < 40:
        lines.append(s)

def load_cfg():
    try:
        return json.loads((root / "surfcontext.json").read_text(encoding="utf-8"))
    except Exception:
        return {}

def load_client():
    spec = importlib.util.spec_from_file_location("surfspace_mcp", str(tools / "surfspace-mcp.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

def print_cache(reason):
    try:
        c = json.loads(cache_path.read_text(encoding="utf-8"))
        age = int(time.time() - float(c.get("at", 0)))
        print("ards-digest: STALE-CACHE %ds old (%s) — the workspace was not reachable" % (age, reason))
        for ln in c.get("lines", [])[:40]:
            print(ln)
    except Exception:
        print("ards-digest: NO-DIGEST (%s) — working offline from CONTEXT.surf '## Core' alone" % reason)

cfg = load_cfg()
ws = cfg.get("workspace", {}) or {}
key_env = ws.get("key_env") or ""
url = ws.get("url") or "https://surf.space/mcp"
key = os.environ.get(key_env, "") if key_env else ""

if not key:
    print_cache("%s unset" % (key_env or "workspace.key_env"))
    raise SystemExit(0)

try:
    mcp = load_client()
except Exception as exc:
    print_cache(type(exc).__name__)
    raise SystemExit(0)

def call(tool, args, timeout=4.0):
    return mcp.call(tool, args, key, url=url, timeout=timeout, retries=2, deadline=deadline)

failures = 0

# --- important docs (context set) -------------------------------------------
ok, docs = call("list_docs", {"limit": 50})
if ok and isinstance(docs, dict):
    docs = docs.get("docs") or docs.get("items") or []
if ok and isinstance(docs, list):
    imp = [d for d in docs if isinstance(d, dict) and d.get("is_important")][:8]
    emit("ards-digest: important docs (%d) — the workspace context set" % len(imp))
    for d in imp:
        emit("- %s  [%s]" % (d.get("title", "?"), d.get("slug") or d.get("id", "?")))
        if time.time() < deadline - 2 and (d.get("slug") or d.get("id")):
            ok2, doc = call("read_doc", {"slug": d.get("slug")} if d.get("slug") else {"doc_id": d.get("id")}, timeout=3.0)
            body = ""
            if ok2 and isinstance(doc, dict):
                body = doc.get("content") or doc.get("body") or ""
            if isinstance(body, str) and body.startswith("---"):
                fm = body.split("---", 2)[1] if body.count("---") >= 2 else ""
                ans, n = False, 0
                for ln in fm.splitlines():
                    if ln.startswith("answers:"):
                        ans = True
                        continue
                    if ans and ln.strip().startswith("-") and n < 2:
                        emit("    answers: %s" % ln.strip().lstrip("- ").strip())
                        n += 1
                    elif ans and ln and not ln.startswith((" ", "\t", "-")):
                        break
else:
    failures += 1

# --- newest active-work ------------------------------------------------------
ok, recent = call("list_docs", {"tag": "active-work", "limit": 5})
if ok and isinstance(recent, dict):
    recent = recent.get("docs") or recent.get("items") or []
if ok and isinstance(recent, list):
    emit("")
    emit("ards-digest: newest active-work (the write path; the workspace is the canon)")
    for d in recent[:5]:
        if isinstance(d, dict):
            emit("- %s  [%s]" % (d.get("title", "?"), d.get("slug") or d.get("id", "?")))
else:
    failures += 1

# --- open cards --------------------------------------------------------------
cards = []
for stage in ("build", "verify"):
    ok, got = call("list_tasks", {"status": stage, "limit": 10})
    if ok and isinstance(got, dict):
        got = got.get("tasks") or got.get("items") or []
    if ok and isinstance(got, list):
        cards.extend([t for t in got if isinstance(t, dict)])
    else:
        failures += 1
if cards:
    emit("")
    emit("ards-digest: open cards (build, then verify)")
    for t in cards[:10]:
        emit("- %s  %s  [%s]" % (t.get("task_id") or t.get("id", "?"),
                                 (t.get("name") or t.get("title") or "?")[:60],
                                 t.get("status") or t.get("stage", "?")))

# --- repo roll-call ----------------------------------------------------------
projects = cfg.get("projects") or []
if isinstance(projects, list) and projects:
    host = url.split("//", 1)[-1].split("/", 1)[0]
    emit("")
    emit("ards-digest: repo roll-call")
    for p in projects[:10]:
        if not isinstance(p, dict):
            continue
        want = (p.get("origin_expected") or "").lower()
        repos = p.get("repos")
        if not isinstance(repos, list) or not repos:
            repos = [p.get("path") or p.get("repo") or ""]
        for rel in repos[:12]:
            rel = rel if isinstance(rel, str) else ""
            d = (root / rel) if rel else root
            if not d.is_dir():
                emit("- %s: absent (not on this machine)" % (rel or "."))
                continue
            origin = ""
            try:
                origin = subprocess.run(["git", "remote", "get-url", "origin"], cwd=str(d),
                                        capture_output=True, text=True, timeout=4).stdout.strip()
            except Exception:
                origin = ""
            if not origin:
                emit("- %s: no origin (not a checkout here)" % (rel or "."))
            elif want == "workspace" and host not in origin:
                emit("- %s: WARN origin is not the workspace remote (%s)" % (rel or ".", origin[:60]))
            else:
                emit("- %s: %s" % (rel or ".", origin[:60]))

if failures and not lines:
    print_cache("%d workspace call(s) failed" % failures)
    raise SystemExit(0)

for ln in lines:
    print(ln)

try:
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_text(json.dumps({"at": time.time(), "lines": lines}, indent=1), encoding="utf-8")
except Exception:
    pass
PYDIGEST
}

{ ards_report 2>/dev/null || true; } | head -n "$MAX_LINES"

exit 0
