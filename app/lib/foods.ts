// Curated whole-foods database — natural, minimally processed foods with
// per-100g macros. Values derive from USDA FoodData Central (public domain)
// and standard nutrition references; servings are typical edible portions.
// Tags drive diet filtering (vegetarian / vegan).

export type FoodCategory = "protein" | "legume" | "dairy" | "grain" | "veg" | "fruit" | "fat" | "drink";

export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  per100g: { kcal: number; proteinG: number; carbsG: number; fatG: number; fiberG: number };
  servingG: number;
  servingLabel: string;
  tags: ("vegetarian" | "vegan")[];
  /** Glycemic Index (0–100). Source: Atkinson et al. 2021, International Tables of GI Values. */
  gi?: number;
  /** Key micronutrients per 100g. Source: USDA FoodData Central. */
  nutrients?: {
    ironMg?: number;      // Iron (mg)
    calciumMg?: number;   // Calcium (mg)
    vitaminDIU?: number;  // Vitamin D (IU)
    vitaminB12Mcg?: number; // Vitamin B12 (µg)
    zincMg?: number;      // Zinc (mg)
    magnesiumMg?: number; // Magnesium (mg)
  };
}

// ── Micronutrient RDA (Recommended Dietary Allowance) ──────────────────────
// Source: USDA Dietary Guidelines for Americans 2020–2025 (Paper #31)
export interface RDA {
  label: string;
  unit: string;
  male: number;  // RDA for adult males 19-50
  female: number; // RDA for adult females 19-50
  keySources: string;
}

export const MICRONUTRIENT_RDAS: RDA[] = [
  { label: "Iron", unit: "mg", male: 8, female: 18, keySources: "Red meat, lentils, spinach, fortified cereals" },
  { label: "Calcium", unit: "mg", male: 1000, female: 1000, keySources: "Dairy, tofu (calcium-set), kale, broccoli" },
  { label: "Vitamin D", unit: "IU", male: 600, female: 600, keySources: "Fatty fish, fortified dairy, sunlight" },
  { label: "Vitamin B12", unit: "µg", male: 2.4, female: 2.4, keySources: "Meat, fish, dairy, eggs" },
  { label: "Zinc", unit: "mg", male: 11, female: 8, keySources: "Meat, shellfish, legumes, nuts" },
  { label: "Magnesium", unit: "mg", male: 400, female: 310, keySources: "Nuts, seeds, dark chocolate, leafy greens" },
  { label: "Fiber", unit: "g", male: 38, female: 25, keySources: "Beans, oats, vegetables, fruits" },
];

/** Compute nutrient intake per serving */
export function nutrientPerServing(food: Food): Food["nutrients"] | undefined {
  if (!food.nutrients) return undefined;
  const k = food.servingG / 100;
  const n = food.nutrients;
  return {
    ironMg: n.ironMg !== undefined ? Math.round(n.ironMg * k * 10) / 10 : undefined,
    calciumMg: n.calciumMg !== undefined ? Math.round(n.calciumMg * k) : undefined,
    vitaminDIU: n.vitaminDIU !== undefined ? Math.round(n.vitaminDIU * k) : undefined,
    vitaminB12Mcg: n.vitaminB12Mcg !== undefined ? Math.round(n.vitaminB12Mcg * k * 100) / 100 : undefined,
    zincMg: n.zincMg !== undefined ? Math.round(n.zincMg * k * 10) / 10 : undefined,
    magnesiumMg: n.magnesiumMg !== undefined ? Math.round(n.magnesiumMg * k) : undefined,
  };
}

/** Aggregate micronutrient totals from a list of {foodId, grams} items */
export function totalNutrients(items: { foodId: string; grams: number }[]): Record<string, number> {
  const totals: Record<string, number> = { ironMg: 0, calciumMg: 0, vitaminDIU: 0, vitaminB12Mcg: 0, zincMg: 0, magnesiumMg: 0 };
  for (const item of items) {
    const food = foodById(item.foodId);
    if (!food?.nutrients) continue;
    const k = item.grams / 100;
    if (food.nutrients.ironMg !== undefined) totals.ironMg += food.nutrients.ironMg * k;
    if (food.nutrients.calciumMg !== undefined) totals.calciumMg += food.nutrients.calciumMg * k;
    if (food.nutrients.vitaminDIU !== undefined) totals.vitaminDIU += food.nutrients.vitaminDIU * k;
    if (food.nutrients.vitaminB12Mcg !== undefined) totals.vitaminB12Mcg += food.nutrients.vitaminB12Mcg * k;
    if (food.nutrients.zincMg !== undefined) totals.zincMg += food.nutrients.zincMg * k;
    if (food.nutrients.magnesiumMg !== undefined) totals.magnesiumMg += food.nutrients.magnesiumMg * k;
  }
  // Round all values
  for (const k of Object.keys(totals)) {
    totals[k] = Math.round(totals[k] * 10) / 10;
  }
  return totals;
}

