import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  try {
    const { matchId } = await req.json();
    if (!matchId) return Response.json({ error: "Missing matchId" }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch match data
    const { data: match } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (!match) return Response.json({ error: "Match not found" }, { status: 404 });

    const prompt = `You are a world-class sports journalist writing for PulseSports, a premium digital sports platform. Write a compelling match report for the following ${match.sport} match:

Match: ${match.team_a} vs ${match.team_b}
Title: ${match.title}
Score: ${match.team_a}: ${match.score_a} | ${match.team_b}: ${match.score_b}
Status: ${match.status}
Sport: ${match.sport}

Generate a JSON response with these fields:
1. "headline" - A catchy, punchy headline (max 80 chars)
2. "subheadline" - A one-line summary (max 120 chars)
3. "report" - A 300-400 word match report with vivid language, key moments, and analysis. Use short paragraphs.
4. "keyMoments" - Array of 3-4 key moments, each with "time", "event", "description"
5. "manOfTheMatch" - Object with "name", "performance" (one line)
6. "fanVerdict" - A one-line provocative question to spark fan debate
7. "tags" - Array of 3-5 tags for the article

If the match is live, write about the current state of play. If completed, write a post-match report.
Respond with valid JSON only.`;

    const { text } = await generateText({
      model: google("gemini-2.5-flash-preview-05-20"),
      prompt,
    });

    // Parse the AI response
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const report = JSON.parse(cleaned);

    return Response.json({
      matchId: match.id,
      sport: match.sport,
      teamA: match.team_a,
      teamB: match.team_b,
      scoreA: match.score_a,
      scoreB: match.score_b,
      status: match.status,
      live: match.live,
      ...report,
      generatedAt: new Date().toISOString(),
      source: "gemini-ai",
    });
  } catch (error: any) {
    console.error("Match report generation error:", error);
    return Response.json({
      error: "Failed to generate report",
      fallback: true,
      headline: "Match Report Unavailable",
      subheadline: "AI analysis is temporarily unavailable",
      report: "Match report generation encountered an error. Please check back later.",
      keyMoments: [],
      tags: [],
    }, { status: 200 });
  }
}
