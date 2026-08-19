// Body measurement history — tracks weight, body fat %, and measurements over time.
// Provides trend analysis, milestone alerts, and weekly/monthly comparisons.

import type { Measurements } from "@/app/lib/body";

export interface MeasurementEntry {
  date: string; // YYYY-MM-DD
  weightKg?: number;
  bodyFatPercent?: number;
  measurements?: Partial<Measurements>;
  notes?: string;
  timestamp: number;
}

export interface WeightTrend {
  direction: "losing" | "gaining" | "stable";
  rateKgPerWeek: number;
  periodDays: number;
}

export interface BodyfatTrend {
  direction: "decreasing" | "increasing" | "stable";
  changePercent: number;
  periodDays: number;
}

export interface Milestone {
  type: "weight" | "bodyfat" | "measurement";
  label: string;
  value: string;
  date: string;
  icon: string;
}

// ── Storage ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "lifeos-body-history";

function getEntries(): MeasurementEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: MeasurementEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// ── Add entry ───────────────────────────────────────────────────────────
export function addMeasurement(entry: Omit<MeasurementEntry, "timestamp">): void {
  const entries = getEntries();
  // Replace if same date
  const existing = entries.findIndex((e) => e.date === entry.date);
  const fullEntry: MeasurementEntry = { ...entry, timestamp: Date.now() };
  if (existing >= 0) {
    entries[existing] = fullEntry;
  } else {
    entries.push(fullEntry);
  }
  entries.sort((a, b) => a.date.localeCompare(b.date));
  saveEntries(entries);
}

// ── Get entries ─────────────────────────────────────────────────────────
export function getMeasurementsBetween(start: string, end: string): MeasurementEntry[] {
  return getEntries().filter((e) => e.date >= start && e.date <= end);
}

export function getLatestWeight(): MeasurementEntry | undefined {
  const entries = getEntries().filter((e) => e.weightKg !== undefined);
  return entries[entries.length - 1];
}

export function getWeightHistory(): { date: string; value: number }[] {
  return getEntries()
    .filter((e) => e.weightKg !== undefined)
    .map((e) => ({ date: e.date, value: e.weightKg! }));
}

export function getBodyFatHistory(): { date: string; value: number }[] {
  return getEntries()
    .filter((e) => e.bodyFatPercent !== undefined)
    .map((e) => ({ date: e.date, value: e.bodyFatPercent! }));
}

// ── Trend analysis ──────────────────────────────────────────────────────
export function weightTrend(weeksBack: number = 4): WeightTrend {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - weeksBack * 7);

  const entries = getEntries().filter(
    (e) =>
      e.weightKg !== undefined &&
      e.date >= start.toISOString().split("T")[0]
  );

  if (entries.length < 2) {
    return { direction: "stable", rateKgPerWeek: 0, periodDays: weeksBack * 7 };
  }

  const first = entries[0];
  const last = entries[entries.length - 1];
  const daysDiff =
    (new Date(last.date).getTime() - new Date(first.date).getTime()) /
    (1000 * 60 * 60 * 24);

  if (daysDiff < 1) {
    return { direction: "stable", rateKgPerWeek: 0, periodDays: 0 };
  }

  const weeksDiff = daysDiff / 7;
  const rate = (last.weightKg! - first.weightKg!) / weeksDiff;

  let direction: WeightTrend["direction"];
  if (rate < -0.1) direction = "losing";
  else if (rate > 0.1) direction = "gaining";
  else direction = "stable";

  return {
    direction,
    rateKgPerWeek: Math.round(rate * 100) / 100,
    periodDays: Math.round(daysDiff),
  };
}

