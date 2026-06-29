/**
 * ExploreScreen: Epicure dataset explorer written for a general audience.
 *
 * Two panels:
 *   1. "What goes with what?" — SLERP results shown as natural-language pairings,
 *      with a toggle between general pairings and cuisine-/flavor-specific ones.
 *   2. "Ingredient Families" — 150 GMM modes described in plain terms.
 */

import { useState, useMemo } from "react";
import exploreData from "../data/generated/explore-data.json";

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface SlerpResult { hit_rank: number; hit_name: string; hit_sim: number }
interface SlerpAngle  { angle: number; results: SlerpResult[] }
interface SlerpCase   { testCase: string; seed: string; direction: string; type: string; angles: SlerpAngle[] }
interface Mode        { id: string; kind: string; property: string; label: string; nMembers: number; members: string[] }
interface CorpusStats { nRecipes: number; nIngredients: number; nEdges: number; nModes: number; nProperties: number; languages: string[] }

const { corpusStats, slerpCases, modes } = exploreData as {
  corpusStats: CorpusStats;
  slerpCases: SlerpCase[];
  modes: Mode[];
};

/* Friendly labels for cuisine / flavor directions */
const DIRECTION_LABEL: Record<string, string> = {
  Japanese: "a Japanese kitchen",
  East_Asian: "an East Asian kitchen",
  Southeast_Asian: "a Southeast Asian kitchen",
  South_Asian: "a South Asian kitchen",
  Mediterranean: "a Mediterranean kitchen",
  Western_Atlantic: "a Western kitchen",
  Latin_American: "a Latin American kitchen",
  Eastern_European: "an Eastern European kitchen",
  sweet: "a sweet direction",
  savory: "a savory direction",
  bitter: "a bitter direction",
  sour: "a sour direction",
  fatty: "a rich/fatty direction",
  floral: "a floral direction",
  earthy: "an earthy direction",
  nutty: "a nutty direction",
  pungent: "a pungent direction",
  "high protein": "a high-protein direction",
  "high fat": "a high-fat direction",
  "high water": "a high-water direction",
  "high fiber": "a high-fiber direction",
  "high sugars": "a high-sugar direction",
  "meat direction": "a meaty direction",
  whole: "a whole/natural foods direction",
  processed: "a processed-foods direction",
};

function dirLabel(dir: string): string {
  return DIRECTION_LABEL[dir] ?? dir;
}

const KIND_PLAIN: Record<string, { label: string; desc: string }> = {
  factor:     { label: "Discovered patterns",  desc: "Groups the AI found on its own — no one defined these in advance." },
  continuous: { label: "Flavor & nutrition",   desc: "Groups organized around sensory properties like savory, sweet, bitter, or nutritional values." },
  binary:     { label: "Food categories",      desc: "Classic food groups: grains, dairy, beverages, spices, etc." },
};

const TYPE_LABEL: Record<string, string> = {
  cuisine:   "By cooking style",
  flavor:    "By flavor direction",
  nutrition: "By nutrition",
};

/* ── Main component ─────────────────────────────────────────────────────────── */

interface ExploreScreenProps { onHome: () => void }

export function ExploreScreen({ onHome }: ExploreScreenProps) {
  const [tab, setTab] = useState<"pairings" | "families">("pairings");

  return (
    <div className="explore-screen">
      <div className="explore-topbar">
        <button className="quit-btn" onClick={onHome}>← Home</button>
        <h2 className="explore-title">Epicure: Inside the Data</h2>
      </div>

      <p className="explore-subtitle">
        A research project scanned <b>{(corpusStats.nRecipes / 1e6).toFixed(2)} million recipes</b> in{" "}
        <b>{corpusStats.languages.length} languages</b> and built a map of how{" "}
        <b>{corpusStats.nIngredients.toLocaleString()} ingredients</b> relate to each other —
        based purely on how real cooks combine them.
      </p>

      {/* Stats */}
      <div className="explore-stats-row">
        <div className="explore-stat-pill"><strong>{(corpusStats.nRecipes / 1e6).toFixed(2)}M</strong><span>recipes analyzed</span></div>
        <div className="explore-stat-pill"><strong>{corpusStats.nIngredients.toLocaleString()}</strong><span>ingredients mapped</span></div>
        <div className="explore-stat-pill"><strong>{(corpusStats.nEdges / 1000).toFixed(0)}k</strong><span>ingredient connections</span></div>
        <div className="explore-stat-pill"><strong>{corpusStats.nModes}</strong><span>flavor families found</span></div>
      </div>

      {/* Tabs */}
      <div className="explore-tabs">
        <button className={`explore-tab${tab === "pairings" ? " active" : ""}`} onClick={() => setTab("pairings")}>
          What goes with what?
        </button>
        <button className={`explore-tab${tab === "families" ? " active" : ""}`} onClick={() => setTab("families")}>
          Ingredient families
        </button>
      </div>

      {tab === "pairings" && <PairingsPanel />}
      {tab === "families" && <FamiliesPanel />}

      <p className="explore-footer-note">
        <a href="https://huggingface.co/Kaikaku/epicure-cooc" target="_blank" rel="noopener noreferrer">Epicure-Cooc</a>
        {" · "}
        <a href="https://arxiv.org/abs/2605.22391" target="_blank" rel="noopener noreferrer">arxiv 2605.22391</a>
        {" · CC-BY-4.0"}
      </p>
    </div>
  );
}

