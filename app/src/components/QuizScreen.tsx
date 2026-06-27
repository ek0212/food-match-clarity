/**
 * Quiz component: shows ingredient cards one at a time and collects ratings.
 */

import { useState } from "react";
import type { QuizCard, Rating, RatingValue } from "../engine/types";

interface QuizScreenProps {
  cards: QuizCard[];
  onComplete: (ratings: Rating[]) => void;
}

type CardResponse = { type: "rated"; value: RatingValue } | { type: "skipped" };

export function QuizScreen({ cards, onComplete }: QuizScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<(CardResponse | null)[]>(
    () => new Array(cards.length).fill(null)
  );
  const [animating, setAnimating] = useState(false);
  const [animDirection, setAnimDirection] = useState<"left" | "right" | "up" | "">(
    ""
  );

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  function handleRate(value: RatingValue): void {
    const direction = value === 1 ? "right" : value === -1 ? "left" : "up";
    animateAndRecord({ type: "rated", value }, direction);
  }

  function handleSkip(): void {
    animateAndRecord({ type: "skipped" }, "up");
  }

  function animateAndRecord(response: CardResponse, direction: "left" | "right" | "up"): void {
    if (animating) return;
    setAnimating(true);
    setAnimDirection(direction);

    setTimeout(() => {
      const newResponses = [...responses];
      newResponses[currentIndex] = response;
      setResponses(newResponses);

      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        finishQuiz(newResponses);
      }
      setAnimating(false);
      setAnimDirection("");
    }, 250);
  }

  function finishQuiz(finalResponses: (CardResponse | null)[]): void {
    const ratings: Rating[] = finalResponses
      .map((r, i) => {
        if (r && r.type === "rated") {
          return { ingredientIndex: i, value: r.value } as Rating;
        }
        return null;
      })
      .filter((r): r is Rating => r !== null);

    onComplete(ratings);
  }

  const cardClass = `card ${animDirection ? `card-exit-${animDirection}` : "card-enter"}`;

  return (
    <div className="quiz-screen">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
        <span className="progress-text">{currentIndex + 1} / {cards.length}</span>
      </div>

      <div className={cardClass} key={currentIndex}>
        <h2 className="card-name">{currentCard.name}</h2>
        <p className="card-context">{currentCard.context}</p>
      </div>

      <div className="rating-buttons">
        <button className="rate-btn love" onClick={() => handleRate(1)} disabled={animating}>
          Love it
        </button>
        <button className="rate-btn fine" onClick={() => handleRate(0)} disabled={animating}>
          It's fine
        </button>
        <button className="rate-btn not-for-me" onClick={() => handleRate(-1)} disabled={animating}>
          Not for me
        </button>
      </div>

      <div className="skip-buttons">
        <button className="skip-btn" onClick={handleSkip} disabled={animating}>
          Can't eat
        </button>
        <button className="skip-btn" onClick={handleSkip} disabled={animating}>
          Don't know
        </button>
      </div>
    </div>
  );
}
