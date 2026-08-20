// Unified Vitality Index — combines all health dimensions into a single 0–100 score.
// Based on: Radha et al. (2022) "Multimodal Data Fusion for Unified Health State
// Representation" (Paper #55).
//
// Components (weighted):
//   Sleep quality:      30%  (from computeSleepQuality)
//   Nutrition adherence: 30%  (protein hit, calories on target)
//   Exercise completion: 25%  (WHO targets, workout completion)
//   Body trend:         15%  (weight trend direction vs goal)

import type { Profile } from "@/app/lib/macros";
import { macrosFor } from "@/app/lib/macros";
import type { MealPlan } from "@/app/lib/meal-plan";
import type { DayPlan } from "@/app/lib/fitness";
import { WEEK_PLAN, planDayIndex, isRestPlanDay } from "@/app/lib/fitness";

export interface VitalityInput {
  profile: Profile;
  mealPlan?: MealPlan;
  /** Sleep quality score 0-100 */
  sleepScore?: number;
  /** Water glasses consumed today */
  waterGlasses: number;
  /** Water goal */
  waterGoal: number;
  /** Habits completed today */
  habitsDone: number;
  /** Total habits */
  habitsTotal: number;
  /** Weight trend kg/week (negative = losing) */
  weightTrendKgPerWeek?: number;
  /** Current day of week (0=Sun) */
  dayOfWeek: number;
}

export interface VitalityResult {
  /** Overall vitality score 0-100 */
  score: number;
  /** Rating */
  rating: "excellent" | "good" | "fair" | "poor";
  /** Individual component scores 0-100 */
  components: {
    sleep: number;
    nutrition: number;
    exercise: number;
    body: number;
  };
  /** Human-readable summary */
  summary: string;
  /** Improvement suggestion */
  suggestion: string;
}

