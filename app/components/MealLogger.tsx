"use client";

import { useState, useMemo, useCallback } from "react";
import { FOODS, foodById, type Food } from "@/app/lib/foods";
import {
  logFood,
  removeLoggedFood,
  addWater,
  getWaterIntake,
  dailyNutrition,
  compareWithTarget,
  type MealLog,
} from "@/app/lib/meal-log";
import { macrosFor, DEFAULT_PROFILE, type Profile } from "@/app/lib/macros";
import { useLocalStorage } from "@/app/lib/use-local-state";
import { giCategory } from "@/app/lib/foods";
import { awardXP } from "@/app/lib/gamification";

// ── Food Search Modal ───────────────────────────────────────────────────
function FoodSearchModal({
  onSelect,
  onClose,
  profile,
}: {
  onSelect: (food: Food, grams: number) => void;
  onClose: () => void;
  profile: Profile;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    let results = FOODS;
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q)
      );
    }
    if (category !== "all") {
      results = results.filter((f) => f.category === category);
    }
    return results;
  }, [query, category]);

  const categories = [
    { id: "all", label: "All" },
    { id: "protein", label: "Protein" },
    { id: "dairy", label: "Dairy" },
    { id: "grain", label: "Grains" },
    { id: "veg", label: "Veg" },
    { id: "fruit", label: "Fruit" },
    { id: "fat", label: "Fats" },
    { id: "legume", label: "Legumes" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white p-5 shadow-2xl dark:bg-zinc-900 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Add food</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods..."
          className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          autoFocus
        />

        {/* Category chips */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
                category === c.id
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Food list */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-1.5">
          {filtered.slice(0, 50).map((food) => {
            const cat = giCategory(food.gi);
            return (
              <FoodRow
                key={food.id}
                food={food}
                giCategory={cat}
                onSelect={(grams) => {
                  onSelect(food, grams);
                  onClose();
                }}
              />
            );
          })}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-400">No foods found</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Food Row ────────────────────────────────────────────────────────────
function FoodRow({
  food,
  giCategory: gi,
  onSelect,
}: {
  food: Food;
  giCategory?: string;
  onSelect: (grams: number) => void;
}) {
  const [customGrams, setCustomGrams] = useState(food.servingG);
  const [expanded, setExpanded] = useState(false);

  const giColor =
    gi === "low"
      ? "text-emerald-600 dark:text-emerald-400"
      : gi === "medium"
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-3 transition hover:border-emerald-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-800">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
            {food.name}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {food.per100g.kcal} kcal · {food.per100g.proteinG}g protein per 100g
          </p>
        </div>
        {gi && (
          <span className={`text-xs font-bold ${giColor}`}>
            GI {food.gi}
          </span>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-2 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
        >
          {expanded ? "Less" : `+ ${food.servingG}g`}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min="10"
            max="1000"
            step="10"
            value={customGrams}
            onChange={(e) => setCustomGrams(parseInt(e.target.value) || food.servingG)}
            className="w-20 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-center text-sm font-medium dark:border-zinc-700 dark:bg-zinc-800"
          />
          <span className="text-xs text-zinc-500">grams</span>
          <button
            onClick={() => onSelect(customGrams)}
            className="ml-auto rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

// ── Water Tracker ───────────────────────────────────────────────────────
function WaterTracker({ date, targetL }: { date: string; targetL: number }) {
  const [water, setWater] = useState(getWaterIntake(date));
  const targetMl = Math.round(targetL * 1000);
  const progress = Math.min(100, (water / targetMl) * 100);

  const handleAdd = (ml: number) => {
    addWater(date, ml);
    setWater(getWaterIntake(date));
    awardXP("LOG_WATER", `Logged ${ml}ml water`);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">💧 Water</h4>
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          {(water / 1000).toFixed(1)}L / {(targetMl / 1000).toFixed(1)}L
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900/30">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-3 flex gap-2">
        {[200, 250, 500].map((ml) => (
          <button
            key={ml}
            onClick={() => handleAdd(ml)}
            className="flex-1 rounded-lg bg-blue-50 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
          >
            +{ml}ml
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main MealLogger ─────────────────────────────────────────────────────
export default function MealLogger() {
  const [profile] = useLocalStorage<Profile>("lifeos-profile", DEFAULT_PROFILE);
  const today = new Date().toISOString().split("T")[0];
  const [showSearch, setShowSearch] = useState(false);
  const [activeSlot, setActiveSlot] = useState<MealLog["meals"][0]["slot"]>("lunch");
  const [refreshKey, setRefreshKey] = useState(0);

  const targets = macrosFor(profile);
  const nutrition = dailyNutrition(today);
  const comparison = compareWithTarget(today, profile);

  const slots: { id: MealLog["meals"][0]["slot"]; label: string; emoji: string }[] = [
    { id: "breakfast", label: "Breakfast", emoji: "🌅" },
    { id: "lunch", label: "Lunch", emoji: "☀️" },
    { id: "dinner", label: "Dinner", emoji: "🌙" },
    { id: "snack", label: "Snack", emoji: "🍎" },
  ];

  const handleAddFood = useCallback(
    (food: Food, grams: number) => {
      logFood(today, activeSlot, food.id, grams);
      awardXP("LOG_MEAL", `Logged ${food.name} (${grams}g)`);
      setRefreshKey((k) => k + 1);
    },
    [today, activeSlot]
  );

  // Calorie progress
  const calPercent = Math.min(100, (nutrition.totalKcal / targets.calories) * 100);
  const protPercent = Math.min(100, (nutrition.totalProteinG / targets.proteinG) * 100);

  return (
    <div className="space-y-4" key={refreshKey}>
      {/* Macro summary */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Today&apos;s intake</h3>
        <div className="mt-3 grid grid-cols-4 gap-3">
          <div className="text-center">
            <p className="text-lg font-bold text-zinc-900 dark:text-white">{nutrition.totalKcal}</p>
            <p className="text-xs text-zinc-500">kcal</p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${calPercent}%` }}
              />
            </div>
            <p className="mt-0.5 text-[10px] text-zinc-400">{Math.round(calPercent)}% of {targets.calories}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {nutrition.totalProteinG}
            </p>
            <p className="text-xs text-zinc-500">protein</p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${protPercent}%` }}
              />
            </div>
            <p className="mt-0.5 text-[10px] text-zinc-400">{Math.round(protPercent)}%</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-zinc-900 dark:text-white">{nutrition.totalCarbsG}</p>
            <p className="text-xs text-zinc-500">carbs</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-zinc-900 dark:text-white">{nutrition.totalFatG}</p>
            <p className="text-xs text-zinc-500">fat</p>
          </div>
        </div>
      </div>

      {/* Water tracker */}
      <WaterTracker date={today} targetL={targets.waterL} />

      {/* Meal slots */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {slots.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSlot(s.id)}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeSlot === s.id
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {/* Add food button */}
      <button
        onClick={() => setShowSearch(true)}
        className="w-full rounded-2xl border-2 border-dashed border-zinc-300 bg-white py-4 text-sm font-semibold text-zinc-500 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-emerald-600"
      >
        + Add food to {activeSlot}
      </button>

      {/* Deviation from target */}
      {nutrition.totalKcal > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">vs Target</h4>
          <div className="mt-2 space-y-1.5">
            {[
              {
                label: "Calories",
                diff: comparison.calorieDiff,
                unit: "kcal",
                target: targets.calories,
              },
              {
                label: "Protein",
                diff: comparison.proteinDiff,
                unit: "g",
                target: targets.proteinG,
              },
              {
                label: "Carbs",
                diff: comparison.carbDiff,
                unit: "g",
                target: targets.carbsG,
              },
              {
                label: "Fat",
                diff: comparison.fatDiff,
                unit: "g",
                target: targets.fatG,
              },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">{m.label}</span>
                <span
                  className={
                    m.diff > 0
                      ? "text-amber-600 dark:text-amber-400"
                      : m.diff < -20
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400"
                  }
                >
                  {m.diff > 0 ? "+" : ""}
                  {m.diff} {m.unit}{" "}
                  <span className="text-zinc-400">
                    (target: {Math.round(m.target)})
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Food search modal */}
      {showSearch && (
        <FoodSearchModal
          profile={profile}
          onSelect={handleAddFood}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  );
}
