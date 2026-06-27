/**
 * URL codec: encodes/decodes profiles to/from URL-safe strings.
 *
 * Binary format:
 *   [version: 1 byte]
 *   [8 cuisine scores: 8 bytes, each uint8 0-255]
 *   [mode count: 1 byte]
 *   [per mode: index uint8 + score uint8 = 2 bytes × N]
 *
 * Total: 10 + 2N bytes → base64url encoded.
 */

import type { EncodedProfile, Profile } from "./types";

const CURRENT_VERSION = 1;
const NUM_CUISINES = 8;
const MAX_MODES = 5;

/**
 * Quantize a float score to uint8 (0-255).
 * Maps [-1, 1] → [0, 255].
 *
 * Args:
 *   score: Float in approximately [-1, 1] range.
 *
 * Returns:
 *   Uint8 value.
 */
function quantize(score: number): number {
  const clamped = Math.max(-1, Math.min(1, score));
  return Math.round((clamped + 1) * 127.5);
}

/**
 * Dequantize uint8 back to float.
 * Maps [0, 255] → [-1, 1].
 *
 * Args:
 *   byte: Uint8 value.
 *
 * Returns:
 *   Float score.
 */
function dequantize(byte: number): number {
  return (byte / 127.5) - 1;
}

/**
 * Encode a base64url string from a Uint8Array (no padding).
 *
 * Args:
 *   bytes: Binary data.
 *
 * Returns:
 *   Base64url string without padding.
 */
function toBase64Url(bytes: Uint8Array): string {
  const binStr = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binStr).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Decode a base64url string to Uint8Array.
 *
 * Args:
 *   str: Base64url string (with or without padding).
 *
 * Returns:
 *   Binary data.
 */
function fromBase64Url(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binStr = atob(padded);
  return Uint8Array.from(binStr, (c) => c.charCodeAt(0));
}

/**
 * Encode a Profile into a URL-safe string.
 *
 * Args:
 *   profile: The user's computed profile.
 *
 * Returns:
 *   Base64url encoded string (~28 characters).
 */
export function encodeProfile(profile: Profile): string {
  const modeCount = Math.min(profile.modeAffinities.length, MAX_MODES);
  const totalBytes = 1 + NUM_CUISINES + 1 + modeCount * 2;
  const buffer = new Uint8Array(totalBytes);

  let offset = 0;

  // Version
  buffer[offset++] = CURRENT_VERSION;

  // 8 cuisine scores
  for (let i = 0; i < NUM_CUISINES; i++) {
    const score = i < profile.cuisineScores.length ? profile.cuisineScores[i].score : 0;
    buffer[offset++] = quantize(score);
  }

  // Mode count
  buffer[offset++] = modeCount;

  // Mode entries
  for (let i = 0; i < modeCount; i++) {
    const mode = profile.modeAffinities[i];
    buffer[offset++] = mode.modeIndex & 0xff;
    buffer[offset++] = quantize(mode.score);
  }

  return toBase64Url(buffer);
}

/**
 * Decode a URL-safe string back into an EncodedProfile.
 *
 * Args:
 *   encoded: Base64url string from the URL hash.
 *
 * Returns:
 *   Decoded profile data, or null if invalid.
 */
export function decodeProfile(encoded: string): EncodedProfile | null {
  try {
    const bytes = fromBase64Url(encoded);

    if (bytes.length < 10) return null;

    let offset = 0;
    const version = bytes[offset++];

    if (version !== CURRENT_VERSION) return null;

    // 8 cuisine scores
    const cuisines: number[] = [];
    for (let i = 0; i < NUM_CUISINES; i++) {
      cuisines.push(dequantize(bytes[offset++]));
    }

    // Mode count
    const modeCount = bytes[offset++];
    if (modeCount > MAX_MODES) return null;
    if (bytes.length < offset + modeCount * 2) return null;

    // Mode entries
    const modes: { index: number; score: number }[] = [];
    for (let i = 0; i < modeCount; i++) {
      const index = bytes[offset++];
      const score = dequantize(bytes[offset++]);
      modes.push({ index, score });
    }

    return { version, cuisines, modes };
  } catch {
    return null;
  }
}

/**
 * Get the full shareable URL for a profile.
 *
 * Args:
 *   profile: The user's computed profile.
 *
 * Returns:
 *   Full URL with profile encoded in hash.
 */
export function getShareableUrl(profile: Profile): string {
  const encoded = encodeProfile(profile);
  return `${window.location.origin}${window.location.pathname}#p=${encoded}`;
}

/**
 * Extract an encoded profile from the current URL hash, if present.
 *
 * Returns:
 *   Decoded profile or null if no valid profile in URL.
 */
export function getProfileFromUrl(): EncodedProfile | null {
  const hash = window.location.hash;
  const match = hash.match(/^#p=(.+)$/);
  if (!match) return null;
  return decodeProfile(match[1]);
}
