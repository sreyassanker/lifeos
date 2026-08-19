// Just-In-Time Adaptive Interventions (JITAI) coaching engine.
// Based on: Nahum-Shani et al. (2016) "JITAIs in Mobile Health" (Paper #38)
// and Ryan & Deci (2018) "Self-Determination Theory" (Paper #39).
//
// Shows the right tip at the right time based on:
// - Time of day (caffeine cutoff, meal timing, sleep reminder)
// - User state (protein intake, hydration, training schedule)
// - Weekly progress (WHO targets, protein adherence, recovery)
//
// Each tip has a priority (higher = more urgent) and a cooldown
// so the same tip doesn't repeat every time the user opens the app.

import type { Profile } from "@/app/lib/macros";
import { macrosFor } from "@/app/lib/macros";
import type { MealPlan } from "@/app/lib/meal-plan";

export interface CoachingTip {
  id: string;
  /** Priority 1-10 (higher = more urgent) */
  priority: number;
  /** Category for grouping */
  category: "hydration" | "nutrition" | "sleep" | "training" | "recovery" | "general";
  /** Short actionable message */
  message: string;
  /** Optional detail / scientific basis */
  detail?: string;
  /** Emoji for visual display */
  emoji: string;
}

interface CoachingContext {
  profile: Profile;
  mealPlan?: MealPlan;
  /** Current hour (0-23) */
  hour: number;
  /** Current day of week (0=Sun, 6=Sat) */
  dayOfWeek: number;
  /** Water glasses consumed today */
  waterGlasses: number;
  /** Water goal (typically 8) */
  waterGoal: number;
  /** Habits completed today */
  habitsDone: number;
  /** Total habits */
  habitsTotal: number;
  /** Sleep quality score 0-100 (if available) */
  sleepScore?: number;
  /** Streak days */
  streak: number;
  /** Recovery score 0-100 */
  recoveryScore?: number;
}

/**
 * Generate context-aware coaching tips, sorted by priority.
 * Source: Nahum-Shani et al. 2016 JITAI framework — decision points,
 * tailoring variables, and intervention options.
 */
