"""
carbon_evidence.py
Green retrofit audit evidence for my Project 3 "RCSA Evidence & Challenge Agent"
(repo: https://github.com/muratcomez1/AI-assisted-RCSA).

Functional unit R = one RCSA challenge report for one process (7 process-risk pairs),
handed to the Second Line reviewer.

Part 1 reads the real JSON run logs committed in the Project 3 repo (outputs/reports/).
Part 2 measures the real prompt size the llm_challenge node sends per pair, by calling
the repo's own payload builder (no API call is made).
Part 3 turns both into a before/after hypothesis per R.

Usage:
    python3 carbon_evidence.py --repo ../AI-assisted-RCSA > carbon_evidence_output.txt

Token counts use chars / 4 as an approximation (tiktoken not installed). Nothing here
measures energy: tokens and calls are proxies for E in SCI = (E x I + M) per R.
"""
import argparse
import collections
import glob
import json
import os
import re
import sys

CHARS_PER_TOKEN = 4
OUTPUT_TOKENS_PER_CHALLENGE = 250   # assumption: JSON with 2-4 sentences + 2-3 questions
NON_RETRYABLE = ("AuthenticationError", "PermissionDeniedError", "BadRequestError")


def part1_run_logs(repo):
    files = sorted(glob.glob(os.path.join(repo, "outputs", "reports", "rcsa_run_log_*.json")))
    c = collections.Counter()
    models = collections.Counter()
    for f in files:
        log = json.load(open(f, encoding="utf-8"))["run_log"]
        for e in log:
            node, detail = e["node"], e["detail"]
            m = re.search(r"(\d+)/(\d+) challenges written by the LLM \(([^)]+)\)", detail)
            if m:
                ok, n, model = int(m[1]), int(m[2]), m[3]
                c["runs"] += 1
                c["pairs_requested"] += n
                c["llm_ok"] += ok
                if ok > 0:
                    models[model] += 1
            if node == "llm_challenge" and "failed after 2 attempts" in detail:
                c["failed_attempts"] += 2
                err = detail.split("(")[1].split(":")[0]
                c["err_" + err] += 1
                if err in NON_RETRYABLE:
                    c["retries_on_non_retryable"] += 1   # attempt 2 could never succeed
            if node == "external_research":
                m = re.search(r"(\d+) attempts", detail)
                if m and "failed" in detail:
                    c["external_failed_attempts"] += int(m[1])
                if "429" in detail:
                    c["external_429"] += 1
    attempts = c["llm_ok"] + c["failed_attempts"]
    print("=== PART 1: real run logs from Project 3 (outputs/reports) ===")
    print(f"  run logs found                         {len(files)}")
    print(f"  runs reaching llm_challenge            {c['runs']}")
    print(f"  pairs sent to llm_challenge            {c['pairs_requested']}")
    print(f"  challenges written by the LLM          {c['llm_ok']}")
    print(f"  LLM attempts in total                  {attempts}")
    print(f"  LLM attempts that failed               {c['failed_attempts']}  ({c['failed_attempts'] / attempts:.0%} of all attempts)")
    print(f"    401 AuthenticationError (pairs)      {c['err_AuthenticationError']}")
    print(f"    403 PermissionDeniedError (pairs)    {c['err_PermissionDeniedError']}")
    print(f"    400 BadRequestError (pairs)          {c['err_BadRequestError']}")
    print(f"  retries on errors that cannot succeed  {c['retries_on_non_retryable']}")
    print(f"  external API attempts that failed      {c['external_failed_attempts']}  (runs with HTTP 429: {c['external_429']})")
    print(f"  models in successful runs              {dict(models)}")
    return c, attempts


