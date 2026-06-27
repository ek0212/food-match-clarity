/**
 * Quiz deck: the 30 fixed ingredients shown to every user.
 *
 * Generated from Epicure's epicure_cooc.csv using cuisine-anchored selection.
 * See data-pipeline/build_data.py for the selection logic.
 */

import type { QuizCard } from "../engine/types";
import quizDeckData from "./generated/quiz-deck.json";

export const QUIZ_DECK: QuizCard[] = quizDeckData as QuizCard[];
