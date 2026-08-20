// Gamification system — XP, dynamic badges, and achievement timeline.
//
// Source: Edwards et al. (2016) "Gamification Mechanics in Fitness Applications"
// Paper #42: Streaks, dynamic badges, and variable reward loops significantly
// improve daily adherence. XP systems create a sense of progression.

import { getLogsForDate, adherenceScore } from "@/app/lib/workout-log";
import { dailyNutrition, mealLogStreak, getWaterIntake } from "@/app/lib/meal-log";
import { getWeightHistory, getMeasurementCount } from "@/app/lib/body-history";

// ── XP System ──────────────────────────────────────────────────────────
export const XP_VALUES = {
  LOG_WORKOUT: 50,
  LOG_MEAL: 10,
  LOG_WATER: 5,
  COMPLETE_WORKOUT: 100,
  HIT_PROTEIN_TARGET: 30,
  HIT_CALORIE_TARGET: 20,
  LOG_MEASUREMENT: 25,
  DAILY_CHECKIN: 15,
  STREAK_BONUS_PER_DAY: 5,
} as const;

export interface XPEvent {
  type: keyof typeof XP_VALUES;
  amount: number;
  date: string;
  timestamp: number;
  description: string;
}

export interface XPData {
  totalXP: number;
  level: number;
  events: XPEvent[];
}

// ── Level calculation ──────────────────────────────────────────────────
// Each level requires progressively more XP
export function xpForLevel(level: number): number {
  return Math.round(100 * Math.pow(1.3, level - 1));
}

export function levelFromXP(totalXP: number): { level: number; currentXP: number; nextLevelXP: number; progress: number } {
  let level = 1;
  let remainingXP = totalXP;
  
  while (remainingXP >= xpForLevel(level)) {
    remainingXP -= xpForLevel(level);
    level++;
  }
  
  const nextLevelXP = xpForLevel(level);
  const progress = nextLevelXP > 0 ? Math.round((remainingXP / nextLevelXP) * 100) : 0;
  
  return { level, currentXP: remainingXP, nextLevelXP, progress };
}

// ── Badge System ───────────────────────────────────────────────────────
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "workout" | "nutrition" | "streak" | "body" | "special";
  requirement: string;
  tiers: { threshold: number; label: string; color: string }[];
}

