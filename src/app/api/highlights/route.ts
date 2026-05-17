import { NextResponse } from "next/server";

/**
 * Real Highlights API — Multi-source aggregator
 * 
 * Sources:
 *   🟢 ScoreBat Free API — Real football highlight videos with embeds (NO API KEY needed)
 *      Covers: Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Champions League, etc.
 *   
 *   🟢 YouTube RSS Feed — ICC/BCCI cricket highlights from official channels (NO API KEY needed)
 *      Parses the public Atom feed to extract latest cricket highlight uploads
 *   
 *   🟡 YouTube Data API v3 — Optional enrichment for cricket (requires YOUTUBE_API_KEY)
 *   
 *   🟡 Supabase — Admin-curated highlights (fallback)
 */

// ─── ScoreBat: Free football highlights with embeddable video ─────────
const SCOREBAT_FREE_FEED = "https://www.scorebat.com/video-api/v3/";

// ─── YouTube RSS: Official cricket channels ───────────────────────────
const CRICKET_YOUTUBE_CHANNELS = [
  { name: "ICC", id: "UCAWqcDCJWn5C1x4P0_G62MA" },
  { name: "IPL", id: "UCkBY0aHJP9BwjZLDYxAQrKg" },
];

interface HighlightItem {
  id: string;
  title: string;
  sport: "cricket" | "football";
  thumbnail: string;
  duration: string;
  views: string;
  video_url: string;
  embed_html?: string;       // ScoreBat provides ready-to-use embed HTML
  competition?: string;      // e.g. "ENGLAND: Premier League"
  teams?: { home: string; away: string };
  featured: boolean;
  created_at: string;
  source: "scorebat" | "youtube-rss" | "youtube-api" | "supabase";
}

// ─── ScoreBat Fetcher ─────────────────────────────────────────────────
async function fetchScoreBatHighlights(): Promise<HighlightItem[]> {
  try {
    const res = await fetch(SCOREBAT_FREE_FEED, {
      next: { revalidate: 900 }, // Cache 15 min
      headers: { "Accept": "application/json" },
    });
    if (!res.ok) return [];

    const data = await res.json();
    // The API returns { response: [...] } or just an array
    const matches = data.response || data || [];
    if (!Array.isArray(matches)) return [];

    // Take top 15 matches with videos, prioritize big leagues
    const bigLeagues = ["Premier League", "La Liga", "Bundesliga", "Serie A", "Ligue 1", "Champions League", "FA Cup", "Europa"];
    
    // Sort: big leagues first, then by date
    const sorted = [...matches]
      .filter((m: any) => m.videos && m.videos.length > 0)
      .sort((a: any, b: any) => {
        const aIsBig = bigLeagues.some(l => (a.competition || "").includes(l)) ? 0 : 1;
        const bIsBig = bigLeagues.some(l => (b.competition || "").includes(l)) ? 0 : 1;
        if (aIsBig !== bIsBig) return aIsBig - bIsBig;
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      });

    return sorted.slice(0, 15).map((match: any, i: number) => {
      const firstVideo = match.videos[0];
      // Extract embed iframe src from the embed HTML
      const embedSrcMatch = (firstVideo.embed || "").match(/src='([^']+)'/);
      const embedSrc = embedSrcMatch ? embedSrcMatch[1] : "";

      return {
        id: `sb-${match.homeTeam?.id || i}-${match.awayTeam?.id || i}`,
        title: match.title || `${match.homeTeam?.name} vs ${match.awayTeam?.name}`,
        sport: "football" as const,
        thumbnail: match.thumbnail || "",
        duration: "Highlights",
        views: "",
        video_url: match.matchviewUrl || "",
        embed_html: firstVideo.embed || "",
        competition: match.competition || "",
        teams: {
          home: match.homeTeam?.name || "",
          away: match.awayTeam?.name || "",
        },
        featured: i === 0,
        created_at: match.date || new Date().toISOString(),
        source: "scorebat" as const,
      };
    });
  } catch (err) {
    console.error("ScoreBat fetch error:", err);
    return [];
  }
}

