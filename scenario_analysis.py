"""Reproduce a planning hypothesis using only Python's standard library.

No API calls, energy estimates, customer data or measured quality results.
Shares are disjoint fractions of all incoming requests, except fallback_share.
"""
import argparse
import json
from pathlib import Path


def calculate(data):
    n = data["requests"]
    resolved = data["successful_resolutions"]
    if not isinstance(n, int) or n <= 0:
        raise ValueError("requests must be a positive integer")
    if not isinstance(resolved, int) or not 0 < resolved <= n:
        raise ValueError("successful_resolutions must be between 1 and requests")
    cache, rules, fallback = (data[k] for k in
        ("cache_share", "deterministic_share", "fallback_share_of_model_requests"))
    if not all(0 <= v <= 1 for v in (cache, rules, fallback)) or cache + rules > 1:
        raise ValueError("shares must be in [0, 1] and cache + deterministic must be <= 1")
    base_rate = data["baseline_calls_per_request"]
    if base_rate <= 0:
        raise ValueError("baseline_calls_per_request must be positive")
    baseline = n * base_rate
    cache_only = n * (1 - cache) * base_rate
    small = n * (1 - cache - rules)
    large = small * fallback
    combined = small + large
    def stage(calls):
        return {"expected_model_calls": round(calls, 6),
                "calls_per_successful_resolution": round(calls / resolved, 6),
                "call_reduction_percent_vs_baseline": round(100 * (1 - calls / baseline), 2)}
    return {
        "evidence_type": "synthetic arithmetic, not an observed deployment result",
        "requests": n, "assumed_successful_resolutions": resolved,
        "baseline": stage(baseline), "cache_only": stage(cache_only),
        "cache_and_routing": stage(combined),
        "routing_breakdown": {"cache_requests": round(n * cache, 6),
            "deterministic_requests": round(n * rules, 6),
            "small_model_calls": round(small, 6), "additional_large_model_calls": round(large, 6)},
        "energy_kwh": None, "carbon_gco2e": None, "sci_gco2e_per_resolution": None,
        "limitations": ["Resolution count and quality are assumptions, not test results.",
            "Calls differ in model, tokens and energy; call reduction is not carbon reduction.",
            "Cache, retrieval, rules, logging and infrastructure still consume resources.",
            "Fallback is included; network retries and multi-turn conversations are not modeled."]
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=Path(__file__).with_name("scenario_inputs.json"))
    parser.add_argument("--output", type=Path)
    parser.add_argument("--resolved", type=int, help="Override the assumed resolution count")
    args = parser.parse_args()
    data = json.loads(args.input.read_text(encoding="utf-8"))
    if args.resolved is not None:
        data["successful_resolutions"] = args.resolved
    try:
        result = calculate(data)
    except (ValueError, TypeError) as error:
        parser.error(str(error))
    result["sensitivity"] = []
    for hit_share in (0.10, 0.30, 0.50):
        alternative = calculate({**data, "cache_share": hit_share})
        result["sensitivity"].append({"cache_share": hit_share,
            **alternative["cache_and_routing"]})
    text = json.dumps(result, indent=2) + "\n"
    if args.output:
        args.output.write_text(text, encoding="utf-8")
    print(text, end="")


if __name__ == "__main__":
    main()
