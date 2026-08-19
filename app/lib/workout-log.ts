// Workout logging system — tracks actual workout completion, sets/reps/weight,
// adherence to the plan, and progressive overload trends.
//
// Source: ACSM 2025 Position Stand — progressive overload is the primary driver
// of strength and hypertrophy gains. Tracking volume (sets × reps × weight) over
// time enables data-driven program adjustments.

import { WEEK_PLAN, type PlanItem } from "@/app/lib/fitness";

export interface LoggedSet {
  reps: number;
  weightKg?: number; // bodyweight exercises omit this
  rpe?: number;      // Rate of Perceived Exertion (1–10)
  completed: boolean;
}

export interface LoggedExercise {
  exerciseIndex: number; // index into DayPlan.items
  exerciseName: string;
  target: string;
  sets: LoggedSet[];
  notes?: string;
  timestamp: number; // Date.now()
}

export interface WorkoutLog {
  date: string; // YYYY-MM-DD
  dayIndex: number; // index into WEEK_PLAN
  exercises: LoggedExercise[];
  durationMin: number;
  caloriesBurned: number;
  completed: boolean;
  notes?: string;
}

export interface ExerciseHistory {
  exerciseName: string;
  target: string;
  sessions: {
    date: string;
    bestSet: { reps: number; weightKg?: number };
    totalVolume: number; // sum of (reps × weight) for all sets
    sets: number;
  }[];
  personalRecord?: {
    reps: number;
    weightKg?: number;
    date: string;
  };
}

export interface OverloadTrend {
  exerciseName: string;
  direction: "increasing" | "decreasing" | "plateau";
  volumeChangePercent: number;
  recommendation: string;
}

// ── Storage keys ─────────────────────────────────────────────────────────
const STORAGE_KEY = "lifeos-workout-log";

