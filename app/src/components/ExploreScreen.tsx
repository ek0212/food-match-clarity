/**
 * ExploreScreen: interactive explorer of the Epicure ingredient dataset.
 * Shows cuisine fingerprints and flavor neighbors for all 50 quiz ingredients.
 */

import { useState, useMemo } from "react";
import exploreData from "../data/generated/explore-data.json";

interface CuisineAffinity {
  id: string;
  label: string;
  score: number;
  pct: number;
}

interface IngredientEntry {
  name: string;
  emoji: string;
  group: string;
  topCuisine: string;
  cuisineAffinities: CuisineAffinity[];
  similar: string[];
}

const { ingredients } = exploreData as {
  ingredients: IngredientEntry[];
  cuisineLabels: string[];
};

const ALL_GROUPS = Array.from(new Set(ingredients.map((i) => i.group))).sort();

const CUISINE_COLORS: Record<string, string> = {
  "South Asian":                  "#f6c44a",
  "East Asian":                   "#f4a24a",
  "Japanese":                     "#e87a7a",
  "Korean":                       "#e84a7a",
  "Southeast Asian":              "#7af0c4",
  "Mediterranean":                "#4ac4f0",
  "Latin American":               "#c47af0",
  "Western/Atlantic":             "#a0d4f0",
  "Middle Eastern & North African":"#f4d47a",
  "Eastern European":             "#a8f6b0",
};

function cuisineColor(label: string): string {
  for (const [key, val] of Object.entries(CUISINE_COLORS)) {
    if (label.startsWith(key.split(" ")[0])) return val;
  }
  return "#a8f6b0";
}

interface ExploreScreenProps {
  onHome: () => void;
}

export function ExploreScreen({ onHome }: ExploreScreenProps) {
  const [selected, setSelected] = useState<IngredientEntry | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    return ingredients.filter((ing) => {
      const matchGroup  = filter === "All" || ing.group === filter;
      const matchSearch = ing.name.toLowerCase().includes(search.toLowerCase());
      return matchGroup && matchSearch;
    });
  }, [filter, search]);

  return (
    <div className="explore-screen">
      <div className="explore-topbar">
        <button className="quit-btn" onClick={onHome}>← Home</button>
        <h2 className="explore-title">Explore the Epicure Dataset</h2>
      </div>

      <p className="explore-subtitle">
        50 ingredients mapped by <b>4M+ recipes</b> across <b>7 languages</b>.
        Click any ingredient to see its cuisine fingerprint and flavor neighbors.
      </p>

      {/* Search + filter */}
      <div className="explore-controls">
        <input
          className="explore-search"
          type="text"
          placeholder="Search ingredient…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelected(null); }}
        />
        <div className="explore-filters">
          {["All", ...ALL_GROUPS].map((g) => (
            <button
              key={g}
              className={`explore-filter-btn${filter === g ? " active" : ""}`}
              onClick={() => { setFilter(g); setSelected(null); }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="explore-detail">
          <div className="explore-detail-header">
            <span className="explore-detail-emoji">{selected.emoji}</span>
            <div>
              <strong className="explore-detail-name">{selected.name}</strong>
              <span className="explore-detail-group">{selected.group}</span>
            </div>
            <button className="explore-close-btn" onClick={() => setSelected(null)}>✕</button>
          </div>

          <div className="explore-detail-body">
            <div className="explore-affinities">
              <div className="explore-section-label">Cuisine Fingerprint</div>
              {selected.cuisineAffinities.map((c) => (
                <div key={c.id} className="explore-aff-row">
                  <span className="explore-aff-label">{c.label}</span>
                  <div className="explore-aff-track">
                    <div
                      className="explore-aff-fill"
                      style={{ width: `${c.pct}%`, background: cuisineColor(c.label) }}
                    />
                  </div>
                  <span className="explore-aff-pct">{c.pct.toFixed(0)}%</span>
                </div>
              ))}
            </div>

            <div className="explore-similar">
              <div className="explore-section-label">Flavor Neighbors</div>
              <div className="explore-similar-pills">
                {selected.similar.map((name) => {
                  const ing = ingredients.find((i) => i.name === name);
                  return (
                    <button
                      key={name}
                      className="explore-similar-pill"
                      onClick={() => setSelected(ing ?? null)}
                    >
                      {ing?.emoji ?? "🍽️"} {name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ingredient grid */}
      <div className="explore-grid">
        {visible.map((ing) => (
          <button
            key={ing.name}
            className={`explore-card${selected?.name === ing.name ? " active" : ""}`}
            onClick={() => setSelected(selected?.name === ing.name ? null : ing)}
          >
            <span className="explore-card-emoji">{ing.emoji}</span>
            <span className="explore-card-name">{ing.name}</span>
            <span
              className="explore-card-cuisine"
              style={{ color: cuisineColor(ing.topCuisine) }}
            >
              {ing.topCuisine}
            </span>
          </button>
        ))}
      </div>

      <p className="explore-footer-note">
        Affinity scores are cosine similarities against cuisine direction vectors derived from the{" "}
        <a href="https://arxiv.org/abs/2605.22391" target="_blank" rel="noopener noreferrer">
          Epicure (CC-BY-4.0)
        </a>{" "}
        embedding space.
      </p>
    </div>
  );
}
