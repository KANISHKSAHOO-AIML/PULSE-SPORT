"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Dynamic Cursor Lighting — The user's cursor becomes a light source.
 * Every surface that uses this hook responds with realistic specular
 * highlights via CSS custom properties `--cursor-x` and `--cursor-y`.
 *
 * Usage:
 *   const lightRef = useCursorLight();
 *   <div ref={lightRef} className="cursor-light-card"> ... </div>
 */
export function useCursorLight<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ref.current.style.setProperty("--cursor-x", `${x}px`);
    ref.current.style.setProperty("--cursor-y", `${y}px`);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMouseMove);
    return () => el.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return ref;
}
