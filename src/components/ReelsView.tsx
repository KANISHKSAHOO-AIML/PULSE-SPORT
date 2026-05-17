"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronUp, ChevronDown, Heart, MessageSquare, Share2, Volume2, VolumeX, Play } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";

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

interface ReelsViewProps {
  highlights: any[];
  onClose: () => void;
}

export default function ReelsView({ highlights, onClose }: ReelsViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown" || e.key === "j") {
        setActiveIndex(prev => Math.min(prev + 1, highlights.length - 1));
      }
      if (e.key === "ArrowUp" || e.key === "k") {
        setActiveIndex(prev => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [highlights.length, onClose]);

  // Scroll to active item when index changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const items = container.children;
    if (items[activeIndex]) {
      items[activeIndex].scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeIndex]);

  // IntersectionObserver to detect which reel is in view
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index)) setActiveIndex(index);
          }
        });
      },
      { root: container, threshold: 0.6 }
    );

    Array.from(container.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [highlights]);

  // Prevent body scroll when reels are open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[70] w-10 h-10 rounded-full glass-depth-3 flex items-center justify-center text-white hover:bg-white/20 transition-all"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Navigation arrows */}
      <div className="absolute top-1/2 -translate-y-1/2 right-4 z-[65] flex flex-col gap-2">
        <button
          onClick={() => setActiveIndex(prev => Math.max(prev - 1, 0))}
          disabled={activeIndex === 0}
          className="w-8 h-8 rounded-full glass-depth-3 flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/20 transition-all"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveIndex(prev => Math.min(prev + 1, highlights.length - 1))}
          disabled={activeIndex === highlights.length - 1}
          className="w-8 h-8 rounded-full glass-depth-3 flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/20 transition-all"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Progress indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[65] flex gap-1">
        {highlights.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* Reels container */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-scroll reels-container"
      >
        {highlights.map((h, i) => {
          const ytId = getYouTubeId(h.video_url || "");
          const scoreBatSrc = h.embed_html ? (h.embed_html.match(/src='([^']+)'/) || h.embed_html.match(/src="([^"]+)"/))?.[1] : null;
          const isActive = i === activeIndex;
          const sportColor = h.sport === "cricket" ? "text-cricket" : "text-football";
          const sportBg = h.sport === "cricket" ? "bg-cricket/15 border-cricket/30" : "bg-football/15 border-football/30";
          const hasViews = h.views && h.views !== "" && h.views !== "—";

          return (
            <div
              key={h.id}
              data-index={i}
              className="w-full h-screen flex items-center justify-center relative reel-item"
            >
              {/* Background — ScoreBat embed, YouTube, or thumbnail */}
              {h.source === "scorebat" && scoreBatSrc && isActive ? (
                <iframe
                  src={scoreBatSrc}
                  className="absolute inset-0 w-full h-full object-cover"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  title={h.title}
                />
              ) : ytId && isActive ? (
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=1&controls=0&loop=1&mute=1&rel=0&modestbranding=1&playlist=${ytId}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  allow="autoplay; encrypted-media"
                  title={h.title}
                />
              ) : (
                <>
                  <img
                    src={h.thumbnail}
                    alt={h.title}
                    className="absolute inset-0 w-full h-full object-cover brightness-50"
                  />
                  {/* Centered play icon when no video */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                      <Play className={`w-10 h-10 ${sportColor} ml-1`} />
                    </div>
                  </div>
                </>
              )}

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

              {/* Bottom info — like Instagram Reels */}
              <div className="absolute bottom-0 left-0 right-16 p-6 z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${sportBg} ${sportColor}`}>
                    {h.sport === "cricket" ? "🏏" : "⚽"} {h.sport}
                  </span>
                  {h.competition && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md bg-black/50 text-zinc-300 border border-zinc-700">
                      🏆 {h.competition}
                    </span>
                  )}
                </div>
                <h3 className="text-white font-black text-xl md:text-2xl leading-tight mb-2 max-w-lg">
                  {h.title}
                </h3>
                <div className="flex items-center gap-4 text-zinc-300 text-sm">
                  {hasViews && <span className="flex items-center gap-1">👁 {h.views} views</span>}
                  <span className="flex items-center gap-1">⏱ {h.duration || "Highlights"}</span>
                  {h.source && (
                    <span className="text-[9px] text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {h.source === "scorebat" ? "ScoreBat" : "YouTube"}
                    </span>
                  )}
                </div>
              </div>

              {/* Right sidebar — actions */}
              <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10">
                <button className="text-white flex flex-col items-center gap-1 hover:scale-110 transition-transform">
                  <div className="w-10 h-10 rounded-full glass-depth-3 flex items-center justify-center">
                    <Heart className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold">{h.likes || "12K"}</span>
                </button>
                <button className="text-white flex flex-col items-center gap-1 hover:scale-110 transition-transform">
                  <div className="w-10 h-10 rounded-full glass-depth-3 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold">Chat</span>
                </button>
                <button className="text-white flex flex-col items-center gap-1 hover:scale-110 transition-transform">
                  <div className="w-10 h-10 rounded-full glass-depth-3 flex items-center justify-center">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold">Share</span>
                </button>
              </div>

              {/* Reel counter */}
              <div className="absolute top-16 left-6 text-white/50 text-xs font-bold z-10">
                {i + 1} / {highlights.length}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
