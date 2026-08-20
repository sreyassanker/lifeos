"use client";

import { useMemo, useState } from "react";
import {
  bmi,
  bmiCategory,
  bodyFatCategory,
  bodyFatNavy,
  bodyShape,
  CM_PER_INCH,
  formatWeeks,
  somatotypeTendency,
  targetWeightFor,
  waistToHeight,
  waistToHipRisk,
  weeklyRateKg,
  weeksToReach,
} from "@/app/lib/body";
import type { Measurements } from "@/app/lib/body";
import { ACTIVITY_LEVELS, DEFAULT_PROFILE, DIETS, GOALS, macrosFor, adaptiveCalories } from "@/app/lib/macros";
import type { ActivityLevel, Diet, Goal, Profile } from "@/app/lib/macros";
import { trend } from "@/app/lib/progress";
import type { CheckIn } from "@/app/lib/progress";
import { COUNTRIES, statesForCountry } from "@/app/lib/regions";
import { useLocalStorage } from "@/app/lib/use-local-state";
import { DEFAULT_SETTINGS, type AppSettings, SETTINGS_STORAGE_KEY } from "@/app/lib/settings";

const inputCls =
  "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-200";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        {label} {hint && <span className="font-normal text-zinc-400 dark:text-zinc-500">— {hint}</span>}
      </span>
      {children}
    </label>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent
          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40"
          : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className={`mt-1 text-xl font-extrabold ${accent ? "text-emerald-700 dark:text-emerald-300" : "text-zinc-900 dark:text-white"}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{sub}</p>}
    </div>
  );
}

const MEASUREMENT_FIELDS: { key: keyof Measurements; label: string; hint?: string }[] = [
  { key: "neckCm", label: "Neck" },
  { key: "shoulderCm", label: "Shoulders" },
  { key: "chestCm", label: "Chest / bust" },
  { key: "waistCm", label: "Waist" },
  { key: "hipCm", label: "Hips" },
  { key: "thighCm", label: "Thigh" },
  { key: "calfCm", label: "Calf" },
  { key: "kneeCm", label: "Knee" },
  { key: "ankleCm", label: "Ankle" },
  { key: "upperArmCm", label: "Upper arm" },
  { key: "forearmCm", label: "Forearm" },
  { key: "wristCm", label: "Wrist" },
];

export default function BodyTab() {
  const [profile, setProfile] = useLocalStorage<Profile>("lifeos-profile", DEFAULT_PROFILE);
  const [settings, setSettings] = useLocalStorage<AppSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
  const units = settings.units === "imperial" ? ("in" as const) : ("cm" as const);
  const setUnits = (u: "cm" | "in") =>
    setSettings((prev) => ({ ...prev, units: u === "in" ? "imperial" : "metric" }));
  const [allergiesText, setAllergiesText] = useState(profile.allergies.join(", "));

  const measurements = useMemo(() => profile.measurements ?? {}, [profile.measurements]);
  const heightCm = profile.heightCm;
  const weightKg = profile.weightKg;

  const setMeasurement = (key: keyof Measurements, value: number) => {
    const parsed = Number.isFinite(value) && value > 0 ? value : undefined;
    setProfile((prev) => ({ ...prev, measurements: { ...prev.measurements, [key]: parsed } }));
  };

  const displayValue = (cm?: number) =>
    cm === undefined ? "" : units === "cm" ? String(cm) : (cm / CM_PER_INCH).toFixed(1);

  const toCm = (value: string) => {
    const n = Number(value);
    return units === "cm" ? n : n * CM_PER_INCH;
  };

  const hasCore = useMemo(
    () =>
      ["neckCm", "shoulderCm", "chestCm", "waistCm", "hipCm"].every(
        (k) => typeof measurements[k as keyof Measurements] === "number"
      ),
    [measurements]
  );

  const macros = macrosFor(profile);
  const [progress] = useLocalStorage<CheckIn[]>("lifeos-progress", []);
  const weightTrend = useMemo(() => trend(progress, "weightKg", 10), [progress]);
  const adaptive = useMemo(() => adaptiveCalories(macros.calories, weightTrend, profile.goal), [macros.calories, weightTrend, profile.goal]);

  const bf = useMemo(
    () => (hasCore ? bodyFatNavy(measurements as Measurements, profile.sex, heightCm) : null),
    [hasCore, measurements, profile.sex, heightCm]
  );
  const bmiValue = useMemo(() => bmi(weightKg, heightCm), [weightKg, heightCm]);
  const shape = useMemo(
    () => (hasCore ? bodyShape(measurements as Measurements, profile.sex) : null),
    [hasCore, measurements, profile.sex]
  );
  const whr = useMemo(
    () => (hasCore ? waistToHipRisk(measurements as Measurements, profile.sex) : null),
    [hasCore, measurements, profile.sex]
  );
  const wth = useMemo(
    () => (hasCore ? waistToHeight(measurements as Measurements, heightCm) : null),
    [hasCore, measurements, heightCm]
  );
  const somato = useMemo(
    () => somatotypeTendency(measurements as Measurements, heightCm),
    [measurements, heightCm]
  );

  // Goal projection
  const targetBodyFat = profile.targetBodyFat;
  const bfForGoal = bf ?? null;
  const targetWeight = useMemo(
    () => (bfForGoal !== null && targetBodyFat !== undefined ? targetWeightFor(weightKg, bfForGoal, targetBodyFat) : null),
    [bfForGoal, targetBodyFat, weightKg]
  );
  const weeks = useMemo(() => {
    if (targetWeight === null || bfForGoal === null) return null;
    return weeksToReach(weightKg, targetWeight, weeklyRateKg(profile.goal, weightKg));
  }, [targetWeight, bfForGoal, weightKg, profile.goal]);

  // Estimated goal measurements: scale each site toward the goal weight (central fat goes first).
  const goalMeasurements = useMemo<Measurements | undefined>(() => {
    if (!hasCore || bfForGoal === null || targetWeight === null) return undefined;
    const ratio = targetWeight / weightKg;
    const siteFactor: Record<string, number> = {
      neckCm: 0.6,
      shoulderCm: 0.4,
      chestCm: 0.8,
      waistCm: 1.25,
      hipCm: 0.95,
      thighCm: 0.9,
      calfCm: 0.7,
      kneeCm: 0.6,
      ankleCm: 0.5,
      upperArmCm: 0.7,
      forearmCm: 0.6,
      wristCm: 0.5,
    };
    const scaled: Record<string, number> = {};
    for (const [k, v] of Object.entries(measurements)) {
      if (typeof v === "number") scaled[k] = v * (1 + (ratio - 1) * (siteFactor[k] ?? 1));
    }
    return scaled as unknown as Measurements;
  }, [hasCore, bfForGoal, targetWeight, measurements, weightKg]);

  const goalRange = profile.sex === "male" ? { min: 6, max: 28 } : { min: 14, max: 38 };
  const sliderTarget = targetBodyFat ?? (bfForGoal ?? (profile.sex === "male" ? 15 : 22));

  return (
    <div className="space-y-6">
      {/* Profile basics */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <span className="text-emerald-600 dark:text-emerald-400">👤</span>
          Your profile
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Your age, size, and goals drive every calculation — macros, body fat, and the meal plan.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Sex">
            <div className="flex overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
              {(["male", "female"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setProfile((p) => ({ ...p, sex: s }))}
                  className={`flex-1 px-3 py-2.5 text-xs font-bold transition ${
                    profile.sex === s ? "bg-emerald-600 text-white" : "bg-zinc-50 text-zinc-500 dark:bg-zinc-900"
                  }`}
                >
                  {s === "male" ? "♂ Male" : "♀ Female"}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Age">
            <input
              type="number"
              min={14}
              max={100}
              value={profile.age}
              onChange={(e) => setProfile((p) => ({ ...p, age: Number(e.target.value) }))}
              className={inputCls}
            />
          </Field>
          <Field label="Weight (kg)">
            <input
              type="number"
              min={30}
              max={300}
              value={profile.weightKg}
              onChange={(e) => setProfile((p) => ({ ...p, weightKg: Number(e.target.value) }))}
              className={inputCls}
            />
          </Field>
          <Field label="Height (cm)">
            <input
              type="number"
              min={120}
              max={250}
              value={profile.heightCm}
              onChange={(e) => setProfile((p) => ({ ...p, heightCm: Number(e.target.value) }))}
              className={inputCls}
            />
          </Field>
          <Field label="Activity level">
            <select
              value={profile.activity}
              onChange={(e) => setProfile((p) => ({ ...p, activity: e.target.value as ActivityLevel }))}
              className={inputCls}
            >
              {ACTIVITY_LEVELS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Goal">
            <select
              value={profile.goal}
              onChange={(e) => setProfile((p) => ({ ...p, goal: e.target.value as Goal }))}
              className={inputCls}
            >
              {GOALS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Country">
            <select
              value={profile.country}
              onChange={(e) => setProfile((p) => ({ ...p, country: e.target.value, state: "" }))}
              className={inputCls}
            >
              <option value="">Select your country</option>
              {COUNTRIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          {profile.country && statesForCountry(profile.country).length > 0 && (
            <Field label="State / Region">
              <select
                value={profile.state}
                onChange={(e) => setProfile((p) => ({ ...p, state: e.target.value }))}
                className={inputCls}
              >
                <option value="">Select your state</option>
                {statesForCountry(profile.country).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          {ACTIVITY_LEVELS.find((a) => a.id === profile.activity)?.example} · Calories via Mifflin-St Jeor + activity factor.
          {profile.country && (
            <span> · Region: {COUNTRIES.find((c) => c.id === profile.country)?.label}{
              profile.state && statesForCountry(profile.country).find((s) => s.id === profile.state)
                ? ` — ${statesForCountry(profile.country).find((s) => s.id === profile.state)!.label}`
                : ""
            }</span>
          )}
        </p>

        {/* Daily macros summary */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Calories / day", value: `${macros.calories} kcal`, accent: true },
            { label: "Protein", value: `${macros.proteinG} g`, sub: `range ${macros.proteinRange} g` },
            { label: "Carbs", value: `${macros.carbsG} g` },
            { label: "Fat", value: `${macros.fatG} g` },
          ].map((m) => (
            <div
              key={m.label}
              className={`rounded-xl border p-4 text-center ${
                m.accent
                  ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40"
                  : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{m.label}</p>
              <p
                className={`mt-1 text-2xl font-extrabold ${
                  m.accent ? "text-emerald-700 dark:text-emerald-300" : "text-zinc-900 dark:text-white"
                }`}
              >
                {m.value}
              </p>
              {m.sub && <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{m.sub}</p>}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            💧 Water: <strong>{macros.waterL} L/day</strong> (NASEM adequate intake) · {macros.note}
          </p>
        </div>
      </section>

      {/* Eating style + meals */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <span className="text-emerald-600 dark:text-emerald-400">🥗</span>
          Your eating style
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Your meal plans adapt to this. Everything stays in your browser.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Diet">
            <select value={profile.diet} onChange={(e) => setProfile((p) => ({ ...p, diet: e.target.value as Diet }))} className={inputCls}>
              {DIETS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Meals per day">
            <div className="flex gap-1.5">
              {([3, 4, 5] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => setProfile((p) => ({ ...p, mealsPerDay: n }))}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                    profile.mealsPerDay === n
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-emerald-300 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-300"
                  }`}
                >
                  {n} meals
                </button>
              ))}
            </div>
          </Field>
          <Field label="Allergies / foods to avoid" hint="comma-separated">
            <input
              value={allergiesText}
              onChange={(e) => {
                setAllergiesText(e.target.value);
                setProfile((p) => ({
                  ...p,
                  allergies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                }));
              }}
              placeholder="e.g. peanuts, shellfish"
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      {/* Measurements */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            <span className="text-emerald-600 dark:text-emerald-400">📏</span>
            Your measurements
          </h3>
          <div className="flex overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
            {(["cm", "in"] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnits(u)}
                className={`px-3 py-1.5 text-xs font-bold transition ${
                  units === u ? "bg-emerald-600 text-white" : "bg-zinc-50 text-zinc-500 dark:bg-zinc-900"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Wrap a tape measure snugly around each spot — neck at the Adam&apos;s apple, waist at your navel, hips at the
          widest point. Shoulders are the straight distance between the shoulder bones (biacromial width). The more
          measurements you add, the more accurate your analysis becomes. Re-measure weekly, same time of day.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {MEASUREMENT_FIELDS.map((f) => (
            <Field key={f.key} label={f.label} hint={f.key === "chestCm" ? (profile.sex === "female" ? "fullest part" : "nipple line") : undefined}>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={displayValue(measurements[f.key])}
                onChange={(e) => setMeasurement(f.key, toCm(e.target.value))}
                placeholder={units === "cm" ? "cm" : "in"}
                className={inputCls}
              />
            </Field>
          ))}
        </div>
      </section>

      {/* Body analysis */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <span className="text-emerald-600 dark:text-emerald-400">🔬</span>
          Body analysis
        </h3>
        {!hasCore ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Enter your <strong>neck, waist, and hips</strong> (plus height above) to unlock body fat %, shape, and health
            markers.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Body fat (Navy)"
              value={bf !== null ? `${bf.toFixed(1)}%` : "—"}
              sub={`${bodyFatCategory(bf ?? 0, profile.sex)} range · ±3% accuracy — track the trend`}
              accent
            />
            <StatCard
              label="BMI"
              value={bmiValue !== null ? bmiValue.toFixed(1) : "—"}
              sub={`${bmiCategory(bmiValue ?? 0).label} · doesn't separate muscle from fat`}
            />
            {shape && (
              <StatCard
                label="Body shape"
                value={shape.label}
                sub="A tendency, not a verdict — every shape can be healthy and strong"
              />
            )}
            {whr && (
              <StatCard
                label="Waist-to-hip"
                value={whr.value.toFixed(2)}
                sub={`${whr.label} (WHO threshold ${profile.sex === "male" ? "0.90" : "0.85"})`}
              />
            )}
            {wth && (
              <StatCard label="Waist-to-height" value={wth.value.toFixed(2)} sub={wth.label} />
            )}
            {somato && <StatCard label="Frame tendency" value={somato.label} sub={somato.note} />}
          </div>
        )}
        {shape && (
          <p className="mt-3 rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-3 text-xs leading-5 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-400">
            <strong>About your shape:</strong> {shape.description}
          </p>
        )}
      </section>

      {/* Goal */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <span className="text-emerald-600 dark:text-emerald-400">🎯</span>
          Your goal body
        </h3>
        {bfForGoal === null ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Add your measurements above to unlock the goal body projection. (Without body fat %, we can&apos;t estimate a
            target weight or timeline.)
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Pick a target body fat %. The slider range fits healthy, realistic levels for your sex — the plan is the
              sustainable path, not a crash diet.
            </p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                <div className="flex items-baseline justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Target body fat
                  </p>
                  <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">{sliderTarget.toFixed(1)}%</p>
                </div>
                <input
                  type="range"
                  min={goalRange.min}
                  max={goalRange.max}
                  step={0.5}
                  value={sliderTarget}
                  onChange={(e) => setProfile((p) => ({ ...p, targetBodyFat: Number(e.target.value) }))}
                  className="mt-3 w-full accent-emerald-600"
                />
                <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  {profile.sex === "male" ? "Visible abs ≈ 10–12% · athletic 12–15% · healthy 18–24%" : "Visible abs ≈ 16–20% · athletic 20–24% · healthy 25–31%"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Est. goal weight" value={targetWeight !== null ? `${targetWeight.toFixed(0)} kg` : "—"} sub="Fat-free mass preserved" />
                <StatCard
                  label="Timeline"
                  value={weeks !== null ? formatWeeks(weeks) : "—"}
                  sub={weeks !== null ? `at ${weeklyRateKg(profile.goal, weightKg).toFixed(2)} kg/week (${profile.goal})` : "Set a cut/bulk goal"}
                  accent
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              To get there you&apos;ll eat ≈ <strong>{macros.calories} kcal/day</strong> (P {macros.proteinG}g · C{" "}
              {macros.carbsG}g · F {macros.fatG}g) — see your personalized meal plan in the <strong>Nutrition</strong> tab.
            </p>
            {adaptive.adjustment !== 0 && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                  ⚡ Adaptive adjustment: {adaptive.adjustedCalories} kcal/day
                </p>
                <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">{adaptive.reason}</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
