/**
 * Profile display: shows the user's palate results in plain language.
 */

import type { Profile } from "../engine/types";

interface ProfileViewProps {
  profile: Profile;
  shareUrl: string;
  onShare: () => void;
  lowSignal?: boolean;
}

export function ProfileView({ profile, shareUrl, onShare, lowSignal }: ProfileViewProps) {
  const topCuisines = profile.cuisineScores.slice(0, 3);
  const topModes = profile.modeAffinities.slice(0, 5);

  const llmPrompt = generateLlmPrompt(profile);

  return (
    <div className="profile-view">
      <h2>Your Palate Profile</h2>

      {lowSignal && (
        <div className="low-signal-warning">
          <p>Based on fewer ingredients than ideal. Retake for a richer profile.</p>
        </div>
      )}

      <section className="cuisine-section">
        <h3>Your Cuisines</h3>
        {topCuisines.map((cuisine) => (
          <div key={cuisine.direction} className="cuisine-result">
            <strong>{cuisine.label}</strong>
            {cuisine.topContributors.length > 0 && (
              <p className="because">
                Because you loved {cuisine.topContributors.join(", ")}
              </p>
            )}
          </div>
        ))}
      </section>

      <section className="modes-section">
        <h3>Your Flavor Neighborhoods</h3>
        {topModes.map((mode) => (
          <div key={mode.modeIndex} className="mode-result">
            <strong>{mode.label}</strong>
            <p className="mode-examples">
              Think: {mode.examples.join(", ")}
            </p>
          </div>
        ))}
      </section>

      <section className="actions-section">
        <h3>Find Places to Eat</h3>
        <p>Paste this into ChatGPT or any AI assistant to find matching restaurants near you:</p>
        <div className="llm-prompt">
          <pre>{llmPrompt}</pre>
          <button onClick={() => navigator.clipboard.writeText(llmPrompt)}>
            Copy Prompt
          </button>
        </div>
      </section>

      <section className="share-section">
        <h3>Share with a Friend</h3>
        <p>Send your profile link. When they take the quiz, you'll see what you have in common.</p>
        <div className="share-url">
          <input type="text" readOnly value={shareUrl} />
          <button onClick={onShare}>Copy Link</button>
        </div>
      </section>
    </div>
  );
}

/**
 * Generate an LLM prompt from the profile for restaurant finding.
 */
function generateLlmPrompt(profile: Profile): string {
  const cuisines = profile.cuisineScores
    .slice(0, 3)
    .map((c) => c.label)
    .join(", ");

  const flavors = profile.modeAffinities
    .slice(0, 3)
    .map((m) => `${m.label} (like ${m.examples.slice(0, 2).join(", ")})`)
    .join("; ");

  return `I'm looking for restaurant recommendations near me. My taste profile:

- I gravitate toward ${cuisines} cuisines
- I especially enjoy: ${flavors}

Suggest 3-5 restaurants or restaurant types that match these preferences. For each, explain which aspect of my palate it would satisfy.`;
}
