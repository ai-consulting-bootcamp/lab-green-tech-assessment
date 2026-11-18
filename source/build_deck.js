const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/root/.claude/skills/synced/e0598609-6285-477e-9be2-d5f2f63d378e_d66f0c12-d111-4893-bfce-d6c7aae3757b/pptx/scripts/apply_theme.js");

const THEME = {
  name: "Carbon Story",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1B2420", lt1: "FFFFFF", dk2: "1F3B2D", lt2: "EEF3EF",
    accent1: "3E8E5E", // carbon / leaf
    accent2: "D9961A", // energy / amber
    accent3: "5B6B7A", // hardware / slate
    accent4: "2A8C9A", // measurement / teal
    accent5: "B8463A", // hot / risk
    accent6: "A9C9B3", // soft green
    hlink: "2A8C9A", folHlink: "5B6B7A",
  },
};
const HEX = THEME.colors;

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Defending the carbon story of the Vendor DD Agent";
pres.author = "Pieter Albrecht";
const C = pres.SchemeColor;

const PILLAR = {
  Carbon: C.accent1, Energy: C.accent2, Hardware: C.accent3, Measurement: C.accent4,
};

// ---------------------------------------------------------------- layouts
pres.defineSlideMaster({
  title: "DARK",
  background: { color: C.text2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 1.5, w: 8.8, h: 1.5,
      fontSize: 36, bold: true, color: C.background1, valign: "bottom", fontFace: THEME.headFontFace }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.6, y: 3.15, w: 8.8, h: 1.2,
      fontSize: 16, color: C.accent6, valign: "top" }, text: "" } },
  ],
});

pres.defineSlideMaster({
  title: "DARK_CONTENT",
  background: { color: C.text2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.3, w: 9.0, h: 0.75,
      fontSize: 30, bold: true, color: C.background1, valign: "middle", margin: 0, fontFace: THEME.headFontFace }, text: "" } },
  ],
  slideNumber: { x: 9.0, y: 5.22, w: 0.5, h: 0.28, fontSize: 10, color: C.accent6, align: "right" },
});

pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: C.background1 },
  margin: [0.5, 0.5, 0.5, 0.5],
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.3, w: 9.0, h: 0.75,
      fontSize: 30, bold: true, color: C.text2, valign: "middle", margin: 0, fontFace: THEME.headFontFace }, text: "" } },
    { text: { text: "Vendor DD Agent · Path B: green retrofit audit", options: {
      x: 0.5, y: 5.22, w: 6, h: 0.28, fontSize: 10, color: C.accent3, margin: 0 } } },
  ],
  slideNumber: { x: 9.0, y: 5.22, w: 0.5, h: 0.28, fontSize: 10, color: C.accent3, align: "right" },
});

// ---------------------------------------------------------------- helpers
function tx(slide, text, o) {
  slide.addText(text, Object.assign({ isTextBox: true, fontSize: 14, color: C.text1, valign: "top", margin: 0 }, o));
}
function card(slide, x, y, w, h, fill, name) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08,
    fill: { color: fill || C.background2 }, line: { type: "none" }, objectName: name });
}
function pill(slide, x, y, label) {
  const w = 0.22 + label.length * 0.085;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.26, rectRadius: 0.13,
    fill: { color: PILLAR[label] }, line: { type: "none" }, objectName: `pill ${label}` });
  slide.addText(label, { isTextBox: true, x, y, w, h: 0.26, fontSize: 10, bold: true,
    color: C.background1, align: "center", valign: "middle", margin: 0 });
  return w;
}
function pills(slide, x, y, labels) {
  let cx = x;
  for (const l of labels) cx += pill(slide, cx, y, l) + 0.08;
}
function badge(slide, x, y, d, label, fill) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { type: "none" },
    objectName: `badge ${label}` });
  slide.addText(String(label), { isTextBox: true, x, y, w: d, h: d, fontSize: d > 0.5 ? 18 : 12, bold: true,
    color: C.background1, align: "center", valign: "middle", margin: 0 });
}
function content(title, section) {
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: section });
  s.addText(title, { placeholder: "title" });
  return s;
}

