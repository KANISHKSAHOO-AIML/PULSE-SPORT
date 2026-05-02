import { NextResponse } from "next/server";
import {
  fetchLiveCricketMatches,
  fetchLiveFootballMatches,
  fetchTodayFootballMatches,
  normalizeCricketMatch,
  normalizeFootballMatch,
  UnifiedMatch,
} from "@/lib/sportsApi";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ═══════════════════════════════════════════════════════════════
   MAX LIMITS — keep the homepage snappy (4 per sport)
   ═══════════════════════════════════════════════════════════════ */
const MAX_PER_SPORT = 4;     // Cap at 4 cricket + 4 football
const MAX_DB_MATCHES = 4;    // Cap Supabase admin-managed data

/**
 * Validate that a Supabase match has realistic scores.
 * Filters out corrupted data like "9120/8" or "201-197".
 */
function isValidMatch(m: any): boolean {
  // Check football scores — no team scores 50+ in a match
  if (m.sport === "football") {
    const scoreA = parseInt(m.score_a);
    const scoreB = parseInt(m.score_b);
    if (!isNaN(scoreA) && scoreA > 50) return false;
    if (!isNaN(scoreB) && scoreB > 50) return false;
  }

  // Check cricket scores — no team scores 1000+ runs
  if (m.sport === "cricket") {
    const runsA = parseInt(m.score_a);
    const runsB = parseInt(m.score_b);
    if (!isNaN(runsA) && runsA > 999) return false;
    if (!isNaN(runsB) && runsB > 999) return false;
    // Also check for slash format like "9120/8"
    const extractRuns = (s: string) => {
      const match = s?.match(/^(\d+)/);
      return match ? parseInt(match[1]) : 0;
    };
    if (extractRuns(m.score_a || "") > 999) return false;
    if (extractRuns(m.score_b || "") > 999) return false;
  }

  return true;
}

export async function GET() {
  let apiMatches: UnifiedMatch[] = [];

  // 1. Try real APIs (parallel) — live + today's matches
  try {
    const [cricketMatches, footballLive, footballToday] = await Promise.all([
      fetchLiveCricketMatches(),
      fetchLiveFootballMatches(),
      fetchTodayFootballMatches(),
    ]);

    // Normalize cricket API data
    const cricketAll: UnifiedMatch[] = [];
    cricketMatches.forEach((m) => cricketAll.push(normalizeCricketMatch(m)));
    
    // Normalize football — merge live + today, deduplicate
    const footballAll: UnifiedMatch[] = [];
    const footballSeen = new Set<number>();
    footballLive.forEach((m) => {
      footballSeen.add(m.id);
      footballAll.push(normalizeFootballMatch(m));
    });
    footballToday.forEach((m) => {
      if (!footballSeen.has(m.id)) {
        footballAll.push(normalizeFootballMatch(m));
      }
    });

    // Sort each sport: live matches first
    const sortLiveFirst = (a: UnifiedMatch, b: UnifiedMatch) => {
      if (a.live && !b.live) return -1;
      if (!a.live && b.live) return 1;
      return 0;
    };
    cricketAll.sort(sortLiveFirst);
    footballAll.sort(sortLiveFirst);

    // ⚡ CAP at 4 per sport
    apiMatches = [
      ...cricketAll.slice(0, MAX_PER_SPORT),
      ...footballAll.slice(0, MAX_PER_SPORT),
    ];
  } catch {
    // API failure — will rely on Supabase data only
  }

  // 2. Only pull from Supabase if API data is sparse (< 4 matches)
  //    This prevents corrupted admin data from polluting the feed
  let dbMatches: UnifiedMatch[] = [];
  if (apiMatches.length < 4) {
    try {
      const { data } = await supabase
        .from("matches")
        .select("*")
        .order("live", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(MAX_DB_MATCHES);

      if (data) {
        data
          .filter(isValidMatch)  // Filter out corrupted data
          .forEach((m: any) => {
            // Deduplicate against API matches
            const exists = apiMatches.some(
              (am) => am.teamA === m.team_a && am.teamB === m.team_b
            );
            if (!exists) {
              dbMatches.push({
                id: m.id,
                sport: m.sport,
                title: m.title,
                teamA: m.team_a,
                teamB: m.team_b,
                scoreA: m.score_a,
                scoreB: m.score_b,
                status: m.status,
                live: m.live,
                source: "supabase",
              });
            }
          });
      }
    } catch {}
  }

  // 3. Combine: real API first → validated Supabase (NO fake data)
  const allMatches = [...apiMatches, ...dbMatches];

  return NextResponse.json({
    matches: allMatches,
    meta: {
      apiMatches: apiMatches.length,
      dbMatches: dbMatches.length,
      total: allMatches.length,
    },
  });
}

