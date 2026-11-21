#!/usr/bin/env python3
"""Summarize per-report workload proxies for a green-software assessment.

Input is one row per completed report and scenario. The bundled CSV is deliberately
synthetic; this tool does not calculate or assert actual energy use / CO2e.
"""
import argparse
import csv
import json
from collections import defaultdict
from pathlib import Path

METRICS = ["model_calls", "external_api_calls", "input_tokens", "output_tokens", "latency_ms"]


def summarize(path: Path):
    groups = defaultdict(list)
    with path.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        missing = {"scenario", "report_id", *METRICS} - set(reader.fieldnames or ())
        if missing:
            raise ValueError(f"Missing columns: {', '.join(sorted(missing))}")
        for row in reader:
            scenario = row["scenario"].strip()
            if not scenario or not row["report_id"].strip():
                raise ValueError("Each row requires scenario and report_id")
            numeric = {}
            for metric in METRICS:
                value = float(row[metric])
                if value < 0:
                    raise ValueError(f"Negative {metric} is invalid")
                numeric[metric] = value
            groups[scenario].append((row["report_id"].strip(), numeric))
    if not groups:
        raise ValueError("No records in input")
    result = {}
    for scenario, rows in sorted(groups.items()):
        ids = [rid for rid, _ in rows]
        if len(set(ids)) != len(ids):
            raise ValueError(f"Duplicate report_id in scenario {scenario}")
        n = len(rows)
        totals = {metric: sum(item[metric] for _, item in rows) for metric in METRICS}
        result[scenario] = {
            "completed_reports_R": n,
            "model_calls_per_R": round(totals["model_calls"] / n, 3),
            "external_api_calls_per_R": round(totals["external_api_calls"] / n, 3),
            "tokens_per_R": round((totals["input_tokens"] + totals["output_tokens"]) / n, 3),
            "latency_ms_per_R_mean": round(totals["latency_ms"] / n, 3),
            "totals": totals,
        }
    if "baseline" in result and "proposed" in result:
        keys = ["model_calls_per_R", "external_api_calls_per_R", "tokens_per_R", "latency_ms_per_R_mean"]
        result["scenario_comparison_percent"] = {
            metric: round((result["proposed"][metric] / result["baseline"][metric] - 1) * 100, 1)
            if result["baseline"][metric] else None for metric in keys
        }
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="CSV with per-report scenario workload rows")
    parser.add_argument("--output", type=Path, help="Optional JSON output path")
    args = parser.parse_args()
    result = summarize(args.input)
    print(json.dumps(result, indent=2, sort_keys=True))
    if args.output:
        args.output.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