// Problem -> change -> pillar solution slide
function solution({ title, tier, problem, change, outcome, pillarsList, pattern, notes }) {
  const s = content(title, "Solutions");
  tx(s, tier, { x: 0.5, y: 1.08, w: 9, h: 0.3, fontSize: 12, bold: true, color: C.accent5, charSpacing: 1 });
  const cols = [
    { head: "Problem", body: problem, x: 0.5 },
    { head: "Change", body: change, x: 3.55 },
    { head: "Business outcome", body: outcome, x: 6.6 },
  ];
  cols.forEach((c, i) => {
    card(s, c.x, 1.5, 2.9, 3.0, i === 1 ? C.text2 : C.background2, `col ${c.head}`);
    tx(s, c.head, { x: c.x + 0.2, y: 1.65, w: 2.5, h: 0.35, fontSize: 16, bold: true,
      color: i === 1 ? C.accent6 : C.text2, fontFace: THEME.headFontFace });
    tx(s, c.body.map((b, j) => ({ text: b, options: { bullet: true, breakLine: j < c.body.length - 1 } })), {
      x: c.x + 0.2, y: 2.05, w: 2.55, h: 2.35, fontSize: 13, paraSpaceAfter: 5,
      color: i === 1 ? C.background1 : C.text1 });
  });
  tx(s, "Pillar:", { x: 0.5, y: 4.68, w: 0.6, h: 0.26, fontSize: 12, bold: true, color: C.text2, valign: "middle" });
  pills(s, 1.1, 4.68, pillarsList);
  if (pattern) {
    tx(s, [{ text: "GSF pattern: ", options: { bold: true } }, { text: pattern }], {
      x: 4.3, y: 4.68, w: 5.2, h: 0.26, fontSize: 11, color: C.accent3, valign: "middle", align: "right" });
  }
  if (notes) s.addNotes(notes);
  return s;
}

// ================================================================ 0. Title
pres.addSection({ title: "Intro" });
{
  const s = pres.addSlide({ masterName: "DARK", sectionTitle: "Intro" });
  s.addText("Defending the carbon story of my Vendor Due-Diligence Agent", { placeholder: "title" });
  s.addText([
    { text: "Path B · green retrofit audit of Project 3", options: { breakLine: true, bold: true, color: C.background1 } },
    { text: "Pieter Albrecht · Ironhack AI Consulting & Integration · November 2026" },
  ], { placeholder: "body" });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 0.6, w: 2.3, h: 0.36, rectRadius: 0.18,
    fill: { color: C.accent1 }, line: { type: "none" }, objectName: "path badge" });
  tx(s, "PATH B · RETROFIT", { x: 0.6, y: 0.6, w: 2.3, h: 0.36, fontSize: 12, bold: true,
    color: C.background1, align: "center", valign: "middle", charSpacing: 1 });
  s.addNotes("This deck follows Path B: a green retrofit audit of an existing bootcamp artifact, my Project 3 Vendor Due-Diligence Agent (github.com/PietFALB/vendor-dd-agent).");
}

// ================================================================ 1. Hook
{
  const s = content("Every vendor check has a footprint", "Intro");
  tx(s, [
    { text: "System: ", options: { bold: true } },
    { text: "a LangGraph agent that checks a company before onboarding (registry, sanctions, adverse media, then a rated report with gpt-4o-mini)." },
  ], { x: 0.5, y: 1.1, w: 9, h: 0.55, fontSize: 14 });
  const items = [
    { h: "Cost", b: "Every LLM call, search and embedding is a metered API call. Waste scales with every vendor and every re-screening." },
    { h: "Latency", b: "29 s median per report. Fewer calls means a faster answer for the compliance officer." },
    { h: "Reputation", b: "Clients that report under CSRD ask suppliers about their emissions. Any claim we make must survive an audit." },
  ];
  items.forEach((it, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.85, 2.85, 2.45, C.background2, `hook ${it.h}`);
    badge(s, x + 0.2, 2.05, 0.45, i + 1, C.accent1);
    tx(s, it.h, { x: x + 0.75, y: 2.1, w: 2.05, h: 0.35, fontSize: 17, bold: true, color: C.text2, fontFace: THEME.headFontFace });
    tx(s, it.b, { x: x + 0.2, y: 2.65, w: 2.45, h: 1.55, fontSize: 13 });
  });
  card(s, 0.5, 4.45, 9, 0.55, C.text2, "audience");
  tx(s, [
    { text: "Primary audience: ", options: { bold: true, color: C.accent6 } },
    { text: "Head of Compliance at a mid-size Dutch law firm, the buyer and budget owner.", options: { color: C.background1 } },
  ], { x: 0.7, y: 4.45, w: 8.6, h: 0.55, fontSize: 14, valign: "middle" });
  s.addNotes("Green software matters here for business reasons first: cost per check, speed, and being able to answer client ESG questions honestly.");
}

