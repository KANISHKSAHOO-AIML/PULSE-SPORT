import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Fallback to avoid crashing the server if keys aren't added yet.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "https://dummy.upstash.io",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "dummy_token"
});

export async function POST(request: Request) {
  try {
    const { matchId, team } = await request.json();

    if (!matchId || !team || (team !== "A" && team !== "B")) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Atomically increment the cheer counter for the specific team in the specific match
    const redisKey = `match:${matchId}:team:${team}:cheers`;
    const newCount = await redis.incr(redisKey);

    return NextResponse.json({ success: true, count: newCount });
  } catch (error: any) {
    if (error.message.includes("dummy")) {
      return NextResponse.json({ error: "Redis is not yet configured" }, { status: 503 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get("matchId");

  if (!matchId) return NextResponse.json({ error: "Missing matchId" }, { status: 400 });

  try {
    // Pipeline the get requests to minimize latency
    const p = redis.pipeline();
    p.get(`match:${matchId}:team:A:cheers`);
    p.get(`match:${matchId}:team:B:cheers`);
    const [teamACheers, teamBCheers] = await p.exec();

    return NextResponse.json({ 
      teamA: Number(teamACheers) || 0, 
      teamB: Number(teamBCheers) || 0 
    });
  } catch (error: any) {
    console.error("GET /api/cheer Error: ", error);
    if (error?.message?.includes("dummy")) {
      return NextResponse.json({ teamA: 0, teamB: 0, error: "Redis not configured" });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
