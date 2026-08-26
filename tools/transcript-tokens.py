#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""transcript-tokens.py — sum harness-transcript tokens since the last marker.

The harness writes one JSON object per line. Assistant entries carry `type`
"assistant", a `requestId`, a `timestamp`, and `message.usage` with
input_tokens, output_tokens, cache_creation_input_tokens and
cache_read_input_tokens.

THE TRAP: a streamed request appears as MULTIPLE lines that share one requestId
and carry IDENTICAL usage. Summing per line multiplies the bill. This tool keys
every sum on the unique requestId and counts each request exactly once.

The transcript format is version-specific, so every field is read defensively
and any shape this tool does not recognise is skipped rather than fatal. It
always exits 0.

Usage:
  python3 transcript-tokens.py --transcript <path> [--root <dir>]
                               [--session <id>] [--write] [--quiet]

  --root     connector root holding .context/.token-marker.json and
             .context/.session-tokens.json (default: cwd)
  --write    write .context/.session-tokens.json (default: report only)
  prints one line: ards-tokens: requests=N in=… out=… cache_w=… cache_r=… total=…
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

USAGE_KEYS = ("input_tokens", "output_tokens",
              "cache_creation_input_tokens", "cache_read_input_tokens")


def arg(argv, name, default=None):
    for i, a in enumerate(argv):
        if a == name and i + 1 < len(argv):
            return argv[i + 1]
        if a.startswith(name + "="):
            return a.split("=", 1)[1]
    return default


def read_marker(root: Path) -> dict:
    try:
        d = json.loads((root / ".context" / ".token-marker.json").read_text(encoding="utf-8"))
        return d if isinstance(d, dict) else {}
    except Exception:
        return {}


def scan(transcript: Path, marker: dict, session_id: str) -> dict:
    """Return the per-requestId token totals recorded after the marker."""
    same_session = bool(session_id) and marker.get("session_id") == session_id
    last_rid = marker.get("last_request_id") if same_session else None
    last_ts = marker.get("last_timestamp") if same_session else None

    seen: dict[str, dict] = {}
    order: list[str] = []
    models: dict[str, dict] = {}
    passed_marker = last_rid is None
    last_seen_rid, last_seen_ts = "", ""

    try:
        fh = transcript.open("r", encoding="utf-8", errors="replace")
    except Exception:
        return {"requests": 0, "totals": {k: 0 for k in USAGE_KEYS}, "models": {},
                "last_request_id": "", "last_timestamp": "", "error": "transcript unreadable"}

    with fh:
        for line in fh:
            line = line.strip()
            if not line or line[0] != "{":
                continue
            try:
                obj = json.loads(line)
            except Exception:
                continue
            if not isinstance(obj, dict) or obj.get("type") != "assistant":
                continue
            rid = obj.get("requestId") or obj.get("request_id") or ""
            ts = obj.get("timestamp") or ""
            msg = obj.get("message") if isinstance(obj.get("message"), dict) else {}
            usage = msg.get("usage") if isinstance(msg.get("usage"), dict) else {}
            if not isinstance(usage, dict) or not usage:
                continue
            if rid:
                last_seen_rid = rid
            if ts:
                last_seen_ts = ts

            # Marker skip: everything up to and including the marked request.
            if not passed_marker:
                if rid and rid == last_rid:
                    passed_marker = True
                continue
            if last_rid is None and last_ts and ts and ts <= last_ts:
                continue

            key = rid or ("noid:%s" % ts)
            if key in seen:
                continue  # streamed duplicate line — same request, same usage
            row = {k: int(usage.get(k) or 0) for k in USAGE_KEYS}
            seen[key] = row
            order.append(key)
            m = msg.get("model") or "unknown"
            slot = models.setdefault(m, {k: 0 for k in USAGE_KEYS})
            slot["requests"] = slot.get("requests", 0) + 1
            for k in USAGE_KEYS:
                slot[k] += row[k]

    totals = {k: sum(r[k] for r in seen.values()) for k in USAGE_KEYS}
    return {
        "requests": len(order),
        "totals": totals,
        "models": models,
        "last_request_id": last_seen_rid,
        "last_timestamp": last_seen_ts,
    }


def main(argv: list[str]) -> int:
    root = Path(arg(argv, "--root", os.getcwd())).resolve()
    session_id = arg(argv, "--session", "") or ""
    quiet = "--quiet" in argv
    tpath = arg(argv, "--transcript", "")
    if not tpath:
        if not quiet:
            print("ards-tokens: no transcript path — skipped")
        return 0

    marker = read_marker(root)
    res = scan(Path(tpath), marker, session_id)
    t = res["totals"]
    total = sum(t.values())

    if not quiet:
        if res.get("error"):
            print("ards-tokens: %s — skipped" % res["error"])
        else:
            print("ards-tokens: requests=%d in=%d out=%d cache_w=%d cache_r=%d total=%d"
                  % (res["requests"], t["input_tokens"], t["output_tokens"],
                     t["cache_creation_input_tokens"], t["cache_read_input_tokens"], total))

    if "--write" in argv and not res.get("error"):
        out = {
            "session_id": session_id,
            "since_marker": {
                "session_id": marker.get("session_id", ""),
                "last_request_id": marker.get("last_request_id", ""),
                "last_timestamp": marker.get("last_timestamp", ""),
                "task_id": marker.get("task_id", ""),
                "stage": marker.get("stage", ""),
            },
            "requests": res["requests"],
            "totals": t,
            "total": total,
            "head_request_id": res["last_request_id"],
            "head_timestamp": res["last_timestamp"],
            "models": res["models"],
        }
        try:
            (root / ".context").mkdir(parents=True, exist_ok=True)
            (root / ".context" / ".session-tokens.json").write_text(
                json.dumps(out, indent=2), encoding="utf-8")
        except Exception:
            pass
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv[1:]))
    except Exception:
        sys.exit(0)  # fail-open: never block the harness