pres.addSection({ title: "Defense" });
// ================================================================ 2. R
{
  const s = content("One unit of value (R)", "Defense");
  card(s, 0.5, 1.15, 9, 1.15, C.text2, "R statement");
  tx(s, [
    { text: "R = one completed vendor due-diligence risk report", options: { bold: true, color: C.background1, breakLine: true, fontSize: 20, fontFace: THEME.headFontFace } },
    { text: "One company, run through registry, sanctions and adverse-media checks, ending in a scored report.", options: { color: C.accent6, fontSize: 14 } },
  ], { x: 0.75, y: 1.15, w: 8.5, h: 1.15, valign: "middle" });

  tx(s, "Inside the boundary", { x: 0.5, y: 2.55, w: 4.3, h: 0.35, fontSize: 16, bold: true, color: C.accent1, fontFace: THEME.headFontFace });
  const inside = ["LLM calls (research agent, synthesis, assessment, report text)", "Embeddings and Pinecone retrieval",
    "GLEIF, KvK and Tavily API calls", "Local sanctions screening (CSV + fuzzy match)", "API / n8n hosting while serving R"];
  tx(s, inside.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < inside.length - 1 } })),
    { x: 0.5, y: 2.95, w: 4.3, h: 1.9, fontSize: 13, paraSpaceAfter: 3 });

  tx(s, "Outside (for now)", { x: 5.2, y: 2.55, w: 4.3, h: 0.35, fontSize: 16, bold: true, color: C.accent3, fontFace: THEME.headFontFace });
  const outside = ["Training of gpt-4o-mini (provider's embodied share)", "User laptops and browsers", "Development and test runs (counted separately)", "One-off RAG ingestion of the guidance PDFs"];
  tx(s, outside.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < outside.length - 1 } })),
    { x: 5.2, y: 2.95, w: 4.3, h: 1.5, fontSize: 13, paraSpaceAfter: 3 });
  tx(s, [{ text: "SCI = (E × I) + M per R", options: { bold: true } }],
    { x: 5.2, y: 4.55, w: 4.3, h: 0.35, fontSize: 14, color: C.accent4, fontFace: THEME.headFontFace });
  s.addNotes("R is testable: every run produces exactly one report file, and LangSmith shows one trace per run. Boundary choices are explicit so nobody can say we left things out quietly.");
}

// ================================================================ 3. Hotspots
{
  const s = content("Where the compute concentrates", "Defense");
  const steps = [
    { n: "Validate", heat: 0 },
    { n: "GLEIF + KvK", heat: 2, note: "~15 HTTP calls" },
    { n: "Sanctions", heat: 1, note: "CSV reload" },
    { n: "Research agent", heat: 3, note: "≤6 tools, ≤20 steps" },
    { n: "Synthesis + assess", heat: 2, note: "2 LLM calls" },
    { n: "Report + check", heat: 2, note: "1–2 LLM calls" },
  ];
  const heatColor = [C.accent6, C.accent2, C.accent2, C.accent5];
  const w = 1.4, gap = 0.12, y = 1.3;
  steps.forEach((st, i) => {
    const x = 0.5 + i * (w + gap);
    card(s, x, y, w, 1.05, heatColor[st.heat], `step ${st.n}`);
    tx(s, st.n, { x: x + 0.08, y: y + 0.12, w: w - 0.16, h: 0.45, fontSize: 12, bold: true,
      color: st.heat === 0 ? C.text2 : C.background1, align: "center" });
    if (st.note) tx(s, st.note, { x: x + 0.08, y: y + 0.6, w: w - 0.16, h: 0.35, fontSize: 10,
      color: C.background1, align: "center" });
  });
  tx(s, "Heat: green = negligible · amber = moderate · red = likely largest share of tokens per R",
    { x: 0.5, y: 2.45, w: 9, h: 0.3, fontSize: 11, color: C.accent3 });

  const rows = [
    ["↻", "Guidance search", "48% of all agent tool calls hit a fixed PDF corpus (60 of 126 in 7 days)."],
    ["↻", "Fixed embedding", "The same asset-freeze query is embedded again on every report with a sanctions hit."],
    ["↻", "GLEIF fan-out", "12 exact-name searches run even when the full-text match is already strong."],
    ["↻", "Whole reports", "No reuse: 5 Sberbank and 5 ING runs in reports/archive during development."],
  ];
  rows.forEach((r, i) => {
    const yy = 2.85 + i * 0.55;
    badge(s, 0.5, yy + 0.04, 0.38, r[0], C.accent4);
    tx(s, r[1], { x: 1.05, y: yy, w: 2.0, h: 0.46, fontSize: 13, bold: true, color: C.text2, valign: "middle" });
    tx(s, r[2], { x: 3.05, y: yy, w: 6.45, h: 0.46, fontSize: 13, valign: "middle" });
  });
  s.addNotes("↻ marks repeated work = caching candidates. Sources: agent/review.py (MAX_SEARCHES=6, MAX_STEPS=20), tools/gleif.py (12 exact legal-name searches), agent/assess.py (_freeze_guidance), reports/archive/, LangSmith tools panel.");
}

