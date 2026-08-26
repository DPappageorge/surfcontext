#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""ards-lint.py — SurfContext ARDS v5.1 conformance linter. stdlib only.

Tenet 12: pushed context is the only guaranteed context. A root file that merely
POINTS at CONTEXT.surf is non-conformant — the rules must be in the file the
harness actually loads, stamped so drift is detectable, and the harness bindings
that carry the receipt must actually exist.

FAIL checks (exit 1)
  1. CLAUDE.md / AGENTS.md carry a complete ards-core begin..end block
     (missing block, or a pointer-only file, is the non-conformance).
  2. The stamp in each block equals a freshly computed Core sha.
  3. The block body is byte-identical to CONTEXT.surf's "## Core" body
     (catches hand edits to the generated file).
  4. The Core body fits coreInjection.budget tokens (budget * 4 chars).
  5. Every binding declared in surfcontext.json is materialized: the hook entry
     exists in .claude/settings.json, its script exists and is executable, and
     .claude/settings.json is not gitignored (an ignored file cannot ship).
  6. Connector mode (surfcontext.json `home` == "surfspace"): workspace.key_env
     is declared and a .mcp.json exists. Without both, the session cannot reach
     the canon and the tier cannot be guaranteed.

WARN checks (printed, exit 0)
  - connector mode: any .surf under .context/docs/ (the workspace is the canon;
    local prose duplicates it and goes stale)
  - repo mode: the newest active-work fragments with no `answers:` frontmatter
  - CONTEXT.surf frontmatter `updated:` older than 7 days

--tier prints one word: guaranteed | injected | discovered.

Core extraction contract (identical in tools/surfcontext-sync.sh and both hooks
in tools/hooks/): the bytes AFTER the newline terminating the line exactly equal
to "## Core", up to but EXCLUDING the first later line starting "## ". Stamp =
sha256 of exactly those bytes, truncated to 16 hex chars. A later
"## Core Principles" must never match.

Usage:  python3 tools/ards-lint.py [--root <dir>] [--tier] [--quiet]
"""
from __future__ import annotations

import datetime
import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

ARDS_VERSION = "5.1"

CORE_HEADING = b"\n## Core\n"
BEGIN = "<!-- ards-core: begin (generated from CONTEXT.surf ## Core - edit THERE, never here) -->"
END = "<!-- ards-core: end -->"
STAMP_RE = re.compile(
    r"^<!-- ards-core: sha256:([0-9a-f]{16}), ards v" + re.escape(ARDS_VERSION) + r" -->$",
    re.M,
)
ROOT_FILES = ("CLAUDE.md", "AGENTS.md")

# declared binding name -> (settings.json hook event, hook script path)
BINDING_MAP = {
    "session-start": ("SessionStart", ".context/tools/hooks/session-start.sh"),
    "stop": ("Stop", ".context/tools/hooks/stop.sh"),
}

FRAGMENT_SCAN = 10
STALE_DAYS = 7


def parse_root(argv: list[str]) -> Path:
    for i, a in enumerate(argv):
        if a == "--root" and i + 1 < len(argv):
            return Path(argv[i + 1]).resolve()
        if a.startswith("--root="):
            return Path(a.split("=", 1)[1]).resolve()
    return Path(os.getcwd()).resolve()


# ── Core extraction ──────────────────────────────────────────────────────────
def core_body(repo: Path) -> bytes | None:
    ctx = repo / "CONTEXT.surf"
    if not ctx.is_file():
        return None
    raw = ctx.read_bytes()
    i = raw.find(CORE_HEADING)
    if i == -1:
        return None
    i += len(CORE_HEADING)
    j = raw.find(b"\n## ", i)
    return raw[i:] if j == -1 else raw[i:j + 1]


def core_stamp(body: bytes) -> str:
    return hashlib.sha256(body).hexdigest()[:16]


def block_body(text: str) -> bytes | None:
    """The Core bytes carried inside a root file's ards-core block, or None."""
    if BEGIN not in text or END not in text:
        return None
    after = text.split(BEGIN, 1)[1]
    if not after.startswith("\n"):
        return None
    after = after[1:]
    if END not in after:
        return None
    inner = after.split(END, 1)[0]
    # Strip the trailing stamp comment line (and the newline that ends it).
    m = STAMP_RE.search(inner)
    if m:
        inner = inner[: m.start()]
    return inner.encode("utf-8")


# ── checks ───────────────────────────────────────────────────────────────────
class Report:
    def __init__(self) -> None:
        self.fails: list[str] = []
        self.warns: list[str] = []
        self.oks: list[str] = []

    def fail(self, msg: str) -> None:
        self.fails.append(msg)

    def warn(self, msg: str) -> None:
        self.warns.append(msg)

    def ok(self, msg: str) -> None:
        self.oks.append(msg)


def load_config(repo: Path) -> dict:
    try:
        return json.loads((repo / "surfcontext.json").read_text(encoding="utf-8"))
    except Exception:
        return {}


