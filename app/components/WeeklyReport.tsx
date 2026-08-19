"use client";

import { useMemo } from "react";
import { useLocalStorage } from "@/app/lib/use-local-state";
import type { Profile } from "@/app/lib/macros";
import { macrosFor } from "@/app/lib/macros";
import { adherenceScore, weeklyVolumeSummary } from "@/app/lib/workout-log";
import { weeklyAdherence, mealLogStreak } from "@/app/lib/meal-log";
import { weeklyBodySummary, weightTrend, milestones } from "@/app/lib/body-history";

export default function WeeklyReport() {
  const [profile] = useLocalStorage<Profile>("lifeos-profile", {} as Profile);
  const targets = macrosFor(profile);

  const workoutAdherence = useMemo(() => adherenceScore(1), []);
  const nutritionAdherence = useMemo(() => weeklyAdherence(profile, 1), [profile]);
  const bodySummary = useMemo(() => weeklyBodySummary(1), []);
  const volume = useMemo(() => weeklyVolumeSummary(1), []);
  const trend = useMemo(() => weightTrend(4), []);
  const streak = useMemo(() => mealLogStreak(), []);
  const recentMilestones = useMemo(() => milestones(), []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">📊 Weekly Report</h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Summary of the past 7 days
        </p>
      </div>

      {/* Workout adherence */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">💪 Workout Adherence</h4>
        <div className="mt-3 flex items-center gap-4">
          <div className="relative h-16 w-16">
            <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3" className="dark:stroke-zinc-700" />
              <circle
                cx="18" cy="18" r="16" fill="none" stroke="#10b981" strokeWidth="3"
                strokeDasharray={`${(workoutAdherence.score / 100) * 100.53} 100.53`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-zinc-900 dark:text-white">
              {workoutAdherence.score}%
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {workoutAdherence.completed}/{workoutAdherence.planned} days
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{workoutAdherence.detail}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800">
            <span className="text-zinc-500">Total volume:</span>{" "}
            <span className="font-bold text-zinc-900 dark:text-white">{volume.totalVolume.toLocaleString()}</span>
          </div>
          <div className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800">
            <span className="text-zinc-500">Total sets:</span>{" "}
            <span className="font-bold text-zinc-900 dark:text-white">{volume.totalSets}</span>
          </div>
        </div>
      </div>

      {/* Nutrition adherence */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">🍽️ Nutrition Adherence</h4>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-zinc-500">Calorie accuracy</p>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${nutritionAdherence.calorieAccuracy}%` }}
              />
            </div>
            <p className="mt-0.5 text-lg font-bold text-zinc-900 dark:text-white">
              {nutritionAdherence.calorieAccuracy}%
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Protein accuracy</p>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${nutritionAdherence.proteinAccuracy}%` }}
              />
            </div>
            <p className="mt-0.5 text-lg font-bold text-zinc-900 dark:text-white">
              {nutritionAdherence.proteinAccuracy}%
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {nutritionAdherence.daysLogged}/{nutritionAdherence.totalDays} days logged
        </p>
      </div>

      {/* Body trends */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">📏 Body Trends</h4>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Weight change</span>
            <span
              className={`font-bold ${
                bodySummary.weightChange < 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : bodySummary.weightChange > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-zinc-900 dark:text-white"
              }`}
            >
              {bodySummary.weightChange > 0 ? "+" : ""}
              {bodySummary.weightChange} kg
            </span>
          </div>
          {bodySummary.bodyfatChange !== 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Body fat</span>
              <span
                className={`font-bold ${
                  bodySummary.bodyfatChange < 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {bodySummary.bodyfatChange > 0 ? "+" : ""}
                {bodySummary.bodyfatChange}%
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">4-week trend</span>
            <span className="font-bold text-zinc-900 dark:text-white">
              {trend.direction === "losing" ? "📉" : trend.direction === "gaining" ? "📈" : "➡️"}{" "}
              {trend.rateKgPerWeek > 0 ? "+" : ""}
              {trend.rateKgPerWeek} kg/week
            </span>
          </div>
        </div>
      </div>

      {/* Streak & milestones */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">🔥 Streak & Milestones</h4>
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-lg font-bold text-zinc-900 dark:text-white">{streak} days</p>
              <p className="text-xs text-zinc-500">Meal logging streak</p>
            </div>
          </div>
        </div>
        {recentMilestones.length > 0 && (
          <div className="mt-3 space-y-2">
            {recentMilestones.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2 dark:bg-emerald-900/20"
              >
                <span>{m.icon}</span>
                <div>
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{m.label}</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-500">
                    {m.value} — {m.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Targets reminder */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">🎯 Your Targets</h4>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800">
            <span className="text-zinc-500">Calories:</span>{" "}
            <span className="font-bold">{targets.calories} kcal</span>
          </div>
          <div className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800">
            <span className="text-zinc-500">Protein:</span>{" "}
            <span className="font-bold">{targets.proteinG}g</span>
          </div>
          <div className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800">
            <span className="text-zinc-500">Carbs:</span>{" "}
            <span className="font-bold">{targets.carbsG}g</span>
          </div>
          <div className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800">
            <span className="text-zinc-500">Fat:</span>{" "}
            <span className="font-bold">{targets.fatG}g</span>
          </div>
        </div>
      </div>
    </div>
  );
}
