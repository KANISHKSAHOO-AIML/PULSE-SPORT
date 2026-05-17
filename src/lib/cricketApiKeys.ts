/**
 * CricAPI Key Rotation & Failover
 *
 * Manages multiple CricAPI keys and automatically rotates to the next one
 * when the current key gets exhausted (HTTP 429 / rate-limit / quota exceeded).
 *
 * Keys are read from environment variables:
 *   CRICKET_API_KEY   — primary key
 *   CRICKET_API_KEY_2 — first fallback
 *   CRICKET_API_KEY_3 — second fallback
 *
 * The module keeps an in-memory index so that once a key is marked as exhausted
 * all subsequent calls within the same process lifetime skip it automatically.
 */

const CRICKET_API_BASE = "https://api.cricapi.com/v1";

/** Gather all available keys from env (filtering out undefined/empty) */
function getAllKeys(): string[] {
  return [
    process.env.CRICKET_API_KEY,
    process.env.CRICKET_API_KEY_2,
    process.env.CRICKET_API_KEY_3,
    process.env.CRICKET_API_KEY_4,
    process.env.CRICKET_API_KEY_5,
    process.env.CRICKET_API_KEY_6,
    process.env.CRICKET_API_KEY_7,
    process.env.CRICKET_API_KEY_8,
    process.env.CRICKET_API_KEY_9,
    process.env.CRICKET_API_KEY_10,
  ].filter((k): k is string => Boolean(k && k.trim()));
}

/** In-memory set of keys that returned rate-limit errors this process cycle */
const exhaustedKeys = new Set<string>();

/** Reset exhausted keys — called automatically after 1 hour so keys can be retried */
let lastResetTime = Date.now();
const RESET_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

function maybeResetExhaustedKeys() {
  if (Date.now() - lastResetTime > RESET_INTERVAL_MS) {
    exhaustedKeys.clear();
    lastResetTime = Date.now();
  }
}

/** Get the next usable key (skipping exhausted ones) */
function getNextKey(): string | null {
  maybeResetExhaustedKeys();
  const keys = getAllKeys();
  for (const key of keys) {
    if (!exhaustedKeys.has(key)) return key;
  }
  return null; // all keys exhausted
}

/** Mark a key as exhausted so future calls skip it */
function markKeyExhausted(key: string) {
  exhaustedKeys.add(key);
  const remaining = getAllKeys().filter(k => !exhaustedKeys.has(k));
  console.warn(
    `[CricAPI] Key …${key.slice(-6)} exhausted. ${remaining.length} key(s) remaining.`
  );
}

/**
 * Check whether a CricAPI JSON response indicates rate-limiting / quota exhaustion.
 * CricAPI returns { status: "failure", ... } with various reason strings.
 */
function isRateLimited(httpStatus: number, body: any): boolean {
  if (httpStatus === 429) return true;
  if (httpStatus === 403) return true;
  if (body?.status === "failure") {
    const reason = (body.reason || body.message || "").toLowerCase();
    if (
      reason.includes("limit") ||
      reason.includes("quota") ||
      reason.includes("exceeded") ||
      reason.includes("exhausted") ||
      reason.includes("upgrade")
    ) {
      return true;
    }
  }
  return false;
}

// ════════════════════════════════════════════════════════════════════
// Public API
// ════════════════════════════════════════════════════════════════════

export { CRICKET_API_BASE };

/**
 * Perform a CricAPI fetch with automatic key rotation.
 *
 * @param endpoint  The path after /v1/ (e.g. "currentMatches", "match_info", "players")
 * @param params    Additional query params (without `apikey`)
 * @param fetchOpts Optional Next.js fetch options (caching, revalidation, etc.)
 * @returns         The parsed JSON body, or `null` if all keys fail
 */
export async function cricApiFetch(
  endpoint: string,
  params: Record<string, string> = {},
  fetchOpts: RequestInit & { next?: { revalidate?: number } } = {}
): Promise<any | null> {
  const keys = getAllKeys();
  if (keys.length === 0) return null;

  maybeResetExhaustedKeys();

  // Try each non-exhausted key in order
  for (const key of keys) {
    if (exhaustedKeys.has(key)) continue;

    const queryParts = [`apikey=${key}`, ...Object.entries(params).map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
    )];
    const url = `${CRICKET_API_BASE}/${endpoint}?${queryParts.join("&")}`;

    try {
      const res = await fetch(url, fetchOpts);
      const body = await res.json();

      if (isRateLimited(res.status, body)) {
        markKeyExhausted(key);
        continue; // try next key
      }

      if (!res.ok) {
        // Non-rate-limit error — still return null but don't exhaust the key
        console.warn(`[CricAPI] ${endpoint} returned HTTP ${res.status}`);
        return null;
      }

      return body;
    } catch (err) {
      console.warn(`[CricAPI] Network error for ${endpoint}:`, err);
      // Network error — don't mark key as exhausted, just fail
      return null;
    }
  }

  // All keys exhausted
  console.error("[CricAPI] All API keys exhausted — no keys left to try.");
  return null;
}

/**
 * Convenience: get a single usable key for cases where the caller
 * builds its own URL. Prefer `cricApiFetch()` when possible.
 */
export function getAvailableCricketKey(): string | null {
  return getNextKey();
}
