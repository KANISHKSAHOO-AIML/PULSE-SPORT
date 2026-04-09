import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "https://dummy.upstash.io",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "dummy_token"
});

export async function POST(request: Request) {
  try {
    const { matchId, username, text, team } = await request.json();

    if (!matchId || !text) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const payload = JSON.stringify({
      id: Date.now().toString(),
      username: username || "Anonymous Fan",
      text,
      team: team || "Neutral",
      timestamp: new Date().toISOString()
    });

    const redisKey = `match:${matchId}:live_chat`;
    
    // LPUSH to add to front of list, LTRIM to keep only latest 50
    const p = redis.pipeline();
    p.lpush(redisKey, payload);
    p.ltrim(redisKey, 0, 49);
    await p.exec();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Redis Live Comment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get("matchId");

  if (!matchId) return NextResponse.json({ error: "Missing matchId" }, { status: 400 });

  try {
    const redisKey = `match:${matchId}:live_chat`;
    // Fetch latest 50 messages
    const messages = await redis.lrange(redisKey, 0, 49);
    return NextResponse.json({ messages });
  } catch (error: any) {
    if (error.message && error.message.includes("dummy")) {
       return NextResponse.json({ messages: [] });
    }
    console.error("Redis fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
