/**
 * ExploreScreen: data visualization of the full Epicure dataset.
 *
 * Two panels:
 *   1. Ingredient Math — SLERP direction arithmetic (48 test cases × 3 angles)
 *   2. Flavor Clusters — 150 GMM modes browseable by kind and property
 */

import { useState, useMemo } from "react";
import exploreData from "../data/generated/explore-data.json";

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface SlerpResult { hit_rank: number; hit_name: string; hit_sim: number }
interface SlerpAngle  { angle: number; results: SlerpResult[] }
interface SlerpCase   { testCase: string; seed: string; direction: string; type: string; angles: SlerpAngle[] }
interface Mode        { id: string; kind: string; property: string; label: string; nMembers: number; members: string[] }
interface CorpusStats { nRecipes: number; nMatched: number; nSources: number; languages: string[]; nIngredients: number; nEdges: number; nModes: number; nProperties: number }

const { corpusStats, slerpCases, modes } = exploreData as {
  corpusStats: CorpusStats;
  slerpCases: SlerpCase[];
  modes: Mode[];
};

const KIND_LABELS: Record<string, string> = { factor: "Emergent", continuous: "Sensory / Nutrition", binary: "Food Group" };
const TYPE_EMOJI:  Record<string, string> = { cuisine: "🌍", flavor: "👅", nutrition: "🥦" };

/* ── Main component ─────────────────────────────────────────────────────────── */

interface ExploreScreenProps { onHome: () => void }

export function ExploreScreen({ onHome }: ExploreScreenProps) {
  const [tab, setTab] = useState<"slerp" | "modes">("slerp");

  return (
    <div className="explore-screen">
      <div className="explore-topbar">
        <button className="quit-btn" onClick={onHome}>← Home</button>
        <h2 className="explore-title">Epicure Dataset Explorer</h2>
      </div>

      {/* Corpus headline stats */}
      <div className="explore-stats-row">
        <div className="explore-stat-pill"><strong>{(corpusStats.nRecipes / 1e6).toFixed(2)}M</strong><span>recipes</span></div>
        <div className="explore-stat-pill"><strong>{corpusStats.languages.length}</strong><span>languages</span></div>
        <div className="explore-stat-pill"><strong>{corpusStats.nIngredients.toLocaleString()}</strong><span>ingredients</span></div>
        <div className="explore-stat-pill"><strong>{(corpusStats.nEdges / 1000).toFixed(0)}k</strong><span>NPMI edges</span></div>
        <div className="explore-stat-pill"><strong>{corpusStats.nModes}</strong><span>flavor clusters</span></div>
        <div className="explore-stat-pill"><strong>{corpusStats.nProperties}</strong><span>properties</span></div>
      </div>

      {/* Tab switcher */}
      <div className="explore-tabs">
        <button className={`explore-tab${tab === "slerp" ? " active" : ""}`} onClick={() => setTab("slerp")}>
          ✦ Ingredient Math
        </button>
        <button className={`explore-tab${tab === "modes" ? " active" : ""}`} onClick={() => setTab("modes")}>
          ✦ Flavor Clusters
        </button>
      </div>

      {tab === "slerp" && <SlerpPanel />}
      {tab === "modes" && <ModesPanel />}

      <p className="explore-footer-note">
        Data: <a href="https://huggingface.co/Kaikaku/epicure-cooc" target="_blank" rel="noopener noreferrer">Epicure-Cooc (HuggingFace)</a>
        {" · "}Paper: <a href="https://arxiv.org/abs/2605.22391" target="_blank" rel="noopener noreferrer">arxiv 2605.22391</a>
        {" · "}CC-BY-4.0
      </p>
    </div>
  );
}

/* ── SLERP panel ────────────────────────────────────────────────────────────── */