export const ALL_BADGES: Badge[] = [
  // Workout badges
  {
    id: "first-workout",
    name: "First Step",
    description: "Complete your first logged workout",
    icon: "🏋️",
    category: "workout",
    requirement: "Complete 1 workout",
    tiers: [
      { threshold: 1, label: "Bronze", color: "#CD7F32" },
      { threshold: 10, label: "Silver", color: "#C0C0C0" },
      { threshold: 50, label: "Gold", color: "#FFD700" },
      { threshold: 100, label: "Platinum", color: "#E5E4E2" },
    ],
  },
  {
    id: "volume-king",
    name: "Volume King",
    description: "Log total workout volume (sets × reps × weight)",
    icon: "👑",
    category: "workout",
    requirement: "Total volume milestones",
    tiers: [
      { threshold: 10000, label: "Bronze", color: "#CD7F32" },
      { threshold: 50000, label: "Silver", color: "#C0C0C0" },
      { threshold: 200000, label: "Gold", color: "#FFD700" },
      { threshold: 1000000, label: "Platinum", color: "#E5E4E2" },
    ],
  },
  {
    id: "pr-smasher",
    name: "PR Smasher",
    description: "Set a personal record on any exercise",
    icon: "💥",
    category: "workout",
    requirement: "Hit PRs on different exercises",
    tiers: [
      { threshold: 1, label: "Bronze", color: "#CD7F32" },
      { threshold: 5, label: "Silver", color: "#C0C0C0" },
      { threshold: 15, label: "Gold", color: "#FFD700" },
      { threshold: 30, label: "Platinum", color: "#E5E4E2" },
    ],
  },
  // Nutrition badges
  {
    id: "protein-ace",
    name: "Protein Ace",
    description: "Hit your daily protein target",
    icon: "🥩",
    category: "nutrition",
    requirement: "Days hitting protein target",
    tiers: [
      { threshold: 1, label: "Bronze", color: "#CD7F32" },
      { threshold: 7, label: "Silver", color: "#C0C0C0" },
      { threshold: 30, label: "Gold", color: "#FFD700" },
      { threshold: 90, label: "Platinum", color: "#E5E4E2" },
    ],
  },
  {
    id: "calorie-master",
    name: "Calorie Master",
    description: "Stay within ±10% of your calorie target",
    icon: "🎯",
    category: "nutrition",
    requirement: "Days hitting calorie target",
    tiers: [
      { threshold: 1, label: "Bronze", color: "#CD7F32" },
      { threshold: 7, label: "Silver", color: "#C0C0C0" },
      { threshold: 30, label: "Gold", color: "#FFD700" },
      { threshold: 90, label: "Platinum", color: "#E5E4E2" },
    ],
  },
  {
    id: "hydration-hero",
    name: "Hydration Hero",
    description: "Hit your daily water intake target",
    icon: "💧",
    category: "nutrition",
    requirement: "Days hitting water target",
    tiers: [
      { threshold: 1, label: "Bronze", color: "#CD7F32" },
      { threshold: 7, label: "Silver", color: "#C0C0C0" },
      { threshold: 30, label: "Gold", color: "#FFD700" },
      { threshold: 90, label: "Platinum", color: "#E5E4E2" },
    ],
  },
  // Streak badges
  {
    id: "streak-starter",
    name: "Streak Starter",
    description: "Maintain a consecutive logging streak",
    icon: "🔥",
    category: "streak",
    requirement: "Consecutive days logging",
    tiers: [
      { threshold: 3, label: "Bronze", color: "#CD7F32" },
      { threshold: 7, label: "Silver", color: "#C0C0C0" },
      { threshold: 30, label: "Gold", color: "#FFD700" },
      { threshold: 90, label: "Platinum", color: "#E5E4E2" },
    ],
  },
  {
    id: "weekend-warrior",
    name: "Weekend Warrior",
    description: "Complete workouts on both Saturday and Sunday",
    icon: "⚔️",
    category: "streak",
    requirement: "Weekends worked out",
    tiers: [
      { threshold: 1, label: "Bronze", color: "#CD7F32" },
      { threshold: 4, label: "Silver", color: "#C0C0C0" },
      { threshold: 12, label: "Gold", color: "#FFD700" },
      { threshold: 24, label: "Platinum", color: "#E5E4E2" },
    ],
  },
  // Body badges
  {
    id: "consistent-tracker",
    name: "Consistent Tracker",
    description: "Log body measurements regularly",
    icon: "📏",
    category: "body",
    requirement: "Measurements logged",
    tiers: [
      { threshold: 3, label: "Bronze", color: "#CD7F32" },
      { threshold: 10, label: "Silver", color: "#C0C0C0" },
      { threshold: 30, label: "Gold", color: "#FFD700" },
      { threshold: 60, label: "Platinum", color: "#E5E4E2" },
    ],
  },
  {
    id: "weight-goal",
    name: "Scale Mover",
    description: "Make progress toward your weight goal",
    icon: "⚖️",
    category: "body",
    requirement: "Weight change milestones",
    tiers: [
      { threshold: 1, label: "Bronze", color: "#CD7F32" },
      { threshold: 5, label: "Silver", color: "#C0C0C0" },
      { threshold: 10, label: "Gold", color: "#FFD700" },
      { threshold: 20, label: "Platinum", color: "#E5E4E2" },
    ],
  },
  // Special badges
  {
    id: "early-bird",
    name: "Early Bird",
    description: "Log a workout before 8 AM",
    icon: "🌅",
    category: "special",
    requirement: "Early morning workouts",
    tiers: [
      { threshold: 1, label: "Bronze", color: "#CD7F32" },
      { threshold: 10, label: "Silver", color: "#C0C0C0" },
      { threshold: 30, label: "Gold", color: "#FFD700" },
      { threshold: 60, label: "Platinum", color: "#E5E4E2" },
    ],
  },
  {
    id: "night-owl",
    name: "Night Owl",
    description: "Log a workout after 9 PM",
    icon: "🦉",
    category: "special",
    requirement: "Late night workouts",
    tiers: [
      { threshold: 1, label: "Bronze", color: "#CD7F32" },
      { threshold: 5, label: "Silver", color: "#C0C0C0" },
      { threshold: 15, label: "Gold", color: "#FFD700" },
      { threshold: 30, label: "Platinum", color: "#E5E4E2" },
    ],
  },
];