// ================================================================ 4. Evidence
{
  const s = content("Why should we believe this?", "Defense");
  const stats = [
    { v: "17.6k", l: "tokens for one Sberbank report (enhanced route)", c: C.accent5 },
    { v: "≈ 6.5", l: "LLM calls per report (207 calls / 32 traces)", c: C.accent2 },
    { v: "48%", l: "of agent tool calls go to the fixed guidance corpus", c: C.accent4 },
    { v: "29 s", l: "median latency per report (P99: 48 s)", c: C.accent1 },
  ];
  stats.forEach((st, i) => {
    const x = 0.5 + i * 2.3;
    card(s, x, 1.2, 2.1, 2.05, C.background2, `stat ${st.v}`);
    tx(s, st.v, { x: x + 0.15, y: 1.3, w: 1.8, h: 0.85, fontSize: 36, bold: true, color: st.c, fontFace: THEME.headFontFace, valign: "middle" });
    tx(s, st.l, { x: x + 0.15, y: 2.2, w: 1.8, h: 0.95, fontSize: 12 });
  });
  card(s, 0.5, 3.45, 9, 1.55, C.text2, "skeptic answer");
  tx(s, [
    { text: "Evidence: ", options: { bold: true, color: C.accent6 } },
    { text: "LangSmith traces of the live agent (7 days, 32 traces: 31 succeeded, 1 failed, $0.07 total) plus a read of the code paths.", options: { color: C.background1, breakLine: true } },
    { text: "Uncertainty: ", options: { bold: true, color: C.accent2 } },
    { text: "the per-report averages include some debug runs, so they are approximate. Cost (≈ $0.002 per report) is too small to be a useful stand-in for energy, so I track tokens and calls instead.", options: { color: C.background1 } },
  ], { x: 0.75, y: 3.55, w: 8.5, h: 1.35, fontSize: 13, paraSpaceAfter: 6, valign: "middle" });
  s.addNotes("Stretch goal: numeric proxies from logs. Screenshot: images/langsmith_overview_7days.png. Next step to remove the uncertainty: tag production runs in LangSmith and log tokens and calls per R.");
}

