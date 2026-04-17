"use client";

export default function SectionDivider() {
  return (
    <div className="relative z-10 py-4">
      <div className="energy-divider">
        <div className="energy-divider-line" />
        <div className="energy-divider-glow" />
        {/* Center spark */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{
            background: "radial-gradient(circle, #00ffff, transparent)",
            boxShadow: "0 0 12px 4px rgba(0,255,255,0.3)",
            animation: "energySpark 2s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}
