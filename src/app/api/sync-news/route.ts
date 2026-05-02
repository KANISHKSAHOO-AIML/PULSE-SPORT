import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────
// ENV — Fail fast with clear messages if keys are missing
// ─────────────────────────────────────────────────────────────
const GEMINI_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ─────────────────────────────────────────────────────────────
// Supabase Admin Client — uses service-role key to bypass RLS
// ─────────────────────────────────────────────────────────────
function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error(
      "Missing SUPABASE env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ─────────────────────────────────────────────────────────────
// Gemini Client — gemini-1.5-flash for speed
// ─────────────────────────────────────────────────────────────
function getGeminiModel() {
  if (!GEMINI_KEY) {
    throw new Error(
      "Missing GOOGLE_GENERATIVE_AI_API_KEY. Set it in .env.local"
    );
  }
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

// ─────────────────────────────────────────────────────────────
// STEP 1 — Fetch raw news from ESPN's public JSON feeds
// This replaces the "placeholder fetch" with real data your
// existing /api/sports-news already uses, keeping the pipeline
// DRY and always returning live articles.
// ─────────────────────────────────────────────────────────────
const ESPN_FEEDS = {
  cricket: "https://site.web.api.espn.com/apis/site/v2/sports/cricket/8676/news?limit=8",
  football_ucl: "https://site.web.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/news?limit=5",
  football_pl: "https://site.web.api.espn.com/apis/site/v2/sports/soccer/eng.1/news?limit=5",
};

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Accept: "application/json",
};

interface RawArticle {
  sport: "cricket" | "football";
  title: string;
  description: string;
  image_url: string;
  published: string;
}

async function fetchRawArticles(): Promise<RawArticle[]> {
  const articles: RawArticle[] = [];

  const feeds: { url: string; sport: "cricket" | "football" }[] = [
    { url: ESPN_FEEDS.cricket, sport: "cricket" },
    { url: ESPN_FEEDS.football_ucl, sport: "football" },
    { url: ESPN_FEEDS.football_pl, sport: "football" },
  ];

  const results = await Promise.allSettled(
    feeds.map((f) => fetch(f.url, { headers: FETCH_HEADERS, cache: "no-store" }))
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status !== "fulfilled" || !result.value.ok) continue;

    try {
      const data = await result.value.json();
      const items = (data.articles || []).slice(0, 5);

      for (const item of items) {
        if (!item.headline) continue;

        // Get image — prefer wider images, handle {width}/{height} templates
        let imgUrl = "";
        if (item.images?.length) {
          const img = item.images.find((i: any) => i.width >= 600) || item.images[0];
          imgUrl = (img?.url || "")
            .replace(/\{width\}/gi, "800")
            .replace(/\{height\}/gi, "450");
        }

        articles.push({
          sport: feeds[i].sport,
          title: item.headline,
          description: item.description || item.story?.slice(0, 300) || item.headline,
          image_url: imgUrl,
          published: item.published || new Date().toISOString(),
        });
      }
    } catch {
      // Individual feed parse failure — skip silently
    }
  }

  return articles;
}

// ─────────────────────────────────────────────────────────────
// STEP 2 — AI Processing via Gemini
// Transforms each raw article into PulseSports-branded content.
// ─────────────────────────────────────────────────────────────
const SYSTEM_INSTRUCTION = `Act as a Lead Journalist for PulseSports. Rewrite this news snippet. Create a catchy, high-energy headline. Write a 2-paragraph engaging story based on the facts. Summarize it into 3 bullet points. CRITICAL RULE: You must NOT mention the original source network (e.g., ESPN) anywhere in the output. Return the response as raw JSON with the keys: title, summary, and content.`;

interface TransformedArticle {
  title: string;
  summary: string;
  content: string;
}