export function computeVitality(input: VitalityInput): VitalityResult {
  const macros = macrosFor(input.profile);

  // ── Sleep component (30%) ──────────────────────────────────────────────
  const sleepScore = input.sleepScore ?? 70; // default if no data

  // ── Nutrition component (30%) ──────────────────────────────────────────
  let nutritionScore = 50; // baseline
  if (input.mealPlan) {
    const proteinPct = input.mealPlan.totals.proteinG / macros.proteinG;
    const kcalPct = input.mealPlan.totals.kcal / macros.calories;
    // Protein adherence (0-50 points)
    nutritionScore += Math.min(25, proteinPct * 25);
    // Calorie adherence (0-25 points)
    const kcalDeviation = Math.abs(1 - kcalPct);
    nutritionScore += Math.max(0, 25 - kcalDeviation * 50);
  }
  // Hydration bonus
  const hydrationPct = input.waterGlasses / input.waterGoal;
  nutritionScore += hydrationPct * 10;
  // Habit bonus
  const habitPct = input.habitsTotal > 0 ? input.habitsDone / input.habitsTotal : 1;
  nutritionScore += habitPct * 10;
  nutritionScore = Math.min(100, Math.round(nutritionScore));

  // ── Exercise component (25%) ───────────────────────────────────────────
  let exerciseScore = 0;
  const planIdx = planDayIndex(input.dayOfWeek); // 0=Mon…6=Sun (WEEK_PLAN order)
  const isRestDay = isRestPlanDay(planIdx);
  // Count planned workout days completed before today (completed if its slot has passed)
  let plannedDays = 0;
  let completedDays = 0;
  for (let i = 0; i < 7; i++) {
    const day = WEEK_PLAN[i];
    if (day && (day.totalMin ?? 0) > 0) {
      plannedDays++;
      if (i < planIdx || (i === planIdx && !isRestDay)) completedDays++;
    }
  }
  if (plannedDays > 0) {
    exerciseScore = Math.round((completedDays / plannedDays) * 100);
  }
  // Bonus for hitting WHO target mid-week
  if (input.dayOfWeek >= 3 && exerciseScore >= 50) {
    exerciseScore = Math.min(100, exerciseScore + 15);
  }

  // ── Body trend component (15%) ─────────────────────────────────────────
  let bodyScore = 70; // neutral baseline
  if (input.weightTrendKgPerWeek !== undefined) {
    const trend = input.weightTrendKgPerWeek;
    const goal = input.profile.goal;
    if (goal === "cut") {
      // Good: losing 0.3-0.8 kg/week. Bad: gaining or losing >1.2
      if (trend >= -0.8 && trend <= -0.3) bodyScore = 95;
      else if (trend >= -1.2 && trend < -0.8) bodyScore = 80;
      else if (trend < -1.2) bodyScore = 60; // too fast
      else if (trend > -0.1 && trend <= 0.1) bodyScore = 50; // stalled
      else if (trend > 0.1) bodyScore = 30; // gaining during cut
    } else if (goal === "lean_bulk" || goal === "bulk") {
      // Good: gaining 0.1-0.3 kg/week
      if (trend >= 0.1 && trend <= 0.3) bodyScore = 95;
      else if (trend > 0.3 && trend <= 0.5) bodyScore = 80;
      else if (trend > 0.5) bodyScore = 60; // too fast
      else if (trend >= -0.05 && trend < 0.1) bodyScore = 50; // not gaining
      else if (trend < -0.05) bodyScore = 30; // losing during bulk
    } else {
      // Maintain: good if stable
      if (Math.abs(trend) < 0.1) bodyScore = 95;
      else if (Math.abs(trend) < 0.3) bodyScore = 75;
      else bodyScore = 50;
    }
  }

  // ── Weighted composite ─────────────────────────────────────────────────
  const score = Math.round(
    sleepScore * 0.30 +
    nutritionScore * 0.30 +
    exerciseScore * 0.25 +
    bodyScore * 0.15
  );

  let rating: VitalityResult["rating"];
  let summary: string;
  let suggestion: string;

  if (score >= 80) {
    rating = "excellent";
    summary = "You're thriving across all dimensions. Keep the momentum going.";
    suggestion = "Maintain your current habits and focus on progressive overload in training.";
  } else if (score >= 60) {
    rating = "good";
    summary = "Solid health foundation with room for optimization.";
    // Find weakest component
    const components = { sleep: sleepScore, nutrition: nutritionScore, exercise: exerciseScore, body: bodyScore };
    const weakest = Object.entries(components).sort(([, a], [, b]) => a - b)[0];
    suggestion = `Focus on improving ${weakest[0]} — it's your weakest area at ${weakest[1]}%.`;
  } else if (score >= 40) {
    rating = "fair";
    summary = "Several areas need attention. Small consistent changes will compound.";
    suggestion = "Start with sleep quality — it's the foundation that affects everything else.";
  } else {
    rating = "poor";
    summary = "Your health metrics need attention. Focus on the basics first.";
    suggestion = "Prioritize: 7+ hours sleep, 3 meals with protein, and one walk per day.";
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    rating,
    components: {
      sleep: Math.round(sleepScore),
      nutrition: Math.round(nutritionScore),
      exercise: Math.round(exerciseScore),
      body: Math.round(bodyScore),
    },
    summary,
    suggestion,
  };
}

/** Get color class for vitality score */
export function vitalityColor(score: number): string {
  if (score >= 80) return "text-emerald-700 dark:text-emerald-300";
  if (score >= 60) return "text-blue-700 dark:text-blue-300";
  if (score >= 40) return "text-amber-700 dark:text-amber-300";
  return "text-red-700 dark:text-red-300";
}

export function vitalityBg(score: number): string {
  if (score >= 80) return "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700";
  if (score >= 60) return "bg-blue-50 border-blue-300 dark:bg-blue-950/40 dark:border-blue-700";
  if (score >= 40) return "bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:border-amber-700";
  return "bg-red-50 border-red-300 dark:bg-red-950/40 dark:border-red-700";
}
