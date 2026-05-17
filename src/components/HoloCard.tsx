"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface HoloCardProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum tilt angle in degrees (default 10) */
  tiltMax?: number;
  /** Enable specular glare overlay (default true) */
  glare?: boolean;
  /** Sport color for the glare tint */
  sport?: "cricket" | "football";
}

/**
 * Holographic Depth Card — Creates a parallax tilt effect based on
 * cursor position, making flat content feel volumetric and spatial.
 * Includes an optional specular glare overlay that moves opposite
 * to the tilt direction.
 *
 * Inspired by Apple's iPhone 15 Pro site and Stripe's dashboard cards.
 */
export default function HoloCard({
  children,
  className = "",
  tiltMax = 10,
  glare = true,
  sport = "cricket",
}: HoloCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      // Normalized -0.5 to 0.5
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setRotate({ x: y * -tiltMax, y: x * tiltMax });
      // Glare follows cursor (percentage-based)
      setGlarePos({ x: (x + 0.5) * 100, y: (y + 0.5) * 100 });
    },
    [tiltMax]
  );

  const handleMouseLeave = useCallback(() => {
    setRotate({ x: 0, y: 0 });
    setGlarePos({ x: 50, y: 50 });
  }, []);

  const glareColor =
    sport === "cricket"
      ? "rgba(0, 255, 255, 0.08)"
      : "rgba(57, 255, 20, 0.08)";

  return (
    <motion.div
      ref={ref}
      className={`holo-card ${className}`}
      style={{ perspective: 800, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.8 }}
    >
      {/* Content */}
      <div style={{ transformStyle: "preserve-3d" }}>{children}</div>

      {/* Specular glare overlay */}
      {glare && (
        <div
          className="holo-glare"
          style={{
            background: `radial-gradient(600px circle at ${glarePos.x}% ${glarePos.y}%, ${glareColor}, transparent 40%)`,
          }}
        />
      )}
    </motion.div>
  );
}