async function transformWithGemini(
  model: any,
  rawTitle: string,
  rawDescription: string
): Promise<TransformedArticle | null> {
  try {
    const userPrompt = `Title: ${rawTitle}\nDescription: ${rawDescription}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();

    // Parse the JSON response — Gemini returns it inside the text
    const parsed: TransformedArticle = JSON.parse(responseText);

    // Validate required keys exist
    if (!parsed.title || !parsed.summary) {
      console.warn("[sync-news] Gemini returned incomplete JSON, skipping");
      return null;
    }

    return parsed;
  } catch (err: any) {
    // Gracefully handle rate limits (429), safety blocks, or malformed JSON
    const status = err?.status || err?.code || err?.httpErrorCode;
    const msg = err?.message || "";
    
    if (status === 429 || msg.includes("429") || msg.includes("exceeded your current quota")) {
      console.warn("[sync-news] ⚠️ GEMINI QUOTA EXHAUSTED: You have exceeded your free tier limits.");
      // Small backoff before continuing the loop so we don't spam the API
      await new Promise((r) => setTimeout(r, 2000));
    } else {
      console.error(`[sync-news] Gemini error (status=${status}):`, err?.message || err?.errorDetails || JSON.stringify(err).slice(0, 500));
    }
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Helper — compute human-readable "time ago" string
// ─────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─────────────────────────────────────────────────────────────
// ROUTE HANDLER — POST /api/sync-news
// Orchestrates: Fetch → AI Transform → DB Insert
// ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const startTime = Date.now();

  // ── Auth guard (optional: use a secret header to prevent abuse) ──
  const authHeader = request.headers.get("x-sync-secret");
  const SYNC_SECRET = process.env.SYNC_NEWS_SECRET;
  if (SYNC_SECRET && authHeader !== SYNC_SECRET) {
    return NextResponse.json(
      { error: "Unauthorized — invalid x-sync-secret header" },
      { status: 401 }
    );
  }

  try {
    // Initialize clients
    const supabaseAdmin = getSupabaseAdmin();
    const model = getGeminiModel();

    // ── STEP 1: Fetch raw articles ──
    console.log("[sync-news] Fetching raw articles from ESPN feeds...");
    const rawArticles = await fetchRawArticles();

    if (rawArticles.length === 0) {
      return NextResponse.json(
        { success: false, error: "No raw articles fetched from feeds" },
        { status: 502 }
      );
    }

    console.log(`[sync-news] Fetched ${rawArticles.length} raw articles`);

    // Take top 5 — balanced: 3 cricket + 2 football (or whatever is available)
    const cricketPool = rawArticles.filter((a) => a.sport === "cricket");
    const footballPool = rawArticles.filter((a) => a.sport === "football");
    const selected = [
      ...cricketPool.slice(0, 3),
      ...footballPool.slice(0, 2),
    ].slice(0, 5);

    console.log(`[sync-news] Selected ${selected.length} articles for AI transformation`);

    // ── STEP 2: Transform each article with Gemini ──
    const transformed: {
      sport: string;
      title: string;
      summary: string;
      content: string;
      image_url: string;
      time_ago: string;
      featured: boolean;
      source: string;
    }[] = [];

    for (let i = 0; i < selected.length; i++) {
      const raw = selected[i];
      console.log(`[sync-news] Transforming [${i + 1}/${selected.length}]: "${raw.title.slice(0, 60)}..."`);

      const result = await transformWithGemini(model, raw.title, raw.description);

      if (result) {
        transformed.push({
          sport: raw.sport,
          title: result.title,
          summary: result.summary,
          content: result.content || result.summary,
          image_url: raw.image_url,
          time_ago: timeAgo(raw.published),
          featured: i === 0, // First article of the batch = featured
          source: "pulsesports-ai",
        });
      }

      // Small delay between API calls to respect rate limits
      if (i < selected.length - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    if (transformed.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "All Gemini transformations failed — check API key / quota",
          raw_count: rawArticles.length,
        },
        { status: 500 }
      );
    }

    console.log(`[sync-news] Successfully transformed ${transformed.length} articles`);

    // ── STEP 3: Deduplicate — skip articles whose titles already exist in DB ──
    const { data: existingTitles } = await supabaseAdmin
      .from("news")
      .select("title")
      .order("created_at", { ascending: false })
      .limit(50);

    const existingSet = new Set(
      (existingTitles || []).map((row: any) => row.title?.toLowerCase().trim())
    );

    const newArticles = transformed.filter(
      (a) => !existingSet.has(a.title.toLowerCase().trim())
    );

    if (newArticles.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No new unique articles to insert — all duplicates of existing content",
        transformed_count: transformed.length,
        inserted_count: 0,
        duration_ms: Date.now() - startTime,
      });
    }

    // ── STEP 4: Insert into Supabase ──
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("news")
      .insert(
        newArticles.map((a) => ({
          sport: a.sport,
          title: a.title,
          summary: a.summary,
          image_url: a.image_url,
          time_ago: a.time_ago,
          featured: a.featured,
        }))
      )
      .select("id, title, sport");

    if (insertError) {
      console.error("[sync-news] Supabase insert error:", insertError);
      return NextResponse.json(
        {
          success: false,
          error: `Database insert failed: ${insertError.message}`,
          transformed_count: transformed.length,
        },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    console.log(
      `[sync-news] ✅ Pipeline complete — ${inserted?.length || 0} articles inserted in ${duration}ms`
    );

    return NextResponse.json({
      success: true,
      message: `AI News pipeline complete`,
      stats: {
        raw_fetched: rawArticles.length,
        selected_for_ai: selected.length,
        successfully_transformed: transformed.length,
        duplicates_skipped: transformed.length - newArticles.length,
        inserted_to_db: inserted?.length || 0,
        duration_ms: duration,
      },
      articles: inserted,
    });
  } catch (err: any) {
    console.error("[sync-news] Pipeline crash:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Unknown pipeline error",
        duration_ms: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// GET handler — health check & usage instructions
// ─────────────────────────────────────────────────────────────
export async function GET() {
  const hasGemini = !!GEMINI_KEY;
  const hasSupabase = !!SUPABASE_URL && !!SUPABASE_SERVICE_KEY;

  return NextResponse.json({
    route: "/api/sync-news",
    status: "ready",
    method: "POST",
    description:
      "AI News Transformer — fetches live ESPN articles, rewrites them with Gemini AI, and inserts into the PulseSports database.",
    config: {
      gemini_key_set: hasGemini,
      supabase_service_key_set: hasSupabase,
      model: "gemini-2.0-flash",
    },
    usage: {
      curl: 'curl -X POST http://localhost:3000/api/sync-news',
      with_auth:
        'curl -X POST http://localhost:3000/api/sync-news -H "x-sync-secret: YOUR_SECRET"',
    },
  });
}
