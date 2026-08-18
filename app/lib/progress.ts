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
