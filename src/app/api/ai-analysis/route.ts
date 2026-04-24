import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 30;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function buildAnalysisPrompt(match: any, history: any[]) {
  return `You are a senior sports analyst for PulseSports. Given the following live match data, provide a JSON response with these exact fields:
{
  "winProbability": { "teamA": <number 0-100>, "teamB": <number 0-100> },
  "momentum": "<teamA_name> | <teamB_name> | neutral",
  "momentumReason": "<1 sentence explaining momentum>",
  "keyInsight": "<1 tactical observation>",
  "prediction": "<1 sentence bold prediction>"
}

Current Match:
- Sport: ${match.sport}
- ${match.team_a}: ${match.score_a}
- ${match.team_b}: ${match.score_b}
- Status: ${match.status}
- Live: ${match.live}

Head-to-Head History (last matches):
${history.length > 0 
  ? history.map((h, i) => `  ${i+1}. ${h.team_a} ${h.score_a} vs ${h.score_b} ${h.team_b} — ${h.status}`).join('\n')
  : '  No previous head-to-head data available.'
}

Consider current score trajectory, match situation, and any historical patterns.
Respond ONLY with valid JSON, no markdown formatting.`;
}

export async function POST(req: NextRequest) {
  try {
    const { matchId } = await req.json();

    if (!matchId) {
      return NextResponse.json({ error: 'matchId required' }, { status: 400 });
    }

    // 1. Fetch current match from Supabase
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // 2. Fetch past head-to-head results (matches involving either team)
    const { data: history } = await supabase
      .from('matches')
      .select('team_a, team_b, score_a, score_b, status')
      .neq('id', matchId)
      .or(`team_a.eq.${match.team_a},team_b.eq.${match.team_a},team_a.eq.${match.team_b},team_b.eq.${match.team_b}`)
      .order('updated_at', { ascending: false })
      .limit(5);

    // 3. Call Gemini for analysis
    const result = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: buildAnalysisPrompt(match, history || []),
    });

    // 4. Parse and return the JSON response
    try {
      // Strip markdown code fences if Gemini wraps in ```json
      let text = result.text.trim();
      if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      const analysis = JSON.parse(text);
      return NextResponse.json({
        ...analysis,
        matchId,
        teamA: match.team_a,
        teamB: match.team_b,
        generatedAt: new Date().toISOString(),
      });
    } catch {
      // If parsing fails, return the raw text as a fallback
      return NextResponse.json({
        winProbability: { teamA: 50, teamB: 50 },
        momentum: 'neutral',
        momentumReason: 'AI analysis could not be parsed.',
        keyInsight: result.text.slice(0, 200),
        prediction: 'Match is too close to call.',
        raw: result.text,
        fallback: true,
      });
    }
  } catch (error: any) {
    console.error('AI Analysis Error:', error);

    if (error?.message?.includes('API key')) {
      return NextResponse.json({
        error: 'Gemini API key not configured',
        fallback: true,
        winProbability: { teamA: 50, teamB: 50 },
        momentum: 'neutral',
        momentumReason: 'AI not available.',
        keyInsight: 'Configure GOOGLE_GENERATIVE_AI_API_KEY to enable AI analysis.',
        prediction: 'AI analysis unavailable.',
      }, { status: 200 });
    }

    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
  }
}
