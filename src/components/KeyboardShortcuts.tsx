"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function KeyboardShortcuts({ onSearchOpen }: { onSearchOpen: () => void }) {
  const router = useRouter();

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      // Don't fire if user is typing in an input
      const active = document.activeElement?.tagName;
      if (active === "INPUT" || active === "TEXTAREA") return;

      switch (e.key) {
        case "/":
          e.preventDefault();
          onSearchOpen();
          break;
        case "c":
        case "C":
          if (!e.ctrlKey && !e.metaKey) {
            const cricketSection =
              document.getElementById("section-cricket") ||
              document.getElementById("news-cricket") ||
              document.getElementById("highlights-cricket");
            if (cricketSection) {
              cricketSection.scrollIntoView({ behavior: "smooth" });
            } else {
              router.push("/");
            }
          }
          break;
        case "f":
        case "F":
          if (!e.ctrlKey && !e.metaKey) {
            const footballSection =
              document.getElementById("section-football") ||
              document.getElementById("news-football") ||
              document.getElementById("highlights-football");
            if (footballSection) {
              footballSection.scrollIntoView({ behavior: "smooth" });
            }
          }
          break;
        case "h":
        case "H":
          if (!e.ctrlKey && !e.metaKey) router.push("/");
          break;
        case "n":
        case "N":
          if (!e.ctrlKey && !e.metaKey) router.push("/news");
          break;
      }
    },
    [onSearchOpen, router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return null; // Headless component
}
