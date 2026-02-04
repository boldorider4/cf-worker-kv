#!/usr/bin/env python3
"""
Run curl against /measure/put and /measure/get for N tokens.
Phases:
  1. PUT: NUM_TOKENS puts (one per token), track cumulative ms.
  2. GET (different key each time): NUM_TOKENS gets, one per previously put token.
  3. GET (same key): NUM_TOKENS gets, all for the same token (e.g. last one put).
"""

import os
import re
import subprocess
import sys

# Base URL for the worker (override with MEASURE_BASE_URL env if needed)
BASE_URL = os.environ.get("MEASURE_BASE_URL", "http://cf-worker-kv.boldorider4.workers.dev")
MEASURE_PUT_URL = f"{BASE_URL}/measure/put/"
MEASURE_GET_URL = f"{BASE_URL}/measure/get/"

# Number of fake tokens (parameterized)
NUM_TOKENS = 30
FAKE_TOKENS = [f"fake-token-{i:05d}" for i in range(NUM_TOKENS)]

# Token used for "same key" get phase (e.g. last one put)
SAME_GET_TOKEN = FAKE_TOKENS[-1]

# Match X-KV-Write-Ms header or "timing is N ms" in HTML
HEADER_MS_RE = re.compile(r"^X-KV-Write-Ms:\s*(\d+)", re.IGNORECASE | re.MULTILINE)
BODY_MS_RE = re.compile(r"timing is\s+(\d+)\s*ms", re.IGNORECASE)


def parse_ms_from_response(output: str) -> int | None:
    """Parse millisecond value from curl output (headers + body)."""
    m = HEADER_MS_RE.search(output)
    if m:
        return int(m.group(1))
    m = BODY_MS_RE.search(output)
    if m:
        return int(m.group(1))
    return None


def run_measure_put(token: str) -> str:
    """Run curl PUT /measure/put/ for one token; return full stdout+stderr."""
    cmd = [
        "curl",
        "-s",
        "-i",
        "-X",
        "GET",
        "-H",
        f"Authorization: Bearer {token}",
        MEASURE_PUT_URL,
    ]
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=30,
    )
    return result.stdout + result.stderr


def run_measure_get(token: str) -> str:
    """Run curl GET /measure/get/ for one token; return full stdout+stderr."""
    cmd = [
        "curl",
        "-s",
        "-i",
        "-X",
        "GET",
        "-H",
        f"Authorization: Bearer {token}",
        MEASURE_GET_URL,
    ]
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=30,
    )
    return result.stdout + result.stderr


def run_phase(
    phase_name: str,
    total: int,
    run_fn,
    tokens: list[str],
    *,
    token_label: str | None = None,
) -> tuple[int, int]:
    """Run a phase: total requests, each with run_fn(token). Returns (cumulative_ms, failed)."""
    cumulative_ms = 0
    failed = 0
    print(f"\n--- {phase_name} ({total} requests) ---")
    for i, token in enumerate(tokens):
        try:
            output = run_fn(token)
            ms = parse_ms_from_response(output)
            if ms is not None:
                cumulative_ms += ms
            else:
                failed += 1
        except subprocess.TimeoutExpired:
            failed += 1
            print(f"  [{i + 1:4d}/{total}] timeout", file=sys.stderr)
        except Exception as e:
            failed += 1
            print(f"  [{i + 1:4d}/{total}] error: {e}", file=sys.stderr)
    label = f" token={token_label}" if token_label else ""
    print(f"  Cumulative ms: {cumulative_ms}, Failed: {failed}{label}")
    return cumulative_ms, failed


def main() -> None:
    total = NUM_TOKENS
    print(f"Base URL: {BASE_URL}")
    print(f"NUM_TOKENS: {total}")

    # Phase 1: PUT each token
    put_cumulative, put_failed = run_phase(
        "Phase 1: PUT (one per token)",
        total,
        run_measure_put,
        FAKE_TOKENS,
    )
    if put_failed:
        print(f"Put phase had {put_failed} failures.", file=sys.stderr)

    # Phase 2: GET each previously put token (different key per request)
    get_diff_cumulative, get_diff_failed = run_phase(
        "Phase 2: GET (different key each request)",
        total,
        run_measure_get,
        FAKE_TOKENS,
    )

    # Phase 3: GET same token NUM_TOKENS times
    same_tokens = [SAME_GET_TOKEN] * total
    get_same_cumulative, get_same_failed = run_phase(
        "Phase 3: GET (same key every request)",
        total,
        run_measure_get,
        same_tokens,
        token_label=SAME_GET_TOKEN,
    )

    # Summary
    def avg(cumulative: int, failed: int) -> str:
        n = total - failed
        return f"{cumulative / n:.2f}" if n else "n/a"

    print("\n" + "=" * 50)
    print("Summary")
    print("=" * 50)
    print(f"  PUT  cumulative ms: {put_cumulative}  avg ms: {avg(put_cumulative, put_failed)}  (failed: {put_failed})")
    print(f"  GET  (different)   cumulative ms: {get_diff_cumulative}  avg ms: {avg(get_diff_cumulative, get_diff_failed)}  (failed: {get_diff_failed})")
    print(f"  GET  (same key)    cumulative ms: {get_same_cumulative}  avg ms: {avg(get_same_cumulative, get_same_failed)}  (failed: {get_same_failed})")
    total_failed = put_failed + get_diff_failed + get_same_failed
    if total_failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