export function bodyfatTrend(weeksBack: number = 4): BodyfatTrend {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - weeksBack * 7);

  const entries = getEntries().filter(
    (e) =>
      e.bodyFatPercent !== undefined &&
      e.date >= start.toISOString().split("T")[0]
  );

  if (entries.length < 2) {
    return { direction: "stable", changePercent: 0, periodDays: weeksBack * 7 };
  }

  const first = entries[0];
  const last = entries[entries.length - 1];
  const daysDiff =
    (new Date(last.date).getTime() - new Date(first.date).getTime()) /
    (1000 * 60 * 60 * 24);

  const change = last.bodyFatPercent! - first.bodyFatPercent!;

  let direction: BodyfatTrend["direction"];
  if (change < -0.5) direction = "decreasing";
  else if (change > 0.5) direction = "increasing";
  else direction = "stable";

  return {
    direction,
    changePercent: Math.round(change * 10) / 10,
    periodDays: Math.round(daysDiff),
  };
}

// ── Milestone alerts ────────────────────────────────────────────────────
export function milestones(): Milestone[] {
  const entries = getEntries();
  if (entries.length < 2) return [];

  const results: Milestone[] = [];

  // Weight milestones: every 5kg lost
  const weights = entries.filter((e) => e.weightKg !== undefined);
  if (weights.length >= 2) {
    const startWeight = weights[0].weightKg!;
    const currentWeight = weights[weights.length - 1].weightKg!;
    const lost = startWeight - currentWeight;

    if (lost >= 5) {
      results.push({
        type: "weight",
        label: `Lost ${Math.floor(lost)}kg`,
        value: `${startWeight} → ${currentWeight} kg`,
        date: weights[weights.length - 1].date,
        icon: "⚖️",
      });
    }
  }

  // Body fat milestones
  const bfEntries = entries.filter((e) => e.bodyFatPercent !== undefined);
  if (bfEntries.length >= 2) {
    const startBF = bfEntries[0].bodyFatPercent!;
    const currentBF = bfEntries[bfEntries.length - 1].bodyFatPercent!;
    const reduction = startBF - currentBF;

    if (reduction >= 2) {
      results.push({
        type: "bodyfat",
        label: `Body fat down ${reduction.toFixed(1)}%`,
        value: `${startBF}% → ${currentBF}%`,
        date: bfEntries[bfEntries.length - 1].date,
        icon: "📉",
      });
    }
  }

  // Waist measurement milestones
  const waistEntries = entries.filter(
    (e) => e.measurements?.waistCm !== undefined
  );
  if (waistEntries.length >= 2) {
    const startWaist = waistEntries[0].measurements!.waistCm!;
    const currentWaist = waistEntries[waistEntries.length - 1].measurements!.waistCm!;
    const reduction = startWaist - currentWaist;

    if (reduction >= 5) {
      results.push({
        type: "measurement",
        label: `Waist down ${Math.floor(reduction)}cm`,
        value: `${startWaist} → ${currentWaist} cm`,
        date: waistEntries[waistEntries.length - 1].date,
        icon: "📏",
      });
    }
  }

  return results;
}

// ── Weekly summary ──────────────────────────────────────────────────────
export function weeklyBodySummary(weeksBack: number = 1): {
  weightChange: number;
  bodyfatChange: number;
  measurementsTaken: number;
  avgWeight: number;
} {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - weeksBack * 7);

  const entries = getEntries().filter(
    (e) => e.date >= start.toISOString().split("T")[0]
  );

  const weights = entries.filter((e) => e.weightKg !== undefined);
  const bfEntries = entries.filter((e) => e.bodyFatPercent !== undefined);

  const avgWeight =
    weights.length > 0
      ? weights.reduce((s, e) => s + e.weightKg!, 0) / weights.length
      : 0;

  let weightChange = 0;
  if (weights.length >= 2) {
    weightChange =
      weights[weights.length - 1].weightKg! - weights[0].weightKg!;
  }

  let bodyfatChange = 0;
  if (bfEntries.length >= 2) {
    bodyfatChange =
      bfEntries[bfEntries.length - 1].bodyFatPercent! -
      bfEntries[0].bodyFatPercent!;
  }

  return {
    weightChange: Math.round(weightChange * 100) / 100,
    bodyfatChange: Math.round(bodyfatChange * 10) / 10,
    measurementsTaken: entries.length,
    avgWeight: Math.round(avgWeight * 100) / 100,
  };
}
