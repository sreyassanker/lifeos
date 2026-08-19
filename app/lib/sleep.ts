// Sleep science helpers, based on:
// - 90-minute sleep cycles (Harvard, Sleep Foundation, Sleep Charity;
//   Bes et al. 2023 confirmed ultradian NREM-REM cycling ~90 min in adults)
// - Adults 18-60 need 7-9h; most need 5-6 full cycles (7.5-9h)
// - ~15 min average to fall asleep (Healthline method)
// - Ambient heat (>30°C) degrades sleep quality: reduces deep sleep and REM,
//   increases wake after sleep onset (Chevance et al. 2024).
//   Recommendation: keep bedroom at 18-20°C (65-68°F).
// - Consistent sleep schedule is the single strongest predictor of sleep quality.
//   Morning sunlight within 1h of waking anchors circadian rhythm.

export const CYCLE_MINUTES = 90;
export const FALL_ASLEEP_MINUTES = 15;

export interface SleepTime {
  label: string;
  value: string; // "HH:MM" 24h
}

function minutesToLabel(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Given a wake-up time "HH:MM", return bedtimes for 5 and 6 sleep cycles. */
export function bedtimesForWake(wake: string): SleepTime[] {
  const [h, m] = wake.split(":").map(Number);
  const wakeMinutes = h * 60 + m;
  return [5, 6].map((cycles) => {
    const total = cycles * CYCLE_MINUTES + FALL_ASLEEP_MINUTES;
    const bedtime = (wakeMinutes - total + 24 * 60) % (24 * 60);
    return { label: `${cycles} cycles · ${(cycles * CYCLE_MINUTES) / 60}h sleep`, value: minutesToLabel(bedtime) };
  });
}

/** Given a bedtime "HH:MM", return wake times for 5 and 6 sleep cycles. */
export function wakeTimesForBed(bed: string): SleepTime[] {
  const [h, m] = bed.split(":").map(Number);
  const bedMinutes = h * 60 + m;
  return [5, 6].map((cycles) => {
    const total = cycles * CYCLE_MINUTES + FALL_ASLEEP_MINUTES;
    const wakeMinutes = (bedMinutes + total) % (24 * 60);
    return { label: `${cycles} cycles · ${(cycles * CYCLE_MINUTES) / 60}h sleep`, value: minutesToLabel(wakeMinutes) };
  });
}

export interface AgeBand {
  age: string;
  hours: string;
}

export const SLEEP_NEEDS: AgeBand[] = [
  { age: "18–60", hours: "7–9 hours (ideal: 7.5–8.5)" },
  { age: "61–64", hours: "7–9 hours" },
  { age: "65+", hours: "7–8 hours" },
];

export interface SleepPosition {
  name: string;
  verdict: "Best" | "Good" | "Avoid if…" | "Not ideal";
  summary: string;
  tips: string[];
}

export const SLEEP_POSITIONS: SleepPosition[] = [
  {
    name: "Side (left or right)",
    verdict: "Best",
    summary:
      "The evidence consistently favors side sleeping: it keeps airways open (reduces snoring and mild sleep apnea) and relieves back pain. A 2022 study found people who preferred right-side lying and turned less at night reported better sleep quality.",
    tips: [
      "Place a pillow between your knees to keep your hips and spine aligned.",
      "Use a supportive pillow that keeps your neck in line with your spine.",
      "Left side can help acid reflux; right side is fine for most people.",
    ],
  },
  {
    name: "Back (supine)",
    verdict: "Avoid if…",
    summary:
      "Good for spinal alignment, but the tongue and soft palate can collapse backward — which worsens snoring and sleep apnea. Not recommended if you snore or have apnea.",
    tips: [
      "If you must sleep on your back, a thin pillow under the knees helps the lower back.",
      "Skip it if you snore — side sleeping is the fix.",
    ],
  },
  {
    name: "Stomach (prone)",
    verdict: "Not ideal",
    summary:
      "Can help keep airways open for some, but forces the neck into rotation for hours and stresses the lower back — most experts recommend against it.",
    tips: [
      "If you can't give it up, use a very flat pillow or none, and a pillow under the pelvis.",
      "Gradually train yourself to side sleeping.",
    ],
  },
];

export interface HygieneItem {
  label: string;
  detail: string;
}

// ── Sleep quality scoring (Paper #34: AASM Manual) ───────────────────────
// Sleep efficiency = (time asleep / time in bed) × 100
// Quality rating based on efficiency + duration:
//   Excellent: ≥90% efficiency + 7–9h sleep
//   Good: ≥85% efficiency + 6.5–9h
//   Fair: ≥75% efficiency + 6–9h
//   Poor: <75% efficiency OR <6h sleep

export interface SleepQualityInput {
  bedTime: string;    // "HH:MM" 24h
  wakeTime: string;   // "HH:MM" 24h
  /** Minutes to fall asleep (default 15) */
  fallAsleepMin?: number;
  /** Number of awakenings during the night */
  awakenings?: number;
}

export interface SleepQualityResult {
  /** Total time in bed (minutes) */
  timeInBedMin: number;
  /** Estimated time asleep (minutes) */
  timeAsleepMin: number;
  /** Sleep efficiency percentage */
  efficiency: number;
  /** Number of complete sleep cycles (90 min each) */
  cycles: number;
  /** Quality rating */
  rating: "excellent" | "good" | "fair" | "poor";
  /** Human-readable summary */
  summary: string;
  /** Score 0–100 */
  score: number;
}

function parseTime(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function computeSleepQuality(input: SleepQualityInput): SleepQualityResult {
  let bedMin = parseTime(input.bedTime);
  let wakeMin = parseTime(input.wakeTime);
  if (wakeMin <= bedMin) wakeMin += 24 * 60; // crosses midnight

  const timeInBedMin = wakeMin - bedMin;
  const fallAsleep = input.fallAsleepMin ?? 15;
  const awakenings = input.awakenings ?? 0;
  const awakeningsMin = awakenings * 5; // ~5 min per awakening
  const timeAsleepMin = Math.max(0, timeInBedMin - fallAsleep - awakeningsMin);
  const efficiency = timeInBedMin > 0 ? Math.round((timeAsleepMin / timeInBedMin) * 100) : 0;
  const cycles = Math.floor(timeAsleepMin / 90);
  const hoursAsleep = timeAsleepMin / 60;

  let rating: SleepQualityResult["rating"];
  let score: number;

  if (efficiency >= 90 && hoursAsleep >= 7 && hoursAsleep <= 9) {
    rating = "excellent";
    score = 95;
  } else if (efficiency >= 85 && hoursAsleep >= 6.5 && hoursAsleep <= 9.5) {
    rating = "good";
    score = 80;
  } else if (efficiency >= 75 && hoursAsleep >= 6) {
    rating = "fair";
    score = 60;
  } else {
    rating = "poor";
    score = Math.max(20, Math.round(efficiency * 0.5 + Math.min(hoursAsleep, 8) * 5));
  }

  // Adjust score for awakenings
  score = Math.max(10, score - awakenings * 3);

  const summary = rating === "excellent"
    ? `${hoursAsleep.toFixed(1)}h sleep, ${efficiency}% efficiency, ${cycles} cycles — excellent quality. You're well-rested.`
    : rating === "good"
    ? `${hoursAsleep.toFixed(1)}h sleep, ${efficiency}% efficiency, ${cycles} cycles — solid sleep. ${awakenings > 0 ? `Try to reduce ${awakenings} awakenings.` : ""}`
    : rating === "fair"
    ? `${hoursAsleep.toFixed(1)}h sleep, ${efficiency}% efficiency — fair quality. ${hoursAsleep < 7 ? "Aim for 7–9h." : "Focus on reducing awakenings."}`
    : `${hoursAsleep.toFixed(1)}h sleep, ${efficiency}% efficiency — poor quality. Review your sleep hygiene checklist.`;

  return { timeInBedMin, timeAsleepMin, efficiency, cycles, rating, summary, score };
}

// ── Circadian alignment score (Paper #35: Smets et al. 2020) ─────────────
// Circadian regularity = how consistent your wake time is day-to-day.
// More regular = better sleep quality and hormonal alignment.
// Metric: coefficient of variation (CV) of wake times over the past week.
// Score 0-100: 100 = perfectly consistent, 0 = highly variable.

export interface CircadianInput {
  /** Array of recent wake times in minutes since midnight (e.g., 420 = 7:00) */
  wakeTimesMin: number[];
}

export interface CircadianResult {
  /** Regularity score 0-100 */
  score: number;
  /** Average wake time (HH:MM) */
  avgWakeTime: string;
  /** Standard deviation in minutes */
  stdDevMin: number;
  /** Rating */
  rating: "excellent" | "good" | "fair" | "poor";
  /** Human-readable summary */
  summary: string;
}

export function computeCircadianRegularity(input: CircadianInput): CircadianResult | null {
  const { wakeTimesMin } = input;
  if (wakeTimesMin.length < 3) return null;

  const avg = wakeTimesMin.reduce((a, b) => a + b, 0) / wakeTimesMin.length;
  const variance = wakeTimesMin.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / wakeTimesMin.length;
  const stdDev = Math.sqrt(variance);

  // Convert avg to HH:MM
  const avgH = Math.floor(avg / 60) % 24;
  const avgM = Math.round(avg % 60);
  const avgWakeTime = `${String(avgH).padStart(2, "0")}:${String(avgM).padStart(2, "0")}`;

  // Score: stdDev of 0 min = 100, stdDev of 60+ min = 0
  const score = Math.max(0, Math.min(100, Math.round(100 - (stdDev / 60) * 100)));

  let rating: CircadianResult["rating"];
  let summary: string;

  if (score >= 90) {
    rating = "excellent";
    summary = `Wake time is very consistent (±${Math.round(stdDev)} min). Your circadian rhythm is well-anchored.`;
  } else if (score >= 70) {
    rating = "good";
    summary = `Wake time varies by ±${Math.round(stdDev)} min — pretty consistent. Small improvements help.`;
  } else if (score >= 50) {
    rating = "fair";
    summary = `Wake time varies by ±${Math.round(stdDev)} min — try to wake within a 30-minute window.`;
  } else {
    rating = "poor";
    summary = `Wake time varies by ±${Math.round(stdDev)} min — irregular schedule disrupts circadian rhythm.`;
  }

  return { score, avgWakeTime, stdDevMin: Math.round(stdDev), rating, summary };
}

export const SLEEP_HYGIENE: HygieneItem[] = [
  {
    label: "Consistent schedule",
    detail:
      "Wake up and go to bed at the same time every day — even weekends. Regularity is one of the strongest predictors of good sleep.",
  },
  {
    label: "Morning sunlight",
    detail:
      "Get 10–15 min of outdoor light within an hour of waking to anchor your circadian rhythm and improve sleep that night.",
  },
  {
    label: "No caffeine after lunch",
    detail:
      "Caffeine has a ~6-hour half-life. A 3 PM coffee still has half its effect at 9 PM. Cut off caffeine 8–10 hours before bed.",
  },
  {
    label: "Dinner ≥3 hours before bed",
    detail: "Finish evening meals at least 3 hours before bedtime (Harvard).",
  },
  {
    label: "No alcohol in the evening",
    detail: "Alcohol fragments sleep and suppresses REM, even though it makes you drowsy.",
  },
  {
    label: "Wind down 30 minutes",
    detail: "Budget 30 minutes of relaxing, low-light wind-down before bed — no screens.",
  },
  {
    label: "Cool, dark, quiet room",
    detail: "Keep the bedroom around 18–20 °C (65–68 °F), dark, and quiet.",
  },
  {
    label: "Exercise earlier",
    detail: "Regular exercise improves sleep, but finish intense workouts at least ~4 hours before bed.",
  },
  {
    label: "Short naps only",
    detail: "If you nap, keep it under ~20–30 minutes and before mid-afternoon.",
  },
];