/** GI category for display */
export function giCategory(gi?: number): "low" | "medium" | "high" | undefined {
  if (gi === undefined) return undefined;
  if (gi <= 55) return "low";
  if (gi <= 69) return "medium";
  return "high";
}

/** Glycemic Load = (GI × grams of available carbs) / 100. Per serving. */
export function glycemicLoad(food: Food): number | undefined {
  if (food.gi === undefined) return undefined;
  const carbsPerServing = (food.per100g.carbsG * food.servingG) / 100;
  return Math.round((food.gi * carbsPerServing) / 100 * 10) / 10;
}

const f = (
  id: string,
  name: string,
  category: FoodCategory,
  kcal: number,
  proteinG: number,
  carbsG: number,
  fatG: number,
  fiberG: number,
  servingG: number,
  servingLabel: string,
  tags: ("vegetarian" | "vegan")[] = [],
  gi?: number,
  nutrients?: Food["nutrients"]
): Food => ({ id, name, category, per100g: { kcal, proteinG, carbsG, fatG, fiberG }, servingG, servingLabel, tags, gi, nutrients });

export const FOODS: Food[] = [
  // ── Protein: meat, fish, eggs ────────────────────────────────────────────
  f("chicken-breast", "Chicken breast (cooked)", "protein", 165, 31, 0, 3.6, 0, 150, "palm-sized fillet", [], undefined, { ironMg: 1.0, zincMg: 1.0, magnesiumMg: 31 }),
  f("chicken-thigh", "Chicken thigh (cooked)", "protein", 209, 26, 0, 11, 0, 150, "1–2 thighs", [], undefined, { ironMg: 1.3, zincMg: 2.4, magnesiumMg: 25 }),
  f("turkey-breast", "Turkey breast (cooked)", "protein", 135, 30, 0, 1, 0, 150, "palm-sized slice", [], undefined, { ironMg: 1.4, zincMg: 2.0, magnesiumMg: 33 }),
  f("beef-sirloin", "Beef sirloin (cooked)", "protein", 217, 29, 0, 10, 0, 150, "deck-of-cards size", [], undefined, { ironMg: 2.6, zincMg: 6.0, magnesiumMg: 23, vitaminB12Mcg: 2.6 }),
  f("beef-mince", "Lean beef mince 93/7 (cooked)", "protein", 196, 23, 0, 11, 0, 150, "¾ cup cooked", [], undefined, { ironMg: 2.6, zincMg: 4.8, magnesiumMg: 20, vitaminB12Mcg: 2.4 }),
  f("beef-liver", "Beef liver (cooked)", "protein", 135, 20, 3.9, 3.6, 0, 100, "small piece", [], undefined, { ironMg: 6.5, zincMg: 4.0, magnesiumMg: 18, vitaminB12Mcg: 70.7, vitaminDIU: 42 }),
  f("pork-tenderloin", "Pork tenderloin (cooked)", "protein", 143, 26, 0, 4, 0, 150, "palm-sized fillet", [], undefined, { ironMg: 1.0, zincMg: 2.4, magnesiumMg: 28, vitaminB12Mcg: 0.6 }),
  f("lamb-lean", "Lamb (lean, cooked)", "protein", 258, 26, 0, 16, 0, 150, "palm-sized portion", [], undefined, { ironMg: 1.9, zincMg: 4.5, magnesiumMg: 22, vitaminB12Mcg: 2.7 }),
  f("salmon", "Salmon (cooked)", "protein", 206, 22, 0, 12, 0, 150, "1 fillet", [], undefined, { ironMg: 0.8, zincMg: 0.6, magnesiumMg: 29, vitaminDIU: 526, vitaminB12Mcg: 4.8 }),
  f("tuna", "Tuna (canned in water)", "protein", 116, 26, 0, 1, 0, 120, "1 small can", [], undefined, { ironMg: 1.0, zincMg: 0.9, magnesiumMg: 32, vitaminDIU: 236, vitaminB12Mcg: 8.5 }),
  f("cod", "Cod (cooked)", "protein", 105, 23, 0, 0.9, 0, 150, "1 fillet", [], undefined, { ironMg: 0.4, zincMg: 0.5, magnesiumMg: 41, vitaminDIU: 52, vitaminB12Mcg: 1.9 }),
  f("shrimp", "Shrimp (cooked)", "protein", 99, 24, 0.2, 0.3, 0, 120, "~15 medium shrimp", [], undefined, { ironMg: 2.1, zincMg: 1.6, magnesiumMg: 37, vitaminB12Mcg: 1.4 }),
  f("sardines", "Sardines (canned, drained)", "protein", 208, 25, 0, 11, 0, 85, "1 small can", [], undefined, { ironMg: 2.9, zincMg: 1.4, magnesiumMg: 39, vitaminDIU: 193, vitaminB12Mcg: 8.9 }),
  f("mussels", "Mussels (cooked)", "protein", 86, 12, 3.7, 2.2, 0, 150, "~20 mussels", [], undefined, { ironMg: 3.9, zincMg: 1.6, magnesiumMg: 37, vitaminDIU: 36, vitaminB12Mcg: 20.4 }),
  f("anchovies", "Anchovies (canned, drained)", "protein", 210, 29, 0, 10, 0, 45, "5–6 fillets", [], undefined, { ironMg: 3.3, zincMg: 1.7, magnesiumMg: 43, vitaminB12Mcg: 13.2 }),
  f("egg", "Eggs (whole)", "protein", 143, 13, 0.7, 9.5, 0, 50, "1 large egg", ["vegetarian"], undefined, { ironMg: 1.8, zincMg: 1.3, magnesiumMg: 12, vitaminDIU: 41, vitaminB12Mcg: 0.9 }),
  f("egg-white", "Egg whites", "protein", 52, 11, 0.7, 0.2, 0, 100, "~3 whites", ["vegetarian"], undefined, { ironMg: 0.0, zincMg: 0.0, magnesiumMg: 11, vitaminB12Mcg: 0.1 }),

  // ── Protein: plant ───────────────────────────────────────────────────────
  f("tofu", "Tofu (firm)", "protein", 144, 16, 3, 9, 0.3, 130, "½ block", ["vegetarian", "vegan"]),
  f("tempeh", "Tempeh", "protein", 193, 19, 9, 11, 4, 100, "½ pack", ["vegetarian", "vegan"]),
  f("seitan", "Seitan", "protein", 147, 25, 8, 2, 0, 100, "palm-sized piece", ["vegetarian", "vegan"]),
  f("edamame", "Edamame (cooked)", "protein", 121, 12, 9, 5, 5, 100, "¾ cup shelled", ["vegetarian", "vegan"]),
  f("nutritional-yeast", "Nutritional yeast", "protein", 380, 50, 32, 5, 16, 10, "2 tbsp", ["vegetarian", "vegan"]),

  // ── Legumes ──────────────────────────────────────────────────────────────
  f("lentils", "Lentils (cooked)", "legume", 116, 9, 20, 0.4, 7.9, 150, "¾ cup cooked", ["vegetarian", "vegan"], 32, { ironMg: 3.3, zincMg: 1.3, magnesiumMg: 36 }),
  f("chickpeas", "Chickpeas (cooked)", "legume", 164, 8.9, 27, 2.6, 7.6, 150, "¾ cup cooked", ["vegetarian", "vegan"], 28, { ironMg: 2.9, zincMg: 1.5, magnesiumMg: 48 }),
  f("black-beans", "Black beans (cooked)", "legume", 132, 8.9, 24, 0.5, 8.7, 150, "¾ cup cooked", ["vegetarian", "vegan"], 30, { ironMg: 2.1, zincMg: 1.0, magnesiumMg: 70 }),
  f("kidney-beans", "Kidney beans (cooked)", "legume", 127, 8.7, 23, 0.5, 6.4, 150, "¾ cup cooked", ["vegetarian", "vegan"], 24, { ironMg: 2.9, zincMg: 1.0, magnesiumMg: 45 }),
  f("white-beans", "White beans (cooked)", "legume", 139, 9.7, 25, 0.4, 6.3, 150, "¾ cup cooked", ["vegetarian", "vegan"], 31),
  f("mung-beans", "Mung beans (cooked)", "legume", 105, 7, 19, 0.4, 7.6, 150, "¾ cup cooked", ["vegetarian", "vegan"], 31),
  f("soybeans", "Soybeans (cooked)", "legume", 173, 16.6, 9.9, 9, 6, 150, "¾ cup cooked", ["vegetarian", "vegan"], 16),
  f("peas", "Green peas (cooked)", "legume", 84, 5.4, 14, 0.2, 5.5, 120, "¾ cup", ["vegetarian", "vegan"], 51),
  f("peanut-butter", "Peanut butter (natural)", "legume", 588, 25, 20, 50, 6, 32, "2 tbsp", ["vegetarian", "vegan"]),
  f("hummus", "Hummus", "legume", 166, 8, 14, 10, 6, 60, "¼ cup", ["vegetarian", "vegan"]),

  // ── Dairy ────────────────────────────────────────────────────────────────
  f("greek-yogurt-0", "Greek yogurt (0% fat)", "dairy", 59, 10, 3.6, 0.4, 0, 170, "1 cup", ["vegetarian"], undefined, { calciumMg: 110, vitaminDIU: 0, vitaminB12Mcg: 0.8, magnesiumMg: 11 }),
  f("greek-yogurt-full", "Greek yogurt (full-fat)", "dairy", 97, 9, 4, 5, 0, 170, "1 cup", ["vegetarian"], undefined, { calciumMg: 100, vitaminDIU: 0, vitaminB12Mcg: 0.7, magnesiumMg: 10 }),
  f("milk-2", "Milk (2%)", "dairy", 50, 3.3, 4.8, 2, 0, 240, "1 glass", ["vegetarian"], undefined, { calciumMg: 293, vitaminDIU: 98, vitaminB12Mcg: 1.1, magnesiumMg: 24 }),
  f("kefir", "Kefir", "dairy", 61, 3.2, 4.8, 3.3, 0, 240, "1 glass", ["vegetarian"], undefined, { calciumMg: 300, vitaminDIU: 0, vitaminB12Mcg: 0.4, magnesiumMg: 25 }),
  f("cottage-cheese", "Cottage cheese (1%)", "dairy", 72, 12, 2.7, 1, 0, 170, "1 cup", ["vegetarian"], undefined, { calciumMg: 103, vitaminDIU: 0, vitaminB12Mcg: 0.6, magnesiumMg: 10 }),
  f("cheddar", "Cheddar cheese", "dairy", 403, 25, 1.3, 33, 0, 30, "1 small cube", ["vegetarian"]),
  f("mozzarella", "Mozzarella (part-skim)", "dairy", 280, 28, 3, 17, 0, 50, "1 ball", ["vegetarian"]),
  f("feta", "Feta cheese", "dairy", 264, 14, 4, 21, 0, 30, "2 tbsp crumbled", ["vegetarian"]),
  f("parmesan", "Parmesan cheese", "dairy", 431, 38, 4, 29, 0, 15, "2 tbsp grated", ["vegetarian"]),
  f("ricotta", "Ricotta (part-skim)", "dairy", 138, 11, 5, 8, 0, 100, "½ cup", ["vegetarian"]),

  // ── Grains ───────────────────────────────────────────────────────────────
  // GI values from Atkinson et al. (2021) International Tables of GI Values
  f("oats", "Oats (rolled, dry)", "grain", 389, 16.9, 66, 6.9, 10.6, 50, "½ cup dry", ["vegetarian", "vegan"], 55),
  f("brown-rice", "Brown rice (cooked)", "grain", 112, 2.6, 24, 0.9, 1.8, 150, "¾ cup cooked", ["vegetarian", "vegan"], 68),
  f("white-rice", "White rice (cooked)", "grain", 130, 2.7, 28, 0.3, 0.4, 150, "¾ cup cooked", ["vegetarian", "vegan"], 73),
  f("quinoa", "Quinoa (cooked)", "grain", 120, 4.4, 21, 1.9, 2.8, 150, "¾ cup cooked", ["vegetarian", "vegan"], 53),
  f("buckwheat", "Buckwheat (cooked)", "grain", 92, 3.4, 20, 0.6, 2.7, 150, "¾ cup cooked", ["vegetarian", "vegan"], 49),
  f("millet", "Millet (cooked)", "grain", 119, 3.5, 24, 1, 1.3, 150, "¾ cup cooked", ["vegetarian", "vegan"], 71),
  f("amaranth", "Amaranth (cooked)", "grain", 102, 3.8, 19, 1.6, 2.1, 150, "¾ cup cooked", ["vegetarian", "vegan"], 35),
  f("barley", "Barley (cooked)", "grain", 123, 2.3, 28, 0.4, 3.8, 150, "¾ cup cooked", ["vegetarian", "vegan"], 28),
  f("farro", "Farro (cooked)", "grain", 170, 5.5, 34, 1.2, 5, 150, "¾ cup cooked", ["vegetarian", "vegan"], 40),
  f("whole-wheat-pasta", "Whole-wheat pasta (cooked)", "grain", 124, 5.3, 26, 0.5, 3, 150, "¾ cup cooked", ["vegetarian", "vegan"], 42),
  f("whole-wheat-bread", "Whole-wheat bread", "grain", 247, 13, 41, 3.4, 7, 60, "2 slices", ["vegetarian", "vegan"], 74),
  f("rye-bread", "Rye bread", "grain", 259, 8.5, 48, 3.3, 5.8, 60, "2 slices", ["vegetarian", "vegan"], 65),
  f("corn-tortilla", "Corn tortilla", "grain", 218, 5.7, 45, 2.9, 6.3, 30, "1 tortilla", ["vegetarian", "vegan"], 52),
  f("couscous", "Couscous (cooked)", "grain", 112, 3.8, 23, 0.2, 1.4, 150, "¾ cup cooked", ["vegetarian", "vegan"], 65),
  f("sweet-potato", "Sweet potato (baked)", "grain", 90, 2, 21, 0.2, 3.3, 200, "1 medium", ["vegetarian", "vegan"], 61),
  f("potato", "Potato (baked, with skin)", "grain", 93, 2.5, 21, 0.1, 2.2, 200, "1 medium", ["vegetarian", "vegan"], 78),

  // ── Vegetables ───────────────────────────────────────────────────────────
  f("broccoli", "Broccoli (cooked)", "veg", 35, 2.4, 7, 0.4, 3.3, 120, "1 cup cooked", ["vegetarian", "vegan"], undefined, { ironMg: 1.0, calciumMg: 62, magnesiumMg: 33 }),
  f("spinach", "Spinach (cooked)", "veg", 23, 3, 3.8, 0.3, 2.4, 120, "1 cup cooked", ["vegetarian", "vegan"], undefined, { ironMg: 3.6, calciumMg: 136, magnesiumMg: 87 }),
  f("kale", "Kale (raw)", "veg", 49, 4.3, 8.8, 0.9, 3.6, 80, "2 cups raw", ["vegetarian", "vegan"], undefined, { ironMg: 1.5, calciumMg: 150, magnesiumMg: 33 }),
  f("arugula", "Arugula (raw)", "veg", 25, 2.6, 3.7, 0.7, 1.6, 60, "2 cups raw", ["vegetarian", "vegan"]),
  f("bok-choy", "Bok choy (cooked)", "veg", 13, 1.5, 2.2, 0.2, 1, 120, "1 cup cooked", ["vegetarian", "vegan"]),
  f("bell-pepper", "Bell pepper (red)", "veg", 31, 1, 6, 0.3, 2.1, 120, "1 large pepper", ["vegetarian", "vegan"]),
  f("carrot", "Carrots (raw)", "veg", 41, 0.9, 10, 0.2, 2.8, 100, "1 medium", ["vegetarian", "vegan"]),
  f("tomato", "Tomato (raw)", "veg", 18, 0.9, 3.9, 0.2, 1.2, 150, "1 medium", ["vegetarian", "vegan"]),
  f("cucumber", "Cucumber (raw)", "veg", 15, 0.7, 3.6, 0.1, 0.5, 100, "½ cucumber", ["vegetarian", "vegan"]),
  f("zucchini", "Zucchini (cooked)", "veg", 15, 1.1, 3.1, 0.2, 1, 120, "1 cup cooked", ["vegetarian", "vegan"]),
  f("cauliflower", "Cauliflower (cooked)", "veg", 23, 1.8, 5, 0.4, 2.3, 120, "1 cup cooked", ["vegetarian", "vegan"]),
  f("cabbage", "Cabbage (raw)", "veg", 25, 1.3, 5.8, 0.1, 2.5, 100, "1 cup shredded", ["vegetarian", "vegan"]),
  f("onion", "Onion (raw)", "veg", 40, 1.1, 9.3, 0.1, 1.7, 60, "½ medium", ["vegetarian", "vegan"]),
  f("mushroom", "Mushrooms (cooked)", "veg", 28, 2.2, 5.3, 0.5, 2.2, 100, "1 cup cooked", ["vegetarian", "vegan"]),
  f("asparagus", "Asparagus (cooked)", "veg", 22, 2.4, 4.1, 0.2, 2, 120, "1 cup cooked", ["vegetarian", "vegan"]),
  f("green-beans", "Green beans (cooked)", "veg", 35, 1.9, 7.9, 0.2, 3.2, 120, "1 cup cooked", ["vegetarian", "vegan"]),
  f("brussels-sprouts", "Brussels sprouts (cooked)", "veg", 36, 2.6, 9, 0.5, 4.1, 120, "1 cup cooked", ["vegetarian", "vegan"]),
  f("eggplant", "Eggplant (cooked)", "veg", 35, 0.8, 9, 0.2, 2.5, 120, "1 cup cooked", ["vegetarian", "vegan"]),
  f("romaine", "Romaine lettuce", "veg", 17, 1.2, 3.3, 0.3, 2.1, 80, "2 cups", ["vegetarian", "vegan"]),
  f("beet", "Beets (cooked)", "veg", 43, 1.6, 10, 0.2, 2.8, 120, "1 cup sliced", ["vegetarian", "vegan"]),
  f("sweet-corn", "Sweet corn (cooked)", "veg", 96, 3.4, 21, 1.5, 2.4, 120, "1 cup", ["vegetarian", "vegan"]),
  f("celery", "Celery (raw)", "veg", 16, 0.7, 3, 0.2, 1.6, 100, "2 stalks", ["vegetarian", "vegan"]),
  f("radish", "Radishes (raw)", "veg", 16, 0.7, 3.4, 0.1, 1.6, 80, "½ cup sliced", ["vegetarian", "vegan"]),
  f("avocado", "Avocado", "veg", 160, 2, 8.5, 15, 6.7, 100, "½ avocado", ["vegetarian", "vegan"]),

  // ── Fruit ────────────────────────────────────────────────────────────────
  f("apple", "Apple", "fruit", 52, 0.3, 14, 0.2, 2.4, 180, "1 medium", ["vegetarian", "vegan"], 36),
  f("banana", "Banana", "fruit", 89, 1.1, 23, 0.3, 2.6, 120, "1 medium", ["vegetarian", "vegan"], 51),
  f("blueberries", "Blueberries", "fruit", 57, 0.7, 14, 0.3, 2.4, 100, "1 cup", ["vegetarian", "vegan"], 53),
  f("strawberries", "Strawberries", "fruit", 32, 0.7, 7.7, 0.3, 2, 150, "1 cup", ["vegetarian", "vegan"], 41),
  f("raspberries", "Raspberries", "fruit", 52, 1.2, 12, 0.7, 6.5, 100, "1 cup", ["vegetarian", "vegan"], 32),
  f("orange", "Orange", "fruit", 47, 0.9, 12, 0.1, 2.4, 150, "1 medium", ["vegetarian", "vegan"], 43),
  f("grapefruit", "Grapefruit", "fruit", 42, 0.8, 10.7, 0.1, 1.6, 200, "½ grapefruit", ["vegetarian", "vegan"], 25),
  f("grapes", "Grapes", "fruit", 69, 0.7, 18, 0.2, 0.9, 120, "1 cup", ["vegetarian", "vegan"], 59),
  f("mango", "Mango", "fruit", 60, 0.8, 15, 0.4, 1.6, 150, "1 cup diced", ["vegetarian", "vegan"], 51),
  f("pineapple", "Pineapple", "fruit", 50, 0.5, 13, 0.1, 1.4, 150, "1 cup chunks", ["vegetarian", "vegan"], 66),
  f("watermelon", "Watermelon", "fruit", 30, 0.6, 7.6, 0.2, 0.4, 200, "1 slice", ["vegetarian", "vegan"], 76),
  f("kiwi", "Kiwi", "fruit", 61, 1.1, 15, 0.5, 3, 80, "1 kiwi", ["vegetarian", "vegan"], 58),
  f("pear", "Pear", "fruit", 57, 0.4, 15, 0.1, 3.1, 180, "1 medium", ["vegetarian", "vegan"], 38),
  f("peach", "Peach", "fruit", 39, 0.9, 9.5, 0.3, 1.5, 150, "1 medium", ["vegetarian", "vegan"], 42),
  f("cherries", "Cherries", "fruit", 63, 1.1, 16, 0.2, 2.1, 120, "1 cup", ["vegetarian", "vegan"], 22),
  f("pomegranate", "Pomegranate arils", "fruit", 83, 1.7, 19, 1.2, 4, 100, "½ cup arils", ["vegetarian", "vegan"], 35),
  f("papaya", "Papaya", "fruit", 43, 0.5, 11, 0.3, 1.7, 150, "1 cup cubed", ["vegetarian", "vegan"], 60),
  f("cantaloupe", "Cantaloupe", "fruit", 34, 0.8, 8.2, 0.2, 0.9, 150, "1 cup cubed", ["vegetarian", "vegan"], 65),
  f("dates", "Dates (dried)", "fruit", 282, 2.5, 75, 0.4, 8, 40, "3–4 dates", ["vegetarian", "vegan"], 42),
  f("dried-apricots", "Dried apricots", "fruit", 241, 3.4, 63, 0.5, 7.3, 40, "6–8 halves", ["vegetarian", "vegan"], 32),
  f("raisins", "Raisins", "fruit", 299, 3.1, 79, 0.5, 3.7, 30, "small handful", ["vegetarian", "vegan"], 64),

  // ── Fats, nuts, seeds ────────────────────────────────────────────────────
  f("almonds", "Almonds", "fat", 579, 21, 22, 50, 12.5, 28, "small handful", ["vegetarian", "vegan"], undefined, { calciumMg: 269, magnesiumMg: 270, zincMg: 3.1, ironMg: 3.7 }),
  f("walnuts", "Walnuts", "fat", 654, 15, 14, 65, 6.7, 28, "small handful", ["vegetarian", "vegan"], undefined, { magnesiumMg: 158, zincMg: 2.0, ironMg: 1.6 }),
  f("cashews", "Cashews", "fat", 553, 18, 30, 44, 3.3, 28, "small handful", ["vegetarian", "vegan"]),
  f("peanuts", "Peanuts", "fat", 567, 26, 16, 49, 8.5, 28, "small handful", ["vegetarian", "vegan"]),
  f("chia-seeds", "Chia seeds", "fat", 486, 17, 42, 31, 34, 20, "1½ tbsp", ["vegetarian", "vegan"]),
  f("flaxseed", "Ground flaxseed", "fat", 534, 18, 29, 42, 27, 15, "1½ tbsp", ["vegetarian", "vegan"]),
  f("pumpkin-seeds", "Pumpkin seeds", "fat", 559, 30, 11, 49, 6, 28, "small handful", ["vegetarian", "vegan"]),
  f("sunflower-seeds", "Sunflower seeds", "fat", 584, 21, 20, 51, 8.6, 28, "small handful", ["vegetarian", "vegan"]),
  f("sesame-seeds", "Sesame seeds", "fat", 573, 18, 23, 50, 11.8, 15, "1 tbsp", ["vegetarian", "vegan"]),
  f("hemp-seeds", "Hemp seeds", "fat", 553, 32, 9, 49, 4, 28, "3 tbsp", ["vegetarian", "vegan"]),
  f("tahini", "Tahini (sesame paste)", "fat", 595, 17, 21, 54, 9.3, 16, "1 tbsp", ["vegetarian", "vegan"]),
  f("olive-oil", "Olive oil", "fat", 884, 0, 0, 100, 0, 14, "1 tbsp", ["vegetarian", "vegan"]),
  f("dark-chocolate", "Dark chocolate 70–85%", "fat", 598, 7.8, 46, 43, 11, 20, "2 squares", ["vegetarian", "vegan"]),

  // ── Drinks & other ───────────────────────────────────────────────────────
  f("soy-milk", "Soy milk (unsweetened)", "drink", 33, 2.9, 1.7, 1.8, 0.6, 240, "1 glass", ["vegetarian", "vegan"]),
  f("oat-milk", "Oat milk (unsweetened)", "drink", 39, 1, 6.6, 1.5, 0.8, 240, "1 glass", ["vegetarian", "vegan"]),
  f("almond-milk", "Almond milk (unsweetened)", "drink", 15, 0.6, 0.3, 1.1, 0.3, 240, "1 glass", ["vegetarian", "vegan"]),
  f("coconut-milk", "Coconut milk (canned)", "drink", 230, 2.3, 5.5, 24, 0, 60, "¼ cup", ["vegetarian", "vegan"]),
];

