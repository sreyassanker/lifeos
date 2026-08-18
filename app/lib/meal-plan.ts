// Personalized meal plan generator.
// Approach: Harvard-plate templates (protein + whole grain + veg + fat, fruit with
// breakfast/snacks) sized to the user's calorie & macro targets, built from the
// curated whole-foods database. Generation is deterministic (seeded) so "regenerate"
// gives variety without hydration surprises.

import type { Food } from "@/app/lib/foods";
import { foodById, foodExcluded, FRUIT_POOL, GRAIN_POOL, PROTEIN_POOL, VEG_POOL, FAT_POOL } from "@/app/lib/foods";
import type { Diet, MacroResult } from "@/app/lib/macros";

export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

export interface PlannedItem {
  foodId: string;
  grams: number;
}

export interface PlannedMeal {
  slot: MealSlot;
  title: string;
  items: PlannedItem[];
}

export interface MealTotals {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface MealPlan {
  meals: PlannedMeal[];
  totals: MealTotals;
  targets: MacroResult;
}

// Deterministic PRNG (mulberry32) so plans are reproducible per seed.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T>(rand: () => number, arr: T[]): T => arr[Math.floor(rand() * arr.length)];

function filteredPool(diet: Diet, allergies: string[], ids: string[]): Food[] {
  const base = ids
    .map(foodById)
    .filter((f): f is Food => f !== undefined && !foodExcluded(f, allergies));
  // Never let an allergy empty a pool — fall back to any diet-compatible food.
  if (base.length > 0) return base;
  return ids.map(foodById).filter((f): f is Food => f !== undefined);
}

function itemNutrition(food: Food, grams: number): MealTotals {
  const k = grams / 100;
  return {
    kcal: food.per100g.kcal * k,
    proteinG: food.per100g.proteinG * k,
    carbsG: food.per100g.carbsG * k,
    fatG: food.per100g.fatG * k,
  };
}

const sumTotals = (totals: MealTotals[]): MealTotals =>
  totals.reduce(
    (acc, t) => ({
      kcal: acc.kcal + t.kcal,
      proteinG: acc.proteinG + t.proteinG,
      carbsG: acc.carbsG + t.carbsG,
      fatG: acc.fatG + t.fatG,
    }),
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );

const round5 = (n: number) => Math.max(0, Math.round(n / 5) * 5);

const BREAKFAST_PROTEIN: Record<Diet, string[]> = {
  omnivore: ["egg", "greek-yogurt-0", "cottage-cheese", "whey-protein", "tofu"],
  vegetarian: ["egg", "greek-yogurt-0", "cottage-cheese", "whey-protein", "tofu"],
  vegan: ["tofu", "tempeh", "pea-protein"],
};

const BREAKFAST_GRAIN: Record<Diet, string[]> = {
  omnivore: ["oats", "whole-wheat-bread", "rye-bread"],
  vegetarian: ["oats", "whole-wheat-bread", "rye-bread"],
  vegan: ["oats", "whole-wheat-bread", "rye-bread"],
};

// Calorie/protein share per meal slot by meals-per-day.
const SHARES: Record<number, { slot: MealSlot; share: number }[]> = {
  3: [
    { slot: "breakfast", share: 0.3 },
    { slot: "lunch", share: 0.35 },
    { slot: "dinner", share: 0.35 },
  ],
  4: [
    { slot: "breakfast", share: 0.27 },
    { slot: "lunch", share: 0.3 },
    { slot: "dinner", share: 0.28 },
    { slot: "snack", share: 0.15 },
  ],
  5: [
    { slot: "breakfast", share: 0.24 },
    { slot: "lunch", share: 0.27 },
    { slot: "dinner", share: 0.24 },
    { slot: "snack", share: 0.13 },
    { slot: "snack", share: 0.12 },
  ],
};

function buildMainMeal(
  rand: () => number,
  diet: Diet,
  allergies: string[],
  share: number,
  targets: MacroResult,
  isBreakfast: boolean
): PlannedMeal {
  const mealCal = targets.calories * share;
  const mealProtein = targets.proteinG * share;
  const mealCarbs = targets.carbsG * share;

  const proteinPool = filteredPool(diet, allergies, isBreakfast ? BREAKFAST_PROTEIN[diet] : PROTEIN_POOL[diet]);
  const grainPool = filteredPool(diet, allergies, isBreakfast ? BREAKFAST_GRAIN[diet] : GRAIN_POOL[diet]);
  const vegPool = filteredPool(diet, allergies, VEG_POOL);
  const fruitPool = filteredPool(diet, allergies, FRUIT_POOL);
  const fatPool = filteredPool(diet, allergies, FAT_POOL);

  const p = pick(rand, proteinPool);
  const v = pick(rand, vegPool);
  const g = pick(rand, grainPool);
  const fat = pick(rand, fatPool);

  const pGrams = round5((mealProtein / p.per100g.proteinG) * 100);
  const vGrams = 120;
  let gGrams = round5((mealCarbs / g.per100g.carbsG) * 100 * 0.6); // start conservative
  let fatGrams = 0;

  // Calibrate grain + fat against the meal calorie budget.
  for (let i = 0; i < 3; i++) {
    const pN = itemNutrition(p, pGrams);
    const vN = itemNutrition(v, vGrams);
    const gN = itemNutrition(g, gGrams);
    const beforeFat = pN.kcal + vN.kcal + gN.kcal;
    fatGrams = round5(Math.max(0, ((mealCal - beforeFat) / fat.per100g.kcal) * 100));
    const total = beforeFat + itemNutrition(fat, fatGrams).kcal;
    const gap = mealCal - total;
    gGrams = round5(gGrams + (gap / g.per100g.kcal) * 100);
  }
  fatGrams = Math.max(0, Math.min(80, fatGrams));

  const items: PlannedItem[] = [
    { foodId: p.id, grams: pGrams },
    ...(isBreakfast ? [] : [{ foodId: v.id, grams: vGrams }]),
    { foodId: g.id, grams: gGrams },
    ...(fatGrams >= 5 ? [{ foodId: fat.id, grams: fatGrams }] : []),
  ];

  if (isBreakfast) {
    const fruit = pick(rand, fruitPool);
    items.splice(1, 0, { foodId: fruit.id, grams: 120 });
  }

  return {
    slot: isBreakfast ? "breakfast" : "lunch", // dinner assigned later by order
    title: isBreakfast ? "Breakfast" : "",
    items: items.filter((it) => it.grams >= 10),
  };
}

function buildSnack(rand: () => number, diet: Diet, allergies: string[]): PlannedMeal {
  const fruitPool = filteredPool(diet, allergies, FRUIT_POOL);
  const fatPool = filteredPool(diet, allergies, FAT_POOL);
  const dairyPool = filteredPool(diet, allergies, ["greek-yogurt-0", "greek-yogurt-full", "cottage-cheese"]);
  const shakePool = filteredPool(diet, allergies, ["whey-protein", "pea-protein"]);
  const milkPool = filteredPool(diet, allergies, ["milk-2", "soy-milk", "oat-milk"]);

  const template = Math.floor(rand() * 3);
  const fruit = pick(rand, fruitPool);
  let items: PlannedItem[];

  if (template === 0 && dairyPool.length > 0) {
    // High-protein snack: dairy (or plant) + fruit
    const dairy = pick(rand, dairyPool);
    items = [
      { foodId: dairy.id, grams: 170 },
      { foodId: fruit.id, grams: 120 },
    ];
  } else if (template === 1 && shakePool.length > 0) {
    // Protein shake + fruit
    const shake = pick(rand, shakePool);
    const milk = pick(rand, milkPool);
    items = [
      { foodId: shake.id, grams: 30 },
      { foodId: milk.id, grams: 240 },
      { foodId: fruit.id, grams: 100 },
    ];
  } else {
    // Nuts/seeds + fruit
    const fat = pick(rand, fatPool);
    items = [
      { foodId: fat.id, grams: 28 },
      { foodId: fruit.id, grams: 150 },
    ];
  }

  return { slot: "snack", title: "Snack", items: items.filter((it) => it.grams >= 10) };
}

export function planDay(
  targets: MacroResult,
  diet: Diet,
  allergies: string[],
  mealsPerDay: number,
  seed: number
): MealPlan {
  const rand = rng(seed);
  const slots = SHARES[mealsPerDay] ?? SHARES[4];

  const meals: PlannedMeal[] = slots.map(({ slot, share }) => {
    if (slot === "snack") return buildSnack(rand, diet, allergies);
    return buildMainMeal(rand, diet, allergies, share, targets, slot === "breakfast");
  });

  // Fix the main-meal slot labels (breakfast/dinner naming) post-hoc for clarity.
  const named: PlannedMeal[] = meals.map((meal, i) => {
    if (meal.slot === "breakfast") return { ...meal, title: "Breakfast" };
    if (meal.slot === "snack") {
      const n = meals.slice(0, i).filter((m) => m.slot === "snack").length + 1;
      return { ...meal, title: `Snack ${n}` };
    }
    // First non-breakfast main meal = lunch, rest = dinner
    const mainsBefore = meals.slice(0, i).filter((m) => m.slot === "lunch" || m.slot === "dinner").length;
    return { ...meal, slot: mainsBefore === 0 ? "lunch" : "dinner", title: mainsBefore === 0 ? "Lunch" : "Dinner" };
  });

  return { meals: named, totals: totalsOf(named), targets };
}

export function totalsOf(meals: PlannedMeal[]): MealTotals {
  return sumTotals(meals.flatMap((meal) => meal.items.map((item) => itemNutrition(foodById(item.foodId)!, item.grams))));
}

/** Aggregate items into a shopping list (food name, total grams, servings). */
export function shoppingList(plan: MealPlan): { food: Food; grams: number }[] {
  const byId = new Map<string, number>();
  for (const meal of plan.meals) {
    for (const item of meal.items) {
      byId.set(item.foodId, (byId.get(item.foodId) ?? 0) + item.grams);
    }
  }
  return [...byId.entries()]
    .map(([id, grams]) => ({ food: foodById(id)!, grams }))
    .filter((e) => e.food !== undefined)
    .sort((a, b) => b.grams - a.grams);
}
