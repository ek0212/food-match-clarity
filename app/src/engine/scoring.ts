/**
 * Scoring engine: computes taste profiles from quiz ratings.
 *
 * All functions are pure — no side effects, no DOM, no state.
 * The math: user ratings × ingredient embeddings → preference vector,
 * then dot products against cuisine directions and mode centroids.
 */

import type { Rating, Profile, CuisineScore, ModeAffinity } from "./types";

/**
 * Compute the dot product of two vectors.
 *
 * Args:
 *   a: First vector.
 *   b: Second vector (same length as a).
 *
 * Returns:
 *   Scalar dot product.
 */
function dot(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

/**
 * Compute the L2 norm of a vector.
 *
 * Args:
 *   v: Input vector.
 *
 * Returns:
 *   Euclidean length.
 */
function norm(v: number[]): number {
  return Math.sqrt(dot(v, v));
}

/**
 * Normalize a vector to unit length. Returns zero vector if input is zero.
 *
 * Args:
 *   v: Input vector.
 *
 * Returns:
 *   Unit vector in the same direction, or zero vector.
 */
function normalize(v: number[]): number[] {
  const n = norm(v);
  if (n === 0) return v.map(() => 0);
  return v.map((x) => x / n);
}

/**
 * Build a user preference vector from quiz ratings and ingredient embeddings.
 *
 * Mean-centers ratings before accumulation so users who loved most ingredients
 * still get discriminating profiles — the vector reflects relative preferences,
 * not raw enthusiasm.
 *
 * Args:
 *   ratings: Array of user ratings (only scored ingredients, not skipped).
 *   embeddings: Matrix of ingredient embeddings (one row per quiz ingredient).
 *
 * Returns:
 *   Normalized 300-dim preference vector.
 */
export function buildPreferenceVector(
  ratings: Rating[],
  embeddings: number[][]
): number[] {
  const dim = embeddings[0].length;
  const prefVector = new Array(dim).fill(0);

  if (ratings.length === 0) return prefVector;

  // Mean-center so "loved everything" users still discriminate by relative preference.
  const mean = ratings.reduce((s, r) => s + r.value, 0) / ratings.length;

  for (const { ingredientIndex, value } of ratings) {
    const centered = value - mean;
    const embedding = embeddings[ingredientIndex];
    for (let i = 0; i < dim; i++) {
      prefVector[i] += centered * embedding[i];
    }
  }

  return normalize(prefVector);
}

/**
 * Score cuisine affinities by projecting the preference vector onto cuisine directions.
 * Uses relative scoring (z-scores) so results emphasize what's distinctive about a user,
 * not what's universally popular.
 *
 * Args:
 *   prefVector: Normalized preference vector.
 *   cuisineVectors: Array of 8 cuisine direction vectors.
 *   cuisineLabels: Array of 8 cuisine direction labels.
 *   ratings: Original ratings for computing top contributors.
 *   embeddings: Ingredient embeddings for contribution analysis.
 *   ingredientNames: Names of quiz ingredients for explanation.
 *
 * Returns:
 *   Array of CuisineScore sorted by score descending.
 */
export function scoreCuisines(
  prefVector: number[],
  cuisineVectors: number[][],
  cuisineLabels: { id: string; label: string }[],
  ratings: Rating[],
  embeddings: number[][],
  ingredientNames: string[]
): CuisineScore[] {
  // Compute raw dot products
  const rawScores = cuisineLabels.map((_, i) => dot(prefVector, cuisineVectors[i]));

  // Convert to z-scores for relative ranking
  const mean = rawScores.reduce((s, v) => s + v, 0) / rawScores.length;
  const variance = rawScores.reduce((s, v) => s + (v - mean) ** 2, 0) / rawScores.length;
  const std = Math.sqrt(variance) || 1;

  const scores: CuisineScore[] = cuisineLabels.map((cuisine, i) => {
    const score = (rawScores[i] - mean) / std;

    // Find top contributors: which rated ingredients project most onto this direction
    const contributions = ratings
      .filter((r) => r.value !== 0)
      .map((r) => ({
        name: ingredientNames[r.ingredientIndex],
        contribution: r.value * dot(embeddings[r.ingredientIndex], cuisineVectors[i]),
      }))
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
      .slice(0, 3)
      .filter((c) => c.contribution > 0)
      .map((c) => c.name);

    return {
      direction: cuisine.id,
      label: cuisine.label,
      score,
      topContributors: contributions,
    };
  });

  return scores.sort((a, b) => b.score - a.score);
}

/**
 * Score mode affinities by projecting the preference vector onto mode centroids.
 *
 * Args:
 *   prefVector: Normalized preference vector.
 *   modeCentroids: Array of mode centroid vectors.
 *   modeEntries: Array of mode metadata (labels, members).
 *
 * Returns:
 *   Array of ModeAffinity sorted by score descending.
 */
export function scoreModes(
  prefVector: number[],
  modeCentroids: number[][],
  modeEntries: { label: string; members: string[] }[]
): ModeAffinity[] {
  const affinities: ModeAffinity[] = modeEntries.map((mode, i) => ({
    modeIndex: i,
    label: mode.label,
    score: dot(prefVector, modeCentroids[i]),
    examples: mode.members.slice(0, 4),
  }));

  return affinities.sort((a, b) => b.score - a.score);
}

/**
 * Build a complete taste profile from quiz ratings.
 *
 * Args:
 *   ratings: User's quiz ratings (excluding skipped/can't-eat).
 *   embeddings: Quiz ingredient embedding matrix.
 *   cuisineVectors: 8 cuisine direction vectors.
 *   cuisineLabels: 8 cuisine labels.
 *   modeCentroids: Mode centroid vectors.
 *   modeEntries: Mode metadata.
 *   ingredientNames: Quiz ingredient names.
 *
 * Returns:
 *   Complete Profile with top cuisines and modes.
 */
export function buildProfile(
  ratings: Rating[],
  embeddings: number[][],
  cuisineVectors: number[][],
  cuisineLabels: { id: string; label: string }[],
  modeCentroids: number[][],
  modeEntries: { label: string; members: string[] }[],
  ingredientNames: string[]
): Profile {
  const prefVector = buildPreferenceVector(ratings, embeddings);

  const cuisineScores = scoreCuisines(
    prefVector,
    cuisineVectors,
    cuisineLabels,
    ratings,
    embeddings,
    ingredientNames
  );

  const modeAffinities = scoreModes(prefVector, modeCentroids, modeEntries);

  return {
    cuisineScores: cuisineScores.slice(0, 3),
    modeAffinities: modeAffinities.slice(0, 5),
  };
}
