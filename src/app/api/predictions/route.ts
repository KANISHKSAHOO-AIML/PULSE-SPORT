import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { user_id, match_id, predicted_winner } = await req.json();

    if (!user_id || !match_id || !predicted_winner) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("predictions")
      .upsert({ user_id, match_id, predicted_winner }, { onConflict: "user_id,match_id" })
      .select()
      .single();

    if (error) {
      // Table might not exist yet — gracefully fail
      return NextResponse.json({ error: error.message, fallback: true }, { status: 200 });
    }

    return NextResponse.json({ prediction: data });
  } catch (e) {
    return NextResponse.json({ error: "Internal error", fallback: true }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  const matchId = req.nextUrl.searchParams.get("matchId");

  if (!matchId) {
    return NextResponse.json({ error: "matchId required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from("predictions")
      .select("predicted_winner")
      .eq("match_id", matchId);

    if (error || !data) {
      return NextResponse.json({ teamA: 0, teamB: 0, draw: 0, fallback: true });
    }

    // Count votes
    const counts = data.reduce(
      (acc: any, p: any) => {
        if (p.predicted_winner === "Draw") acc.draw++;
        else if (acc.seen === undefined) {
          acc.teamA++;
          acc.seen = p.predicted_winner;
        } else if (p.predicted_winner === acc.seen) acc.teamA++;
        else acc.teamB++;
        return acc;
      },
      { teamA: 0, teamB: 0, draw: 0 }
    );

    return NextResponse.json(counts);
  } catch (e) {
    return NextResponse.json({ teamA: 0, teamB: 0, draw: 0, fallback: true });
  }
}