/* ── Pairings panel ─────────────────────────────────────────────────────────── */

function PairingsPanel() {
  const [typeFilter, setTypeFilter] = useState<string>("cuisine");
  const [activeCase, setActiveCase] = useState<SlerpCase>(() =>
    slerpCases.find(c => c.type === "cuisine") ?? slerpCases[0]
  );
  const [showStyled, setShowStyled] = useState(true);

  const filtered = useMemo(() =>
    slerpCases.filter(c => c.type === typeFilter),
    [typeFilter]
  );

  // angle 0 = natural pairings, angle 60 = styled pairings
  const baseResults   = activeCase.angles.find(a => a.angle === 0)?.results  ?? [];
  const styledResults = activeCase.angles.find(a => a.angle === 60)?.results ?? [];
  const results = showStyled ? styledResults : baseResults;

  const maxSim = Math.max(...results.map(r => r.hit_sim), 0.01);

  return (
    <div className="pairings-panel">
      {/* Type filter */}
      <div className="explore-filters" style={{ marginBottom: "0.875rem" }}>
        {(["cuisine", "flavor", "nutrition"] as const).map(t => (
          <button key={t}
            className={`explore-filter-btn${typeFilter === t ? " active" : ""}`}
            onClick={() => {
              setTypeFilter(t);
              const first = slerpCases.find(c => c.type === t);
              if (first) setActiveCase(first);
              setShowStyled(true);
            }}>
            {TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      {/* Case grid */}
      <div className="slerp-case-grid">
        {filtered.map(c => (
          <button key={c.testCase}
            className={`slerp-case-btn${activeCase.testCase === c.testCase ? " active" : ""}`}
            onClick={() => { setActiveCase(c); setShowStyled(true); }}>
            <span className="slerp-seed">{c.seed}</span>
            <span className="slerp-arrow">+</span>
            <span className="slerp-dir">{c.direction.replace(/_/g, " ")}</span>
          </button>
        ))}
      </div>

      {/* Result card */}
      <div className="slerp-result-card">
        {/* Toggle */}
        <div className="pairing-toggle">
          <button
            className={`pairing-toggle-btn${!showStyled ? " active" : ""}`}
            onClick={() => setShowStyled(false)}>
            General pairings
          </button>
          <button
            className={`pairing-toggle-btn${showStyled ? " active" : ""}`}
            onClick={() => setShowStyled(true)}>
            In {dirLabel(activeCase.direction)}
          </button>
        </div>

        {/* Headline */}
        <p className="pairing-headline">
          {showStyled
            ? <>In <b>{dirLabel(activeCase.direction)}</b>, <b>{activeCase.seed}</b> is typically paired with:</>
            : <>In general, <b>{activeCase.seed}</b> is typically cooked with:</>
          }
        </p>

        {/* Results */}
        <div className="slerp-results">
          {results.map((r, i) => (
            <div key={i} className="slerp-result-row">
              <span className="slerp-rank">#{r.hit_rank}</span>
              <span className="slerp-name">{r.hit_name.replace(/_/g, " ")}</span>
              <div className="slerp-sim-track">
                <div className="slerp-sim-fill" style={{ width: `${(r.hit_sim / maxSim) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        <p className="pairing-note">
          Bars show relative strength of the association — the longer, the more often these appear together in recipes.
        </p>
      </div>
    </div>
  );
}

/* ── Families panel ─────────────────────────────────────────────────────────── */

function FamiliesPanel() {
  const [kindFilter, setKindFilter] = useState<string>("factor");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const kindInfo = KIND_PLAIN[kindFilter];

  const filtered = useMemo(() =>
    modes.filter(m =>
      m.kind === kindFilter &&
      (search === "" ||
        m.label.toLowerCase().includes(search.toLowerCase()) ||
        m.members.some(mem => mem.toLowerCase().includes(search.toLowerCase())))
    ),
    [kindFilter, search]
  );

  return (
    <div className="modes-panel">
      <div className="explore-controls">
        <input className="explore-search" type="text"
          placeholder="Search by family name or ingredient…"
          value={search} onChange={e => { setSearch(e.target.value); setExpanded(null); }} />
        <div className="explore-filters">
          {(["factor", "continuous", "binary"] as const).map(k => (
            <button key={k}
              className={`explore-filter-btn${kindFilter === k ? " active" : ""}`}
              onClick={() => { setKindFilter(k); setExpanded(null); setSearch(""); }}>
              {KIND_PLAIN[k].label} ({modes.filter(m => m.kind === k).length})
            </button>
          ))}
        </div>
        <p className="kind-description">{kindInfo.desc}</p>
      </div>

      <div className="modes-grid">
        {filtered.map(mode => (
          <div key={mode.id}
            className={`mode-card${expanded === mode.id ? " expanded" : ""}`}
            onClick={() => setExpanded(expanded === mode.id ? null : mode.id)}>
            <div className="mode-card-header">
              <span className="mode-size">{mode.nMembers} ingredients</span>
              <span className="mode-label">{mode.label}</span>
            </div>
            <div className="mode-card-members">
              {(expanded === mode.id ? mode.members : mode.members.slice(0, 4)).map(m => (
                <span key={m} className="mode-member-pill">{m}</span>
              ))}
              {expanded !== mode.id && mode.members.length > 4 && (
                <span className="mode-more">+{mode.members.length - 4} more — click to expand</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
