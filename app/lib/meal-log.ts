// Meal logging system — tracks actual food intake, compares to planned targets,
// and provides daily/weekly nutrition adherence metrics.
//
// Source: Paper #42 (Gamification) — logging actual meals significantly improves
// adherence to nutrition targets. Self-monitoring is the #1 predictor of dietary success.

import { foodById, type Food } from "@/app/lib/foods";
import { macrosFor, type Profile, type MacroResult } from "@/app/lib/macros";

export interface LoggedFood {
  foodId: string;
  grams: number;
  timestamp: number;
}

export interface MealLog {
  date: string; // YYYY-MM-DD
  meals: {
    slot: "breakfast" | "lunch" | "dinner" | "snack";
    foods: LoggedFood[];
  }[];
  waterMl: number;
  notes?: string;
}

export interface DailyNutrition {
  date: string;
  totalKcal: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
  waterMl: number;
  mealCount: number;
}

export interface NutritionAdherence {
  calorieAccuracy: number; // % of target
  proteinAccuracy: number; // % of target
  daysLogged: number;
  totalDays: number;
  avgCalorieAccuracy: number;
  avgProteinAccuracy: number;
}

// ── Storage ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "lifeos-meal-log";

function getMealLogs(): MealLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMealLogs(logs: MealLog[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

// ── Log food ────────────────────────────────────────────────────────────
export function logFood(date: string, slot: MealLog["meals"][0]["slot"], foodId: string, grams: number): void {
  const logs = getMealLogs();
  let dayLog = logs.find((l) => l.date === date);
  
  if (!dayLog) {
    dayLog = { date, meals: [], waterMl: 0 };
    logs.push(dayLog);
  }
  
  let meal = dayLog.meals.find((m) => m.slot === slot);
  if (!meal) {
    meal = { slot, foods: [] };
    dayLog.meals.push(meal);
  }
  
  meal.foods.push({ foodId, grams, timestamp: Date.now() });
  saveMealLogs(logs);
}

export function removeLoggedFood(date: string, slot: string, foodIndex: number): void {
  const logs = getMealLogs();
  const dayLog = logs.find((l) => l.date === date);
  if (!dayLog) return;
  
  const meal = dayLog.meals.find((m) => m.slot === slot);
  if (!meal) return;
  
  meal.foods.splice(foodIndex, 1);
  saveMealLogs(logs);
}

export function addWater(date: string, ml: number): void {
  const logs = getMealLogs();
  let dayLog = logs.find((l) => l.date === date);
  
  if (!dayLog) {
    dayLog = { date, meals: [], waterMl: 0 };
    logs.push(dayLog);
  }
  
  dayLog.waterMl = Math.max(0, dayLog.waterMl + ml);
  saveMealLogs(logs);
}

export function getWaterIntake(date: string): number {
  const logs = getMealLogs();
  const dayLog = logs.find((l) => l.date === date);
  return dayLog?.waterMl ?? 0;
}

// ── Daily totals ────────────────────────────────────────────────────────
export function dailyNutrition(date: string): DailyNutrition {
  const logs = getMealLogs();
  const dayLog = logs.find((l) => l.date === date);
  
  if (!dayLog) {
    return {
      date,
      totalKcal: 0,
      totalProteinG: 0,
      totalCarbsG: 0,
      totalFatG: 0,
      totalFiberG: 0,
      waterMl: 0,
      mealCount: 0,
    };
  }
  
  let totalKcal = 0;
  let totalProteinG = 0;
  let totalCarbsG = 0;
  let totalFatG = 0;
  let totalFiberG = 0;
  
  for (const meal of dayLog.meals) {
    for (const logged of meal.foods) {
      const food = foodById(logged.foodId);
      if (!food) continue;
      const k = logged.grams / 100;
      totalKcal += food.per100g.kcal * k;
      totalProteinG += food.per100g.proteinG * k;
      totalCarbsG += food.per100g.carbsG * k;
      totalFatG += food.per100g.fatG * k;
      totalFiberG += food.per100g.fiberG * k;
    }
  }
  
  return {
    date,
    totalKcal: Math.round(totalKcal),
    totalProteinG: Math.round(totalProteinG * 10) / 10,
    totalCarbsG: Math.round(totalCarbsG * 10) / 10,
    totalFatG: Math.round(totalFatG * 10) / 10,
    totalFiberG: Math.round(totalFiberG * 10) / 10,
    waterMl: dayLog.waterMl,
    mealCount: dayLog.meals.filter((m) => m.foods.length > 0).length,
  };
}

// ── Weekly adherence ────────────────────────────────────────────────────
export function weeklyAdherence(profile: Profile, weeksBack: number = 1): NutritionAdherence {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - weeksBack * 7);
  
  const targets = macrosFor(profile);
  const days: DailyNutrition[] = [];
  
  for (let i = 0; i < weeksBack * 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const nutrition = dailyNutrition(dateStr);
    if (nutrition.totalKcal > 0) days.push(nutrition);
  }
  
  if (days.length === 0) {
    return {
      calorieAccuracy: 0,
      proteinAccuracy: 0,
      daysLogged: 0,
      totalDays: weeksBack * 7,
      avgCalorieAccuracy: 0,
      avgProteinAccuracy: 0,
    };
  }
  
  let totalCalAccuracy = 0;
  let totalProtAccuracy = 0;
  
  for (const day of days) {
    totalCalAccuracy += Math.min(100, Math.round((day.totalKcal / targets.calories) * 100));
    totalProtAccuracy += Math.min(100, Math.round((day.totalProteinG / targets.proteinG) * 100));
  }
  
  return {
    calorieAccuracy: days.length > 0 ? Math.round(totalCalAccuracy / days.length) : 0,
    proteinAccuracy: days.length > 0 ? Math.round(totalProtAccuracy / days.length) : 0,
    daysLogged: days.length,
    totalDays: weeksBack * 7,
    avgCalorieAccuracy: Math.round(totalCalAccuracy / days.length),
    avgProteinAccuracy: Math.round(totalProtAccuracy / days.length),
  };
}

// ── Meal plan comparison ────────────────────────────────────────────────
export function compareWithTarget(
  date: string,
  profile: Profile
): {
  actual: DailyNutrition;
  target: MacroResult;
  calorieDiff: number;
  proteinDiff: number;
  carbDiff: number;
  fatDiff: number;
} {
  const actual = dailyNutrition(date);
  const target = macrosFor(profile);
  
  return {
    actual,
    target,
    calorieDiff: actual.totalKcal - target.calories,
    proteinDiff: Math.round((actual.totalProteinG - target.proteinG) * 10) / 10,
    carbDiff: Math.round((actual.totalCarbsG - target.carbsG) * 10) / 10,
    fatDiff: Math.round((actual.totalFatG - target.fatG) * 10) / 10,
  };
}

// ── Streak tracking ─────────────────────────────────────────────────────
export function mealLogStreak(): number {
  const logs = getMealLogs();
  const dates = [...new Set(logs.map((l) => l.date))].sort().reverse();
  
  if (dates.length === 0) return 0;
  
  let streak = 0;
  const today = new Date().toISOString().split("T")[0];
  let checkDate = new Date(today);
  
  // Check if today has a log
  const todayLog = logs.find((l) => l.date === today);
  if (!todayLog || todayLog.meals.every((m) => m.foods.length === 0)) {
    // Start from yesterday
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    const dayLog = logs.find((l) => l.date === dateStr);
    if (dayLog && dayLog.meals.some((m) => m.foods.length > 0)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}
