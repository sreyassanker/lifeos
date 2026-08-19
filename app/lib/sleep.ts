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
