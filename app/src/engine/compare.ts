/**
 * Comparison engine: overlays two profiles to find compatibility.
 *
 * Produces shared ground (primary), conflicts, and bridge suggestions.
 */

import type { Profile, Comparison, CuisineScore, ModeAffinity } from "./types";

const SHARED_THRESHOLD = 0.1;
const CONFLICT_THRESHOLD = 0.3;
const BRIDGE_THRESHOLD = 0.05;

/**
 * Compare two profiles and produce a compatibility result.
 *
 * Args:
 *   profileA: First user's profile (the sharer).
 *   profileB: Second user's profile (the viewer).
 *
 * Returns:
 *   Comparison with shared ground, conflicts, bridges, and eat-together suggestion.
 */
export function compareProfiles(
  profileA: Profile,
  profileB: Profile
): Comparison {
  const sharedCuisines = findSharedCuisines(profileA.cuisineScores, profileB.cuisineScores);
  const sharedModes = findSharedModes(profileA.modeAffinities, profileB.modeAffinities);
  const conflicts = findConflicts(profileA.cuisineScores, profileB.cuisineScores);
  const bridges = findBridges(profileA.modeAffinities, profileB.modeAffinities);

  const sharedSummary = buildSharedSummary(sharedCuisines, sharedModes);
  const eatTogether = buildEatTogetherSuggestion(sharedCuisines, sharedModes);

  return {
    sharedGround: {
      cuisines: sharedCuisines,
      modes: sharedModes,
      summary: sharedSummary,
    },
    conflicts,
    bridges,
    eatTogether,
  };
}

/**
 * Find cuisines where both users score above threshold.
 */
function findSharedCuisines(
  scoresA: CuisineScore[],
  scoresB: CuisineScore[]
): CuisineScore[] {
  const shared: CuisineScore[] = [];

  for (const a of scoresA) {
    const b = scoresB.find((s) => s.direction === a.direction);
    if (b && a.score > SHARED_THRESHOLD && b.score > SHARED_THRESHOLD) {
      shared.push({
        direction: a.direction,
        label: a.label,
        score: (a.score + b.score) / 2,
        topContributors: [...new Set([...a.topContributors, ...b.topContributors])].slice(0, 4),
      });
    }
  }

  return shared.sort((a, b) => b.score - a.score);
}

/**
 * Find modes where both users have high affinity.
 */
function findSharedModes(
  modesA: ModeAffinity[],
  modesB: ModeAffinity[]
): ModeAffinity[] {
  const shared: ModeAffinity[] = [];

  for (const a of modesA) {
    const b = modesB.find((m) => m.modeIndex === a.modeIndex);
    if (b && a.score > SHARED_THRESHOLD && b.score > SHARED_THRESHOLD) {
      shared.push({
        modeIndex: a.modeIndex,
        label: a.label,
        score: (a.score + b.score) / 2,
        examples: a.examples,
      });
    }
  }

  return shared.sort((a, b) => b.score - a.score);
}

/**
 * Find cuisine directions where one scores high and the other low.
 */
function findConflicts(
  scoresA: CuisineScore[],
  scoresB: CuisineScore[]
): Comparison["conflicts"] {
  const conflicts: Comparison["conflicts"] = [];

  for (const a of scoresA) {
    const b = scoresB.find((s) => s.direction === a.direction);
    if (b && Math.abs(a.score - b.score) > CONFLICT_THRESHOLD) {
      const higher = a.score > b.score ? "You" : "They";
      const lower = a.score > b.score ? "they" : "you";
      conflicts.push({
        direction: a.direction,
        labelA: a.label,
        labelB: b.label,
        summary: `${higher} lean toward ${a.label} flavors, but ${lower} rated those ingredients lower.`,
      });
    }
  }

  return conflicts;
}

/**
 * Find modes where one person is high and the other is neutral (not negative).
 * These are opportunities to introduce new flavors.
 */
function findBridges(
  modesA: ModeAffinity[],
  modesB: ModeAffinity[]
): Comparison["bridges"] {
  const bridges: Comparison["bridges"] = [];

  // Check A's top modes that B hasn't explored
  for (const a of modesA.slice(0, 5)) {
    const b = modesB.find((m) => m.modeIndex === a.modeIndex);
    if (b && a.score > SHARED_THRESHOLD && b.score >= -BRIDGE_THRESHOLD && b.score < SHARED_THRESHOLD) {
      bridges.push({
        ingredient: a.examples[0] || a.label,
        from: "them",
        to: "you",
        summary: `They love ${a.label} (like ${a.examples.slice(0, 2).join(", ")}). You haven't explored it much — you might enjoy it.`,
      });
    }
  }

  // Check B's top modes that A hasn't explored
  for (const b of modesB.slice(0, 5)) {
    const a = modesA.find((m) => m.modeIndex === b.modeIndex);
    if (a && b.score > SHARED_THRESHOLD && a.score >= -BRIDGE_THRESHOLD && a.score < SHARED_THRESHOLD) {
      bridges.push({
        ingredient: b.examples[0] || b.label,
        from: "you",
        to: "them",
        summary: `You love ${b.label} (like ${b.examples.slice(0, 2).join(", ")}). They might be open to trying it.`,
      });
    }
  }

  return bridges.slice(0, 3);
}

/**
 * Build a natural-language summary of shared ground.
 */
function buildSharedSummary(
  cuisines: CuisineScore[],
  modes: ModeAffinity[]
): string {
  if (cuisines.length === 0 && modes.length === 0) {
    return "You have pretty different palates! But that can make dining together an adventure.";
  }

  const cuisineNames = cuisines.slice(0, 2).map((c) => c.label);
  const modeExamples = modes.slice(0, 2).flatMap((m) => m.examples.slice(0, 2));

  let summary = `You both gravitate toward ${cuisineNames.join(" and ")} flavors`;
  if (modeExamples.length > 0) {
    summary += `, especially ingredients like ${modeExamples.join(", ")}`;
  }
  summary += ".";

  return summary;
}

/**
 * Generate a concrete eat-together suggestion from shared ground.
 */
function buildEatTogetherSuggestion(
  cuisines: CuisineScore[],
  modes: ModeAffinity[]
): string {
  if (cuisines.length === 0) {
    return "Try a restaurant with a diverse menu so you can each find something you love.";
  }

  const topCuisine = cuisines[0];
  const topMode = modes.length > 0 ? modes[0] : null;

  let suggestion = `Look for a ${topCuisine.label} restaurant`;
  if (topMode) {
    suggestion += ` that features ${topMode.label.toLowerCase()} dishes`;
    if (topMode.examples.length > 0) {
      suggestion += ` (think ${topMode.examples.slice(0, 3).join(", ")})`;
    }
  }
  suggestion += ". You'll both enjoy it.";

  return suggestion;
}