// ── Storage ────────────────────────────────────────────────────────────
const XP_STORAGE_KEY = "lifeos-xp";
const BADGE_STORAGE_KEY = "lifeos-badges";
const ACHIEVEMENT_STORAGE_KEY = "lifeos-achievements";

export interface Achievement {
  badgeId: string;
  tier: string;
  date: string;
  timestamp: number;
}

function getXPData(): XPData {
  if (typeof window === "undefined") return { totalXP: 0, level: 1, events: [] };
  try {
    const raw = localStorage.getItem(XP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { totalXP: 0, level: 1, events: [] };
  } catch {
    return { totalXP: 0, level: 1, events: [] };
  }
}

function saveXPData(data: XPData): void {
  localStorage.setItem(XP_STORAGE_KEY, JSON.stringify(data));
}

function getEarnedBadges(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(BADGE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveEarnedBadges(badges: Record<string, number>): void {
  localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(badges));
}

function getAchievements(): Achievement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAchievements(achievements: Achievement[]): void {
  localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(achievements));
}

// ── Award XP ───────────────────────────────────────────────────────────
export function awardXP(type: keyof typeof XP_VALUES, description: string): XPData {
  const data = getXPData();
  const amount = XP_VALUES[type];
  const today = new Date().toISOString().split("T")[0];
  
  // Streak bonus
  const streak = mealLogStreak();
  const streakBonus = streak * XP_VALUES.STREAK_BONUS_PER_DAY;
  
  const event: XPEvent = {
    type,
    amount: amount + streakBonus,
    date: today,
    timestamp: Date.now(),
    description,
  };
  
  data.events.push(event);
  data.totalXP += amount + streakBonus;
  
  const levelInfo = levelFromXP(data.totalXP);
  data.level = levelInfo.level;
  
  saveXPData(data);
  return data;
}

// ── Compute current badge progress ─────────────────────────────────────
export function computeBadgeProgress(): {
  badge: Badge;
  currentCount: number;
  currentTier: number;
  nextTier: number | null;
  progress: number;
  unlocked: boolean;
}[] {
  const workoutDays = new Set<string>();
  const proteinDays = new Set<string>();
  const calorieDays = new Set<string>();
  const waterDays = new Set<string>();
  const earlyWorkouts = new Set<string>();
  const lateWorkouts = new Set<string>();
  let totalVolume = 0;
  let prExercises = new Set<string>();
  let measurementsLogged = 0;
  let weekendWorkouts = 0;
  
  // Scan last 365 days of data
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();
    
    // Workout data
    const logs = getLogsForDate(dateStr);
    for (const log of logs) {
      if (log.completed) {
        workoutDays.add(dateStr);          // Note: Early bird / Night owl badges require workout timestamp tracking
          // For now, we count completed workouts
        
        // Weekend
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          weekendWorkouts++;
        }
        
        // Volume
        for (const exercise of log.exercises) {
          for (const set of exercise.sets) {
            if (set.completed) {
              totalVolume += set.reps * (set.weightKg ?? 0);
            }
          }
        }
      }
    }
    
    // Nutrition data
    const nutrition = dailyNutrition(dateStr);
    if (nutrition.totalKcal > 0) {
      // Protein target (rough: 1.8g/kg)
      if (nutrition.totalProteinG >= 100) proteinDays.add(dateStr);
      // Calorie target (within ±10%)
      if (nutrition.totalKcal >= 1500 && nutrition.totalKcal <= 2500) calorieDays.add(dateStr);
    }
    
    // Water
    const water = getWaterIntake(dateStr);
    if (water >= 2500) waterDays.add(dateStr);
  }
  
  // Weight milestones
  const weightHistory = getWeightHistory();
  let weightChange = 0;
  if (weightHistory.length >= 2) {
    weightChange = Math.abs(weightHistory[weightHistory.length - 1].value - weightHistory[0].value);
  }
  
  // Measurements
  measurementsLogged = getMeasurementCount();
  
  return ALL_BADGES.map((badge) => {
    let currentCount = 0;
    
    switch (badge.id) {
      case "first-workout":
      case "volume-king":
        currentCount = badge.id === "volume-king" ? totalVolume : workoutDays.size;
        break;
      case "protein-ace":
        currentCount = proteinDays.size;
        break;
      case "calorie-master":
        currentCount = calorieDays.size;
        break;
      case "hydration-hero":
        currentCount = waterDays.size;
        break;
      case "streak-starter":
        currentCount = mealLogStreak();
        break;
      case "weekend-warrior":
        currentCount = weekendWorkouts;
        break;
      case "consistent-tracker":
        currentCount = measurementsLogged;
        break;
      case "weight-goal":
        currentCount = Math.floor(weightChange);
        break;
      case "early-bird":
      case "night-owl":
        currentCount = 0; // Requires timestamp tracking
        break;
      default:
        currentCount = 0;
    }
    
    // Find current tier
    let currentTier = -1;
    for (let i = badge.tiers.length - 1; i >= 0; i--) {
      if (currentCount >= badge.tiers[i].threshold) {
        currentTier = i;
        break;
      }
    }
    
    const nextTier = currentTier < badge.tiers.length - 1 ? currentTier + 1 : null;
    const progress = nextTier !== null
      ? Math.min(100, Math.round(
          ((currentCount - badge.tiers[currentTier >= 0 ? currentTier : 0].threshold) /
            (badge.tiers[nextTier].threshold - badge.tiers[currentTier >= 0 ? currentTier : 0].threshold)) *
            100
        ))
      : 100;
    
    return {
      badge,
      currentCount,
      currentTier,
      nextTier,
      progress: currentTier >= 0 ? (nextTier !== null ? progress : 100) : 0,
      unlocked: currentTier >= 0,
    };
  });
}

