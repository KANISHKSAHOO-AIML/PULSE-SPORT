"use client";

import { useRef, useEffect, useState, ReactNode } from "react";
import { motion, useInView } from "framer-motion";

interface ScrollAnimationSectionProps {
  id: string;
  sport: "cricket" | "football";
  title: string;
  subtitle: string;
  children: (scrollProgress: number) => ReactNode;
  enabled: boolean;
}

export default function ScrollAnimationSection({
  id,
  sport,
  title,
  subtitle,
  children,
  enabled,
}: ScrollAnimationSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const isInView = useInView(containerRef, { amount: 0.1 });

  useEffect(() => {
    if (!enabled) return;

    let ticking = false;
    let rafId = 0;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      rafId = requestAnimationFrame(() => {
        if (!containerRef.current) {
          ticking = false;
          return;
        }
        const rect = containerRef.current.getBoundingClientRect();
        const containerHeight = containerRef.current.offsetHeight;
        const viewportHeight = window.innerHeight;

        // Calculate how far through the scroll container we are
        const scrollableDistance = containerHeight - viewportHeight;
        if (scrollableDistance <= 0) {
          setScrollProgress(prev => prev !== 0 ? 0 : prev);
          ticking = false;
          return;
        }

        // rect.top goes from positive (below viewport) to negative (above viewport)
        const rawProgress = -rect.top / scrollableDistance;
        const clampedProgress = Math.max(0, Math.min(1, rawProgress));
        setScrollProgress(prev => Math.abs(prev - clampedProgress) > 0.005 ? clampedProgress : prev);
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [enabled]);

  const accentColor = sport === "cricket" ? "#00FFFF" : "#39FF14";
  const glowClass = sport === "cricket" ? "text-cricket" : "text-football";

  if (!enabled) {
    // Fallback: just show the title without 3D
    return (
      <section id={id} className="relative py-20 overflow-hidden">
        <div className="text-center">
          <h2
            className={`text-5xl md:text-7xl font-black tracking-tighter ${glowClass}`}
            style={{
              textShadow: `0 0 40px ${accentColor}40, 0 0 80px ${accentColor}20`,
            }}
          >
            {title}
          </h2>
          <p className="text-zinc-500 mt-3 text-lg font-medium">{subtitle}</p>
          <p className="text-zinc-600 mt-2 text-sm italic">
            3D animations disabled for performance
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id={id}
      ref={containerRef}
      className="relative"
      style={{ height: "250vh" }}
    >
      {/* Sticky container — stays in viewport while scrolling through the tall section */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* 3D Canvas Area */}
        <div className="absolute inset-0 z-0">{children(scrollProgress)}</div>

        {/* Title Overlay */}
        <motion.div
          className="relative z-10 text-center pointer-events-none select-none"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2
            className={`text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter ${glowClass}`}
            style={{
              textShadow: `0 0 60px ${accentColor}50, 0 0 120px ${accentColor}25`,
              opacity: Math.max(0, 1 - scrollProgress * 3),
            }}
          >
            {title}
          </h2>
          <p
            className="text-zinc-400 mt-3 text-lg md:text-xl font-medium tracking-wide"
            style={{
              opacity: Math.max(0, 1 - scrollProgress * 3),
            }}
          >
            {subtitle}
          </p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          style={{
            opacity: Math.max(0, 1 - scrollProgress * 5),
          }}
        >
          <span className="text-xs text-zinc-500 font-semibold tracking-widest uppercase">
            Scroll to animate
          </span>
          <svg
            className="w-5 h-5 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-900 z-10">
          <motion.div
            className="h-full"
            style={{
              width: `${scrollProgress * 100}%`,
              background: `linear-gradient(90deg, ${accentColor}80, ${accentColor})`,
              boxShadow: `0 0 20px ${accentColor}80`,
            }}
          />
        </div>
      </div>
    </section>
  );
}
