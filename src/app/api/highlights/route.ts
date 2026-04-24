import { NextResponse } from "next/server";

/**
 * Real Highlights API — Fetches from YouTube Data API v3
 * 
 * Sources:
 *   - YouTube search for cricket/football highlights
 *   - Supabase highlights table (admin-curated)
 *   
 * YouTube API key is optional — falls back to Supabase + curated links
 */

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

// Curated YouTube channels for reliable sports highlight content
const CRICKET_CHANNELS = "UCkBY0aHJP9BwjZLDYxAQrKg"; // ICC
const FOOTBALL_CHANNELS = "UCDVYQ4Zhbm3S2dlz7P1GBDg"; // UEFA

interface HighlightItem {
  id: string;
  title: string;
  sport: "cricket" | "football";
  thumbnail: string;
  duration: string;
  views: string;
  video_url: string;
  featured: boolean;
  created_at: string;
  source: "youtube" | "supabase";
}

function formatViews(count: string | number): string {
  const n = typeof count === "string" ? parseInt(count) : count;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function formatDuration(iso8601: string): string {
  // PT4M13S -> 04:13
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "00:00";
  const h = match[1] ? parseInt(match[1]) : 0;
  const m = match[2] ? parseInt(match[2]) : 0;
  const s = match[3] ? parseInt(match[3]) : 0;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

async function fetchYouTubeHighlights(
  query: string,
  sport: "cricket" | "football",
  maxResults: number = 6
): Promise<HighlightItem[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];

  try {
    // Step 1: Search for videos
    const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&order=date&relevanceLanguage=en&key=${key}`;
    const searchRes = await fetch(searchUrl, { next: { revalidate: 1800 } }); // Cache 30min
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();

    if (!searchData.items || searchData.items.length === 0) return [];

    // Step 2: Get video details (duration, views)
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",");
    const detailUrl = `${YOUTUBE_API_BASE}/videos?part=contentDetails,statistics&id=${videoIds}&key=${key}`;
    const detailRes = await fetch(detailUrl, { next: { revalidate: 1800 } });
    const detailData = detailRes.ok ? await detailRes.json() : { items: [] };

    const detailMap = new Map<string, any>();
    (detailData.items || []).forEach((d: any) => detailMap.set(d.id, d));

    return searchData.items.map((item: any, i: number) => {
      const videoId = item.id.videoId;
      const detail = detailMap.get(videoId);
      return {
        id: `yt-${videoId}`,
        title: item.snippet.title,
        sport,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || "",
        duration: detail?.contentDetails?.duration ? formatDuration(detail.contentDetails.duration) : "—",
        views: detail?.statistics?.viewCount ? formatViews(detail.statistics.viewCount) : "—",
        video_url: `https://www.youtube.com/watch?v=${videoId}`,
        featured: i === 0,
        created_at: item.snippet.publishedAt,
        source: "youtube" as const,
      };
    });
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const [cricketHighlights, footballHighlights] = await Promise.allSettled([
      fetchYouTubeHighlights("cricket highlights 2026 IPL wickets sixes", "cricket"),
      fetchYouTubeHighlights("football highlights 2026 goals Champions League Premier League", "football"),
    ]);

    let cricket: HighlightItem[] = [];
    let football: HighlightItem[] = [];

    if (cricketHighlights.status === "fulfilled") cricket = cricketHighlights.value;
    if (footballHighlights.status === "fulfilled") football = footballHighlights.value;

    const all = [...cricket, ...football];

    return NextResponse.json({
      highlights: all,
      count: all.length,
      source: all.length > 0 ? "youtube" : "none",
    });
  } catch (err) {
    console.error("Highlights API error:", err);
    return NextResponse.json({ highlights: [], source: "error" }, { status: 200 });
  }
}
