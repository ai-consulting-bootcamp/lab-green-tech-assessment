"""Green retrofit audit: per-run compute proxies from the Editorial Research Agent's evidence files.

Reads every evidence/editorial_*.json (one file per agent run) and estimates, per run,
how many external calls the agent made. No API is called; no personal data is printed.
Call counts are ESTIMATES derived from the code paths in editorial_agent/graph.py (commit 3939562):
  - Tavily search: 1 per search attempt
  - Open Library: 1 author search + 1 edition lookup per book found, per attempt
  - Google Books: 1 per book with ISBN, per attempt
  - Tavily publisher page: 1 per book, per attempt
  - Gemini describe: ceil(books / 3) per attempt (batches of 3)
  - Gemini judge: 1 per attempt that reached the judge
  - Gemini reformulate: 1 per extra attempt
"""
import json, math, sys, pathlib, statistics, collections

def run_metrics(d):
    hist = d.get("search_history") or []
    attempts = max(len(hist), d.get("search_attempts") or 0, 1)
    books_per_attempt = [h.get("books_count") or 0 for h in hist] or [len(d.get("books") or [])]
    while len(books_per_attempt) < attempts:
        books_per_attempt.append(books_per_attempt[-1])
    reached_judge = bool(d.get("judgments")) or any(h.get("decision") for h in hist)
    gem_describe = sum(math.ceil(b / 3) for b in books_per_attempt if b)
    gem_judge = attempts if reached_judge else 0
    gem_reform = attempts - 1
    tav = attempts + sum(books_per_attempt)
    ol = sum(1 + b for b in books_per_attempt)
    gb = sum(books_per_attempt)
    judg = d.get("judgments") or []
    useful = sum(1 for j in judg if str(j.get("decision", "")).lower() in {"útil", "util", "useful", "sí", "si", "yes"})
    web_chars = sum(len(r.get("content") or "") for r in (d.get("results") or []))
    return {
        "attempts": attempts,
        "books_final": len(d.get("books") or []),
        "gemini_calls": gem_describe + gem_judge + gem_reform,
        "tavily_calls": tav,
        "open_library_calls": ol,
        "google_books_calls": gb,
        "external_calls_total": gem_describe + gem_judge + gem_reform + tav + ol + gb,
        "web_text_chars": web_chars,
        "judged": len(judg),
        "useful": useful,
        "dossier_written": bool(d.get("dossier_path")),
        "error": bool(d.get("error")),
        "author_hash": hash(d.get("author") or "") ,  # only used to count repeats, never printed
        "profile": d.get("profile_name"),
    }

def main(evidence_dir, out_json):
    files = sorted(pathlib.Path(evidence_dir).glob("editorial_*.json"))
    rows = []
    for f in files:
        d = json.loads(f.read_text(encoding="utf-8"))
        m = run_metrics(d); m["run"] = f.stem.replace("editorial_", "")
        rows.append(m)
    ok = [r for r in rows if r["dossier_written"] and not r["error"]]
    authors = collections.Counter(r["author_hash"] for r in rows)
    def med(k, rs): return statistics.median(r[k] for r in rs) if rs else None
    summary = {
        "runs_total": len(rows),
        "runs_with_dossier": len(ok),
        "runs_failed_or_no_dossier": len(rows) - len(ok),
        "distinct_authors": len(authors),
        "runs_same_most_common_author": authors.most_common(1)[0][1] if authors else 0,
        "runs_with_second_attempt": sum(1 for r in rows if r["attempts"] > 1),
        "median_external_calls_per_R": med("external_calls_total", ok),
        "median_gemini_calls_per_R": med("gemini_calls", ok),
        "median_tavily_calls_per_R": med("tavily_calls", ok),
        "median_web_text_chars_per_R": med("web_text_chars", ok),
        "external_calls_spent_on_runs_without_dossier": sum(r["external_calls_total"] for r in rows if r not in ok),
        "judge_acceptance_rate": round(sum(r["useful"] for r in ok) / max(1, sum(r["judged"] for r in ok)), 2),
    }
    for r in rows: r.pop("author_hash")
    pathlib.Path(out_json).write_text(json.dumps({"summary": summary, "runs": rows}, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(summary, indent=2, ensure_ascii=False))
    print(f"{'run':24} att books gem tav ol gb total chars judged useful dossier")
    for r in rows:
        print(f"{r['run']:24} {r['attempts']:>3} {r['books_final']:>5} {r['gemini_calls']:>3} {r['tavily_calls']:>3} {r['open_library_calls']:>2} {r['google_books_calls']:>2} {r['external_calls_total']:>5} {r['web_text_chars']:>5} {r['judged']:>6} {r['useful']:>6} {str(r['dossier_written']):>7}")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
