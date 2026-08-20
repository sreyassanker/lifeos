"use client";

import { useMemo, useState } from "react";
import { bedtimesForWake } from "@/app/lib/sleep";
import { macrosFor } from "@/app/lib/macros";
import type { Profile } from "@/app/lib/macros";
import { DEFAULT_HABITS } from "@/app/lib/routine";
import { DEFAULT_PROFILE } from "@/app/lib/macros";
import { planDay } from "@/app/lib/meal-plan";
import { foodById } from "@/app/lib/foods";
import { bodyFatNavy } from "@/app/lib/body";
import type { Measurements } from "@/app/lib/body";
import { latest, todayKey, trend, upsertCheckIn, computeRecovery } from "@/app/lib/progress";
import type { CheckIn } from "@/app/lib/progress";
import { WEEK_PLAN, todayPlanIndex, isRestPlanDay } from "@/app/lib/fitness";
import { computeSleepQuality } from "@/app/lib/sleep";
import { generateCoachingTips, timeGreeting } from "@/app/lib/coaching";
import { computeVitality, vitalityColor, vitalityBg } from "@/app/lib/vitality";
import { useLocalStorage } from "@/app/lib/use-local-state";
import { awardXP } from "@/app/lib/gamification";
import { FadeIn, AnimatedNumber, AnimatedBar, showToast } from "@/app/lib/animations";
import DataManager from "@/app/components/DataManager";
import WeeklyReport from "@/app/components/WeeklyReport";
import GamificationPanel from "@/app/components/GamificationPanel";

const WATER_GOAL = 8;

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
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
      {sub && <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{sub}</p>}
    </div>
  );
}

