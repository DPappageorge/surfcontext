#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""surfspace-mcp.py — minimal stdlib JSON-RPC client for a Surfspace MCP server.

No third-party dependencies: the hooks that call this must work in a bare login
shell. Two shapes:

  library:  from surfspace_mcp import call
            ok, value = call("list_docs", {"limit": 5}, key=..., url=..., timeout=8)
            `ok` is False and `value` is a short error string on any failure —
            this module never raises out of `call` and never calls sys.exit from
            it, so a fail-open hook stays fail-open.

  cli:      python3 surfspace-mcp.py --key-env VAR [--url URL] [--timeout 8]
                                     [--retries 3] <tool> ['<json args>']
            python3 surfspace-mcp.py --key-env VAR --list
            Prints the tool result as JSON on stdout (exit 0), or
            {"error": "..."} on stdout (exit 1).

The key is read from the environment variable NAMED on the command line. The key
itself is never accepted as an argument, never printed, and never logged.
"""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request

DEFAULT_URL = "https://surf.space/mcp"
RETRY_CODES = (429, 500, 502, 503, 504)


def _post(url: str, key: str, payload: dict, timeout: float):
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": key if key.lower().startswith("bearer ") else "Bearer " + key,
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read().decode("utf-8", "replace")
    # A server may answer a JSON-RPC POST as a single SSE event; accept both.
    stripped = raw.lstrip()
    if stripped.startswith("event:") or stripped.startswith("data:"):
        for line in stripped.splitlines():
            if line.startswith("data:"):
                raw = line[5:].strip()
                break
    return json.loads(raw)


def rpc(method: str, params: dict, key: str, url: str = DEFAULT_URL,
        timeout: float = 8.0, retries: int = 3, deadline: float | None = None):
    """Raw JSON-RPC call. Returns (ok, result_or_error_string)."""
    if not key:
        return False, "no key (env var unset)"
    payload = {"jsonrpc": "2.0", "id": 1, "method": method, "params": params}
    delay = 1.0
    last = "unknown error"
    for attempt in range(max(1, retries)):
        if deadline is not None and time.time() >= deadline:
            return False, "deadline exceeded"
        try:
            out = _post(url, key, payload, timeout)
        except urllib.error.HTTPError as e:
            last = "http %s" % e.code
            if e.code in RETRY_CODES and attempt < retries - 1:
                time.sleep(delay)
                delay = min(delay * 2, 8.0)
                continue
            return False, last
        except Exception as e:  # URLError, TimeoutError, JSON decode, anything
            last = type(e).__name__
            if attempt < retries - 1:
                time.sleep(delay)
                delay = min(delay * 2, 8.0)
                continue
            return False, last
        if isinstance(out, dict) and out.get("error"):
            return False, "rpc error: %s" % json.dumps(out["error"])[:160]
        return True, out.get("result") if isinstance(out, dict) else out
    return False, last


def call(tool: str, args: dict, key: str, url: str = DEFAULT_URL,
         timeout: float = 8.0, retries: int = 3, deadline: float | None = None):
    """tools/call. Returns (ok, parsed_content_or_error_string)."""
    ok, res = rpc("tools/call", {"name": tool, "arguments": args}, key,
                  url=url, timeout=timeout, retries=retries, deadline=deadline)
    if not ok:
        return False, res
    if not isinstance(res, dict):
        return False, "unexpected result shape"
    content = res.get("content") or []
    text = ""
    if content and isinstance(content[0], dict):
        text = content[0].get("text", "")
    if res.get("isError"):
        return False, "tool error: %s" % (text or "?")[:160]
    if not text:
        return True, {}
    try:
        return True, json.loads(text)
    except Exception:
        return True, text


def list_tools(key: str, url: str = DEFAULT_URL, timeout: float = 8.0,
               retries: int = 2, deadline: float | None = None):
    """tools/list. Returns (ok, [tool names] or error string)."""
    ok, res = rpc("tools/list", {}, key, url=url, timeout=timeout,
                  retries=retries, deadline=deadline)
    if not ok:
        return False, res
    if not isinstance(res, dict):
        return False, "unexpected result shape"
    names = [t.get("name", "") for t in res.get("tools", []) if isinstance(t, dict)]
    return True, [n for n in names if n]


def _main(argv: list[str]) -> int:
    key_env = ""
    url = os.environ.get("SURFCONTEXT_MCP_URL", DEFAULT_URL)
    timeout = 8.0
    retries = 3
    want_list = False
    rest: list[str] = []
    i = 0
    while i < len(argv):
        a = argv[i]
        if a == "--key-env" and i + 1 < len(argv):
            key_env = argv[i + 1]; i += 2
        elif a.startswith("--key-env="):
            key_env = a.split("=", 1)[1]; i += 1
        elif a == "--url" and i + 1 < len(argv):
            url = argv[i + 1]; i += 2
        elif a.startswith("--url="):
            url = a.split("=", 1)[1]; i += 1
        elif a == "--timeout" and i + 1 < len(argv):
            timeout = float(argv[i + 1]); i += 2
        elif a == "--retries" and i + 1 < len(argv):
            retries = int(argv[i + 1]); i += 2
        elif a == "--list":
            want_list = True; i += 1
        elif a in ("-h", "--help"):
            print(__doc__)
            return 0
        else:
            rest.append(a); i += 1

    key = os.environ.get(key_env, "") if key_env else ""
    if want_list:
        ok, val = list_tools(key, url=url, timeout=timeout, retries=retries)
    elif rest:
        try:
            args = json.loads(rest[1]) if len(rest) > 1 else {}
        except Exception as exc:
            print(json.dumps({"error": "bad json arguments: %s" % exc}))
            return 1
        ok, val = call(rest[0], args, key, url=url, timeout=timeout, retries=retries)
    else:
        print(json.dumps({"error": "no tool named; pass a tool name or --list"}))
        return 1

    if not ok:
        print(json.dumps({"error": val}))
        return 1
    print(json.dumps(val))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(_main(sys.argv[1:]))
    except Exception as exc:  # never traceback into a hook's stdout
        print(json.dumps({"error": "%s: %s" % (type(exc).__name__, exc)}))
        sys.exit(1)