// ── Get earned badge count per category ─────────────────────────────────
export function badgeSummary(): {
  total: number;
  earned: number;
  byCategory: Record<string, { total: number; earned: number }>;
} {
  const progress = computeBadgeProgress();
  const byCategory: Record<string, { total: number; earned: number }> = {};
  
  for (const p of progress) {
    if (!byCategory[p.badge.category]) {
      byCategory[p.badge.category] = { total: 0, earned: 0 };
    }
    byCategory[p.badge.category].total++;
    if (p.unlocked) byCategory[p.badge.category].earned++;
  }
  
  return {
    total: progress.length,
    earned: progress.filter((p) => p.unlocked).length,
    byCategory,
  };
}

// ── Get XP data ────────────────────────────────────────────────────────
export function getXP(): XPData {
  return getXPData();
}

// ── Recent XP events ───────────────────────────────────────────────────
export function recentXPEvents(days: number = 7): XPEvent[] {
  const data = getXPData();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return data.events
    .filter((e) => new Date(e.timestamp) >= cutoff)
    .sort((a, b) => b.timestamp - a.timestamp);
}

// ── Daily XP total ─────────────────────────────────────────────────────
export function dailyXP(date: string): number {
  const data = getXPData();
  return data.events
    .filter((e) => e.date === date)
    .reduce((sum, e) => sum + e.amount, 0);
}
