/**
 * PulseSports — Free Sports Data API Integration
 * 
 * Cricket: CricAPI (cricketdata.org) — free tier: 100 requests/day
 *          Uses 3 API keys with automatic failover (see cricketApiKeys.ts)
 * Football: Football-Data.org — free tier: 10 requests/min
 * 
 * Usage:
 *   Set these env vars in .env.local:
 *     CRICKET_API_KEY=primary_key
 *     CRICKET_API_KEY_2=fallback_key_1
 *     CRICKET_API_KEY_3=fallback_key_2
 *     FOOTBALL_API_KEY=your_football_data_key
 * 
 *   Get free keys at:
 *     https://cricketdata.org/ (sign up → API key)
 *     https://www.football-data.org/client/register (sign up → API token)
 */

import { cricApiFetch } from "./cricketApiKeys";

// ═══════════════════════════════════════════════════════════════
// CRICKET API — cricketdata.org (with automatic key rotation)
// ═══════════════════════════════════════════════════════════════

export interface CricketMatch {
  id: string;
  name: string;
  series?: string;
  status: string;
  venue: string;
  date: string;
  teams: string[];
  score: { r: number; w: number; o: number; inning: string }[];
  matchStarted: boolean;
  matchEnded: boolean;
}

/**
 * STRICT WHITELIST — Only show these types of cricket matches:
 * 1. Bangladesh vs Pakistan Test match
 * 2. English County Cricket (County Championship, Vitality Blast, One-Day Cup, etc.)
 * NO women's matches allowed.
 */

/** Keywords that identify a match as county cricket */
const COUNTY_CRICKET_KEYWORDS = [
  "county", "county championship", "vitality blast", "t20 blast",
  "one-day cup", "royal london", "the hundred",
];

/** Check if a match is the Bangladesh vs Pakistan Test */
function isBanPakTest(name: string, series: string): boolean {
  const text = `${name} ${series}`;
  const hasBan = text.includes("bangladesh") || text.includes("ban ");
  const hasPak = text.includes("pakistan") || text.includes("pak ");
  const isTest = text.includes("test");
  return hasBan && hasPak && isTest;
}

/** Check if a match is county cricket */
function isCountyCricket(name: string, series: string): boolean {
  const text = `${name} ${series}`;
  return COUNTY_CRICKET_KEYWORDS.some(kw => text.includes(kw));
}

/** Check if a match is a women's match */
function isWomensMatch(name: string, series: string): boolean {
  const text = `${name} ${series}`;
  return text.includes("women") || text.includes("wom ");
}

export async function fetchLiveCricketMatches(): Promise<CricketMatch[]> {
  try {
    const data = await cricApiFetch("currentMatches", { offset: "0" }, {
      next: { revalidate: 90 }, // Cache for 1m30s
    });
    
    if (!data || data.status !== "success" || !data.data) return [];
    
    // Strict whitelist: only Ban vs Pak Test + county cricket, no women's matches
    return (data.data as CricketMatch[]).filter((m) => {
      const name = (m.name || "").toLowerCase();
      const series = (m.series || "").toLowerCase();

      // Block all women's matches first
      if (isWomensMatch(name, series)) return false;

      // Allow only: Ban vs Pak Test OR county cricket
      return isBanPakTest(name, series) || isCountyCricket(name, series);
    });
  } catch {
    return [];
  }
}

export async function fetchCricketMatchInfo(matchId: string) {
  try {
    const data = await cricApiFetch("match_info", { id: matchId }, {
      next: { revalidate: 90 }, // Cache for 1m30s
    });
    return data?.status === "success" ? data.data : null;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// FOOTBALL API — football-data.org
// ═══════════════════════════════════════════════════════════════

const FOOTBALL_API_BASE = "https://api.football-data.org/v4";

export interface FootballMatch {
  id: number;
  competition: { name: string; emblem: string };
  homeTeam: { name: string; shortName: string; crest: string };
  awayTeam: { name: string; shortName: string; crest: string };
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
  status: string; // "SCHEDULED" | "LIVE" | "IN_PLAY" | "PAUSED" | "FINISHED"
  utcDate: string;
  minute?: number;
}

export async function fetchLiveFootballMatches(): Promise<FootballMatch[]> {
  const key = process.env.FOOTBALL_API_KEY;
  if (!key) return [];
  
  try {
    const res = await fetch(`${FOOTBALL_API_BASE}/matches?status=LIVE,IN_PLAY,PAUSED`, {
      headers: { "X-Auth-Token": key },
      next: { revalidate: 90 }, // 1m30s cache
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    return data.matches || [];
  } catch {
    return [];
  }
}

export async function fetchTodayFootballMatches(): Promise<FootballMatch[]> {
  const key = process.env.FOOTBALL_API_KEY;
  if (!key) return [];
  
  try {
    const today = new Date().toISOString().split("T")[0];
    const res = await fetch(`${FOOTBALL_API_BASE}/matches?dateFrom=${today}&dateTo=${today}`, {
      headers: { "X-Auth-Token": key },
      next: { revalidate: 90 }, // 1m30s cache
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    return data.matches || [];
  } catch {
    return [];
  }
}

export async function fetchFootballStandings(competitionCode: string = "PL") {
  const key = process.env.FOOTBALL_API_KEY;
  if (!key) return null;
  
  try {
    const res = await fetch(`${FOOTBALL_API_BASE}/competitions/${competitionCode}/standings`, {
      headers: { "X-Auth-Token": key },
      next: { revalidate: 7200 }, // 2hr cache for standings
    });
    
    if (!res.ok) return null;
    const data = await res.json();
    return data.standings || null;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// UNIFIED MATCH FORMAT (normalizes both APIs)
// ═══════════════════════════════════════════════════════════════

export interface UnifiedMatch {
  id: string;
  sport: "cricket" | "football";
  title: string;
  teamA: string;
  teamB: string;
  scoreA: string;
  scoreB: string;
  status: string;
  live: boolean;
  source: "api" | "supabase";
}

export function normalizeCricketMatch(m: CricketMatch): UnifiedMatch {
  const teams = m.teams || [];
  const scores = m.score || [];
  
  return {
    id: m.id,
    sport: "cricket",
    title: m.name || `${teams[0]} vs ${teams[1]}`,
    teamA: teams[0] || "TBA",
    teamB: teams[1] || "TBA",
    scoreA: scores[0] ? `${scores[0].r}/${scores[0].w} (${scores[0].o})` : "—",
    scoreB: scores[1] ? `${scores[1].r}/${scores[1].w} (${scores[1].o})` : "—",
    status: m.status || "Upcoming",
    live: m.matchStarted && !m.matchEnded,
    source: "api",
  };
}

export function normalizeFootballMatch(m: FootballMatch): UnifiedMatch {
  const isLive = ["LIVE", "IN_PLAY", "PAUSED"].includes(m.status);
  const home = m.score?.fullTime?.home;
  const away = m.score?.fullTime?.away;
  
  return {
    id: String(m.id),
    sport: "football",
    title: `${m.competition?.name || "Match"} — ${m.homeTeam?.shortName} vs ${m.awayTeam?.shortName}`,
    teamA: m.homeTeam?.shortName || m.homeTeam?.name || "Home",
    teamB: m.awayTeam?.shortName || m.awayTeam?.name || "Away",
    scoreA: home !== null ? String(home) : "—",
    scoreB: away !== null ? String(away) : "—",
    status: isLive ? `${m.minute || ""}' — Live` : m.status === "FINISHED" ? "Full Time" : "Upcoming",
    live: isLive,
    source: "api",
  };
}
