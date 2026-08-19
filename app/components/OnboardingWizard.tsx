"use client";

import { useState } from "react";
import { DEFAULT_PROFILE, ACTIVITY_LEVELS, DIETS, GOALS } from "@/app/lib/macros";
import type { ActivityLevel, Diet, Goal, Profile } from "@/app/lib/macros";
import { COUNTRIES, statesForCountry } from "@/app/lib/regions";
import { TapButton } from "@/app/lib/animations";

const STEPS = [
  { id: "welcome", title: "Welcome to LifeOS", subtitle: "Your personal health companion" },
  { id: "basics", title: "About You", subtitle: "Basic info for personalized calculations" },
  { id: "goals", title: "Your Goals", subtitle: "What are you working towards?" },
  { id: "diet", title: "Eating Style", subtitle: "Tailor meals to your preferences" },
  { id: "done", title: "You're All Set!", subtitle: "Start your journey" },
];

const inputCls =
  "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-200";

interface Props {
  onComplete: (profile: Profile) => void;
}

export default function OnboardingWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Profile>({ ...DEFAULT_PROFILE });
  const [allergiesText, setAllergiesText] = useState("");

  const update = (patch: Partial<Profile>) => setProfile((p) => ({ ...p, ...patch }));

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };
  const prev = () => {
    if (step > 0) setStep(step - 1);
  };
  const finish = () => {
    onComplete({
      ...profile,
      allergies: allergiesText.split(",").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-lg px-6">
        {/* Progress dots */}
        <div className="mb-8 flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i <= step ? "bg-emerald-500 w-8" : "bg-zinc-200 dark:bg-zinc-700 w-2"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div
          key={step}
          className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          style={{ animation: "pageIn 0.3s ease" }}
        >
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{STEPS[step].title}</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{STEPS[step].subtitle}</p>

          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="mt-8 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {["😴 Sleep", "🏋️ Fitness", "🥗 Nutrition", "📊 Body"].map((item) => (
                  <div key={item} className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-center text-sm font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-300">
                    {item}
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                All your data stays in your browser. No account needed. No tracking.
              </p>
            </div>
          )}

          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Sex</span>
                  <div className="flex overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
                    {(["male", "female"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => update({ sex: s })}
                        className={`flex-1 px-3 py-2.5 text-xs font-bold transition ${
                          profile.sex === s ? "bg-emerald-600 text-white" : "bg-zinc-50 text-zinc-500 dark:bg-zinc-900"
                        }`}
                      >
                        {s === "male" ? "♂ Male" : "♀ Female"}
                      </button>
                    ))}
                  </div>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Age</span>
                  <input type="number" min={14} max={100} value={profile.age} onChange={(e) => update({ age: Number(e.target.value) })} className={inputCls} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Weight (kg)</span>
                  <input type="number" min={30} max={300} value={profile.weightKg} onChange={(e) => update({ weightKg: Number(e.target.value) })} className={inputCls} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Height (cm)</span>
                  <input type="number" min={120} max={250} value={profile.heightCm} onChange={(e) => update({ heightCm: Number(e.target.value) })} className={inputCls} />
                </label>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Activity level</span>
                <select value={profile.activity} onChange={(e) => update({ activity: e.target.value as ActivityLevel })} className={inputCls}>
                  {ACTIVITY_LEVELS.map((a) => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Country</span>
                <select value={profile.country} onChange={(e) => update({ country: e.target.value, state: "" })} className={inputCls}>
                  <option value="">Select your country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </label>
              {profile.country && statesForCountry(profile.country).length > 0 && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">State / Region</span>
                  <select value={profile.state} onChange={(e) => update({ state: e.target.value })} className={inputCls}>
                    <option value="">Select your state</option>
                    {statesForCountry(profile.country).map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div className="mt-6 space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Primary goal</span>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => update({ goal: g.id as Goal })}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                        profile.goal === g.id
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-emerald-300 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-300"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </label>
              {profile.goal === "cut" && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Target body fat %</span>
                  <input
                    type="range"
                    min={profile.sex === "male" ? 6 : 14}
                    max={profile.sex === "male" ? 28 : 38}
                    value={profile.targetBodyFat ?? (profile.sex === "male" ? 15 : 22)}
                    onChange={(e) => update({ targetBodyFat: Number(e.target.value) })}
                    className="w-full accent-emerald-600"
                  />
                  <p className="text-center text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {profile.targetBodyFat ?? (profile.sex === "male" ? 15 : 22)}%
                  </p>
                </label>
              )}
            </div>
          )}

          {/* Step 3: Diet */}
          {step === 3 && (
            <div className="mt-6 space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Diet type</span>
                <div className="grid grid-cols-3 gap-2">
                  {DIETS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => update({ diet: d.id as Diet })}
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                        profile.diet === d.id
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-emerald-300 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-300"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Meals per day</span>
                <div className="flex gap-2">
                  {([3, 4, 5] as const).map((n) => (
                    <button
                      key={n}
                      onClick={() => update({ mealsPerDay: n })}
                      className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                        profile.mealsPerDay === n
                          ? "border-emerald-500 bg-emerald-600 text-white"
                          : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-emerald-300 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-300"
                      }`}
                    >
                      {n} meals
                    </button>
                  ))}
                </div>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Allergies / foods to avoid</span>
                <input
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder="e.g. peanuts, shellfish (comma-separated)"
                  className={inputCls}
                />
              </label>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <div className="mt-8 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl dark:bg-emerald-950/40">
                🎉
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Your personalized plan is ready. Tap below to get started.
              </p>
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left dark:border-emerald-800 dark:bg-emerald-950/30">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Quick summary</p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {profile.sex === "male" ? "Male" : "Female"}, {profile.age} years · {profile.weightKg} kg · {profile.heightCm} cm
                  <br />
                  Goal: {GOALS.find((g) => g.id === profile.goal)?.label} · Diet: {DIETS.find((d) => d.id === profile.diet)?.label}
                  <br />
                  {profile.mealsPerDay} meals/day · {ACTIVITY_LEVELS.find((a) => a.id === profile.activity)?.label}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          {step > 0 ? (
            <TapButton
              onClick={prev}
              className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-600 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              ← Back
            </TapButton>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <TapButton
              onClick={next}
              className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500"
            >
              Continue →
            </TapButton>
          ) : (
            <TapButton
              onClick={finish}
              className="rounded-xl bg-emerald-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500"
            >
              Get Started 🚀
            </TapButton>
          )}
        </div>
      </div>
    </div>
  );
}
