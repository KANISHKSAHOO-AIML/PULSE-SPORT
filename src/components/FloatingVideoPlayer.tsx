"use client";

import { useState, useEffect, useRef } from "react";
import { X, PlayCircle, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingVideoPlayerProps {
  title: string;
  thumbnail: string;
  duration: string;
  sport: string;
  videoRef: React.RefObject<HTMLDivElement | null>;
}

export default function FloatingVideoPlayer({ title, thumbnail, duration, sport, videoRef }: FloatingVideoPlayerProps) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (videoRef.current) {
            const rect = videoRef.current.getBoundingClientRect();
            // Show PiP when video is fully scrolled out of viewport
            const isOut = rect.bottom < -50;
            setShow(isOut);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [videoRef, dismissed]);

  const handleClose = () => {
    setDismissed(true);
    setShow(false);
  };

  const handleExpand = () => {
    videoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setShow(false);
  };

  const accent = sport === "cricket" ? "text-cricket" : "text-football";

  return (
    <AnimatePresence>
      {show && !dismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="pip-player glass-card-strong border border-zinc-700/50"
        >
          {/* Mini thumbnail */}
          <div className="relative aspect-video cursor-pointer group" onClick={handleExpand}>
            <img src={thumbnail} alt={title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />

            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                <PlayCircle className={`w-6 h-6 ${accent}`} strokeWidth={1.5} />
              </div>
            </div>

            {/* Duration badge */}
            <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
              {duration}
            </div>

            {/* Control buttons */}
            <div className="absolute top-1.5 right-1.5 flex gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); handleExpand(); }}
                className="w-6 h-6 rounded bg-black/50 backdrop-blur-sm flex items-center justify-center text-zinc-300 hover:text-white transition-colors border border-white/10"
                title="Expand"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleClose(); }}
                className="w-6 h-6 rounded bg-black/50 backdrop-blur-sm flex items-center justify-center text-zinc-300 hover:text-white transition-colors border border-white/10"
                title="Close"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Info bar */}
          <div className="px-3 py-2 bg-zinc-900/90">
            <p className="text-[11px] font-bold text-zinc-200 truncate">{title}</p>
            <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold mt-0.5">
              {sport} highlight • {duration}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
