"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  /** Pull strength 0–1 (default 0.3) */
  strength?: number;
  /** HTML element type — renders as <a> when href is provided */
  href?: string;
}

/**
 * Magnetic Interaction Field — Buttons magnetically pull toward the
 * cursor when it enters the element, creating a tactile, intentional
 * feel. On leave, the element snaps back with a satisfying spring.
 *
 * Drop-in replacement for any <button> or CTA.
 */
export default function MagneticButton({
  children,
  className = "",
  onClick,
  strength = 0.3,
  href,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });

  const motionProps = {
    className,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    animate: { x: position.x, y: position.y },
    transition: { type: "spring" as const, stiffness: 350, damping: 15, mass: 0.5 },
  };

  if (href) {
    return (
      <motion.a
        ref={ref as React.RefObject<HTMLAnchorElement | null>}
        href={href}
        onClick={onClick}
        {...motionProps}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement | null>}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
}
