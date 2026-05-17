import { NextResponse } from "next/server";
import { cricApiFetch } from "@/lib/cricketApiKeys";

/**
 * Player Data API — Real cricket stats from CricAPI
 * 
 * Provides player search and stats lookup.
 * Uses automatic key rotation across multiple CricAPI keys.
 * Football player stats use the curated data (no free API for player-level stats).
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport") || "cricket";
  const query = searchParams.get("q") || "";
  const playerId = searchParams.get("id") || "";

  // If requesting specific player info from CricAPI
  if (sport === "cricket" && playerId) {
    try {
      const data = await cricApiFetch("players_info", { id: playerId }, {
        next: { revalidate: 86400 }, // Cache 24h — player data doesn't change often
      });
      if (data?.status === "success" && data.data) {
        return NextResponse.json({
          player: data.data,
          source: "cricapi",
        });
      }
    } catch {}
  }

  // Search players from CricAPI
  if (sport === "cricket" && query) {
    try {
      const data = await cricApiFetch("players", { offset: "0", search: query }, {
        next: { revalidate: 3600 },
      });
      if (data?.status === "success" && data.data) {
        return NextResponse.json({
          players: data.data,
          source: "cricapi",
          count: data.data.length,
        });
      }
    } catch {}
  }

  // Football player data from Football-Data.org (limited — team scorers only)
  if (sport === "football") {
    const footballKey = process.env.FOOTBALL_API_KEY;
    if (footballKey) {
      try {
        // Fetch top scorers from Premier League
        const res = await fetch(
          "https://api.football-data.org/v4/competitions/PL/scorers?limit=20",
          {
            headers: { "X-Auth-Token": footballKey },
            next: { revalidate: 3600 },
          }
        );
        if (res.ok) {
          const data = await res.json();
          const scorers = (data.scorers || []).map((s: any) => ({
            id: String(s.player?.id),
            name: s.player?.name,
            nationality: s.player?.nationality,
            position: s.player?.position,
            team: s.team?.shortName || s.team?.name,
            teamCrest: s.team?.crest,
            goals: s.goals || 0,
            assists: s.assists || 0,
            penalties: s.penalties || 0,
            playedMatches: s.playedMatches || 0,
          }));

          return NextResponse.json({
            players: scorers,
            competition: "Premier League",
            source: "football-data",
            count: scorers.length,
          });
        }
      } catch {}
    }
  }

  return NextResponse.json({
    players: [],
    source: "none",
    message: "No data available. Check API keys.",
  });
}