def part2_prompt_size(repo, process):
    sys.path.insert(0, repo)
    from rcsa_agent import llm
    from rcsa_agent.data_loader import load_pairs
    from rcsa_agent.retriever import load_chunks, retrieve
    from rcsa_agent.rules import FLAG_TEXT, evaluate_pair

    pairs, _ = load_pairs(os.path.join(repo, "data", "rcsa_synthetic_data.csv"), process)
    chunks = load_chunks(os.path.join(repo, "knowledge"))
    # 6 external items, as llm_challenge keeps external_items[:6]; snippet up to 300 chars (tavily)
    ext = [{"title": "External context item title", "url": "https://example.org/item", "snippet": "x" * 300}] * 6
    rows = []
    for p in pairs:
        r = evaluate_pair(p)
        f = {"pair": p, "flags": r["flags"], "scenario_result": r["scenario_result"]}
        f["guidance"] = retrieve(p["risk"] + " " + " ".join(FLAG_TEXT[x] for x in r["flags"]), chunks, k=3)
        no_ext, _ = llm._payload(f, [])
        with_ext, _ = llm._payload(f, ext)
        rows.append((p["pair_id"], r["review_priority"], len(no_ext), len(with_ext)))
    sys_chars = len(llm.SYSTEM_PROMPT)
    ext_chars = sum(r[3] - r[2] for r in rows) / len(rows)
    pair_chars = sum(r[2] for r in rows) / len(rows)
    print(f"\n=== PART 2: real prompt size per llm_challenge call ({process}) ===")
    print(f"  pairs in R                             {len(rows)}")
    print(f"  review priority                        {dict(collections.Counter(r[1] for r in rows))}")
    print(f"  system prompt                          {sys_chars} chars  (~{sys_chars // CHARS_PER_TOKEN} tokens), re-sent every call")
    print(f"  pair evidence + guidance (avg)         {pair_chars:.0f} chars  (~{pair_chars / CHARS_PER_TOKEN:.0f} tokens)")
    print(f"  6 external items (avg)                 {ext_chars:.0f} chars  (~{ext_chars / CHARS_PER_TOKEN:.0f} tokens), identical for every pair")
    return rows, sys_chars, pair_chars, ext_chars


def part3_hypothesis(rows, sys_chars, pair_chars, ext_chars):
    n = len(rows)
    low = sum(1 for r in rows if r[1] == "low")
    t = lambda chars: chars / CHARS_PER_TOKEN

    base_calls = n
    base_in = n * t(sys_chars + pair_chars + ext_chars)
    base_out = n * OUTPUT_TOKENS_PER_CHALLENGE
    base_fail_calls = n * 2            # key/permission error: 2 attempts per pair

    llm_pairs = n - low                # low-priority pairs keep the labelled deterministic draft
    new_calls = 1                      # one batched call for all remaining pairs
    new_in = t(sys_chars + ext_chars + llm_pairs * pair_chars)
    new_out = llm_pairs * OUTPUT_TOKENS_PER_CHALLENGE
    new_fail_calls = 1                 # stop at the first non-retryable error

    print("\n=== PART 3: before/after hypothesis per R (estimate) ===")
    print(f"  {'':38}{'before':>10}{'after':>10}{'change':>9}")
    for label, b, a in [("LLM calls (happy path)", base_calls, new_calls),
                        ("input tokens", base_in, new_in),
                        ("output tokens", base_out, new_out),
                        ("total tokens", base_in + base_out, new_in + new_out),
                        ("LLM calls when the key is wrong", base_fail_calls, new_fail_calls)]:
        print(f"  {label:<38}{b:>10,.0f}{a:>10,.0f}{(a - b) / b:>9.0%}")
    print("  NOTE: hypothesis from real code + real logs; tokens are approximate (chars/4) and are a proxy for energy, not energy.")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", required=True, help="path to a clone of AI-assisted-RCSA")
    ap.add_argument("--process", default="Payment Processing")
    a = ap.parse_args()
    part1_run_logs(a.repo)
    part3_hypothesis(*part2_prompt_size(a.repo, a.process))
