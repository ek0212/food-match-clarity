/**
 * Barrel export for the scoring engine.
 */

export { buildProfile, buildPreferenceVector, scoreCuisines, scoreModes } from "./scoring";
export { encodeProfile, decodeProfile, getShareableUrl, getProfileFromUrl } from "./url-codec";
export { compareProfiles } from "./compare";
export type {
  Rating,
  RatingValue,
  Profile,
  CuisineScore,
  ModeAffinity,
  EncodedProfile,
  Comparison,
  QuizCard,
  ModeEntry,
  CuisineDirection,
} from "./types";
