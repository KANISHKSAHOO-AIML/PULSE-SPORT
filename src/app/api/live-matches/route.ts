import { NextResponse } from "next/server";
import {
  fetchLiveCricketMatches,
  fetchLiveFootballMatches,
  normalizeCricketMatch,
  normalizeFootballMatch,
  UnifiedMatch,
} from "@/lib/sportsApi";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const allMatches: UnifiedMatch[] = [];

  // 1. Try real APIs (parallel)
  const [cricketMatches, footballMatches] = await Promise.all([
    fetchLiveCricketMatches(),
    fetchLiveFootballMatches(),
  ]);

  // Normalize API data
  cricketMatches.forEach((m) => allMatches.push(normalizeCricketMatch(m)));
  footballMatches.forEach((m) => allMatches.push(normalizeFootballMatch(m)));

  // 2. Always include Supabase matches (admin-managed + seed data)
  try {
    const { data: dbMatches } = await supabase
      .from("matches")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(20);

    if (dbMatches) {
      dbMatches.forEach((m: any) => {
        // Avoid duplicates — skip if API already has this match
        const exists = allMatches.some(
          (am) => am.teamA === m.team_a && am.teamB === m.team_b
        );
        if (!exists) {
          allMatches.push({
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

  // Sort: live first, then by source (api first)
  allMatches.sort((a, b) => {
    if (a.live && !b.live) return -1;
    if (!a.live && b.live) return 1;
    if (a.source === "api" && b.source !== "api") return -1;
    return 0;
  });

  return NextResponse.json({
    matches: allMatches,
    meta: {
      cricketApi: cricketMatches.length > 0,
      footballApi: footballMatches.length > 0,
      supabase: true,
      total: allMatches.length,
    },
  });
}
