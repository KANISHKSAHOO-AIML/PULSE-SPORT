"use client";

import React, { useState, useEffect } from "react";
import { CircleDashed } from "lucide-react";

export default function Loader3D({ sport }: { sport: "cricket" | "football" }) {
  const [mounted, setMounted] = useState(false);
  const accentColor = sport === "cricket" ? "text-cricket" : "text-football";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full h-64 flex flex-col justify-center items-center">
      <div className={`relative flex items-center justify-center w-24 h-24 ${accentColor}`}>
         {/* Simple rotating sleek circle */}
         <CircleDashed className={`absolute w-full h-full animate-spin opacity-80`} />
         <div className={`w-16 h-16 rounded-full bg-current opacity-20 animate-ping`} />
      </div>
      <div className="mt-8 text-zinc-500 text-sm font-semibold tracking-widest uppercase animate-pulse">
        {sport === "cricket" ? "Warming up the pitch..." : "Preparing the pitch..."}
      </div>
    </div>
  );
}

