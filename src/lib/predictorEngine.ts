/**
 * Predictor Gamification Engine
 *
 * Compares a user's "Predicted Playing 11" against the actual confirmed Playing 11.
 * Awards points and unlocks achievement badges based on accuracy.
 *
 * Scoring:
 *   • 10 points per correct player match → Max 110 points
 *   • Matching is case-insensitive and ignores extra whitespace
 *
 * Badges:
 *   • "Perfect Oracle"  → 110 points (all 11 correct)
 *   • "Elite Scout"     → 90+ points (9 or more correct)
 *   • "Sharp Eye"       → 70+ points (7 or more correct)
 *   • "Cricket Fan"     → 50+ points (5 or more correct)
 */

export interface PredictorResult {
  /** Total points earned (0–110) */
  score: number;
  /** Number of correctly matched players (0–11) */
  correctCount: number;
  /** Players the user predicted that were in the actual 11 */
  correctPicks: string[];
  /** Players the user predicted that were NOT in the actual 11 */
  missedPicks: string[];
  /** Actual players the user didn't predict */
  unpredicted: string[];
  /** Unlocked badge, if any */
  badge: PredictorBadge | null;
  /** All applicable badges (user may unlock multiple tiers) */
  allBadges: PredictorBadge[];
}

export interface PredictorBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  tier: "legendary" | "epic" | "rare" | "common";
  minScore: number;
  color: string;
  glowColor: string;
}

/** All available badges, ordered from highest to lowest tier */
export const PREDICTOR_BADGES: PredictorBadge[] = [
  {
    id: "perfect_oracle",
    name: "Perfect Oracle",
    icon: "🔮",
    description: "Predicted all 11 players correctly. Absolute genius!",
    tier: "legendary",
    minScore: 110,
    color: "from-amber-400 via-yellow-300 to-amber-500",
    glowColor: "rgba(251, 191, 36, 0.6)",
  },
  {
    id: "elite_scout",
    name: "Elite Scout",
    icon: "🎯",
    description: "9+ correct picks. You see what others can't.",
    tier: "epic",
    minScore: 90,
    color: "from-purple-400 via-violet-400 to-purple-500",
    glowColor: "rgba(167, 139, 250, 0.5)",
  },
  {
    id: "sharp_eye",
    name: "Sharp Eye",
    icon: "👁️",
    description: "7+ correct picks. Your cricket instincts are strong.",
    tier: "rare",
    minScore: 70,
    color: "from-cyan-400 via-teal-400 to-cyan-500",
    glowColor: "rgba(34, 211, 238, 0.4)",
  },
  {
    id: "cricket_fan",
    name: "Cricket Fan",
    icon: "🏏",
    description: "5+ correct picks. You know your squads!",
    tier: "common",
    minScore: 50,
    color: "from-green-400 via-emerald-400 to-green-500",
    glowColor: "rgba(52, 211, 153, 0.3)",
  },
];

/** Normalize a player name for comparison */
function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Score a user's Predicted 11 against the Actual 11.
 */
export function scorePredictor(
  predictedPlayers: string[],
  actualPlayers: string[]
): PredictorResult {
  const normalizedActual = new Set(actualPlayers.map(normalizeName));
  const normalizedPredicted = predictedPlayers.map(normalizeName);

  const correctPicks: string[] = [];
  const missedPicks: string[] = [];

  normalizedPredicted.forEach((name, i) => {
    if (normalizedActual.has(name)) {
      correctPicks.push(predictedPlayers[i]);
    } else {
      missedPicks.push(predictedPlayers[i]);
    }
  });

  // Find actual players the user didn't predict
  const predictedSet = new Set(normalizedPredicted);
  const unpredicted = actualPlayers.filter(
    (p) => !predictedSet.has(normalizeName(p))
  );

  const correctCount = correctPicks.length;
  const score = correctCount * 10;

  // Determine unlocked badges
  const allBadges = PREDICTOR_BADGES.filter((b) => score >= b.minScore);
  const badge = allBadges.length > 0 ? allBadges[0] : null; // Highest tier

  return {
    score,
    correctCount,
    correctPicks,
    missedPicks,
    unpredicted,
    badge,
    allBadges,
  };
}

/** Player shape for the squad picker */
export interface SquadPlayer {
  id: string;
  name: string;
  role: "Batsman" | "Bowler" | "All-Rounder" | "Wicket-Keeper";
  image?: string;
}

/** Live stats shape for the live tracking state */
export interface PlayerLiveStat {
  playerId: string;
  name: string;
  runs?: number;
  balls?: number;
  fours?: number;
  sixes?: number;
  wickets?: number;
  economy?: number;
  catches?: number;
  strikeRate?: number;
  isOnStrike?: boolean;
  isBowling?: boolean;
  isOut?: boolean;
}
