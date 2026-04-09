"use client";

// Skeleton card for match loading
export function MatchCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl border border-dark-border p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-3 w-28 bg-zinc-800 rounded" />
        <div className="h-5 w-12 bg-zinc-800 rounded-full" />
      </div>
      <div className="space-y-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-800 rounded-full" />
            <div className="h-4 w-24 bg-zinc-800 rounded" />
          </div>
          <div className="h-5 w-16 bg-zinc-800 rounded" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-800 rounded-full" />
            <div className="h-4 w-20 bg-zinc-800 rounded" />
          </div>
          <div className="h-5 w-16 bg-zinc-800 rounded" />
        </div>
      </div>
      <div className="h-px bg-zinc-800 mb-3" />
      <div className="flex justify-between">
        <div className="h-3 w-20 bg-zinc-800 rounded" />
        <div className="h-3 w-24 bg-zinc-800 rounded" />
      </div>
      {/* Shimmer overlay */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="skeleton-shimmer" />
      </div>
    </div>
  );
}

// Skeleton card for news articles
export function NewsCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl border border-dark-border overflow-hidden animate-pulse">
      <div className="h-48 bg-zinc-800" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-3 w-16 bg-zinc-800 rounded" />
          <div className="h-3 w-20 bg-zinc-800 rounded" />
        </div>
        <div className="h-5 w-full bg-zinc-800 rounded" />
        <div className="h-5 w-3/4 bg-zinc-800 rounded" />
        <div className="h-3 w-full bg-zinc-800 rounded" />
        <div className="h-3 w-2/3 bg-zinc-800 rounded" />
        <div className="h-3 w-24 bg-zinc-800 rounded mt-2" />
      </div>
    </div>
  );
}

// Hero skeleton
export function HeroSkeleton() {
  return (
    <div className="glass-card rounded-2xl border border-dark-border overflow-hidden animate-pulse mb-6">
      <div className="h-[300px] md:h-[380px] bg-zinc-800 relative">
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 space-y-3">
          <div className="h-5 w-20 bg-zinc-700 rounded-full" />
          <div className="h-8 w-3/4 bg-zinc-700 rounded" />
          <div className="h-4 w-1/2 bg-zinc-700 rounded" />
          <div className="h-3 w-32 bg-zinc-700 rounded" />
        </div>
      </div>
    </div>
  );
}

// Highlight video skeleton
export function VideoCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl border border-dark-border overflow-hidden animate-pulse">
      <div className="aspect-video bg-zinc-800 relative">
        <div className="absolute bottom-2 right-2 h-5 w-12 bg-zinc-700 rounded" />
      </div>
      <div className="p-4 space-y-2">
        <div className="h-4 w-full bg-zinc-800 rounded" />
        <div className="h-4 w-3/4 bg-zinc-800 rounded" />
        <div className="h-3 w-20 bg-zinc-800 rounded" />
      </div>
    </div>
  );
}
