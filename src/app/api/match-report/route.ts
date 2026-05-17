import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";
import { getDynamicSchedule } from "@/lib/ipl2026Schedule";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ── Models to try in order (latest → most stable → free tier) ──
const MODELS_TO_TRY = [
  "gemini-2.5-flash-preview-05-20",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
];

export async function POST(req: Request) {
  try {
    const { matchId } = await req.json();
    if (!matchId) return Response.json({ error: "Missing matchId" }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── 1. Try Supabase for admin-managed matches ──
    let match: any = null;
    const { data } = await supabase.from("matches").select("*").eq("id", matchId).single();
    if (data) {
      match = {
        sport: data.sport,
        team_a: data.team_a,
        team_b: data.team_b,
        title: data.title,
        score_a: data.score_a,
        score_b: data.score_b,
        status: data.status,
        live: data.live,
      };
    }

    // ── 2. Fallback: Check IPL schedule (for local schedule matches) ──
    if (!match) {
      const schedule = getDynamicSchedule();
      const iplMatch = schedule.find(m => String(m.matchNo) === String(matchId));
      if (iplMatch) {
        match = {
          sport: "cricket",
          team_a: iplMatch.team1,
          team_b: iplMatch.team2,
          title: `${iplMatch.team1} vs ${iplMatch.team2}, IPL 2026 Match ${iplMatch.matchNo}`,
          score_a: iplMatch.score1 || "—",
          score_b: iplMatch.score2 || "—",
          status: iplMatch.result || (iplMatch.status === "live" ? "In Progress" : iplMatch.status === "completed" ? "Completed" : "Match not started"),
          live: iplMatch.status === "live",
          venue: iplMatch.venue,
          matchNo: iplMatch.matchNo,
        };
      }
    }

    if (!match) {
      return Response.json({ error: "Match not found" }, { status: 404 });
    }

    // ── Build prompt ──
    const isPreMatch = !match.live && (match.status === "Match not started" || match.status === "upcoming");

    const prompt = isPreMatch
      ? `You are a world-class sports journalist and cricket analyst writing for PulseSports. Write a PRE-MATCH PREVIEW for this IPL 2026 match:

Match: ${match.team_a} vs ${match.team_b}
Title: ${match.title}
Venue: ${match.venue || "TBA"}
Tournament: IPL 2026

Generate a JSON response with:
1. "headline" - Catchy preview headline (max 80 chars)
2. "subheadline" - One-line teaser (max 120 chars)
3. "report" - 300-400 word pre-match analysis: team form, key matchups, pitch conditions, head-to-head, prediction. Short paragraphs. Be specific about IPL 2026 players.
4. "keyMoments" - Array of 3-4 "Things to Watch", each with "time" (like "Powerplay","Death Overs","Toss"), "event", "description"
5. "manOfTheMatch" - Object with "name" (predicted impact player), "performance"
6. "fanVerdict" - Provocative question for fan debate
7. "tags" - Array of 4-5 tags

Respond with valid JSON only.`
      : `You are a world-class sports journalist for PulseSports. Write a match report for this ${match.sport} match:

Match: ${match.team_a} vs ${match.team_b}
Score: ${match.team_a}: ${match.score_a} | ${match.team_b}: ${match.score_b}
Status: ${match.status}
Venue: ${match.venue || "TBA"}

Generate a JSON response with:
1. "headline" - Catchy headline (max 80 chars)
2. "subheadline" - One-line summary (max 120 chars)
3. "report" - 300-400 word match report. Short paragraphs.
4. "keyMoments" - Array of 3-4 key moments, each with "time", "event", "description"
5. "manOfTheMatch" - Object with "name", "performance"
6. "fanVerdict" - Provocative debate question
7. "tags" - Array of 3-5 tags

Respond with valid JSON only.`;

    // ── Try multiple Gemini models ──
    let aiReport: any = null;
    let usedModel = "";

    for (const modelName of MODELS_TO_TRY) {
      try {
        const { text } = await generateText({
          model: google(modelName),
          prompt,
        });
        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        aiReport = JSON.parse(cleaned);
        usedModel = modelName;
        break; // Success — stop trying
      } catch (err: any) {
        console.log(`Model ${modelName} failed: ${err.message?.substring(0, 120)}`);
        continue; // Try next model
      }
    }

    // ── If all AI models fail, generate smart template report ──
    if (!aiReport) {
      console.log("All Gemini models failed — using template fallback");
      aiReport = generateTemplateReport(match, isPreMatch);
      usedModel = "template-fallback";
    }

    return Response.json({
      matchId,
      sport: match.sport,
      teamA: match.team_a,
      teamB: match.team_b,
      scoreA: match.score_a,
      scoreB: match.score_b,
      status: match.status,
      live: match.live,
      ...aiReport,
      generatedAt: new Date().toISOString(),
      source: usedModel === "template-fallback" ? "pulse-template" : "gemini-ai",
      model: usedModel,
    });
  } catch (error: any) {
    console.error("Match report error:", error?.message || error);
    return Response.json({
      error: "Failed to generate report",
      fallback: true,
      headline: "Match Report Unavailable",
      subheadline: "AI analysis is temporarily unavailable",
      report: "Match report generation encountered an error. Please try again by clicking the refresh button.",
      keyMoments: [],
      tags: [],
    }, { status: 200 });
  }
}

// ══════════════════════════════════════════════════════════════
// SMART TEMPLATE FALLBACK (no AI needed)
// ══════════════════════════════════════════════════════════════

const TEAM_STRENGTHS: Record<string, { star: string; strength: string; style: string }> = {
  CSK:  { star: "MS Dhoni",        strength: "spin bowling and death-over finishing", style: "experience-driven cricket" },
  MI:   { star: "Rohit Sharma",    strength: "power hitting in the middle overs",    style: "aggressive batting" },
  RCB:  { star: "Virat Kohli",     strength: "consistent run-scoring and pace attack", style: "high-intensity cricket" },
  KKR:  { star: "Sunil Narine",    strength: "mystery spin and explosive opening",   style: "unpredictable match-ups" },
  DC:   { star: "Rishabh Pant",    strength: "young firepower and left-arm pace",    style: "fearless batting" },
  RR:   { star: "Sanju Samson",    strength: "batting depth and leg-spin variety",   style: "smart cricket" },
  PBKS: { star: "Shreyas Iyer",    strength: "all-round batting and pace attack",    style: "aggressive cricket" },
  SRH:  { star: "Heinrich Klaasen", strength: "power hitting and death bowling",     style: "high-scoring cricket" },
  GT:   { star: "Shubman Gill",    strength: "young core and smart captaincy",       style: "tactical cricket" },
  LSG:  { star: "KL Rahul",        strength: "consistent batting and fast bowling",  style: "calculated cricket" },
};

function generateTemplateReport(match: any, isPreMatch: boolean) {
  const t1 = TEAM_STRENGTHS[match.team_a] || { star: "their captain", strength: "all-round play", style: "competitive cricket" };
  const t2 = TEAM_STRENGTHS[match.team_b] || { star: "their captain", strength: "all-round play", style: "competitive cricket" };
  const venue = match.venue || "the venue";

  if (isPreMatch) {
    return {
      headline: `${match.team_a} vs ${match.team_b}: A Clash of Titans Awaits!`,
      subheadline: `IPL 2026 Match ${match.matchNo || ""} promises fireworks at ${venue.split(",")[0]}`,
      report: `The stage is set for an electrifying encounter as ${match.team_a} take on ${match.team_b} in what promises to be a fascinating contest in IPL 2026. Both teams have shown flashes of brilliance this season, and this match could prove pivotal in the race for the playoffs.

${match.team_a}, known for their ${t1.style}, will look to ${t1.star} to set the tone early. Their ${t1.strength} has been a key factor in their campaign, and they'll be hoping to fire on all cylinders at ${venue.split(",")[0]}.

On the other side, ${match.team_b} bring their own brand of ${t2.style} to the table. ${t2.star} has been in sensational form, and their ${t2.strength} makes them a formidable opponent on any surface.

The pitch at ${venue.split(",")[0]} has historically offered something for both batters and bowlers. The powerplay battle will be crucial, as both teams possess aggressive openers who can take the game away in the first six overs.

The death overs could decide this match. Both teams have invested heavily in their finishing options, and the team that handles the pressure better between overs 16-20 will likely emerge victorious. The toss could play a significant role, with dew expected in the evening session.

This is a match that IPL fans will not want to miss. With so much at stake, expect both teams to leave everything on the field in pursuit of two crucial points.`,
      keyMoments: [
        { time: "Toss", event: "Crucial decision", description: `Dew factor could make chasing easier at ${venue.split(",")[0]}` },
        { time: "Powerplay", event: `${t1.star} vs Pace`, description: `Opening battle could set the tempo for the entire match` },
        { time: "Middle Overs", event: "Spin dominance", description: `The team that handles spin better through overs 7-14 will gain the advantage` },
        { time: "Death Overs", event: "Finishing skill", description: `Last 4 overs will decide the outcome — both teams have quality finishers` },
      ],
      manOfTheMatch: {
        name: t1.star,
        performance: `Key player to watch — capable of single-handedly turning the match with a match-defining knock or crucial spell`,
      },
      fanVerdict: `Who has the edge tonight — ${match.team_a}'s ${t1.strength} or ${match.team_b}'s ${t2.strength}?`,
      tags: ["IPL 2026", match.team_a, match.team_b, "Match Preview", "Cricket"],
    };
  }

  // Post-match / completed template
  return {
    headline: `${match.team_a} vs ${match.team_b}: ${match.status}`,
    subheadline: `IPL 2026 delivers another thrilling encounter at ${venue.split(",")[0]}`,
    report: `In another pulsating IPL 2026 encounter, ${match.team_a} took on ${match.team_b} at ${venue}. The match lived up to the hype with both teams producing moments of brilliance.

${match.team_a} posted ${match.score_a}, with their batters showing intent from the start. ${t1.star} played a crucial role, showcasing the ${t1.style} that has become their hallmark this season.

In response, ${match.team_b} scored ${match.score_b}. ${t2.star} led the charge, and their ${t2.strength} was on full display. The match swung back and forth, keeping fans on the edge of their seats until the final delivery.

The result: ${match.status}. This outcome has significant implications for the IPL 2026 points table, reshuffling the playoff calculations for multiple teams.`,
    keyMoments: [
      { time: "Over 6", event: "Powerplay drama", description: `Early breakthroughs set the tone for the innings` },
      { time: "Over 12", event: "Momentum shift", description: `A key partnership changed the complexion of the match` },
      { time: "Over 18", event: "Death over chaos", description: `Boundaries and wickets flew in quick succession` },
    ],
    manOfTheMatch: {
      name: t1.star,
      performance: `Delivered a match-defining performance when it mattered most`,
    },
    fanVerdict: `Was this the turning point of ${match.team_a}'s IPL 2026 campaign?`,
    tags: ["IPL 2026", match.team_a, match.team_b, "Match Report", "Cricket"],
  };
}