function SlerpPanel() {
  const [activeCase, setActiveCase] = useState<SlerpCase>(slerpCases[0]);
  const [angleIdx, setAngleIdx] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>("cuisine");

  const filtered = useMemo(() =>
    slerpCases.filter(c => c.type === typeFilter),
    [typeFilter]
  );

  const currentAngle = activeCase.angles[angleIdx];

  return (
    <div className="slerp-panel">
      <p className="explore-subtitle">
        The paper's <b>SLERP operator</b> rotates an ingredient's embedding toward a cuisine or flavor direction.
        At 0° you get the ingredient's natural neighbors; by 60° the target style dominates.
      </p>

      {/* Type filter */}
      <div className="explore-filters" style={{ marginBottom: "0.75rem" }}>
        {["cuisine","flavor","nutrition"].map(t => (
          <button key={t} className={`explore-filter-btn${typeFilter === t ? " active" : ""}`}
            onClick={() => { setTypeFilter(t); setActiveCase(slerpCases.filter(c=>c.type===t)[0]); setAngleIdx(0); }}>
            {TYPE_EMOJI[t]} {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {/* Test case grid */}
      <div className="slerp-case-grid">
        {filtered.map(c => (
          <button key={c.testCase}
            className={`slerp-case-btn${activeCase.testCase === c.testCase ? " active" : ""}`}
            onClick={() => { setActiveCase(c); setAngleIdx(0); }}>
            <span className="slerp-seed">{c.seed}</span>
            <span className="slerp-arrow">+</span>
            <span className="slerp-dir">{c.direction}</span>
          </button>
        ))}
      </div>

      {/* Result panel */}
      <div className="slerp-result-card">
        <div className="slerp-result-header">
          <div className="slerp-result-title">
            <span className="slerp-seed-lg">{activeCase.seed}</span>
            {" "}<span className="slerp-plus">rotated toward</span>{" "}
            <span className="slerp-dir-lg">{activeCase.direction}</span>
          </div>
        </div>

        {/* Angle selector */}
        <div className="slerp-angles">
          {activeCase.angles.map((a, i) => (
            <button key={a.angle} className={`slerp-angle-btn${angleIdx === i ? " active" : ""}`}
              onClick={() => setAngleIdx(i)}>
              {a.angle}°
            </button>
          ))}
          <span className="slerp-angle-hint">
            {angleIdx === 0 ? "Pure neighbors" : angleIdx === 1 ? "Transitioning…" : "Target style dominates"}
          </span>
        </div>

        {/* Results */}
        <div className="slerp-results">
          {currentAngle.results.map((r, i) => (
            <div key={i} className="slerp-result-row">
              <span className="slerp-rank">#{r.hit_rank}</span>
              <span className="slerp-name">{r.hit_name.replace(/_/g,' ')}</span>
              <div className="slerp-sim-track">
                <div className="slerp-sim-fill" style={{ width: `${r.hit_sim * 100}%` }} />
              </div>
              <span className="slerp-sim-val">{r.hit_sim.toFixed(3)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Modes panel ────────────────────────────────────────────────────────────── */

function ModesPanel() {
  const [kindFilter, setKindFilter] = useState<string>("factor");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() =>
    modes.filter(m =>
      m.kind === kindFilter &&
      (search === "" || m.label.toLowerCase().includes(search.toLowerCase()) ||
       m.members.some(mem => mem.toLowerCase().includes(search.toLowerCase())))
    ),
    [kindFilter, search]
  );

  return (
    <div className="modes-panel">
      <p className="explore-subtitle">
        <b>{modes.length} GMM clusters</b> discovered in the embedding space across 41 properties.
        <b> Emergent</b> clusters were found via ICA with no labels given; <b>Sensory/Nutrition</b> and <b>Food Group</b> are supervised projections.
      </p>

      <div className="explore-controls">
        <input className="explore-search" type="text" placeholder="Search cluster or ingredient…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="explore-filters">
          {(["factor","continuous","binary"] as const).map(k => (
            <button key={k} className={`explore-filter-btn${kindFilter === k ? " active" : ""}`}
              onClick={() => { setKindFilter(k); setExpanded(null); }}>
              {KIND_LABELS[k]} ({modes.filter(m => m.kind === k).length})
            </button>
          ))}
        </div>
      </div>

      <div className="modes-grid">
        {filtered.map(mode => (
          <div key={mode.id}
            className={`mode-card${expanded === mode.id ? " expanded" : ""}`}
            onClick={() => setExpanded(expanded === mode.id ? null : mode.id)}>
            <div className="mode-card-header">
              <span className="mode-size">{mode.nMembers}</span>
              <span className="mode-label">{mode.label}</span>
            </div>
            <div className="mode-card-members">
              {(expanded === mode.id ? mode.members : mode.members.slice(0, 4)).map(m => (
                <span key={m} className="mode-member-pill">{m}</span>
              ))}
              {expanded !== mode.id && mode.members.length > 4 && (
                <span className="mode-more">+{mode.members.length - 4} more</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