// ================================================================ 5. Assumptions
{
  const s = content("What I assume, and what I don't know yet", "Defense");
  const rows = [
    ["Region / grid", "OpenAI, Tavily and the Pinecone free tier probably run in US data centres. LangSmith is set to the EU endpoint.", "Unknown"],
    ["Model size", "gpt-4o-mini is small, but OpenAI publishes no energy per token, so E per R can only be estimated from tokens.", "Estimate"],
    ["Call pattern", "Research loop dominates: every agent step resends the growing conversation, so tokens grow with each step.", "Measured in part"],
    ["Retention", "Reports kept indefinitely as Markdown (tiny). The sanctions CSV is a large snapshot, re-downloaded by hand.", "Known"],
    ["Volume", "Demo scale today. A real firm: tens to hundreds of checks a month, plus re-screening of current vendors.", "Estimate"],
  ];
  const conf = { "Unknown": C.accent5, "Estimate": C.accent2, "Measured in part": C.accent4, "Known": C.accent1 };
  rows.forEach((r, i) => {
    const y = 1.15 + i * 0.78;
    card(s, 0.5, y, 9, 0.68, i % 2 ? C.background1 : C.background2, `assumption ${r[0]}`);
    tx(s, r[0], { x: 0.65, y, w: 1.65, h: 0.68, fontSize: 14, bold: true, color: C.text2, valign: "middle" });
    tx(s, r[1], { x: 2.35, y, w: 5.45, h: 0.68, fontSize: 12, valign: "middle" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.95, y: y + 0.19, w: 1.4, h: 0.3, rectRadius: 0.15,
      fill: { color: conf[r[2]] }, line: { type: "none" }, objectName: `conf ${i}` });
    tx(s, r[2], { x: 7.95, y: y + 0.19, w: 1.4, h: 0.3, fontSize: 10, bold: true, color: C.background1, align: "center", valign: "middle" });
  });
  s.addNotes("Being explicit about unknowns is the honesty test of this lab. Validate next: provider regions (OpenAI, Pinecone index region, Tavily), and real monthly volume with the client.");
}

// ================================================================ 6. Pillars map
{
  const s = content("How the hotspots map to the four pillars", "Defense");
  const quads = [
    { p: "Carbon", t: "Where and when R runs", b: ["Providers likely in US regions", "Re-screening runs whenever someone clicks, not at low-carbon hours"] },
    { p: "Energy", t: "How much work R needs", b: ["Research loop tokens grow per step", "Repeated guidance, GLEIF and embedding lookups"] },
    { p: "Hardware", t: "What sits idle", b: ["API server and n8n always on for occasional checks", "A bigger model would mean more GPU per R"] },
    { p: "Measurement", t: "What we can prove", b: ["LangSmith traces exist, but no per-R dashboard yet", "No token or call budget tracked per report"] },
  ];
  quads.forEach((q, i) => {
    const x = 0.5 + (i % 2) * 4.6, y = 1.15 + Math.floor(i / 2) * 1.98;
    card(s, x, y, 4.4, 1.83, C.background2, `quad ${q.p}`);
    pill(s, x + 0.2, y + 0.18, q.p);
    tx(s, q.t, { x: x + 0.2, y: y + 0.52, w: 4.0, h: 0.35, fontSize: 15, bold: true, color: C.text2, fontFace: THEME.headFontFace });
    tx(s, q.b.map((b, j) => ({ text: b, options: { bullet: true, breakLine: j < q.b.length - 1 } })),
      { x: x + 0.2, y: y + 0.9, w: 4.0, h: 0.85, fontSize: 12, paraSpaceAfter: 3 });
  });
  s.addNotes("Carbon = location and timing (grid intensity I). Energy = work per R (E). Hardware = embodied emissions and idle capacity (M). Measurement = the SCI loop that proves any of it.");
}

