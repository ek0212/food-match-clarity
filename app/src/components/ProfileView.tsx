/**
 * Profile display: shows the user's palate results in plain language.
 */

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
  onShare,
  onRetake,
  lowSignal,
}: ProfileViewProps) {
  const topCuisines = profile.cuisineScores.slice(0, 3);
  const llmPrompt = generateLlmPrompt(profile);

  // Build disliked set for dish filtering
  const dislikedNames = new Set(
    ingredientRatings.filter((r) => r.value === -1).map((r) => r.name)
  );

  function isDishOk(dish: DishSuggestion): boolean {
    if (!dish.keyIngredients?.length) return true;
    return !dish.keyIngredients.some((ing) => dislikedNames.has(ing));
  }

  // Build ingredient clusters grouped by cuisine family
  const groups: Record<string, IngredientRating[]> = {};
  for (const r of ingredientRatings) {
    const group = INGREDIENT_GROUP[r.name] ?? "Other";
    if (!groups[group]) groups[group] = [];
    groups[group].push(r);
  }

  // Sort groups: most loved ingredients first
  const sortedGroups = Object.entries(groups).sort(([, a], [, b]) => {
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
                {cuisine.topContributors.length > 0 && (
                  <p className="because">Because you loved {cuisine.topContributors.join(", ")}</p>
                )}
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
                    <span
                      key={r.name}
                      className={`ingredient-pill ${r.value === 1 ? "loved" : r.value === -1 ? "disliked" : "fine"}`}
                    >
                      {getEmoji(r.name)} {r.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="actions-section">
        <h3>Find a Restaurant</h3>
        <p>Paste this into ChatGPT or any AI assistant:</p>
        <div className="llm-prompt">
          <pre>{llmPrompt}</pre>
          <button onClick={() => navigator.clipboard.writeText(llmPrompt)}>
            Copy Prompt
          </button>
        </div>
      </section>

      <section className="share-section">
        <h3>Share with a Friend</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--ink-mid)", marginBottom: "1rem" }}>
          Send them your link. When they take the quiz you'll see your compatibility score.
        </p>
        <button className="share-cta-btn" onClick={onShare}>
          📋 Copy My Profile Link
        </button>
        <p className="share-cta-hint">{shareUrl}</p>
      </section>
    </div>
  );
}

function generateLlmPrompt(profile: Profile): string {
  const cuisines = profile.cuisineScores.slice(0, 3).map((c) => c.label).join(", ");
  return `I'm looking for restaurant recommendations near me. My taste profile:

- I gravitate toward ${cuisines} cuisines

Suggest 3-5 restaurants or restaurant types that match these preferences. For each, explain which aspect of my palate it would satisfy.`;
}
