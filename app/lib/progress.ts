// Weekly check-in tracking — weight, waist, and body-fat trends, stored locally.

export interface CheckIn {
  date: string; // local date YYYY-MM-DD
  weightKg?: number;
  waistCm?: number;
  bodyFatPct?: number;
}

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Insert or update today's check-in, keeping history sorted oldest → newest. */
export function upsertCheckIn(history: CheckIn[], entry: CheckIn): CheckIn[] {
  const withoutToday = history.filter((c) => c.date !== entry.date);
  return [...withoutToday, entry].sort((a, b) => a.date.localeCompare(b.date));
}

/** Last `n` check-ins that have a value for `key`, oldest first. */
export function trend(history: CheckIn[], key: keyof CheckIn, n = 8): { date: string; value: number }[] {
  return history
    .filter((c) => typeof c[key] === "number")
    .slice(-n)
    .map((c) => ({ date: c.date, value: c[key] as number }));
}

export function latest(history: CheckIn[], key: keyof CheckIn): number | undefined {
  for (let i = history.length - 1; i >= 0; i--) {
    const v = history[i][key];
    if (typeof v === "number") return v;
  }
  return undefined;
}

// ── Recovery / Readiness Score (Paper #37: Plews et al. 2013) ──────────────
// Simplified model without HRV sensor:
//   Recovery = 0.4 × SleepScore + 0.3 × TrainingAdherence + 0.3 × RestCompliance
// SleepScore: 0–100 from sleep quality (efficiency + duration)
// TrainingAdherence: % of planned workouts completed this week (0–100)
// RestCompliance: 100 if rest day taken, 70 if not, 0 if 7+ consecutive active days

export interface RecoveryInput {
  /** Sleep quality score 0–100 (from computeSleepQuality) */
  sleepScore: number;
  /** Number of planned workouts completed this week (0–6) */
  workoutsCompleted: number;
  /** Total planned workouts this week (typically 6) */
  workoutsPlanned: number;
  /** Whether today is a rest day */
  isRestDay: boolean;
  /** Consecutive active days without rest (0 if rest day taken) */
  consecutiveActiveDays: number;
}

export interface RecoveryResult {
  /** Overall recovery score 0–100 */
  score: number;
  /** Rating */
  rating: "ready" | "caution" | "rest";
  /** Human-readable summary */
  summary: string;
  /** Individual component scores */
  components: {
    sleep: number;
    training: number;
    rest: number;
  };
}

export function computeRecovery(input: RecoveryInput): RecoveryResult {
  // Sleep component (40%)
  const sleepComponent = Math.min(100, input.sleepScore);

  // Training adherence (30%)
  const trainingPct = input.workoutsPlanned > 0
    ? Math.min(100, (input.workoutsCompleted / input.workoutsPlanned) * 100)
    : 100;
  const trainingComponent = trainingPct;

  // Rest compliance (30%)
  let restComponent: number;
  if (input.isRestDay) {
    restComponent = 100;
  } else if (input.consecutiveActiveDays >= 7) {
    restComponent = 0; // No rest in 7+ days — overtraining risk
  } else if (input.consecutiveActiveDays >= 5) {
    restComponent = 50; // Should rest soon
  } else {
    restComponent = 80; // Normal active streak
  }

  const score = Math.round(
    sleepComponent * 0.4 +
    trainingComponent * 0.3 +
    restComponent * 0.3
  );

  let rating: RecoveryResult["rating"];
  let summary: string;

  if (score >= 75) {
    rating = "ready";
    summary = "You're well-recovered. Ready for a challenging session.";
  } else if (score >= 50) {
    rating = "caution";
    summary = "Moderate recovery. Consider a lighter session or extra rest.";
  } else {
    rating = "rest";
    summary = "Low recovery. Prioritize rest and sleep today.";
  }

  if (input.consecutiveActiveDays >= 6 && !input.isRestDay) {
    summary += " You've been active 6+ days — rest is overdue.";
  }

  return {
    score,
    rating,
    summary,
    components: {
      sleep: Math.round(sleepComponent),
      training: Math.round(trainingComponent),
      rest: Math.round(restComponent),
    },
  };
}