// ================================================================ 7-10. Solutions
pres.addSection({ title: "Solutions" });
solution({
  title: "1 · Cache what doesn't change",
  tier: "QUICK WIN",
  problem: ["Guidance passages are retrieved again on every report", "The same asset-freeze query is re-embedded", "GLEIF runs ~15 calls per report, with no cache"],
  change: ["Cache GLEIF results per name and LEI (7-day TTL)", "Cache embeddings and retrieved passages by query", "Run the 12 exact-name searches only if the full-text match is below 95"],
  outcome: ["Fewer external calls per R", "Faster reports", "Sanctions screening is never cached, so risk does not change"],
  pillarsList: ["Energy", "Measurement"],
  pattern: "Cache static data",
  notes: "Code: tools/gleif.py already has STRONG = 95, so the exact-name fan-out can be made conditional. Measure the cache hit rate to prove the effect.",
});
solution({
  title: "2 · Fewer agent steps, same model",
  tier: "MEDIUM",
  problem: ["The research agent spends about half its tool budget on the guidance corpus", "Every extra step resends the whole conversation", "A failed check triggers a full rewrite call"],
  change: ["Fetch guidance in code for each route, outside the agent loop", "Lower the search and step budget on the clean (standard) route", "Keep gpt-4o-mini; change model only after a sample eval"],
  outcome: ["Fewer LLM calls and tokens per R", "Lower cost and latency", "Quality guarded by the 7-company regression set"],
  pillarsList: ["Energy", "Hardware"],
  pattern: "Optimize agent orchestration to reduce unnecessary model calls",
  notes: "Hint 3: pair any smaller budget or model change with a quality check, not a blind downgrade. The TODO in agent/review.py to try a stronger model should also go through the same eval, not ship by default.",
});
solution({
  title: "3 · Reuse reports, batch re-screening",
  tier: "MEDIUM",
  problem: ["The same company is fully re-checked each time", "Re-screening current vendors would run one by one, on demand", "Each run redoes registry and media work"],
  change: ["Return a recent report if the company and the sanctions data date are unchanged", "Run periodic re-screening as a nightly n8n batch", "Schedule the batch for low-carbon grid hours"],
  outcome: ["Lower spend as the vendor base grows", "Predictable load for IT", "Report shows its date, so the audit trail stays intact"],
  pillarsList: ["Carbon", "Energy"],
  pattern: "Queue non-urgent processing requests",
  notes: "Ties to GTM sprint 3 (n8n as integration layer: batch checks and re-screening alerts). Reuse is only allowed when the sanctions CSV date is unchanged; a new sanctions snapshot always forces a fresh screen.",
});
solution({
  title: "4 · Right region, no idle server",
  tier: "STRATEGIC",
  problem: ["The API and n8n stay on to serve occasional form submissions", "Provider regions are probably US", "/check blocks for 1–3 minutes"],
  change: ["Run the agent on demand (serverless or scale to zero)", "Pick EU regions for hosting and Pinecone, preferring low-carbon grids", "Use the /jobs endpoint so nothing waits"],
  outcome: ["No paying for idle capacity", "EU data residency helps GDPR", "Clients get an answer they can defend"],
  pillarsList: ["Carbon", "Hardware"],
  pattern: "Scale down applications when not in use",
  notes: "Region choice is limited by OpenAI's own data-centre locations; the hosting and vector DB are the parts we control. Related pattern: trigger AI and agent workloads only when needed (serverless / event-driven).",
});

// ================================================================ 11. Measurement plan
pres.addSection({ title: "Close" });
{
  const s = content("What I would track for two weeks", "Close");
  const header = ["Metric per R", "Source", "Baseline", "Success"];
  const rows = [
    ["Tokens (in + out)", "LangSmith", "17.6k (Sberbank)", "≥ 30% lower"],
    ["LLM calls", "LangSmith run tree", "≈ 6.5", "≤ 5"],
    ["Agent tool calls", "LangSmith tools", "≈ 3.9", "≤ 2.5"],
    ["External HTTP calls + cache hit rate", "App logs", "~15 GLEIF calls", "≥ 50% fewer"],
    ["Latency (P50)", "LangSmith", "29 s", "≤ 20 s"],
    ["Rating changes on regression set", "tests/regression_gleif.py + 3 samples", "—", "Zero"],
  ];
  const opt = (bold, fill, color) => ({ bold, fill: { color: fill }, color, fontSize: 12, valign: "middle", margin: [3, 6, 3, 6] });
  const data = [header.map(h => ({ text: h, options: opt(true, HEX.dk2, HEX.lt1) }))]
    .concat(rows.map((r, i) => r.map((c, j) => ({ text: c, options: opt(j === 0 || j === 3, i % 2 ? HEX.lt1 : HEX.lt2, j === 3 ? HEX.accent1 : HEX.dk1) }))));
  s.addTable(data, { x: 0.5, y: 1.15, w: 9, colW: [2.9, 2.6, 1.75, 1.75], rowH: 0.42,
    border: { type: "solid", pt: 0.5, color: "D5DED8" }, objectName: "measurement table" });
  tx(s, [
    { text: "Grid intensity (I): ", options: { bold: true } },
    { text: "note each provider's region and use published grid intensity to turn E per R into an SCI estimate. The quality guardrail matters more than any saving." },
  ], { x: 0.5, y: 4.3, w: 9, h: 0.7, fontSize: 13, color: C.text1 });
  s.addNotes("Baselines come from the LangSmith overview (7 days) and the Sberbank test run on 18 Nov 2026. Tag production runs in LangSmith so debug runs don't skew the averages.");
}

