/**
 * Quiz component: shows ingredient cards one at a time and collects ratings.
 */

import { useState, useEffect, useCallback } from "react";
import type { QuizCard, Rating, RatingValue } from "../engine/types";

interface QuizScreenProps {
  cards: QuizCard[];
  onComplete: (ratings: Rating[]) => void;
  onQuit: () => void;
}

type CardResponse = { type: "rated"; value: RatingValue } | { type: "skipped" };

export function QuizScreen({ cards, onComplete, onQuit }: QuizScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<(CardResponse | null)[]>(
    () => new Array(cards.length).fill(null)
  );
  const [animating, setAnimating] = useState(false);
  const [animDirection, setAnimDirection] = useState<"left" | "right" | "up" | "down" | "">(
    ""
  );

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  function handleRate(value: RatingValue): void {
    // Love → left, Fine → up, Not for me → right
    const direction = value === 1 ? "left" : value === -1 ? "right" : "up";
    animateAndRecord({ type: "rated", value }, direction);
  }

  function handleSkip(): void {
    animateAndRecord({ type: "skipped" }, "down");
  }

  function animateAndRecord(response: CardResponse, direction: "left" | "right" | "up" | "down"): void {
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

  function handleUndo(): void {
    if (currentIndex === 0 || animating) return;
    const newResponses = [...responses];
    newResponses[currentIndex - 1] = null;
    setResponses(newResponses);
    setCurrentIndex(currentIndex - 1);
  }

  const handleKeyDown = useCallback((e: KeyboardEvent): void => {
    if (animating) return;
    switch (e.key) {
      case "ArrowLeft":   handleRate(1);   break; // Love
      case "ArrowRight":  handleRate(-1);  break; // Not for me
      case "ArrowUp":     handleRate(0);   break; // Fine
      case "ArrowDown":   handleSkip();    break; // Skip
      case "Backspace":   handleUndo();    break; // Undo
    }
  }, [animating, currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const cardClass = `card ${animDirection ? `card-exit-${animDirection}` : "card-enter"}`;

  return (
    <div className="quiz-screen">
      <div className="quiz-topbar">
        <button className="quit-btn" onClick={onQuit}>← Home</button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
          <span className="progress-text">{currentIndex + 1} / {cards.length}</span>
        </div>
        <button className="undo-btn" onClick={handleUndo} disabled={currentIndex === 0 || animating}>
          ↩ Undo
        </button>
      </div>

      <div className={cardClass} key={currentIndex}>
        <h2 className="card-name">{currentCard.name}</h2>
        <p className="card-context">{currentCard.context}</p>
      </div>

      <div className="rating-buttons">
        <button className="rate-btn love" onClick={() => handleRate(1)} disabled={animating}>
          <span className="key-hint">←</span> Love it
        </button>
        <button className="rate-btn fine" onClick={() => handleRate(0)} disabled={animating}>
          <span className="key-hint">↑</span> It's fine
        </button>
        <button className="rate-btn not-for-me" onClick={() => handleRate(-1)} disabled={animating}>
          Not for me <span className="key-hint">→</span>
        </button>
      </div>

      <div className="skip-buttons">
        <button className="skip-btn" onClick={handleSkip} disabled={animating}>
          <span className="key-hint">↓</span> Can't eat / Skip
        </button>
      </div>
    </div>
  );
}