def check_blocks(rep: Report, repo: Path, body: bytes | None, stamp: str) -> bool:
    """FAIL checks 1-3. True when every root file's block is conformant."""
    if body is None:
        rep.fail("CONTEXT.surf: no exact '## Core' heading — nothing to inject")
        return False
    clean = True
    for name in ROOT_FILES:
        p = repo / name
        if not p.is_file():
            rep.fail(f"{name}: missing — the harness root file must exist and carry the Core block")
            clean = False
            continue
        text = p.read_text(encoding="utf-8")
        got = block_body(text)
        if got is None:
            kind = "pointer-only" if "CONTEXT.surf" in text else "no ards-core block"
            rep.fail(f"{name}: {kind} — run tools/surfcontext-sync.sh")
            clean = False
            continue
        m = STAMP_RE.search(text)
        if not m:
            rep.fail(f"{name}: ards-core block carries no v{ARDS_VERSION} sha256 stamp line")
            clean = False
            continue
        if m.group(1) != stamp:
            rep.fail(
                f"{name}: stamp sha256:{m.group(1)} != CONTEXT.surf Core sha256:{stamp} "
                "— stale, run tools/surfcontext-sync.sh"
            )
            clean = False
            continue
        if got != body:
            rep.fail(
                f"{name}: injected body differs from CONTEXT.surf '## Core' "
                f"({len(got)} vs {len(body)} bytes) — hand-edited; edit CONTEXT.surf and re-sync"
            )
            clean = False
            continue
        rep.ok(f"{name}: ards-core block present, stamped sha256:{stamp}, body matches CONTEXT.surf")
    return clean


def check_budget(rep: Report, body: bytes | None, cfg: dict) -> None:
    if body is None:
        return
    budget_tokens = int(cfg.get("coreInjection", {}).get("budget", 2000))
    limit = budget_tokens * 4
    n = len(body.decode("utf-8", "replace"))
    if n > limit:
        rep.fail(f"CONTEXT.surf '## Core': {n} chars over budget {limit} ({budget_tokens} tokens) — compress it")
    else:
        rep.ok(f"Core body {n} chars / {limit} budget (~{n // 4} of {budget_tokens} tokens)")


def check_bindings(rep: Report, repo: Path, cfg: dict) -> bool:
    """FAIL check 5. True when every declared binding is materialized."""
    declared = cfg.get("bindings", {}).get("claude-code", {}).get("hooks", [])
    if not declared:
        rep.warn("surfcontext.json: no claude-code bindings declared — tier cannot exceed 'injected'")
        return False

    settings_path = repo / ".claude" / "settings.json"
    clean = True

    try:
        out = subprocess.run(
            ["git", "check-ignore", "-q", ".claude/settings.json"],
            cwd=repo, capture_output=True, timeout=10,
        )
        if out.returncode == 0:
            rep.fail(
                ".claude/settings.json is gitignored — bindings cannot ship "
                "(.gitignore needs '.claude/*' + '!.claude/settings.json')"
            )
            clean = False
    except Exception:
        rep.warn("git check-ignore unavailable — could not verify .claude/settings.json is committable")

    if not settings_path.is_file():
        rep.fail(".claude/settings.json: missing — declared bindings are not materialized")
        return False
    try:
        settings = json.loads(settings_path.read_text(encoding="utf-8"))
    except Exception as exc:
        rep.fail(f".claude/settings.json: unparseable ({exc}) — bindings cannot load")
        return False

    hooks = settings.get("hooks", {})
    for name in declared:
        event, script_rel = BINDING_MAP.get(name, (None, None))
        if event is None:
            rep.warn(f"surfcontext.json bindings: unknown hook '{name}' — no mapping to a Claude Code event")
            clean = False
            continue
        entries = hooks.get(event, [])
        commands = [
            h.get("command", "")
            for group in entries if isinstance(group, dict)
            for h in group.get("hooks", []) if isinstance(h, dict)
        ]
        if not any(script_rel in c for c in commands):
            rep.fail(f".claude/settings.json: declared binding '{name}' has no {event} hook running {script_rel}")
            clean = False
            continue
        script = repo / script_rel
        if not script.is_file():
            rep.fail(f"{script_rel}: hook script missing — binding '{name}' declared but not present")
            clean = False
        elif not script.stat().st_mode & 0o111:
            rep.fail(f"{script_rel}: hook script not executable — chmod +x it")
            clean = False
        else:
            rep.ok(f"binding '{name}' -> {event} -> {script_rel} (present, executable)")
    return clean