// ================================================================ 12. Before / after
{
  const s = content("Before / after hypothesis", "Close");
  tx(s, [
    { text: "If we move guidance retrieval out of the agent loop and cache it, ", options: { bold: true } },
    { text: "we expect about 45% fewer agent tool calls and about 30% fewer tokens per report, with no change in rating." },
  ], { x: 0.5, y: 1.1, w: 9, h: 0.65, fontSize: 14 });
  s.addChart(pres.charts.BAR, [
    { name: "Today", labels: ["Tool calls per R", "LLM calls per R", "Tokens per R (k)"], values: [3.9, 6.5, 17.6] },
    { name: "Hypothesis", labels: ["Tool calls per R", "LLM calls per R", "Tokens per R (k)"], values: [2.1, 4.5, 12.3] },
  ], {
    x: 0.5, y: 1.85, w: 5.6, h: 3.2, barDir: "col", barGrouping: "clustered",
    chartColors: [HEX.accent3, HEX.accent1], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0",
    dataLabelFontSize: 11, dataLabelColor: HEX.dk1, dataLabelFontFace: "+mn-lt",
    showLegend: true, legendPos: "b", legendFontSize: 11, legendFontFace: "+mn-lt",
    catAxisLabelColor: HEX.accent3, valAxisLabelColor: HEX.accent3, catAxisLabelFontSize: 11, valAxisLabelFontSize: 10,
    catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt",
    valGridLine: { color: "E1E7E3", size: 0.5 }, catGridLine: { style: "none" },
    showTitle: true, title: "Per report: today vs. hypothesis", titleFontSize: 13, titleColor: HEX.dk2, titleFontFace: "+mn-lt",
    objectName: "before after chart",
  });
  card(s, 6.35, 1.85, 3.15, 3.2, C.background2, "hypothesis logic");
  tx(s, "How I got there", { x: 6.55, y: 2.0, w: 2.8, h: 0.35, fontSize: 15, bold: true, color: C.text2, fontFace: THEME.headFontFace });
  const logic = ["Guidance search is 1.9 of 3.9 tool calls per R; it goes to ~0", "Each saved tool call saves about one agent step (one LLM call)", "Tokens scale with steps; I assume −30%", "Watch for one week: tool calls and tokens per R in LangSmith"];
  tx(s, logic.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < logic.length - 1 } })),
    { x: 6.55, y: 2.4, w: 2.8, h: 2.55, fontSize: 12, paraSpaceAfter: 4 });
  s.addNotes("This is a hypothesis, not a result. Expected values are estimates from the LangSmith baseline; the one-week measurement decides whether they hold.");
}

// ================================================================ 13. Caveats (dark close)
{
  const s = pres.addSlide({ masterName: "DARK_CONTENT", sectionTitle: "Close" });
  s.addText("Caveats: what I will not claim", { placeholder: "title" });
  const items = [
    ["No “carbon neutral” claim", "There is no measured E per R yet, so there is nothing to call neutral."],
    ["Offsets are not SCI", "Buying offsets would not lower SCI per R. Only less work, cleaner regions and less idle hardware do."],
    ["Estimates, not results", "Every percentage in this deck is a hypothesis until per-R logging has run for a week."],
    ["Validate next with the client", "Real monthly volume, the provider regions, and how fresh a cached report may be for their risk policy."],
  ];
  items.forEach((it, i) => {
    const x = 0.5 + (i % 2) * 4.6, y = 1.35 + Math.floor(i / 2) * 1.85;
    badge(s, x, y, 0.45, i + 1, C.accent1);
    tx(s, it[0], { x: x + 0.6, y: y + 0.02, w: 3.6, h: 0.4, fontSize: 15, bold: true, color: C.background1, valign: "middle" });
    tx(s, it[1], { x: x + 0.6, y: y + 0.5, w: 3.7, h: 1.15, fontSize: 13, color: C.accent6 });
  });
  s.addNotes("Lesson reminder: offsets and SCI are different things. SCI is a rate per R and can only go down by reducing E, I or M.");
}

(async () => {
  await pres.writeFile({ fileName: "carbon_story_vendor_dd_agent_path_b.pptx" });
  await applyTheme("carbon_story_vendor_dd_agent_path_b.pptx", THEME);
  console.log("written");
})();
