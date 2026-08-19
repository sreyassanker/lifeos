"use client";

// Deterministic pseudo-random widths so server and client render the same values
const WIDTHS = [
  [88, 76, 91, 73, 85, 97, 74, 89],
  [72, 83, 95, 78, 86, 71, 92, 80],
  [79, 87, 74, 93, 77, 82, 96, 70],
  [90, 75, 88, 81, 94, 73, 86, 78],
  [84, 91, 76, 89, 83, 77, 95, 72],
];

export function SkeletonCard({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="skeleton mb-3 h-4 w-1/3" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="skeleton h-3" style={{ width: `${WIDTHS[i % WIDTHS.length][0]}%` }} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
      <div className="skeleton mb-2 h-3 w-1/2" />
      <div className="skeleton mb-1 h-7 w-1/3" />
      <div className="skeleton h-2 w-2/3" />
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStat key={i} />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="skeleton mb-4 h-6 w-1/3" />
        <SkeletonGrid />
        <div className="mt-4 skeleton h-20 rounded-xl" />
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="skeleton h-16 rounded-xl" />
          <div className="skeleton h-16 rounded-xl" />
        </div>
      </div>
      <SkeletonCard lines={4} />
      <SkeletonCard lines={3} />
    </div>
  );
}
