"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/utils/supabase/client";
import Header from "@/components/Header";
import CommentSection from "@/components/CommentSection";
import ShareButtons from "@/components/ShareButtons";
import { ArrowLeft, Eye, ExternalLink, Trophy } from "lucide-react";
import Link from "next/link";

/** Extract YouTube video ID from any YouTube URL format */
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

/** Extract ScoreBat embed iframe src */
function getScoreBatEmbedSrc(embedHtml: string): string | null {
  if (!embedHtml) return null;
  const match = embedHtml.match(/src='([^']+)'/) || embedHtml.match(/src="([^"]+)"/);
  return match ? match[1] : null;
}

export default function HighlightDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [highlight, setHighlight] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const fetchHighlight = async () => {
      // Try Supabase first
      const isSupabaseId = !id.startsWith("sb-") && !id.startsWith("yt-");
      if (isSupabaseId) {
        const { data } = await supabase.from("highlights").select("*").eq("id", id).single();
        if (data) {
          setHighlight(data);
          setLoading(false);
          return;
        }
      }

      // Try the highlights API route to find by ID
      try {
        const res = await fetch("/api/highlights");
        if (res.ok) {
          const json = await res.json();
          const found = (json.highlights || []).find((h: any) => h.id === id);
          if (found) {
            setHighlight(found);
            setLoading(false);
            return;
          }
        }
      } catch {}

      // Supabase fallback for non-prefixed IDs
      if (!isSupabaseId) {
        const { data } = await supabase.from("highlights").select("*").eq("id", id).single();
        if (data) {
          setHighlight(data);
        }
      }
      setLoading(false);
    };
    fetchHighlight();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-dark-bg text-white">
      <Header />
      <div className="container mx-auto px-4 py-16 max-w-5xl animate-pulse">
        <div className="h-4 w-32 bg-zinc-800 rounded mb-6" />
        <div className="aspect-video bg-zinc-800 rounded-2xl mb-6" />
        <div className="h-8 w-3/4 bg-zinc-800 rounded mb-3" />
        <div className="h-4 w-40 bg-zinc-800 rounded" />
      </div>
    </div>
  );

  if (!highlight) return (
    <div className="min-h-screen bg-dark-bg text-white">
      <Header />
      <div className="p-8 text-center text-zinc-500">Video not found.</div>
    </div>
  );

  const accentColor = highlight.sport === "cricket" ? "text-cricket" : "text-football";
  const ytId = getYouTubeId(highlight.video_url || "");
  const scoreBatSrc = getScoreBatEmbedSrc(highlight.embed_html || "");
  const hasVideo = !!ytId || !!scoreBatSrc;

  // Determine the embed source
  const isScoreBat = highlight.source === "scorebat" && scoreBatSrc;

  return (
    <div className="min-h-screen bg-dark-bg text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Link href="/highlights" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Highlights
        </Link>

        {/* ── Video Player ───────────────────────────────────────── */}
        <div className="mb-10 p-2 sm:p-3 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden">

            {/* ScoreBat embed — plays directly */}
            {isScoreBat && playing ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={scoreBatSrc!}
                frameBorder="0"
                allow="autoplay; fullscreen"
                allowFullScreen
                title={highlight.title}
              />
            ) : ytId && playing ? (
              /* YouTube embed */
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={highlight.title}
              />
            ) : (
              <>
                {/* Thumbnail + play button */}
                <img
                  src={highlight.thumbnail}
                  alt={highlight.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Play button */}
                <button
                  onClick={() => hasVideo ? setPlaying(true) : null}
                  className="absolute inset-0 flex items-center justify-center group"
                  aria-label="Play video"
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
                    ${hasVideo
                      ? "bg-white/10 backdrop-blur-md border-2 border-white/30 group-hover:scale-110 group-hover:bg-white/20 cursor-pointer"
                      : "bg-white/5 backdrop-blur-sm border border-white/10 cursor-not-allowed opacity-60"
                    }`}>
                    {/* Play triangle */}
                    <svg className={`w-10 h-10 ml-1 ${accentColor}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </button>

                {/* Duration badge */}
                <div className="absolute right-4 bottom-4 px-3 py-1.5 bg-black/80 text-white font-mono text-sm font-bold tracking-widest rounded-md backdrop-blur-md">
                  {highlight.duration || "—"}
                </div>

                {/* Sport badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${
                    highlight.sport === "cricket"
                      ? "bg-cricket/15 text-cricket border-cricket/30"
                      : "bg-football/15 text-football border-football/30"
                  }`}>{highlight.sport}</span>
                </div>

                {/* Competition badge for ScoreBat */}
                {highlight.competition && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-black/60 text-zinc-300 border border-zinc-700 flex items-center gap-1.5">
                      <Trophy className="w-3 h-3" />
                      {highlight.competition}
                    </span>
                  </div>
                )}

                {/* "No video" banner when no embed available */}
                {!hasVideo && (
                  <div className="absolute bottom-0 left-0 right-0 py-3 px-5 bg-black/80 backdrop-blur-sm text-center text-zinc-400 text-xs">
                    🎬 Full video not available — use the admin panel to add a YouTube URL
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Title + Meta ───────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 border-b border-zinc-800 pb-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-4xl font-extrabold mb-3 leading-tight tracking-tight text-white">
              {highlight.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-zinc-400 text-sm font-medium">
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-zinc-800 border border-zinc-700 ${accentColor}`}>
                {highlight.sport}
              </span>
              {highlight.competition && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-zinc-800 border border-zinc-700 text-zinc-300">
                  {highlight.competition}
                </span>
              )}
              {highlight.views && highlight.views !== "—" && (
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> {highlight.views} views
                </span>
              )}
              {highlight.created_at && (
                <span className="text-zinc-500 text-xs">
                  {new Date(highlight.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
              {highlight.video_url && !highlight.video_url.includes("scorebat") && (
                <a href={highlight.video_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Watch on YouTube
                </a>
              )}
              {highlight.source && (
                <span className="text-[10px] text-zinc-600 bg-zinc-800/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  via {highlight.source === "scorebat" ? "ScoreBat" : highlight.source === "youtube-rss" ? "YouTube" : highlight.source}
                </span>
              )}
            </div>
          </div>
          <ShareButtons title={highlight.title} />
        </div>

        {/* ── Comments ────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto">
          <CommentSection entityType="highlight" entityId={id} />
        </div>
      </main>
    </div>
  );
}
