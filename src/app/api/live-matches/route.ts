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
   CURATED DEMO MATCHES — shown alongside real data to fill the UI
   4 demo matches: 2 cricket + 2 football
   ═══════════════════════════════════════════════════════════════ */
const DEMO_MATCHES: UnifiedMatch[] = [
  {
    id: "demo-cric-1",
    sport: "cricket",
    title: "IPL 2026 — MI vs CSK",
    teamA: "Mumbai Indians",
    teamB: "Chennai Super Kings",
    scoreA: "186/4 (20)",
    scoreB: "172/8 (20)",
    status: "MI won by 14 runs",
    live: false,
    source: "supabase",
  },
  {
    id: "demo-cric-2",
    sport: "cricket",
    title: "IPL 2026 — RCB vs KKR",
    teamA: "Royal Challengers Bengaluru",
    teamB: "Kolkata Knight Riders",
    scoreA: "205/3 (20)",
    scoreB: "198/7 (20)",
    status: "RCB won by 7 runs",
    live: false,
    source: "supabase",
  },
  {
    id: "demo-foot-1",
    sport: "football",
    title: "Premier League — Arsenal vs Man City",
    teamA: "Arsenal",
    teamB: "Man City",
    scoreA: "2",
    scoreB: "1",
    status: "Full Time",
    live: false,
    source: "supabase",
  },
  {
    id: "demo-foot-2",
    sport: "football",
    title: "La Liga — Barcelona vs Real Madrid",
    teamA: "Barcelona",
    teamB: "Real Madrid",
    scoreA: "3",
    scoreB: "3",
    status: "Full Time",
    live: false,
    source: "supabase",
  },
];

/* ═══════════════════════════════════════════════════════════════
   MAX LIMITS — keep the homepage snappy
   ═══════════════════════════════════════════════════════════════ */
const MAX_API_MATCHES = 4;   // Cap real API data at 4
const MAX_DEMO_MATCHES = 4;  // Fill remaining slots with demo data

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
    cricketMatches.forEach((m) => apiMatches.push(normalizeCricketMatch(m)));
    
    // Normalize football — merge live + today, deduplicate
    const footballSeen = new Set<number>();
    footballLive.forEach((m) => {
      footballSeen.add(m.id);
      apiMatches.push(normalizeFootballMatch(m));
    });
    footballToday.forEach((m) => {
      if (!footballSeen.has(m.id)) {
        apiMatches.push(normalizeFootballMatch(m));
      }
    });

    // Sort: live matches first
    apiMatches.sort((a, b) => {
      if (a.live && !b.live) return -1;
      if (!a.live && b.live) return 1;
      return 0;
    });

    // ⚡ CAP at 4 real matches (prefer live ones since they're sorted first)
    apiMatches = apiMatches.slice(0, MAX_API_MATCHES);
  } catch {
    // API failure — will use demo matches only
  }

  // 2. Try Supabase admin-managed matches (cap at remaining slots)
  let dbMatches: UnifiedMatch[] = [];
  try {
    const slotsLeft = MAX_API_MATCHES - apiMatches.length;
    if (slotsLeft > 0) {
      const { data } = await supabase
        .from("matches")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(slotsLeft);

      if (data) {
        data.forEach((m: any) => {
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
    }
  } catch {}

  // 3. Fill remaining slots with demo matches
  const realCount = apiMatches.length + dbMatches.length;
  const demoSlots = Math.min(MAX_DEMO_MATCHES, 8 - realCount); // Total max = 8
  const demoToAdd = DEMO_MATCHES.slice(0, demoSlots).filter(
    (dm) => ![...apiMatches, ...dbMatches].some(
      (m) => m.teamA === dm.teamA && m.teamB === dm.teamB
    )
  );

  // 4. Combine: real API first → Supabase → demo
  const allMatches = [...apiMatches, ...dbMatches, ...demoToAdd];

  return NextResponse.json({
    matches: allMatches,
    meta: {
      apiMatches: apiMatches.length,
      dbMatches: dbMatches.length,
      demoMatches: demoToAdd.length,
      total: allMatches.length,
    },
  });
}
