/**
 * Profile display: shows the user's palate results in plain language.
 */

import { useState } from "react";
import type { Profile } from "../engine/types";
import { DISH_SUGGESTIONS, type DishSuggestion } from "../data/dish-suggestions";
import { INGREDIENT_GROUP } from "../data/ingredient-groups";
import { getEmoji } from "../data/ingredient-emojis";

interface IngredientRating {
  name: string;
  value: number;
}

interface ProfileViewProps {
  profile: Profile;
  ingredientRatings: IngredientRating[];
  shareUrl: string;
  onShare: () => void;
  onRetake: () => void;
  lowSignal?: boolean;
}

export function ProfileView({
  profile,
  ingredientRatings,
  shareUrl,
  onRetake,
  lowSignal,
}: ProfileViewProps) {
  const [copied, setCopied] = useState<"prompt" | "link" | null>(null);

  const topCuisines = profile.cuisineScores.slice(0, 3);

  const dislikedNames = new Set(
    ingredientRatings.filter((r) => r.value === -1).map((r) => r.name)
  );

  function isDishOk(dish: DishSuggestion): boolean {
    if (!dish.keyIngredients?.length) return true;
    return !dish.keyIngredients.some((ing) => dislikedNames.has(ing));
  }

  function copy(text: string, key: "prompt" | "link"): void {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const llmPrompt = generateLlmPrompt(profile, ingredientRatings);

  // Build ingredient clusters
  const groups: Record<string, IngredientRating[]> = {};
  for (const r of ingredientRatings) {
    const group = INGREDIENT_GROUP[r.name] ?? "Other";
    if (!groups[group]) groups[group] = [];
    groups[group].push(r);
  }

  const sortedGroups = Object.entries(groups)
    .filter(([, items]) => items.some(r => r.value !== 0))
    .sort(([, a], [, b]) => {
      const loveA = a.filter((r) => r.value === 1).length;
      const loveB = b.filter((r) => r.value === 1).length;
      return loveB - loveA;
    });

  return (
    <div className="profile-view">
      <div className="profile-topbar">
        <button className="retake-btn" onClick={onRetake}>↩ Retake Quiz</button>
      </div>
      <h2>Your Palate Profile</h2>

      {lowSignal && (
        <div className="low-signal-warning">
          <p>Based on fewer ingredients than ideal. Retake for a richer profile.</p>
        </div>
      )}

      <section className="cuisine-section">
        <h3>Your Cuisines</h3>
        {(() => {
          const maxScore = Math.max(...topCuisines.map((c) => c.score), 0.001);
          return topCuisines.map((cuisine, idx) => {
            const barPct = Math.round((cuisine.score / maxScore) * 100);
            const dishes = (DISH_SUGGESTIONS[cuisine.direction] ?? []).filter(isDishOk);
            return (
              <div key={cuisine.direction} className="cuisine-result">
                <div className="cuisine-result-header">
                  <strong>{cuisine.label}</strong>
                  <span className="cuisine-rank">#{idx + 1}</span>
                </div>
                <div className="cuisine-bar-track">
                  <div className="cuisine-bar-fill" style={{ width: `${barPct}%` }} />
                </div>
                {dishes.length > 0 && (
                  <p className="dishes">
                    Recipes:{" "}
                    {dishes.slice(0, 3).map((d: DishSuggestion, i: number) => (
                      <span key={d.name}>
                        {i > 0 && " · "}
                        <a href={d.url} target="_blank" rel="noopener noreferrer" className="dish-link">
                          {d.name}
                        </a>
                      </span>
                    ))}
                  </p>
                )}
              </div>
            );
          });
        })()}
      </section>

      {sortedGroups.length > 0 && (
        <section className="ingredient-clusters-section">
          <h3>Your Ingredients</h3>
          <div className="ingredient-clusters">
            {sortedGroups.map(([groupName, items]) => (
              <div key={groupName} className="ingredient-cluster">
                <div className="cluster-label">{groupName}</div>
                <div className="cluster-pills">
                  {items.map((r) => (
                    r.value !== 0 && (
                    <span
                      key={r.name}
                      className={`ingredient-pill ${r.value === 1 ? "loved" : "disliked"}`}
                    >
                      {getEmoji(r.name)} {r.name}
                    </span>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="actions-section">
        <h3>Find a Restaurant</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--ink-mid)", marginBottom: "0.75rem" }}>
          Paste this into ChatGPT, Claude, or any AI assistant:
        </p>
        <div className="llm-prompt">
          <pre>{llmPrompt}</pre>
          <button
            className={copied === "prompt" ? "copy-btn copied" : "copy-btn"}
            onClick={() => copy(llmPrompt, "prompt")}
          >
            {copied === "prompt" ? "✓ Copied!" : "Copy Prompt"}
          </button>
        </div>
      </section>

      <section className="share-section">
        <h3>Share with a Friend</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--ink-mid)", marginBottom: "1rem" }}>
          Send them your link. When they take the quiz you'll see your compatibility score.
        </p>
        <button
          className={`share-cta-btn${copied === "link" ? " copied" : ""}`}
          onClick={() => copy(shareUrl, "link")}
        >
          {copied === "link" ? "✓ Link Copied!" : "📋 Copy My Profile Link"}
        </button>
        <p className="share-cta-hint">{shareUrl}</p>
      </section>
    </div>
  );
}

/**
 * Generate a rich LLM prompt from the profile and ingredient ratings.
 */
function generateLlmPrompt(profile: Profile, ingredientRatings: IngredientRating[]): string {
  const cuisines = profile.cuisineScores.slice(0, 3).map((c) => c.label).join(", ");

  const loved = ingredientRatings
    .filter((r) => r.value === 1)
    .map((r) => r.name)
    .slice(0, 12)
    .join(", ");

  const disliked = ingredientRatings
    .filter((r) => r.value === -1)
    .map((r) => r.name);

  const dislikedLine = disliked.length > 0
    ? `\n- I dislike or can't eat: ${disliked.join(", ")}`
    : "";

  const contributors = profile.cuisineScores
    .slice(0, 3)
    .flatMap((c) => c.topContributors)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 6)
    .join(", ");

  return `I'm looking for restaurant recommendations near [your city/neighbourhood].

My taste profile:
- Top cuisines: ${cuisines}
- Ingredients I love: ${loved || contributors}${dislikedLine}

Please recommend 3–5 restaurants or restaurant types that match my palate. For each:
1. Name the cuisine style or dish type
2. Explain which of my loved flavours it features
3. Suggest 1–2 specific dishes to order

${disliked.length > 0 ? `Avoid dishes that prominently feature: ${disliked.join(", ")}` : ""}`.trim();
}
