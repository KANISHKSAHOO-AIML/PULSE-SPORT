import { NextResponse } from "next/server";

const CRICKET_API_BASE = "https://api.cricapi.com/v1";

export async function GET() {
  const key = process.env.CRICKET_API_KEY;
  if (!key) {
    return NextResponse.json({ matches: [], error: "No API key" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `${CRICKET_API_BASE}/currentMatches?apikey=${key}&offset=0`,
      { next: { revalidate: 30 } }
    );
    if (!res.ok) {
      return NextResponse.json({ matches: [], error: "API error" });
    }
    const data = await res.json();
    if (data.status !== "success" || !data.data) {
      return NextResponse.json({ matches: [], error: "No data" });
    }

    // Filter for IPL matches from CricAPI
    const apiMatches = data.data ? data.data.filter((m: any) => {
      const name = (m.name || "").toLowerCase();
      const series = (m.series || "").toLowerCase();
      return (
        series.includes("indian premier league") ||
        series.includes("ipl") ||
        name.includes("ipl") ||
        (name.includes("csk") || name.includes("chennai")) && series.includes("t20") ||
        (name.includes("srh") || name.includes("sunrisers")) && series.includes("t20")
      );
    }) : [];

    // Dynamically inject today's matches from our local schedule
    const todayStr = new Date().toISOString().split("T")[0]; // e.g. "2026-04-18"
    const { IPL_2026_SCHEDULE } = await import("@/lib/ipl2026Schedule");
    
    const localTodayMatches = IPL_2026_SCHEDULE.filter(m => m.date.startsWith(todayStr)).map(m => ({
      id: m.matchNo.toString(),
      name: `${m.team1} vs ${m.team2}, Match ${m.matchNo}`,
      matchType: "t20",
      status: m.status === "completed" ? m.result : m.status === "live" ? "Live" : "Match not started",
      venue: m.venue,
      date: m.date,
      dateTimeGMT: m.date,
      teams: [m.team1, m.team2],
      teamInfo: [{ name: m.team1, shortname: m.team1 }, { name: m.team2, shortname: m.team2 }],
      score: m.score1 ? [
        { r: parseInt(m.score1.split("/")[0]) || 0, w: parseInt(m.score1.split("/")[1]) || 0, o: parseFloat(m.score1.split("(")[1]) || 0, inning: "Innings 1" },
        ...(m.score2 ? [{ r: parseInt(m.score2.split("/")[0]) || 0, w: parseInt(m.score2.split("/")[1]) || 0, o: parseFloat(m.score2.split("(")[1]) || 0, inning: "Innings 2" }] : [])
      ] : [],
      matchStarted: m.status === "live" || m.status === "completed",
      matchEnded: m.status === "completed",
      matchNo: m.matchNo
    }));

    // Merge them (prefer local if it's the same teams to avoid dupes, but for simplicity we just concat for now and rely on UI slicing)
    const combinedMatches = [...apiMatches, ...localTodayMatches];

    return NextResponse.json({
      matches: combinedMatches,
      total: combinedMatches.length,
      allMatchCount: data.data ? data.data.length : 0,
    });
  } catch (err) {
    return NextResponse.json({ matches: [], error: "Fetch failed" });
  }
}
