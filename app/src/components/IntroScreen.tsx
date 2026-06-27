/**
 * Landing page: explains what Epicure is and why the quiz matters.
 */

interface IntroScreenProps {
  onStart: () => void;
  hasFriendProfile: boolean;
}

export function IntroScreen({ onStart, hasFriendProfile }: IntroScreenProps) {
  return (
    <div className="intro-screen">
      <h1>Food Match</h1>
      <p className="subtitle">Find your palate. Find what to eat together.</p>

      {hasFriendProfile && (
        <div className="friend-cta">
          <p><strong>A friend shared their taste profile with you!</strong></p>
          <p>Take the quiz to see what you have in common and what to eat together.</p>
        </div>
      )}

      <div className="intro-explanation">
        <p>
          A research project called <strong>Epicure</strong> scanned over 4 million recipes
          across 7 languages and mapped how 1,790 ingredients actually relate to each other.
          Not by chemistry alone, but by how real cooks combine them.
        </p>
        <p>
          This quiz uses that ingredient map to figure out your palate in about 5 minutes.
          You'll rate 30 ingredients, and the app will tell you which cuisines you gravitate
          toward, which flavor neighborhoods you belong to, and what dishes to try next.
        </p>
        <p>
          Share your results with a friend. When they take the quiz too, you'll see what
          you both love, where you differ, and what to eat together tonight.
        </p>
      </div>

      <button className="start-button" onClick={onStart}>
        {hasFriendProfile ? "Take the Quiz & Compare" : "Take the Quiz"}
      </button>

      <p className="attribution">
        Powered by <a href="https://arxiv.org/abs/2605.22391" target="_blank" rel="noopener noreferrer">Epicure</a> (CC-BY-4.0).
        Built from 4M+ recipes.
      </p>
    </div>
  );
}
