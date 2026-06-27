/**
 * Cuisine direction labels.
 *
 * These correspond to the 8 directions computed from Epicure's embedding space.
 * Labels and vectors are loaded from generated data.
 */

import type { CuisineDirection } from "../engine/types";
import cuisineData from "./generated/cuisine-vectors.json";

export const CUISINE_DIRECTIONS: CuisineDirection[] = cuisineData.labels as CuisineDirection[];