export const FOOD_BY_ID = new Map(FOODS.map((food) => [food.id, food]));

export function foodById(id: string): Food | undefined {
  return FOOD_BY_ID.get(id);
}

// Diet-appropriate pools for meal building.
export const PROTEIN_POOL: Record<"omnivore" | "vegetarian" | "vegan", string[]> = {
  omnivore: [
    "chicken-breast", "turkey-breast", "beef-sirloin", "pork-tenderloin", "salmon", "tuna", "cod", "shrimp",
    "egg", "greek-yogurt-0", "cottage-cheese", "tofu", "tempeh", "lentils", "chickpeas", "black-beans",
    "edamame",
  ],
  vegetarian: [
    "egg", "greek-yogurt-0", "greek-yogurt-full", "cottage-cheese", "tofu", "tempeh", "lentils", "chickpeas",
    "black-beans", "kidney-beans", "edamame", "peas", "seitan",
  ],
  vegan: [
    "tofu", "tempeh", "seitan", "lentils", "chickpeas", "black-beans", "kidney-beans", "white-beans",
    "mung-beans", "soybeans", "edamame", "peas",
  ],
};

export const GRAIN_POOL: Record<"omnivore" | "vegetarian" | "vegan", string[]> = {
  omnivore: ["brown-rice", "quinoa", "whole-wheat-pasta", "whole-wheat-bread", "sweet-potato", "potato", "oats", "buckwheat"],
  vegetarian: ["brown-rice", "quinoa", "whole-wheat-pasta", "whole-wheat-bread", "sweet-potato", "potato", "oats", "buckwheat", "farro", "millet"],
  vegan: ["brown-rice", "quinoa", "whole-wheat-pasta", "whole-wheat-bread", "sweet-potato", "potato", "oats", "buckwheat", "farro", "millet"],
};

