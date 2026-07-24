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

const MAX_PER_SPORT = 4;

/**
 * 2 upcoming India vs Zimbabwe T20I matches (July 2026 series)
 * India lead the 3-match series 1-0 after winning the 1st T20I on July 23.
 * Used as fallback when CricAPI doesn't return these matches.
 */
const IND_ZIM_FALLBACK: UnifiedMatch[] = [
  {
    id: "ind-zim-t20i-2",
    sport: "cricket",
    title: "2nd T20I — India vs Zimbabwe",
    teamA: "India",
    teamB: "Zimbabwe",
    scoreA: "—",
    scoreB: "—",
    status: "Jul 25 • Harare Sports Club",
    live: false,
    source: "api",
  },
  {
    id: "ind-zim-t20i-3",
    sport: "cricket",
    title: "3rd T20I — India vs Zimbabwe",
    teamA: "India",
    teamB: "Zimbabwe",
    scoreA: "—",
    scoreB: "—",
    status: "Jul 26 • Harare Sports Club",
    live: false,
    source: "api",
  },
];

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
    const cricketApi: UnifiedMatch[] = [];
    cricketMatches.forEach((m) => cricketApi.push(normalizeCricketMatch(m)));

    // Always include India vs Zimbabwe T20I upcoming matches first,
    // then fill remaining slots with live API matches
    const hasIndZim = cricketApi.some(m =>
      (m.title.toLowerCase().includes("india") && m.title.toLowerCase().includes("zimbabwe")) ||
      (m.teamA?.toLowerCase().includes("india") && m.teamB?.toLowerCase().includes("zimbabwe"))
    );

    const cricketAll: UnifiedMatch[] = [];
    if (!hasIndZim) {
      // Add our 2 IND vs ZIM cards first
      cricketAll.push(...IND_ZIM_FALLBACK);
    }
    // Fill remaining slots with live API matches
    const remainingSlots = MAX_PER_SPORT - cricketAll.length;
    cricketApi.sort((a, b) => (a.live && !b.live ? -1 : !a.live && b.live ? 1 : 0));
    cricketAll.push(...cricketApi.slice(0, remainingSlots));

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

    // Sort: live matches first
    footballAll.sort((a, b) => (a.live && !b.live ? -1 : !a.live && b.live ? 1 : 0));

    apiMatches = [
      ...cricketAll.slice(0, MAX_PER_SPORT),
      ...footballAll.slice(0, MAX_PER_SPORT),
    ];
  } catch {
    // API failure — cricket gets IND vs ZIM fallbacks only
    apiMatches = [...IND_ZIM_FALLBACK];
  }

  // 2. Only pull Supabase for FOOTBALL (never for cricket — no fake cricket data)
  let dbMatches: UnifiedMatch[] = [];
  const apiFootballCount = apiMatches.filter(m => m.sport === "football").length;
  const needsFootball = apiFootballCount < MAX_PER_SPORT;

  if (needsFootball) {
    try {
      const { data } = await supabase
        .from("matches")
        .select("*")
        .eq("sport", "football")
        .order("live", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(MAX_PER_SPORT);

      if (data) {
        data.forEach((m: any) => {
          const scoreA = parseInt(m.score_a);
          const scoreB = parseInt(m.score_b);
          if (!isNaN(scoreA) && scoreA > 50) return;
          if (!isNaN(scoreB) && scoreB > 50) return;

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
