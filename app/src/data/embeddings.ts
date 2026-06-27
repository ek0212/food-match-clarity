/**
 * Epicure data: real embeddings, cuisine vectors, and mode atlas.
 *
 * Generated from Epicure's CC-BY-4.0 ancillary data using data-pipeline/build_data.py.
 * Embeddings are pre-normalized to unit length (prevents magnitude dominance).
 */

import embeddingsData from "./generated/embeddings.json";
import cuisineData from "./generated/cuisine-vectors.json";
import modeData from "./generated/mode-atlas.json";

// Quiz ingredient embeddings (30 × 300)
export const EMBEDDINGS: number[][] = embeddingsData;

// Cuisine direction vectors (8 × 300)
export const CUISINE_VECTORS: number[][] = cuisineData.vectors;

// Mode centroids (30 × 300)
export const MODE_CENTROIDS: number[][] = modeData.centroids;

// Mode entries (labels and example members)
export const MODE_ENTRIES: { label: string; members: string[] }[] = modeData.entries;
