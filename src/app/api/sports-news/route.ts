import { NextResponse } from "next/server";

// ESPN's unofficial public API — powers their own website, free to use
const ESPN_CRICKET = "https://site.web.api.espn.com/apis/site/v2/sports/cricket/8676/news?limit=10";
const ESPN_FOOTBALL_UCL = "https://site.web.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/news?limit=6";
const ESPN_FOOTBALL_PL = "https://site.web.api.espn.com/apis/site/v2/sports/soccer/eng.1/news?limit=6";
const ESPN_FOOTBALL_ISL = "https://site.web.api.espn.com/apis/site/v2/sports/soccer/ind.1/news?limit=4";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Accept: "application/json",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getImageUrl(images: any[], sport: "cricket" | "football"): string {
  if (!images || images.length === 0) return "";
  
  // Try to find the best image — prefer wider ones
  const img = images.find((i: any) => i.width >= 600) || images[0];
  let url = img?.url || "";
  
  if (!url) return "";
  
  // Replace common ESPN template placeholders
  url = url
    .replace(/\{width\}/gi, "800")
    .replace(/\{height\}/gi, "450")
    .replace(/&w=\d+/, "&w=800")
    .replace(/&h=\d+/, "&h=450");
  
  // Ensure HTTPS
  if (url.startsWith("http://")) {
    url = url.replace("http://", "https://");
  }

  // Cricket images from cricinfo CDN are blocked by hotlink protection.
  // For cricket: only proxy images from /photo/ path (which work), 
  // skip cricinfo ones (use empty string so frontend shows graceful fallback).
  // For football: all images load fine via proxy.
  const isCricinfoBlocked = url.includes("/i/cricket/cricinfo/");
  
  if (isCricinfoBlocked) {
    // Try to construct an alternative URL or skip
    // ESPNCricinfo images are fully blocked, return empty so the frontend shows sport-themed gradient
    return "";
  }

  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

function parseESPNArticles(articles: any[], sport: "cricket" | "football") {
  return articles
    .filter((a: any) => a.headline)
    .map((a: any) => {
      const imageUrl = getImageUrl(a.images || [], sport);
      return {
        id: `espn-${a.id || a.uid || Math.random()}`,
        sport,
        title: a.headline,
        summary: a.description || a.story?.slice(0, 200) || a.headline,
        image_url: imageUrl,
        time_ago: timeAgo(a.published || new Date().toISOString()),
        source_url: a.links?.web?.href || "#",
        featured: false,
        created_at: a.published || new Date().toISOString(),
      };
    });
}

export async function GET() {
  try {
    const [cricketRes, uclRes, plRes, islRes] = await Promise.allSettled([
      fetch(ESPN_CRICKET, { headers: HEADERS, next: { revalidate: 900 } }),
      fetch(ESPN_FOOTBALL_UCL, { headers: HEADERS, next: { revalidate: 900 } }),
      fetch(ESPN_FOOTBALL_PL, { headers: HEADERS, next: { revalidate: 900 } }),
      fetch(ESPN_FOOTBALL_ISL, { headers: HEADERS, next: { revalidate: 900 } }),
    ]);

    let cricket: any[] = [];
    let football: any[] = [];

    if (cricketRes.status === "fulfilled" && cricketRes.value.ok) {
      const data = await cricketRes.value.json();
      cricket = parseESPNArticles(data.articles || [], "cricket");
    }

    const footballSources = [uclRes, plRes, islRes];
    for (const res of footballSources) {
      if (res.status === "fulfilled" && res.value.ok) {
        const data = await res.value.json();
        football.push(...parseESPNArticles(data.articles || [], "football"));
      }
    }

    // Deduplicate football by title
    const seen = new Set<string>();
    football = football.filter((a) => {
      if (seen.has(a.title)) return false;
      seen.add(a.title);
      return true;
    });

    // Mark first of each as featured
    if (cricket.length > 0) cricket[0].featured = true;
    if (football.length > 0) football[0].featured = true;

    const all = [...cricket, ...football];

    if (all.length === 0) {
      return NextResponse.json({ articles: [], source: "none" }, { status: 200 });
    }

    return NextResponse.json({ articles: all, source: "espn", count: all.length });
  } catch (err) {
    console.error("Sports news fetch error:", err);
    return NextResponse.json({ articles: [], source: "error" }, { status: 200 });
  }
}
