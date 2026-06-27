/**
 * Core types for the Food Match scoring engine.
 */

/** User's response to a single quiz card. */
export type RatingValue = 1 | 0 | -1;

/** A single quiz card rating result. */
export interface Rating {
  ingredientIndex: number;
  value: RatingValue;
}

/** A cuisine direction with computed score and explanation. */
export interface CuisineScore {
  direction: string;
  label: string;
  score: number;
  topContributors: string[];
}

/** A flavor neighborhood (mode) affinity. */
export interface ModeAffinity {
  modeIndex: number;
  label: string;
  score: number;
  examples: string[];
}

/** A user's complete taste profile. */
export interface Profile {
  cuisineScores: CuisineScore[];
  modeAffinities: ModeAffinity[];
}

/** Encoded profile for URL sharing. */
export interface EncodedProfile {
  version: number;
  cuisines: number[];
  modes: { index: number; score: number }[];
}

/** Compatibility result between two profiles. */
export interface Comparison {
  sharedGround: {
    cuisines: CuisineScore[];
    modes: ModeAffinity[];
    summary: string;
  };
  conflicts: {
    direction: string;
    labelA: string;
    labelB: string;
    summary: string;
  }[];
  bridges: {
    ingredient: string;
    from: string;
    to: string;
    summary: string;
  }[];
  eatTogether: string;
}

/** Quiz card definition. */
export interface QuizCard {
  name: string;
  context: string;
  embeddingIndex: number;
}

/** Mode atlas entry. */
export interface ModeEntry {
  label: string;
  members: string[];
}

/** Cuisine direction definition. */
export interface CuisineDirection {
  id: string;
  label: string;
}
