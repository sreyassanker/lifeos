"use client";

import { useMemo, useState } from "react";
import {
  getXP,
  levelFromXP,
  computeBadgeProgress,
  badgeSummary,
  recentXPEvents,
  type Badge,
} from "@/app/lib/gamification";

const CATEGORY_ICONS: Record<string, string> = {
  workout: "💪",
  nutrition: "🍽️",
  streak: "🔥",
  body: "📏",
  special: "⭐",
};

const CATEGORY_COLORS: Record<string, string> = {
  workout: "text-blue-600 dark:text-blue-400",
  nutrition: "text-emerald-600 dark:text-emerald-400",
  streak: "text-orange-600 dark:text-orange-400",
  body: "text-purple-600 dark:text-purple-400",
  special: "text-amber-600 dark:text-amber-400",
};

// ── XP Bar ─────────────────────────────────────────────────────────────
function XPBar() {
  const xp = useMemo(() => getXP(), []);
  const levelInfo = useMemo(() => levelFromXP(xp.totalXP), [xp.totalXP]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            ⚡ Level {levelInfo.level}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {xp.totalXP.toLocaleString()} total XP
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {levelInfo.currentXP}/{levelInfo.nextLevelXP}
          </p>
          <p className="text-[10px] text-zinc-400">XP to next level</p>
        </div>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
          style={{ width: `${levelInfo.progress}%` }}
        />
      </div>
      <p className="mt-1 text-right text-[10px] text-zinc-400">
        {levelInfo.progress}%
      </p>
    </div>
  );
}

// ── Badge Card ─────────────────────────────────────────────────────────
function BadgeCard({
  badge,
  currentCount,
  currentTier,
  nextTier,
  progress,
  unlocked,
}: {
  badge: Badge;
  currentCount: number;
  currentTier: number;
  nextTier: number | null;
  progress: number;
  unlocked: boolean;
}) {
  const currentTierData = currentTier >= 0 ? badge.tiers[currentTier] : null;
  const nextTierData = nextTier !== null ? badge.tiers[nextTier] : null;

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        unlocked
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{badge.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              {badge.name}
            </h4>
            {currentTierData && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                style={{ backgroundColor: currentTierData.color }}
              >
                {currentTierData.label}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {badge.description}
          </p>

          {/* Progress bar */}
          {nextTierData && (
            <div className="mt-2">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>{currentCount}</span>
                <span>{nextTierData.threshold}</span>
              </div>
              <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: currentTierData?.color ?? "#10b981",
                  }}
                />
              </div>
            </div>
          )}

          {nextTier === null && unlocked && (
            <p className="mt-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              ✨ Max tier achieved!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Recent XP Events ───────────────────────────────────────────────────
function RecentXPEvents() {
  const events = useMemo(() => recentXPEvents(7), []);

  if (events.length === 0) return null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">📋 Recent XP</h4>
      <div className="mt-3 space-y-2">
        {events.slice(0, 10).map((event, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-zinc-600 dark:text-zinc-400">{event.description}</span>
            </div>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              +{event.amount} XP
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main GamificationPanel ─────────────────────────────────────────────
export default function GamificationPanel() {
  const [filter, setFilter] = useState<string>("all");
  const badges = useMemo(() => computeBadgeProgress(), []);
  const summary = useMemo(() => badgeSummary(), []);

  const filtered = filter === "all"
    ? badges
    : badges.filter((b) => b.badge.category === filter);

  const categories = [
    { id: "all", label: "All" },
    { id: "workout", label: "Workout" },
    { id: "nutrition", label: "Nutrition" },
    { id: "streak", label: "Streak" },
    { id: "body", label: "Body" },
    { id: "special", label: "Special" },
  ];

  return (
    <div className="space-y-4">
      {/* XP Bar */}
      <XPBar />

      {/* Badge summary */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            🏆 Badges
          </h3>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {summary.earned}/{summary.total}
          </span>
        </div>
        <div className="mt-3 flex gap-3">
          {Object.entries(summary.byCategory).map(([cat, data]) => (
            <div key={cat} className="text-center">
              <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
              <p className="text-[10px] font-bold text-zinc-900 dark:text-white">
                {data.earned}/{data.total}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filter === c.id
                ? "bg-emerald-600 text-white"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {c.id !== "all" && CATEGORY_ICONS[c.id]} {c.label}
          </button>
        ))}
      </div>

      {/* Badge grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((b) => (
          <BadgeCard key={b.badge.id} {...b} />
        ))}
      </div>

      {/* Recent XP */}
      <RecentXPEvents />
    </div>
  );
}
