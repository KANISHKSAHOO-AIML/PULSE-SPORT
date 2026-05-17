import { NextResponse } from "next/server";
import { IPL_TEAMS } from "@/lib/iplTeams";
import { cricApiFetch } from "@/lib/cricketApiKeys";

/**
 * Normalize any team name (full, short, or city) to a short code like "CSK", "MI", etc.
 * e.g. "Rajasthan Royals" → "RR", "Chennai Super Kings" → "CSK"
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

/** Create a canonical pair key like "DC|PBKS" for deduplication (sorted) */
function teamPairKey(team1: string, team2: string): string {
  const a = toShortCode(team1);
  const b = toShortCode(team2);
  return [a, b].sort().join("|");
}

export async function GET() {
  try {
    const data0 = await cricApiFetch("currentMatches", { offset: "0" }, { next: { revalidate: 90 } });
    const data25 = await cricApiFetch("currentMatches", { offset: "25" }, { next: { revalidate: 90 } });

    if (!data0 || data0.status !== "success" || !data0.data) {
      // API unavailable — fall through to local schedule only
      return buildResponseWithLocalOnly();
    }

    const allApiMatches = [
      ...(data0.data || []),
      ...(data25?.data || [])
    ];

    // Filter for IPL matches from CricAPI
    const apiMatches: any[] = allApiMatches.filter((m: any) => {
      const name = (m.name || "").toLowerCase();
      const series = (m.series || "").toLowerCase();
      return (
        series.includes("indian premier league") ||
        series.includes("ipl") ||
        name.includes("ipl") ||
        name.includes("indian premier league")
      );
    });

    // Dynamically inject today's matches from our local schedule
    const now = new Date();
    const todayStr = new Date(now.getTime() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0];
    const { getDynamicSchedule } = await import("@/lib/ipl2026Schedule");
    
    const dynamicSchedule = getDynamicSchedule();
    const localTodayMatches = dynamicSchedule.filter(m => m.date.startsWith(todayStr)).map(m => {
      const matchTime = new Date(m.date).getTime();
      const hasStartTimePassed = now.getTime() >= matchTime;
      const isMatchLive = m.status === "live" || (m.status === "upcoming" && hasStartTimePassed);
      const isMatchCompleted = m.status === "completed";
      
      return {
        id: m.matchNo.toString(),
        name: `${m.team1} vs ${m.team2}, Match ${m.matchNo}`,
        matchType: "t20",
        status: isMatchCompleted ? (m.result || "Completed") : isMatchLive ? "Live" : "Match not started",
        venue: m.venue,
        date: m.date,
        dateTimeGMT: m.date,
        teams: [m.team1, m.team2],
        teamInfo: [{ name: m.team1, shortname: m.team1 }, { name: m.team2, shortname: m.team2 }],
        score: m.score1 ? [
          { r: parseInt(m.score1.split("/")[0]) || 0, w: parseInt(m.score1.split("/")[1]) || 0, o: parseFloat(m.score1.split("(")[1]) || 0, inning: "Innings 1" },
          ...(m.score2 && m.score2 !== "-" ? [{ r: parseInt(m.score2.split("/")[0]) || 0, w: parseInt(m.score2.split("/")[1]) || 0, o: parseFloat(m.score2.split("(")[1]) || 0, inning: "Innings 2" }] : [])
        ] : [],
        matchStarted: isMatchLive || isMatchCompleted,
        matchEnded: isMatchCompleted,
        matchNo: m.matchNo
      };
    });

    // ── Merge: API data (with real scores) ALWAYS wins over local schedule ──
    // Track which team pairs are already covered by CricAPI
    const apiCoveredPairs = new Set<string>();
    for (const m of apiMatches) {
      const teams = m.teams || [];
      if (teams.length >= 2) {
        apiCoveredPairs.add(teamPairKey(teams[0], teams[1]));
      }
    }

    // Only add local schedule entries if CricAPI didn't already cover those teams
    const dedupedLocal = localTodayMatches.filter(m => {
      const pk = teamPairKey(m.teams[0], m.teams[1]);
      return !apiCoveredPairs.has(pk);
    });

    // API matches first (they have real scores), then remaining local entries
    const combinedMatches = [...apiMatches, ...dedupedLocal].filter(m => !m.matchEnded);

    return NextResponse.json({
      matches: combinedMatches,
      total: combinedMatches.length,
      allMatchCount: allApiMatches.length,
    });
  } catch (err) {
    return buildResponseWithLocalOnly();
  }
}

/** Fallback: return only local schedule data when CricAPI is unavailable */
async function buildResponseWithLocalOnly() {
  try {
    const now = new Date();
    const todayStr = new Date(now.getTime() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0];
    const { getDynamicSchedule } = await import("@/lib/ipl2026Schedule");
    const dynamicSchedule = getDynamicSchedule();
    const localTodayMatches = dynamicSchedule.filter(m => m.date.startsWith(todayStr)).map(m => {
      const matchTime = new Date(m.date).getTime();
      const hasStartTimePassed = now.getTime() >= matchTime;
      const isMatchLive = m.status === "live" || (m.status === "upcoming" && hasStartTimePassed);
      const isMatchCompleted = m.status === "completed";
      return {
        id: m.matchNo.toString(),
        name: `${m.team1} vs ${m.team2}, Match ${m.matchNo}`,
        matchType: "t20",
        status: isMatchCompleted ? (m.result || "Completed") : isMatchLive ? "Live" : "Match not started",
        venue: m.venue,
        date: m.date,
        dateTimeGMT: m.date,
        teams: [m.team1, m.team2],
        teamInfo: [{ name: m.team1, shortname: m.team1 }, { name: m.team2, shortname: m.team2 }],
        score: m.score1 ? [
          { r: parseInt(m.score1.split("/")[0]) || 0, w: parseInt(m.score1.split("/")[1]) || 0, o: parseFloat(m.score1.split("(")[1]) || 0, inning: "Innings 1" },
          ...(m.score2 && m.score2 !== "-" ? [{ r: parseInt(m.score2.split("/")[0]) || 0, w: parseInt(m.score2.split("/")[1]) || 0, o: parseFloat(m.score2.split("(")[1]) || 0, inning: "Innings 2" }] : [])
        ] : [],
        matchStarted: isMatchLive || isMatchCompleted,
        matchEnded: isMatchCompleted,
        matchNo: m.matchNo,
      };
    }).filter(m => !m.matchEnded);
    
    return NextResponse.json({ matches: localTodayMatches, total: localTodayMatches.length, allMatchCount: 0, source: "local-fallback" });
  } catch {
    return NextResponse.json({ matches: [], error: "All API keys exhausted & local fallback failed" });
  }
}
