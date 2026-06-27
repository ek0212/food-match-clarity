/**
 * Food Match: main app shell.
 *
 * Manages the flow: Intro → Quiz → Profile → (Compare if friend's profile in URL)
 */

import { useState, useEffect } from "react";
import { IntroScreen } from "./components/IntroScreen";
import { QuizScreen } from "./components/QuizScreen";
import { ProfileView } from "./components/ProfileView";
import { ComparisonView } from "./components/ComparisonView";
import {
  buildProfile,
  getShareableUrl,
  getProfileFromUrl,
  compareProfiles,
} from "./engine";
import type { Rating, Profile, Comparison, EncodedProfile } from "./engine";
import { QUIZ_DECK } from "./data/quiz-deck";
import { CUISINE_DIRECTIONS } from "./data/cuisine-directions";
import { EMBEDDINGS, CUISINE_VECTORS, MODE_CENTROIDS, MODE_ENTRIES } from "./data/embeddings";
import "./App.css";

type AppPhase = "intro" | "quiz" | "profile" | "compare";

const LOW_SIGNAL_THRESHOLD = 15;

function App() {
  const [phase, setPhase] = useState<AppPhase>("intro");
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [friendProfile, setFriendProfile] = useState<EncodedProfile | null>(null);
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [ratingCount, setRatingCount] = useState(0);

  useEffect(() => {
    const decoded = getProfileFromUrl();
    if (decoded) {
      setFriendProfile(decoded);
    }
  }, []);

  function handleStartQuiz(): void {
    setMyProfile(null);
    setComparison(null);
    setRatingCount(0);
    setPhase("quiz");
  }

  function handleRetake(): void {
    setMyProfile(null);
    setComparison(null);
    setRatingCount(0);
    setPhase("quiz");
  }

  function handleQuitToHome(): void {
    setMyProfile(null);
    setComparison(null);
    setRatingCount(0);
    setPhase("intro");
  }

  function handleQuizComplete(ratings: Rating[]): void {
    const ingredientNames = QUIZ_DECK.map((card) => card.name);
    setRatingCount(ratings.length);

    const profile = buildProfile(
      ratings,
      EMBEDDINGS,
      CUISINE_VECTORS,
      CUISINE_DIRECTIONS,
      MODE_CENTROIDS,
      MODE_ENTRIES,
      ingredientNames
    );

    setMyProfile(profile);
    setShareUrl(getShareableUrl(profile));

    if (friendProfile) {
      const friendFullProfile = reconstructProfileFromEncoded(friendProfile);
      const comp = compareProfiles(friendFullProfile, profile);
      setComparison(comp);
      setPhase("compare");
    } else {
      setPhase("profile");
    }
  }

  function handleShare(): void {
    navigator.clipboard.writeText(shareUrl);
  }

  const lowSignal = ratingCount > 0 && ratingCount < LOW_SIGNAL_THRESHOLD;

  return (
    <div className="app">
      {phase === "intro" && (
        <IntroScreen
          onStart={handleStartQuiz}
          hasFriendProfile={friendProfile !== null}
        />
      )}

      {phase === "quiz" && (
        <QuizScreen cards={QUIZ_DECK} onComplete={handleQuizComplete} onQuit={handleQuitToHome} />
      )}

      {phase === "profile" && myProfile && (
        <ProfileView
          profile={myProfile}
          shareUrl={shareUrl}
          onShare={handleShare}
          onRetake={handleRetake}
          lowSignal={lowSignal}
        />
      )}

      {phase === "compare" && myProfile && comparison && (
        <div>
          <ProfileView
            profile={myProfile}
            shareUrl={shareUrl}
            onShare={handleShare}
            onRetake={handleRetake}
            lowSignal={lowSignal}
          />
          <ComparisonView comparison={comparison} onRetake={handleRetake} />
        </div>
      )}
    </div>
  );
}

/**
 * Reconstruct a Profile from URL-decoded scores for comparison.
 */
function reconstructProfileFromEncoded(encoded: EncodedProfile): Profile {
  return {
    cuisineScores: CUISINE_DIRECTIONS.map((dir, i) => ({
      direction: dir.id,
      label: dir.label,
      score: encoded.cuisines[i] || 0,
      topContributors: [],
    })),
    modeAffinities: encoded.modes.map((m) => ({
      modeIndex: m.index,
      label: MODE_ENTRIES[m.index]?.label || "Unknown",
      score: m.score,
      examples: MODE_ENTRIES[m.index]?.members.slice(0, 4) || [],
    })),
  };
}

export default App;
