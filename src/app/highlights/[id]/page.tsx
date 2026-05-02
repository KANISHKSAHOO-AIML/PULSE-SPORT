"use client";

import { useState, useEffect, use, useRef } from "react";
import { supabase } from "@/utils/supabase/client";
import Header from "@/components/Header";
import CommentSection from "@/components/CommentSection";
import ShareButtons from "@/components/ShareButtons";
import { ArrowLeft, Eye, ExternalLink } from "lucide-react";
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

export default function HighlightDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [highlight, setHighlight] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const fetchHighlight = async () => {
      // Try Supabase first
      const { data } = await supabase.from("highlights").select("*").eq("id", id).single();
      if (data) {
        setHighlight(data);
      } else {
        // Try the YouTube API route to find by ID
        try {
          const res = await fetch("/api/highlights");
          if (res.ok) {
            const json = await res.json();
            const found = (json.highlights || []).find((h: any) => h.id === id);
            if (found) {
              setHighlight(found);
            }
          }
        } catch {}
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
  const accentBg = highlight.sport === "cricket" ? "bg-cricket" : "bg-football";
  const ytId = getYouTubeId(highlight.video_url || "");

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

            {/* YouTube embed — shows when ytId exists AND user clicked play */}
            {ytId && playing ? (
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
                  onClick={() => ytId ? setPlaying(true) : null}
                  className="absolute inset-0 flex items-center justify-center group"
                  aria-label="Play video"
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
                    ${ytId
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

                {/* "No video" banner when no YouTube URL */}
                {!ytId && (
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
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> {highlight.views} views
              </span>
              {highlight.video_url && (
                <a href={highlight.video_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Watch on YouTube
                </a>
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