function getLogs(): WorkoutLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLogs(logs: WorkoutLog[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

// ── Log a completed workout ──────────────────────────────────────────────
export function logWorkout(log: WorkoutLog): void {
  const logs = getLogs();
  // Replace if same date + dayIndex already logged
  const existing = logs.findIndex(
    (l) => l.date === log.date && l.dayIndex === log.dayIndex
  );
  if (existing >= 0) {
    logs[existing] = log;
  } else {
    logs.push(log);
  }
  saveLogs(logs);
}

export function deleteWorkoutLog(date: string, dayIndex: number): void {
  const logs = getLogs().filter(
    (l) => !(l.date === date && l.dayIndex === dayIndex)
  );
  saveLogs(logs);
}

// ── Get logs for a date range ────────────────────────────────────────────
export function getLogsBetween(startDate: string, endDate: string): WorkoutLog[] {
  return getLogs().filter((l) => l.date >= startDate && l.date <= endDate);
}

export function getLogsForDate(date: string): WorkoutLog[] {
  return getLogs().filter((l) => l.date === date);
}

export function getLogsForDay(dayIndex: number): WorkoutLog[] {
  return getLogs().filter((l) => l.dayIndex === dayIndex);
}

// ── Adherence score (% of planned workouts completed) ────────────────────
export function adherenceScore(weeksBack: number = 1): {
  score: number;
  completed: number;
  planned: number;
  detail: string;
} {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - weeksBack * 7);
  
  const logs = getLogsBetween(
    startDate.toISOString().split("T")[0],
    now.toISOString().split("T")[0]
  );
  
  // Count planned workout days (exclude Sunday rest day)
  const plannedDays = WEEK_PLAN.filter((d) => (d.totalMin ?? 0) > 0).length * weeksBack;
  const completedDays = new Set(
    logs.filter((l) => l.completed).map((l) => l.date)
  ).size;
  
  const score = plannedDays > 0 ? Math.round((completedDays / plannedDays) * 100) : 0;
  
  let detail = "";
  if (score >= 90) detail = "Excellent adherence! 💪";
  else if (score >= 70) detail = "Good consistency — keep it up!";
  else if (score >= 50) detail = "Moderate — try to hit 4+ days/week.";
  else detail = "Low adherence — even 2 days/week makes a difference.";
  
  return { score, completed: completedDays, planned: plannedDays, detail };
}

// ── Progressive overload tracker ─────────────────────────────────────────
export function exerciseHistory(exerciseName: string): ExerciseHistory {
  const logs = getLogs();
  const sessions: ExerciseHistory["sessions"] = [];
  
  for (const log of logs) {
    const exercise = log.exercises.find(
      (e) => e.exerciseName === exerciseName
    );
    if (!exercise) continue;
    
    const completedSets = exercise.sets.filter((s) => s.completed);
    if (completedSets.length === 0) continue;
    
    // Find best set (highest weight, then highest reps)
    const bestSet = completedSets.reduce((best, s) => {
      if (s.weightKg !== undefined && best.weightKg !== undefined) {
        if (s.weightKg > best.weightKg) return s;
        if (s.weightKg === best.weightKg && s.reps > best.reps) return s;
      }
      return s;
    }, completedSets[0]);
    
    // Total volume = sum(reps × weight) for all sets
    const totalVolume = completedSets.reduce((sum, s) => {
      const w = s.weightKg ?? 0; // bodyweight = 0 for volume calc
      return sum + s.reps * w;
    }, 0);
    
    sessions.push({
      date: log.date,
      bestSet: { reps: bestSet.reps, weightKg: bestSet.weightKg },
      totalVolume,
      sets: completedSets.length,
    });
  }
  
  // Sort by date
  sessions.sort((a, b) => a.date.localeCompare(b.date));
  
  // Compute PR (highest weight at any reps)
  let personalRecord: ExerciseHistory["personalRecord"];
  for (const s of sessions) {
    if (s.bestSet.weightKg !== undefined) {
      if (
        !personalRecord ||
        s.bestSet.weightKg > (personalRecord.weightKg ?? 0) ||
        (s.bestSet.weightKg === personalRecord.weightKg &&
          s.bestSet.reps > personalRecord.reps)
      ) {
        personalRecord = { ...s.bestSet, date: s.date };
      }
    }
  }
  
  const firstExercise = logs[0]?.exercises.find(
    (e) => e.exerciseName === exerciseName
  );
  
  return {
    exerciseName,
    target: firstExercise?.target ?? "",
    sessions,
    personalRecord,
  };
}

// ── Overload trend analysis ─────────────────────────────────────────────
export function overloadTrend(exerciseName: string): OverloadTrend {
  const history = exerciseHistory(exerciseName);
  const recent = history.sessions.slice(-4); // last 4 sessions
  
  if (recent.length < 2) {
    return {
      exerciseName,
      direction: "plateau",
      volumeChangePercent: 0,
      recommendation: "Need at least 2 sessions to assess trend.",
    };
  }
  
  const firstHalf = recent.slice(0, Math.ceil(recent.length / 2));
  const secondHalf = recent.slice(Math.ceil(recent.length / 2));
  
  const avgFirst = firstHalf.reduce((s, r) => s + r.totalVolume, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((s, r) => s + r.totalVolume, 0) / secondHalf.length;
  
  const changePercent = avgFirst > 0
    ? Math.round(((avgSecond - avgFirst) / avgFirst) * 100)
    : 0;
  
  let direction: OverloadTrend["direction"];
  let recommendation: string;
  
  if (changePercent > 5) {
    direction = "increasing";
    recommendation = "Great progress! Volume is trending up. Keep adding reps or weight.";
  } else if (changePercent < -5) {
    direction = "decreasing";
    recommendation = "Volume is declining. Consider a deload week or check recovery.";
  } else {
    direction = "plateau";
    recommendation = "Plateau detected. Try adding 1-2 reps per set or a harder variation.";
  }
  
  return { exerciseName, direction, volumeChangePercent: changePercent, recommendation };
}

// ── Weekly volume summary ───────────────────────────────────────────────
export function weeklyVolumeSummary(weeksBack: number = 1): {
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  exerciseCount: number;
  avgVolumePerExercise: number;
} {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - weeksBack * 7);
  
  const logs = getLogsBetween(
    startDate.toISOString().split("T")[0],
    now.toISOString().split("T")[0]
  );
  
  let totalVolume = 0;
  let totalSets = 0;
  let totalReps = 0;
  const exerciseNames = new Set<string>();
  
  for (const log of logs) {
    for (const exercise of log.exercises) {
      exerciseNames.add(exercise.exerciseName);
      for (const set of exercise.sets) {
        if (!set.completed) continue;
        totalSets++;
        totalReps += set.reps;
        totalVolume += set.reps * (set.weightKg ?? 0);
      }
    }
  }
  
  return {
    totalVolume: Math.round(totalVolume),
    totalSets,
    totalReps,
    exerciseCount: exerciseNames.size,
    avgVolumePerExercise: exerciseNames.size > 0
      ? Math.round(totalVolume / exerciseNames.size)
      : 0,
  };
}

// ── Today's workout status ──────────────────────────────────────────────
export function todayWorkoutStatus(): {
  logged: boolean;
  completed: boolean;
  exercisesLogged: number;
  totalExercises: number;
  caloriesBurned: number;
} {
  const today = new Date().toISOString().split("T")[0];
  const dayOfWeek = new Date().getDay(); // 0=Sun
  const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Map to WEEK_PLAN index
  
  const logs = getLogsForDate(today);
  const log = logs.find((l) => l.dayIndex === dayIndex);
  
  if (!log) {
    return {
      logged: false,
      completed: false,
      exercisesLogged: 0,
      totalExercises: WEEK_PLAN[dayIndex]?.items.length ?? 0,
      caloriesBurned: 0,
    };
  }
  
  return {
    logged: true,
    completed: log.completed,
    exercisesLogged: log.exercises.filter((e) => e.sets.some((s) => s.completed)).length,
    totalExercises: WEEK_PLAN[dayIndex]?.items.length ?? 0,
    caloriesBurned: log.caloriesBurned,
  };
}