export const VEG_POOL: string[] = [
  "broccoli", "spinach", "kale", "arugula", "bok-choy", "bell-pepper", "carrot", "tomato", "cucumber",
  "zucchini", "cauliflower", "cabbage", "mushroom", "asparagus", "green-beans", "brussels-sprouts",
  "eggplant", "beet", "sweet-corn", "romaine",
];

export const FRUIT_POOL: string[] = [
  "apple", "banana", "blueberries", "strawberries", "raspberries", "orange", "mango", "pineapple", "kiwi",
  "pear", "peach", "cherries", "pomegranate", "grapes", "watermelon",
];

export const FAT_POOL: string[] = ["olive-oil", "almonds", "walnuts", "avocado", "tahini", "pumpkin-seeds"];

export const DAIRY_POOL: string[] = ["greek-yogurt-0", "greek-yogurt-full", "cottage-cheese", "kefir"];

export function mealFoodsFor(diet: "omnivore" | "vegetarian" | "vegan"): Food[] {
  const pools = new Set([
    ...PROTEIN_POOL[diet],
    ...GRAIN_POOL[diet],
    ...VEG_POOL,
    ...FRUIT_POOL,
    ...FAT_POOL,
    ...(diet === "omnivore" ? DAIRY_POOL : diet === "vegetarian" ? DAIRY_POOL : []),
  ]);
  return FOODS.filter((food) => pools.has(food.id));
}

/** True when a food matches an allergy string (name or category-level like "dairy"/"nuts"). */
export function foodExcluded(food: Food, allergies: string[]): boolean {
  return allergies.some((a) => {
    const al = a.trim().toLowerCase();
    if (!al) return false;
    if (food.name.toLowerCase().includes(al)) return true;
    if (al === "dairy" || al === "milk" || al === "lactose") {
      return food.category === "dairy";
    }
    if (al === "nuts" || al === "nut" || al === "peanut" || al === "peanuts") {
      return food.category === "fat" && /almond|walnut|cashew|peanut|pumpkin|sunflower|sesame|hemp|tahini|chocolate|flax|chia/.test(food.name.toLowerCase());
    }
    if (al === "gluten" || al === "wheat") {
      return /bread|pasta|wheat|rye|barley|farro|couscous/.test(food.name.toLowerCase());
    }
    if (al === "egg" || al === "eggs") return food.name.toLowerCase().includes("egg");
    if (al === "soy" || al === "soya") return /soy|tofu|tempeh|edamame/.test(food.name.toLowerCase());
    return false;
  });
}