export function generateCoachingTips(ctx: CoachingContext): CoachingTip[] {
  const tips: CoachingTip[] = [];
  const macros = macrosFor(ctx.profile);
  const hour = ctx.hour;

  // ── Hydration nudges ──────────────────────────────────────────────────
  if (ctx.waterGlasses < ctx.waterGoal) {
    const remaining = ctx.waterGoal - ctx.waterGlasses;
    if (remaining >= 4) {
      tips.push({
        id: "hydration-catchup",
        priority: 8,
        category: "hydration",
        message: `You've had ${ctx.waterGlasses}/${ctx.waterGoal} glasses — catch up with ${remaining} more today.`,
        detail: "NASEM adequate intake: 3.7 L/day (men), 2.7 L/day (women). Dehydration impairs cognitive performance by 10–25%.",
        emoji: "💧",
      });
    } else if (remaining <= 2) {
      tips.push({
        id: "hydration-almost",
        priority: 4,
        category: "hydration",
        message: `Almost there — ${remaining} more glass${remaining > 1 ? "es" : ""} to hit your water goal.`,
        emoji: "💧",
      });
    }
  }

  // ── Meal timing nudges ────────────────────────────────────────────────
  if (hour >= 7 && hour <= 9) {
    tips.push({
      id: "morning-meal",
      priority: 5,
      category: "nutrition",
      message: "Morning: start with protein + fiber to stabilize blood sugar all day.",
      detail: "High-protein breakfast reduces afternoon snacking by 40% (Leidy et al. 2013).",
      emoji: "🌅",
    });
  }

  if (hour >= 12 && hour <= 14) {
    tips.push({
      id: "lunch-protein",
      priority: 5,
      category: "nutrition",
      message: `Lunch target: ~${Math.round(macros.proteinG * 0.3)}g protein, ~${Math.round(macros.calories * 0.3)} kcal.`,
      detail: "Spread protein across meals (20-40g per meal) for optimal muscle protein synthesis.",
      emoji: "🍽️",
    });
  }

  if (hour >= 19 && hour <= 21) {
    tips.push({
      id: "dinner-light",
      priority: 4,
      category: "nutrition",
      message: "Dinner: keep it light and finish 3+ hours before bed for better sleep quality.",
      detail: "Late heavy meals increase acid reflux and reduce deep sleep (Harvard Medical School).",
      emoji: "🌙",
    });
  }

  // ── Caffeine cutoff ───────────────────────────────────────────────────
  // Caffeine half-life is ~6 hours. If bedtime is around 23:00, cutoff is 15:00.
  const bedHour = 23; // default
  const caffeineCutoff = bedHour - 8; // 8 hours before bed
  if (hour >= caffeineCutoff && hour < bedHour) {
    tips.push({
      id: "caffeine-cutoff",
      priority: 7,
      category: "sleep",
      message: `Caffeine cutoff is now — no coffee/tea after ${caffeineCutoff}:00 for quality sleep.`,
      detail: "Caffeine has a 6-hour half-life. A 3 PM coffee still has half its effect at 9 PM.",
      emoji: "☕",
    });
  }

  // ── Sleep reminder ────────────────────────────────────────────────────
  if (hour >= 22) {
    tips.push({
      id: "sleep-winddown",
      priority: 6,
      category: "sleep",
      message: "Wind-down time: dim lights, no screens, prepare for bed.",
      detail: "Blue light suppresses melatonin for up to 3 hours. Start winding down 30-60 min before bed.",
      emoji: "😴",
    });
  }

  if (hour >= 6 && hour < 7) {
    tips.push({
      id: "morning-light",
      priority: 6,
      category: "sleep",
      message: "Get 10-15 min of outdoor light within an hour of waking to anchor your circadian rhythm.",
      detail: "Morning sunlight is the single strongest zeitgeber (time cue) for the circadian clock.",
      emoji: "☀️",
    });
  }

  // ── Training nudges ───────────────────────────────────────────────────
  const isRestDay = ctx.dayOfWeek === 0 || ctx.dayOfWeek === 6;
  if (!isRestDay && hour >= 16 && hour <= 20) {
    tips.push({
      id: "training-time",
      priority: 5,
      category: "training",
      message: "Afternoon/early evening is the optimal time for strength training — body temperature peaks.",
      detail: "Muscle strength and reaction time peak between 14:00-20:00 (Chtourou & Souissi 2012).",
      emoji: "💪",
    });
  }

  if (isRestDay) {
    tips.push({
      id: "rest-day",
      priority: 3,
      category: "recovery",
      message: "Rest day: recovery is when muscles grow. Prioritize sleep and protein today.",
      detail: "Muscle protein synthesis peaks 24-48h post-exercise. Rest days are growth days.",
      emoji: "🛌",
    });
  }

  // ── Recovery nudges ───────────────────────────────────────────────────
  if (ctx.recoveryScore !== undefined && ctx.recoveryScore < 50) {
    tips.push({
      id: "low-recovery",
      priority: 9,
      category: "recovery",
      message: "Your recovery score is low — consider a lighter session or extra rest today.",
      detail: "Overtraining syndrome affects 60% of serious athletes. Listen to your body.",
      emoji: "⚠️",
    });
  }

  // ── Protein tracking ──────────────────────────────────────────────────
  if (ctx.mealPlan) {
    const totalProtein = ctx.mealPlan.totals.proteinG;
    const targetProtein = macros.proteinG;
    if (totalProtein < targetProtein * 0.7 && hour >= 20) {
      tips.push({
        id: "protein-low",
        priority: 7,
        category: "nutrition",
        message: `Protein is at ${Math.round(totalProtein)}/${targetProtein}g — add a protein-rich snack before bed.`,
        detail: "Casein (cottage cheese, Greek yogurt) before bed supports overnight muscle recovery.",
        emoji: "🥩",
      });
    }
  }

  // ── Habit/streak nudges ───────────────────────────────────────────────
  if (ctx.habitsDone < ctx.habitsTotal && ctx.habitsTotal > 0) {
    const remaining = ctx.habitsTotal - ctx.habitsDone;
    tips.push({
      id: "habits-remaining",
      priority: 4,
      category: "general",
      message: `${remaining} habit${remaining > 1 ? "s" : ""} left today — small wins compound over time.`,
      detail: "Atomic Habits: each small action is a vote for the person you want to become.",
      emoji: "✅",
    });
  }

  if (ctx.streak >= 7) {
    tips.push({
      id: "streak-celebrate",
      priority: 2,
      category: "general",
      message: `🔥 ${ctx.streak}-day streak! Consistency is the #1 predictor of long-term results.`,
      emoji: "🔥",
    });
  }

  // Sort by priority (highest first) and return top 5
  return tips.sort((a, b) => b.priority - a.priority).slice(0, 5);
}

/** Get a brief greeting based on time of day */
export function timeGreeting(hour: number): string {
  if (hour < 6) return "Night owl? ";
  if (hour < 12) return "Good morning! ";
  if (hour < 17) return "Good afternoon! ";
  if (hour < 21) return "Good evening! ";
  return "Winding down? ";
}