// ─── YouTube RSS Fetcher (Cricket) ────────────────────────────────────
async function fetchCricketFromYouTubeRSS(): Promise<HighlightItem[]> {
  const results: HighlightItem[] = [];

  for (const channel of CRICKET_YOUTUBE_CHANNELS) {
    try {
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`;
      const res = await fetch(rssUrl, {
        next: { revalidate: 1800 }, // Cache 30 min
      });
      if (!res.ok) continue;

      const xml = await res.text();

      // Parse XML entries — extract video data from Atom feed
      const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) || [];

      for (const entry of entries.slice(0, 6)) {
        // Extract fields from XML
        const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] || "";
        const title = entry.match(/<title>([^<]+)<\/title>/)?.[1] || "";
        const published = entry.match(/<published>([^<]+)<\/published>/)?.[1] || "";
        const thumbnailMatch = entry.match(/<media:thumbnail[^>]*url="([^"]+)"/);
        const thumbnail = thumbnailMatch 
          ? thumbnailMatch[1] 
          : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        const viewsMatch = entry.match(/<media:statistics[^>]*views="([^"]+)"/);
        const views = viewsMatch ? viewsMatch[1] : "";

        // Filter: only include videos that look like highlights
        const lowerTitle = title.toLowerCase();
        const isHighlight = lowerTitle.includes("highlight") ||
          lowerTitle.includes("wicket") || lowerTitle.includes("six") ||
          lowerTitle.includes("catch") || lowerTitle.includes("boundary") ||
          lowerTitle.includes("innings") || lowerTitle.includes("match") ||
          lowerTitle.includes("ipl") || lowerTitle.includes("vs") ||
          lowerTitle.includes("final") || lowerTitle.includes("super") ||
          lowerTitle.includes("century") || lowerTitle.includes("best of") ||
          lowerTitle.includes("bowled") || lowerTitle.includes("run out") ||
          lowerTitle.includes("review") || lowerTitle.includes("replay");

        if (!isHighlight && !videoId) continue;

        results.push({
          id: `yt-${videoId}`,
          title: decodeXmlEntities(title),
          sport: "cricket",
          thumbnail,
          duration: "—",
          views: views ? formatViews(views) : "—",
          video_url: `https://www.youtube.com/watch?v=${videoId}`,
          featured: results.length === 0,
          created_at: published,
          source: "youtube-rss",
        });
      }
    } catch (err) {
      console.error(`YouTube RSS fetch error for ${channel.name}:`, err);
    }
  }

  // Mark first as featured
  if (results.length > 0) {
    results[0].featured = true;
  }

  return results.slice(0, 8);
}

// ─── YouTube Data API v3 (Optional enrichment for cricket) ────────────
async function fetchYouTubeHighlights(
  query: string,
  sport: "cricket" | "football",
  maxResults: number = 6
): Promise<HighlightItem[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];

  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&order=date&relevanceLanguage=en&key=${key}`;
    const searchRes = await fetch(searchUrl, { next: { revalidate: 1800 } });
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();

    if (!searchData.items || searchData.items.length === 0) return [];

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",");
    const detailUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${key}`;
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
        source: "youtube-api" as const,
      };
    });
  } catch {
    return [];
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────

function formatViews(count: string | number): string {
  const n = typeof count === "string" ? parseInt(count) : count;
  if (isNaN(n)) return "—";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function formatDuration(iso8601: string): string {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "00:00";
  const h = match[1] ? parseInt(match[1]) : 0;
  const m = match[2] ? parseInt(match[2]) : 0;
  const s = match[3] ? parseInt(match[3]) : 0;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

// ─── Main GET Handler ─────────────────────────────────────────────────

export async function GET() {
  try {
    // Fetch all sources in parallel
    const [scorebatResult, cricketRssResult, cricketYtResult] = await Promise.allSettled([
      fetchScoreBatHighlights(),
      fetchCricketFromYouTubeRSS(),
      fetchYouTubeHighlights("cricket highlights 2026 IPL wickets sixes", "cricket"),
    ]);

    let football: HighlightItem[] = [];
    let cricket: HighlightItem[] = [];

    // ScoreBat → Football highlights
    if (scorebatResult.status === "fulfilled") {
      football = scorebatResult.value;
    }

    // Cricket: prefer YouTube RSS (no API key), supplement with YouTube Data API if available
    if (cricketRssResult.status === "fulfilled" && cricketRssResult.value.length > 0) {
      cricket = cricketRssResult.value;
    } else if (cricketYtResult.status === "fulfilled") {
      cricket = cricketYtResult.value;
    }

    // Deduplicate cricket by video ID
    const seenIds = new Set<string>();
    cricket = cricket.filter(h => {
      if (seenIds.has(h.id)) return false;
      seenIds.add(h.id);
      return true;
    });

    const all = [...cricket, ...football];

    const sources = [];
    if (football.length > 0) sources.push("scorebat");
    if (cricket.length > 0) sources.push(cricket[0]?.source || "youtube");

    return NextResponse.json({
      highlights: all,
      count: all.length,
      sources,
      football_count: football.length,
      cricket_count: cricket.length,
    });
  } catch (err) {
    console.error("Highlights API error:", err);
    return NextResponse.json({ highlights: [], sources: ["error"] }, { status: 200 });
  }
}