export default function DashboardTab() {
  const [wake, setWake] = useLocalStorage<string>("lifeos-wake", "07:00");
  const [water, setWater] = useLocalStorage<number>("lifeos-water", 0);
  const [habits] = useLocalStorage<string[]>("lifeos-habits", DEFAULT_HABITS);
  const [done, setDone] = useLocalStorage<Record<string, boolean>>("lifeos-habits-done", {});
  const [profile, setProfile] = useLocalStorage<Profile>("lifeos-profile", DEFAULT_PROFILE);
  const [showSetup, setShowSetup] = useState(false);
  const [progress, setProgress] = useLocalStorage<CheckIn[]>("lifeos-progress", []);
  const [weightInput, setWeightInput] = useState<string>(String(profile.weightKg));
  const [waistInput, setWaistInput] = useState<string>(latest(progress, "waistCm") ? String(latest(progress, "waistCm")) : "");
  const [bfInput, setBfInput] = useState<string>(latest(progress, "bodyFatPct") ? String(latest(progress, "bodyFatPct")) : "");

  const todayIdx = todayPlanIndex();
  const todayPlan = WEEK_PLAN[todayIdx];

  // Recovery score computation
  const [bed] = useLocalStorage<string>("lifeos-bed", "23:00");
  const [fallAsleepMin] = useLocalStorage<number>("lifeos-fall-asleep", 15);
  const [awakenings] = useLocalStorage<number>("lifeos-awakenings", 0);

  const sleepQuality = useMemo(() => {
    if (!bed || !wake) return null;
    return computeSleepQuality({ bedTime: bed, wakeTime: wake, fallAsleepMin, awakenings });
  }, [bed, wake, fallAsleepMin, awakenings]);

  const isRestDay = isRestPlanDay(todayIdx);
  const workoutsCompleted = useMemo(() => {
    let count = 0;
    for (let i = 0; i <= todayIdx; i++) {
      const day = WEEK_PLAN[i];
      if (day && (day.totalMin ?? 0) > 0) count++;
    }
    return count;
  }, [todayIdx]);

  const recovery = useMemo(() => computeRecovery({
    sleepScore: sleepQuality?.score ?? 75,
    workoutsCompleted,
    workoutsPlanned: 6,
    isRestDay,
    consecutiveActiveDays: isRestDay ? 0 : todayIdx + 1,
  }), [sleepQuality, workoutsCompleted, isRestDay, todayIdx]);

  const bedtime = useMemo(() => (wake ? bedtimesForWake(wake)[1] : null), [wake]);
  const macros = useMemo(() => macrosFor(profile), [profile]);
  const doneCount = habits.filter((h) => done[h]).length;


  const plan = useMemo(
    () => planDay(macros, profile.diet, profile.allergies, profile.mealsPerDay, 0),
    [macros, profile.diet, profile.allergies, profile.mealsPerDay]
  );

  // Gamification: streaks and badges (after plan is declared)
  const [streak, setStreak] = useLocalStorage<number>("lifeos-streak", 0);
  const [lastActiveDate, setLastActiveDate] = useLocalStorage<string>("lifeos-last-active", "");
  const todayKey_ = todayKey();

  useMemo(() => {
    if (lastActiveDate === todayKey_) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
    if (lastActiveDate === yKey) {
      setStreak((s) => s + 1);
    } else if (lastActiveDate !== todayKey_) {
      setStreak(1);
    }
    setLastActiveDate(todayKey_);
  }, [todayKey_, lastActiveDate, setStreak, setLastActiveDate]);

  const badges = useMemo(() => {
    const b: { label: string; emoji: string; earned: boolean }[] = [];
    b.push({ label: "Protein goal", emoji: "🥩", earned: plan.totals.proteinG >= macros.proteinG * 0.9 });
    b.push({ label: "Hydration hero", emoji: "💧", earned: water >= WATER_GOAL });
    b.push({ label: "Habit master", emoji: "✅", earned: doneCount >= habits.length });
    b.push({ label: "Early riser", emoji: "🌅", earned: wake !== "" && wake <= "07:00" });
    b.push({ label: "Workout warrior", emoji: "💪", earned: (todayPlan?.totalMin ?? 0) > 0 });
    b.push({ label: "7-day streak", emoji: "🔥", earned: streak >= 7 });
    return b;
  }, [plan.totals.proteinG, macros.proteinG, water, doneCount, habits.length, wake, todayPlan, streak]);
  const badgesEarned = badges.filter((b) => b.earned).length;

  const weightTrend = useMemo(() => trend(progress, "weightKg"), [progress]);
  const estBf = useMemo(() => {
    const m = profile.measurements;
    if (m && m.neckCm && m.waistCm && m.hipCm)
      return bodyFatNavy(m as Measurements, profile.sex, profile.heightCm);
    return null;
  }, [profile]);

  const saveCheckIn = () => {
    const entry: CheckIn = {
      date: todayKey(),
      weightKg: weightInput ? Number(weightInput) : undefined,
      waistCm: waistInput ? Number(waistInput) : undefined,
      bodyFatPct: bfInput ? Number(bfInput) : undefined,
    };
    setProgress((prev) => upsertCheckIn(prev, entry));
    if (entry.weightKg) setProfile((p) => ({ ...p, weightKg: entry.weightKg! }));
    awardXP("LOG_MEASUREMENT", "Logged weekly check-in");
    showToast("Check-in saved!", "success");
  };

  const weightDelta =
    weightTrend.length >= 2 ? weightTrend[weightTrend.length - 1].value - weightTrend[0].value : null;

  return (
    <div className="space-y-6 page-enter">
      <FadeIn delay={0}><div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Your day at a glance. Everything below is saved in your browser — adjust it in the tabs.
            </p>
          </div>
          <button
            onClick={() => setShowSetup((v) => !v)}
            className="shrink-0 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {showSetup ? "Hide setup" : "Setup"}
          </button>
        </div>

        {showSetup && (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              My wake-up time (drives your sleep target)
            </span>
            <input
              type="time"
              value={wake}
              onChange={(e) => setWake(e.target.value)}
              className="w-40 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 font-mono text-sm text-zinc-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-200"
            />
          </label>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Sleep target"
            value={bedtime ? `Bed by ${bedtime.value}` : "—"}
            sub={bedtime ? `${bedtime.label.replace(" · ", " · ")} · wake ${wake}` : "Set your wake time"}
            accent
          />
          <Stat
            label="Calories"
            value={`${macros.calories} kcal`}
            sub={`P ${macros.proteinG}g · C ${macros.carbsG}g · F ${macros.fatG}g`}
          />
          <Stat label="Water" value={`${water}/${WATER_GOAL} glasses`} sub="Tap to log a glass" />
          <Stat label="Habits" value={`${doneCount}/${habits.length}`} sub="Daily checklist" />
        </div>

        {/* Recovery score */}
        <div className={`rounded-xl border p-4 ${
          recovery.rating === "ready"
            ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40"
            : recovery.rating === "caution"
            ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40"
            : "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/40"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Recovery score</p>
              <p className="mt-1 text-2xl font-extrabold text-zinc-900 dark:text-white">{recovery.score}/100</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
              recovery.rating === "ready"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : recovery.rating === "caution"
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                : "bg-red-500/15 text-red-700 dark:text-red-300"
            }`}>
              {recovery.rating}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{recovery.summary}</p>
          <div className="mt-2 flex gap-3 text-[10px] text-zinc-500 dark:text-zinc-400">
            <span>Sleep: {recovery.components.sleep}%</span>
            <span>Training: {recovery.components.training}%</span>
            <span>Rest: {recovery.components.rest}%</span>
          </div>
        </div>

        {/* Gamification: streak + badges */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Daily streak</p>
            <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">🔥 {streak} day{streak !== 1 ? "s" : ""}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <span
                key={b.label}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                  b.earned
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
                }`}
                title={b.earned ? `Earned: ${b.label}` : `Not yet: ${b.label}`}
              >
                <span>{b.emoji}</span>
                <span>{b.label}</span>
              </span>
            ))}
          </div>
          {badgesEarned > 0 && (
            <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              {badgesEarned}/{badges.length} badges earned today
            </p>
          )}
        </div>

        {/* Unified Vitality Index */}
        {(() => {
          const trendRate = weightTrend.length >= 2
            ? (weightTrend[weightTrend.length - 1].value - weightTrend[0].value) / Math.max(1, (new Date(weightTrend[weightTrend.length - 1].date).getTime() - new Date(weightTrend[0].date).getTime()) / (7 * 24 * 60 * 60 * 1000))
            : undefined;
          const vitality = computeVitality({
            profile,
            mealPlan: plan,
            sleepScore: sleepQuality?.score,
            waterGlasses: water,
            waterGoal: WATER_GOAL,
            habitsDone: doneCount,
            habitsTotal: habits.length,
            weightTrendKgPerWeek: trendRate,
            dayOfWeek: new Date().getDay(),
          });
          return (
            <div className={`rounded-xl border p-4 ${vitalityBg(vitality.score)} transition`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Vitality index</p>
                  <p className={`mt-1 text-3xl font-extrabold ${vitalityColor(vitality.score)}`}>{vitality.score}/100</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${vitalityColor(vitality.score)} bg-white/50 dark:bg-black/20`}>
                  {vitality.rating}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{vitality.summary}</p>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">💡 {vitality.suggestion}</p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {([
                  { label: "Sleep", score: vitality.components.sleep, weight: "30%" },
                  { label: "Nutrition", score: vitality.components.nutrition, weight: "30%" },
                  { label: "Exercise", score: vitality.components.exercise, weight: "25%" },
                  { label: "Body", score: vitality.components.body, weight: "15%" },
                ] as const).map((c) => (
                  <div key={c.label} className="text-center">
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{c.label} ({c.weight})</p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                      <div className={`h-full rounded-full ${vitalityColor(c.score).replace("text-", "bg-").replace("dark:text-", "dark:bg-")}`} style={{ width: `${c.score}%` }} />
                    </div>
                    <p className="mt-0.5 text-[10px] font-bold text-zinc-700 dark:text-zinc-300">{c.score}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* JITAI Coaching Tips */}
        {(() => {
          const tips = generateCoachingTips({
            profile,
            mealPlan: plan,
            hour: new Date().getHours(),
            dayOfWeek: new Date().getDay(),
            waterGlasses: water,
            waterGoal: WATER_GOAL,
            habitsDone: doneCount,
            habitsTotal: habits.length,
            sleepScore: sleepQuality?.score,
            streak,
            recoveryScore: recovery.score,
          });
          if (tips.length === 0) return null;
          return (
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/30">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
                {timeGreeting(new Date().getHours())}Smart tips for you
              </p>
              <div className="mt-2 space-y-2">
                {tips.map((tip) => (
                  <div key={tip.id} className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-sm">{tip.emoji}</span>
                    <div>
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{tip.message}</p>
                      {tip.detail && (
                        <p className="mt-0.5 text-[10px] leading-4 text-zinc-500 dark:text-zinc-400">{tip.detail}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Water + habits quick actions */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Water</p>
            <div className="mt-2 flex items-center gap-1.5">
              {Array.from({ length: WATER_GOAL }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setWater(i + 1 === water ? i : i + 1)}
                  className={`h-6 w-6 rounded-lg text-xs font-bold transition ${
                    i < water
                      ? "bg-sky-500 text-white"
                      : "bg-zinc-200 text-zinc-400 hover:bg-sky-200 dark:bg-zinc-800 dark:text-zinc-500"
                  }`}
                  aria-label={`Glass ${i + 1}`}
                >
                  💧
                </button>
              ))}
              <button
                onClick={() => setWater(0)}
                className="ml-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                reset
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Habits — quick check
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {habits.slice(0, 6).map((h) => (
                <button
                  key={h}
                  onClick={() => setDone((prev) => ({ ...prev, [h]: !prev[h] }))}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                    done[h]
                      ? "bg-emerald-600 text-white"
                      : "border border-zinc-200 bg-white text-zinc-600 hover:border-emerald-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                  }`}
                >
                  {done[h] ? "✓ " : ""}
                  {h.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div></FadeIn>

      <FadeIn delay={100}>{/* Today's workout */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <span className="text-emerald-600 dark:text-emerald-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6.5 6.5h11v11h-11z" strokeLinejoin="round" />
              <path d="M6.5 6.5 4 4m2.5 13.5L4 20m13.5-13.5L20 4m-2.5 13.5L20 20" strokeLinecap="round" />
            </svg>
          </span>
          Today: {todayPlan?.title}
        </h3>
        <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
          {todayPlan?.items.map((item) => <li key={item.text}>{item.text}</li>)}
        </ul>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Full week plan + the abs circuit live in the <strong>Fitness</strong> tab.
        </p>
      </section></FadeIn>

      <FadeIn delay={200}>{/* Today's meal plan */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <span className="text-emerald-600 dark:text-emerald-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v18M5 5l7 7 7-7M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Today&apos;s meal plan
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Personalized for <strong>{profile.diet}</strong> · {profile.mealsPerDay} meals/day · ≈{" "}
          {Math.round(plan.totals.kcal)} kcal. Swaps and the shopping list live in the <strong>Nutrition</strong> tab.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {plan.meals.map((meal, mi) => (
            <div key={`${meal.title}-${mi}`} className="rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  {meal.title}
                </p>
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                  {Math.round(meal.items.reduce((acc, it) => acc + (foodById(it.foodId)!.per100g.kcal * it.grams) / 100, 0))}{" "}
                  kcal
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-zinc-700 dark:text-zinc-300">
                {meal.items.map((it) => `${foodById(it.foodId)!.name} (${it.grams}g)`).join(" + ")}
              </p>
            </div>
          ))}
        </div>
      </section></FadeIn>

      <FadeIn delay={300}>{/* Daily anchors */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <span className="text-emerald-600 dark:text-emerald-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v18M5 5l7 7 7-7M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Today&apos;s non-negotiables
        </h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "10–15 min morning sunlight within 1h of waking",
            `Sleep by ${bedtime?.value ?? "your target time"} — regularity beats everything`,
            "3 balanced meals: ½ veg, ¼ grains, ¼ protein",
            `${macros.proteinG}g protein — spread across meals`,
            `${macros.waterL} L water (≈ ${WATER_GOAL} glasses)`,
            todayPlan?.day === "Sunday" || todayPlan?.day === "Thursday"
              ? "Recovery day — walk, stretch, rest well"
              : "Move your body — strength or cardio per the plan",
          ].map((item) => (
            <div key={item} className="rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-300">
              {item}
            </div>
          ))}
        </div>
      </section></FadeIn>

      <FadeIn delay={400}>{/* Progress tracking */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <span className="text-emerald-600 dark:text-emerald-400">📈</span>
          Progress tracking
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Log a check-in once a week (same time of day). Weight is enough — waist and body fat refine the picture.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
            <div className="grid grid-cols-3 gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Weight (kg)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Waist (cm)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={waistInput}
                  onChange={(e) => setWaistInput(e.target.value)}
                  placeholder={profile.measurements?.waistCm ? String(profile.measurements.waistCm) : ""}
                  className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Body fat %</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={bfInput}
                  onChange={(e) => setBfInput(e.target.value)}
                  placeholder={estBf !== null ? estBf.toFixed(1) : ""}
                  className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </label>
            </div>
            <button
              onClick={saveCheckIn}
              className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500"
            >
              Log today&apos;s check-in
            </button>
            {weightDelta !== null && (
              <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                {weightDelta === 0
                  ? "Weight stable since your first check-in."
                  : weightDelta < 0
                    ? `↓ ${Math.abs(weightDelta).toFixed(1)} kg since your first check-in`
                    : `↑ ${weightDelta.toFixed(1)} kg since your first check-in`}
                {" "}· {progress.length} check-in{progress.length === 1 ? "" : "s"} saved.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Weight trend{estBf !== null ? ` · body fat ≈ ${estBf.toFixed(1)}%` : ""}
            </p>
            {weightTrend.length < 2 ? (
              <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
                Log at least two check-ins to see your trend line.
              </p>
            ) : (
              <TrendChart points={weightTrend} />
            )}
          </div>
        </div>
      </section></FadeIn>

      <FadeIn delay={500}><GamificationPanel /></FadeIn>
        <FadeIn delay={550}><WeeklyReport /></FadeIn>
        <FadeIn delay={600}><DataManager /></FadeIn>
    </div>
  );
}

function TrendChart({ points }: { points: { date: string; value: number }[] }) {
  const w = 300;
  const h = 110;
  const pad = 14;
  const min = Math.min(...points.map((p) => p.value));
  const max = Math.max(...points.map((p) => p.value));
  const range = max - min || 1;
  const x = (i: number) => pad + (i * (w - 2 * pad)) / (points.length - 1);
  const y = (v: number) => h - pad - ((v - min) / range) * (h - 2 * pad);
  const line = points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  return (
    <div className="mt-2">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-28 w-full">
        <line x1={pad} y1={y(min)} x2={w - pad} y2={y(min)} stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
        <line x1={pad} y1={y(max)} x2={w - pad} y2={y(max)} stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
        <polyline
          points={line}
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle key={p.date} cx={x(i)} cy={y(p.value)} r="3.5" fill="#10b981" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
        <span>
          {first.date.slice(5)} · {first.value.toFixed(1)} kg
        </span>
        <span>
          {last.date.slice(5)} · {last.value.toFixed(1)} kg
        </span>
      </div>
    </div>
  );
}