def check_connector(rep: Report, repo: Path, cfg: dict) -> bool:
    """FAIL check 6 plus the local-prose WARN. Connector mode only."""
    clean = True
    ws = cfg.get("workspace", {}) or {}
    key_env = ws.get("key_env") or ""
    if not key_env:
        rep.fail("surfcontext.json: home is 'surfspace' but workspace.key_env is not declared — the session cannot reach the canon")
        clean = False
    elif not re.match(r"^[A-Z][A-Z0-9_]*$", key_env):
        rep.warn(f"surfcontext.json: workspace.key_env '{key_env}' is not an environment-variable name")
    else:
        rep.ok(f"workspace.key_env declared as {key_env} (name only — the key itself is never stored here)")

    mcp = repo / ".mcp.json"
    if not mcp.is_file():
        rep.fail(".mcp.json: missing — a connector needs the project-scoped MCP server entry")
        clean = False
    else:
        try:
            servers = json.loads(mcp.read_text(encoding="utf-8")).get("mcpServers", {})
        except Exception as exc:
            rep.fail(f".mcp.json: unparseable ({exc})")
            return False
        if not servers:
            rep.fail(".mcp.json: no mcpServers entry")
            clean = False
        else:
            bad = [n for n, s in servers.items() if isinstance(s, dict) and s.get("url") and not s.get("type")]
            if bad:
                rep.fail(f".mcp.json: url entries missing the required 'type' field: {', '.join(bad)}")
                clean = False
            else:
                rep.ok(f".mcp.json: {len(servers)} server entry/entries, url entries typed")
            if key_env:
                blob = mcp.read_text(encoding="utf-8")
                if "${" + key_env + "}" not in blob:
                    rep.warn(f".mcp.json: no ${{{key_env}}} reference — the pinned workspace key may not be wired")

    docs = repo / ".context" / "docs"
    if docs.is_dir():
        stray = sorted(p.name for p in docs.rglob("*.surf"))
        if stray:
            rep.warn(
                f"connector mode: {len(stray)} .surf file(s) under .context/docs/ — the workspace is the canon, "
                "local prose duplicates it and goes stale: "
                + ", ".join(stray[:5])
                + (" …" if len(stray) > 5 else "")
            )
    return clean


def check_fragments(rep: Report, repo: Path, cfg: dict) -> None:
    streams = cfg.get("fragmentStreams", {}) or {}
    rel = (streams.get("active-work", {}) or {}).get("dir", ".context/docs/active-work")
    frag_dir = repo / rel
    if not frag_dir.is_dir():
        rep.warn(f"{rel}: fragment dir missing — relevance-hook check skipped")
        return
    frags = sorted(
        (f for f in frag_dir.glob("*.surf") if re.match(r"^\d{4}-\d{2}-\d{2}", f.name)),
        reverse=True,
    )[:FRAGMENT_SCAN]
    missing = [
        f.name for f in frags
        if not re.search(r"^answers:\s*$", f.read_text(encoding="utf-8", errors="replace"), re.M)
    ]
    if missing:
        rep.warn(
            f"fragments: {len(missing)}/{len(frags)} newest active-work fragments have no `answers:` frontmatter — "
            + ", ".join(missing[:4])
            + (" …" if len(missing) > 4 else "")
        )
    elif frags:
        rep.ok(f"fragments: all {len(frags)} newest carry `answers:` relevance hooks")


def check_updated(rep: Report, repo: Path) -> None:
    ctx = repo / "CONTEXT.surf"
    if not ctx.is_file():
        return
    m = re.search(r"^updated:\s*(\d{4}-\d{2}-\d{2})\s*$", ctx.read_text(encoding="utf-8"), re.M)
    if not m:
        rep.warn("CONTEXT.surf: no frontmatter `updated:` date")
        return
    try:
        d = datetime.date.fromisoformat(m.group(1))
    except ValueError:
        rep.warn(f"CONTEXT.surf: unparseable `updated: {m.group(1)}`")
        return
    age = (datetime.date.today() - d).days
    if age > STALE_DAYS:
        rep.warn(f"CONTEXT.surf: `updated: {m.group(1)}` is {age} days old (>{STALE_DAYS}) — re-verify the canon")
    else:
        rep.ok(f"CONTEXT.surf: updated {m.group(1)} ({age}d old)")


# ── main ─────────────────────────────────────────────────────────────────────
def main(argv: list[str]) -> int:
    tier_only = "--tier" in argv
    quiet = "--quiet" in argv
    repo = parse_root(argv)

    cfg = load_config(repo)
    body = core_body(repo)
    stamp = core_stamp(body) if body is not None else ""
    connector = str(cfg.get("home", "")).lower() == "surfspace"

    rep = Report()
    blocks_ok = check_blocks(rep, repo, body, stamp)
    check_budget(rep, body, cfg)
    bindings_ok = check_bindings(rep, repo, cfg)
    if connector:
        connector_ok = check_connector(rep, repo, cfg)
    else:
        connector_ok = True
        check_fragments(rep, repo, cfg)
    check_updated(rep, repo)

    failed = bool(rep.fails)
    if not failed and blocks_ok and bindings_ok and connector_ok:
        tier = "guaranteed"
    elif blocks_ok:
        tier = "injected"
    else:
        tier = "discovered"

    if tier_only:
        print(tier)
        return 0

    if not quiet:
        for line in rep.oks:
            print(f"OK   {line}")
    for line in rep.warns:
        print(f"WARN {line}")
    for line in rep.fails:
        print(f"FAIL {line}")

    print(f"ards-lint: {len(rep.fails)} fail, {len(rep.warns)} warn — conformance tier: {tier}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
