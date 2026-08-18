"use client";

import { useMemo, useState } from "react";
import { ACTIVITY_LEVELS, DEFAULT_PROFILE, EVERYDAY_STARS, GOALS, HARVARD_PLATE, macrosFor } from "@/app/lib/macros";
import type { ActivityLevel, Goal, Profile, Sex } from "@/app/lib/macros";
import { useLocalStorage } from "@/app/lib/use-local-state";
import { FOODS, foodById, foodExcluded } from "@/app/lib/foods";
import { planDay, shoppingList, totalsOf } from "@/app/lib/meal-plan";
import type { MealPlan } from "@/app/lib/meal-plan";

type ItemSwap = { mealIdx: number; itemIdx: number; foodId: string };

function applySwap(plan: MealPlan, mealIdx: number, itemIdx: number, newFoodId: string): MealPlan {
  const meals = plan.meals.map((meal, mi) => {
    if (mi !== mealIdx) return meal;
    return {
      ...meal,
      items: meal.items.map((item, ii) => {
        if (ii !== itemIdx) return item;
        const old = foodById(item.foodId)!;
        const next = foodById(newFoodId)!;
        const oldKcal = (old.per100g.kcal * item.grams) / 100;
        const newGrams = Math.max(10, Math.round(((oldKcal / next.per100g.kcal) * 100) / 5) * 5);
        return { foodId: newFoodId, grams: newGrams };
      }),
    };
  });
  return { ...plan, meals, totals: totalsOf(meals) };
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
        <span className="text-emerald-600 dark:text-emerald-400">{icon}</span>
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-200";

const MEAL_EMOJI: Record<string, string> = { Breakfast: "🌅", Lunch: "☀️", Dinner: "🌙", "Snack 1": "🍎", "Snack 2": "🥜" };

function macroChip(label: string, actual: number, target: number) {
  const pct = target > 0 ? (actual / target) * 100 : 0;
  const ok = pct >= 90 && pct <= 115;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
        ok ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
      }`}
      title={`target ${target}`}
    >
      {label} {Math.round(actual)}g{ok ? " ✓" : ` / ${target}g`}
    </span>
  );
}

export default function NutritionTab() {
  const [profile, setProfile] = useLocalStorage<Profile>("lifeos-profile", DEFAULT_PROFILE);

  const [activeGoal, setActiveGoal] = useState<Goal>(profile.goal);
  const [seed, setSeed] = useState(1);
  const [swapLog, setSwapLog] = useState<ItemSwap[]>([]);

  const basePlan = useMemo(
    () => planDay(macrosFor(profile), profile.diet, profile.allergies, profile.mealsPerDay, seed),
    [profile, seed]
  );

  const [prevBasePlan, setPrevBasePlan] = useState(basePlan);
  if (basePlan !== prevBasePlan) {
    setPrevBasePlan(basePlan);
    setSwapLog([]);
  }

  const plan = useMemo(() => {
    let current = basePlan;
    for (const swap of swapLog) {
      current = applySwap(current, swap.mealIdx, swap.itemIdx, swap.foodId);
    }
    return current;
  }, [basePlan, swapLog]);

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const result = macrosFor(profile);
  const list = shoppingList(plan);

  return (
    <div className="space-y-6">
      {/* Profile + macros */}
      <Card
        title="Your daily numbers"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v18M3 12h18" strokeLinecap="round" />
          </svg>
        }
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Sex">
            <select value={profile.sex} onChange={(e) => update("sex", e.target.value as Sex)} className={inputCls}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </Field>
          <Field label="Age">
            <input
              type="number"
              min={14}
              max={100}
              value={profile.age}
              onChange={(e) => update("age", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Weight (kg)">
            <input
              type="number"
              min={30}
              max={300}
              value={profile.weightKg}
              onChange={(e) => update("weightKg", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Height (cm)">
            <input
              type="number"
              min={120}
              max={250}
              value={profile.heightCm}
              onChange={(e) => update("heightCm", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Activity level">
            <select
              value={profile.activity}
              onChange={(e) => update("activity", e.target.value as ActivityLevel)}
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
              onChange={(e) => {
                const goal = e.target.value as Goal;
                update("goal", goal);
                setActiveGoal(goal);
              }}
              className={inputCls}
            >
              {GOALS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          {ACTIVITY_LEVELS.find((a) => a.id === profile.activity)?.example} · Calories via Mifflin-St Jeor + activity
          factor. Diet, meals/day &amp; allergies are set in the <strong>Body</strong> tab.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Calories / day", value: `${result.calories} kcal`, accent: true },
            { label: "Protein", value: `${result.proteinG} g`, sub: `range ${result.proteinRange} g` },
            { label: "Carbs", value: `${result.carbsG} g` },
            { label: "Fat", value: `${result.fatG} g` },
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
            💧 Water: <strong>{result.waterL} L/day</strong> (NASEM adequate intake) · {result.note}
          </p>
        </div>
      </Card>

      {/* Personalized meal plan */}
      <Card
        title="Your personalized meal plan"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v18M5 5l7 7 7-7M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Built from <strong>natural whole foods</strong> only, sized to hit{" "}
            <strong>{result.calories} kcal</strong> and your macros — {profile.diet} ·{" "}
            {profile.mealsPerDay} meals/day. Swap any item below; the plan rebalances.
          </p>
          <button
            onClick={() => setSeed(Math.floor(Math.random() * 1_000_000))}
            className="shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-600 transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-300 dark:hover:border-emerald-600"
          >
            🎲 Shuffle plan
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {plan.meals.map((meal, mi) => (
            <div key={`${meal.title}-${mi}`} className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {MEAL_EMOJI[meal.title] ?? "🍽️"} {meal.title}
                </h4>
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                  {Math.round(
                    meal.items.reduce((acc, it) => acc + (foodById(it.foodId)!.per100g.kcal * it.grams) / 100, 0)
                  )}{" "}
                  kcal
                </span>
              </div>
              <ul className="mt-2 space-y-2">
                {meal.items.map((item, ii) => {
                  const food = foodById(item.foodId)!;
                  const options = FOODS.filter(
                    (f) => f.category === food.category && f.id !== food.id && !foodExcluded(f, profile.allergies)
                  );
                  return (
                    <li key={`${item.foodId}-${ii}`} className="flex items-center gap-2 text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {food.name}{" "}
                          <span className="font-normal text-zinc-500 dark:text-zinc-400">
                            {item.grams}g ({food.servingLabel})
                          </span>
                        </p>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                          P {Math.round((food.per100g.proteinG * item.grams) / 100)}g · C{" "}
                          {Math.round((food.per100g.carbsG * item.grams) / 100)}g · F{" "}
                          {Math.round((food.per100g.fatG * item.grams) / 100)}g
                        </p>
                      </div>
                      {options.length > 0 && (
                        <select
                          value={food.id}
                          onChange={(e) => { setSwapLog((prev) => [...prev, { mealIdx: mi, itemIdx: ii, foodId: e.target.value }]); }}
                          className="w-32 shrink-0 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-zinc-600 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                          title="Swap for a similar food"
                        >
                          {options.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Totals vs targets */}
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40">
          <span className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Day total:</span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              Math.abs(plan.totals.kcal - result.calories) / result.calories <= 0.12
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
            }`}
          >
            {Math.round(plan.totals.kcal)} / {result.calories} kcal
          </span>
          {macroChip("P", plan.totals.proteinG, result.proteinG)}
          {macroChip("C", plan.totals.carbsG, result.carbsG)}
          {macroChip("F", plan.totals.fatG, result.fatG)}
        </div>
      </Card>

      {/* Shopping list */}
      {list.length > 0 && (
        <Card
          title="Shopping list"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18l-2 12H5L3 6zM3 6l1.5-3h5M9 9v3m6-3v3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {list.map(({ food, grams }) => (
              <div
                key={food.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-950/40"
              >
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{food.name}</p>
                <p className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                  {grams}g · ≈ {Math.max(1, Math.round(grams / food.servingG))} {food.servingLabel}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-zinc-400 dark:text-zinc-500">
            Nutrient values from USDA FoodData Central (public domain). Portions are estimates — eat until satisfied,
            adjust weekly.
          </p>
        </Card>
      )}

      {/* What to eat today */}
      <Card
        title="What to eat today"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v18M5 5l7 7 7-7M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
      >
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Harvard&apos;s Healthy Eating Plate is the simplest evidence-based guide: <strong>½ vegetables & fruit, ¼ whole
          grains, ¼ healthy protein</strong>, healthy oils, and water. The plan above follows it exactly.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {HARVARD_PLATE.map((group) => (
            <div key={group.name} className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{group.name}</h4>
                <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                  {group.share}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">{group.examples.join(" · ")}</p>
              <p className="mt-1.5 text-xs italic text-zinc-500 dark:text-zinc-400">{group.tip}</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Classic combos for: {GOALS.find((g) => g.id === activeGoal)?.label}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {GOALS.map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveGoal(g.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  activeGoal === g.id
                    ? "bg-emerald-600 text-white"
                    : "border border-zinc-200 bg-white text-zinc-600 hover:border-emerald-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {["breakfast", "lunch", "dinner", "snack"].map((slot) => (
              <div key={slot} className="rounded-xl border border-zinc-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  {slot === "snack" ? "Snack / dessert" : slot}
                </p>
                <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-zinc-700 dark:text-zinc-300">
                  {comboIdeas(activeGoal)[slot].map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Everyday stars */}
      <Card
        title="The 'best of the best' everyday foods"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8L12 2z" strokeLinejoin="round" />
          </svg>
        }
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {EVERYDAY_STARS.map((f) => (
            <div key={f.name} className="rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{f.name}</p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{f.why}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Eating a variety of these most days covers most of your micronutrient bases — no supplements required for most
          people.
        </p>
      </Card>
    </div>
  );
}

function comboIdeas(goal: Goal): Record<string, string[]> {
  const highProtein = goal !== "maintain";
  return {
    breakfast: highProtein
      ? ["Greek yogurt + berries + oats", "3-egg omelette with spinach + whole-wheat toast"]
      : ["Oats with fruit and nuts", "Whole-grain toast + eggs + fruit"],
    lunch: highProtein
      ? ["Chicken/grilled fish + quinoa + roasted vegetables", "Lentil or chickpea salad bowl + avocado"]
      : ["Rice bowl with vegetables + tofu/egg", "Whole-grain sandwich + salad + yogurt"],
    dinner: highProtein
      ? ["Salmon + brown rice + broccoli", "Lean meat stir-fry + vegetables + small rice"]
      : ["Vegetable curry + whole grains", "Fish + potatoes + green vegetables"],
    snack: highProtein
      ? ["Protein shake or cottage cheese", "Handful of almonds + fruit"]
      : ["Fruit + nuts", "Carrot sticks + hummus"],
  };
}
