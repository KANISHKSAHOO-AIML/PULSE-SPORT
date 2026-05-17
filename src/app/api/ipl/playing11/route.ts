import { NextResponse } from "next/server";
import { cricApiFetch } from "@/lib/cricketApiKeys";
import { IPL_TEAMS } from "@/lib/iplTeams";

/**
 * GET /api/ipl/playing11?matchId=62&team=PBKS
 * Attempts to fetch the real playing 11 from CricAPI for a given IPL match.
 * Falls back to empty array if not yet announced.
 */

function toShortCode(name: string): string {
  const lower = name.toLowerCase().trim();
  for (const t of Object.values(IPL_TEAMS)) {
    if (
      lower === t.short.toLowerCase() ||
      lower === t.name.toLowerCase() ||
      lower.includes(t.name.toLowerCase()) ||
      t.name.toLowerCase().includes(lower) ||
      lower === t.city.toLowerCase()
    ) {
      return t.short;
    }
  }
  return name.substring(0, 3).toUpperCase();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get("matchId");
  const team = searchParams.get("team");

  if (!matchId || !team) {
    return NextResponse.json({ error: "matchId and team are required" }, { status: 400 });
  }

  try {
    // Fetch current IPL matches from CricAPI
    const data = await cricApiFetch("currentMatches", { offset: "0" }, {
      next: { revalidate: 90 },
    });

    if (!data || data.status !== "success" || !data.data) {
      return NextResponse.json({ playing11: [], source: "unavailable" });
    }

    // Find the matching IPL match
    const iplMatches = data.data.filter((m: any) => {
      const series = (m.series || "").toLowerCase();
      return series.includes("indian premier league") || series.includes("ipl");
    });

    // Try to match by teams
    const teamShort = toShortCode(team);
    const match = iplMatches.find((m: any) => {
      const teams = (m.teams || []).map((t: string) => toShortCode(t));
      return teams.includes(teamShort);
    });

    if (!match) {
      return NextResponse.json({ playing11: [], source: "match-not-found" });
    }

    // Try to get match_info which might have playing11 data
    if (match.id) {
      try {
        const matchInfo = await cricApiFetch("match_info", { id: match.id }, {
          next: { revalidate: 60 },
        });

        if (matchInfo?.data?.matchInfo?.team1?.squad && matchInfo?.data?.matchInfo?.team2?.squad) {
          const t1Short = toShortCode(matchInfo.data.matchInfo.team1.name || "");
          const t2Short = toShortCode(matchInfo.data.matchInfo.team2.name || "");

          let playing11: string[] = [];
          if (teamShort === t1Short && matchInfo.data.matchInfo.team1.playing11) {
            playing11 = matchInfo.data.matchInfo.team1.playing11.map((p: any) => p.name || p);
          } else if (teamShort === t2Short && matchInfo.data.matchInfo.team2.playing11) {
            playing11 = matchInfo.data.matchInfo.team2.playing11.map((p: any) => p.name || p);
          }

          if (playing11.length === 11) {
            return NextResponse.json({ playing11, source: "cricapi-live" });
          }
        }
      } catch {}
    }

    return NextResponse.json({ playing11: [], source: "not-announced-yet" });
  } catch {
    return NextResponse.json({ playing11: [], source: "error" });
  }
}
