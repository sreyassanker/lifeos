// Nutrition calculations, based on:
// - Mifflin-St Jeor equation for BMR (validated in multiple comparisons, remains the
//   most accurate population-level equation for healthy adults)
// - Protein: RDA 0.8 g/kg; sedentary 1.2 g/kg; muscle gain 1.6–2.2 g/kg;
//   fat loss 1.8–2.2 g/kg (NASM; ACSM 2025 Position Stand recommends ≥1.6 g/kg
//   for RT participants). Zhao et al. (2024) meta-analysis found protein supplementation
//   significantly improved endurance performance (SMD 0.31) and muscle glycogen.
// - Harvard Healthy Eating Plate for food guidance
// - Female athletes: watch for RED-S (Relative Energy Deficiency in Sport) —
//   ensure energy availability ≥45 kcal/kg FFM/day; monitor iron, calcium, vitamin D
//   (Grabia et al. 2024). Vegan/vegetarian athletes may benefit from creatine
//   supplementation (3–5 g/day monohydrate) due to lower baseline stores.
//   (Gutiérrez-Hellín et al. 2025; Wang et al. 2024: +4.43 kg upper-body, +11.35 kg
//   lower-body strength with creatine + RT in adults <50).

export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "maintain" | "cut" | "lean_bulk" | "bulk";
export type Diet = "omnivore" | "vegetarian" | "vegan";

export const DIETS: { id: Diet; label: string }[] = [
  { id: "omnivore", label: "Omnivore (eat everything)" },
  { id: "vegetarian", label: "Vegetarian (no meat/fish)" },
  { id: "vegan", label: "Vegan (no animal products)" },
];

export const DEFAULT_PROFILE: Profile = {
  sex: "male",
  age: 30,
  weightKg: 70,
  heightCm: 175,
  activity: "moderate",
  goal: "maintain",
  diet: "omnivore",
  allergies: [],
  mealsPerDay: 4,
  country: "",
  state: "",
};

export interface Profile {
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
  activity: ActivityLevel;
  goal: Goal;
  /** Body measurements in cm — drives body fat % and shape analysis. */
  measurements?: Partial<import("@/app/lib/body").Measurements>;
  /** Target body-fat % chosen in the Body tab — drives the goal avatar + projection. */
  targetBodyFat?: number;
  diet: Diet;
  allergies: string[];
  mealsPerDay: 3 | 4 | 5;
  /** Country code (ISO 3166-1 alpha-2) — drives regional food availability and dietary guidance. */
  country: string;
  /** State / region code within the country — fine-tunes local food preferences. */
  state: string;
}

export const ACTIVITY_LEVELS: { id: ActivityLevel; label: string; factor: number; example: string }[] = [
  { id: "sedentary", label: "Sedentary", factor: 1.2, example: "Desk job, little exercise" },
  { id: "light", label: "Lightly active", factor: 1.375, example: "Exercise 1–3 days/week" },
  { id: "moderate", label: "Moderately active", factor: 1.55, example: "Exercise 3–5 days/week" },
  { id: "active", label: "Very active", factor: 1.725, example: "Exercise 6–7 days/week" },
  { id: "very_active", label: "Athlete", factor: 1.9, example: "Hard training, physical job" },
];

export const GOALS: { id: Goal; label: string; calAdjust: number; protein: [number, number]; note: string }[] = [
  { id: "maintain", label: "Maintain weight", calAdjust: 0, protein: [1.6, 2.0], note: "Eat at maintenance (TDEE)." },
  {
    id: "cut",
    label: "Lose fat (cut)",
    calAdjust: -500,
    protein: [1.8, 2.2],
    note: "Moderate deficit of ~500 kcal/day. High protein protects muscle while you lose fat.",
  },
  {
    id: "lean_bulk",
    label: "Lean muscle gain",
    calAdjust: 150,
    protein: [1.6, 2.0],
    note: "Small surplus so you gain mostly muscle, not fat.",
  },
  {
    id: "bulk",
    label: "Bulk (maximize gains)",
    calAdjust: 350,
    protein: [1.6, 2.0],
    note: "Larger surplus. Expect some fat gain alongside muscle.",
  },
];

export function bmr(p: Profile): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return p.sex === "male" ? base + 5 : base - 161;
}

export function tdee(p: Profile): number {
  const factor = ACTIVITY_LEVELS.find((a) => a.id === p.activity)?.factor ?? 1.375;
  return Math.round(bmr(p) * factor);
}

export interface MacroResult {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  proteinRange: string;
  waterL: number;
  note: string;
}

export function macrosFor(p: Profile): MacroResult {
  const goal = GOALS.find((g) => g.id === p.goal) ?? GOALS[0];
  const calories = Math.max(1200, tdee(p) + goal.calAdjust);

  // Protein in the middle of the goal's evidence-based range.
  const proteinG = Math.round(p.weightKg * ((goal.protein[0] + goal.protein[1]) / 2));

  // Fat ~0.8–1 g/kg (supports hormones; enough to keep meals palatable).
  const fatG = Math.round(p.weightKg * 0.9);

  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4));

  // NASEM adequate intake for total water: 3.7 L/day men, 2.7 L/day women.
  const waterL = p.sex === "male" ? 3.7 : 2.7;

  return {
    calories,
    proteinG,
    carbsG,
    fatG,
    proteinRange: `${Math.round(p.weightKg * goal.protein[0])}–${Math.round(p.weightKg * goal.protein[1])} g`,
    waterL,
    note: goal.note,
  };
}

export interface FoodGroup {
  name: string;
  share: string;
  examples: string[];
  tip: string;
}

// Harvard Healthy Eating Plate: 1/2 veg + fruit, 1/4 whole grains, 1/4 healthy protein.
export const HARVARD_PLATE: FoodGroup[] = [
  {
    name: "Vegetables & fruit",
    share: "½ of your plate",
    examples: ["Leafy greens", "Broccoli, peppers, carrots", "Berries, apples, citrus", "Tomatoes, cucumber"],
    tip: "The more color and variety, the better. Eat vegetables at every meal.",
  },
  {
    name: "Whole grains",
    share: "¼ of your plate",
    examples: ["Oats, quinoa, brown rice", "Whole-wheat bread & pasta", "Buckwheat, barley, millet"],
    tip: "Limit refined grains (white rice, white bread) — they spike blood sugar.",
  },
  {
    name: "Healthy protein",
    share: "¼ of your plate",
    examples: ["Fish, chicken, turkey", "Beans, lentils, tofu", "Eggs, yogurt, nuts"],
    tip: "Vary your sources. Limit red meat and cheese; avoid processed meats.",
  },
  {
    name: "Healthy oils & water",
    share: "Moderate",
    examples: ["Olive oil, canola oil", "Nuts, seeds, avocado", "Water, tea, coffee"],
    tip: "Cook with healthy oils, skip sugary drinks — water is the default drink.",
  },
];

// ── Adaptive calorie adjustment (Paper #21: Hall's Dynamic Model concept) ──
// Monitors weight trend over 2+ weeks and adjusts TDEE if progress stalls.
// Based on: if weight loss < 0.2 kg/week during a cut → reduce by 100 kcal;
//           if weight loss > 1 kg/week → increase by 100 kcal (too aggressive).
export interface AdaptiveResult {
  adjustedCalories: number;
  trendKgPerWeek: number;
  adjustment: number;
  reason: string;
}

export function adaptiveCalories(
  currentCalories: number,
  weightHistory: { date: string; value: number }[],
  goal: Goal
): AdaptiveResult {
  if (weightHistory.length < 3) {
    return { adjustedCalories: currentCalories, trendKgPerWeek: 0, adjustment: 0, reason: "Need at least 3 weigh-ins to estimate trend." };
  }

  // Use first and last points for trend (simple linear slope)
  const first = weightHistory[0];
  const last = weightHistory[weightHistory.length - 1];
  const daysDiff = (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff < 7) {
    return { adjustedCalories: currentCalories, trendKgPerWeek: 0, adjustment: 0, reason: "Need at least 7 days of data for trend." };
  }
  const weeksDiff = daysDiff / 7;
  const trendKgPerWeek = (last.value - first.value) / weeksDiff;

  let adjustment = 0;
  let reason = "";

  if (goal === "cut") {
    if (trendKgPerWeek > -0.1) {
      // Weight not dropping — reduce calories
      adjustment = -100;
      reason = `Weight stalled (${trendKgPerWeek.toFixed(2)} kg/week). Reducing by 100 kcal.`;
    } else if (trendKgPerWeek < -1.2) {
      // Dropping too fast — increase calories to preserve muscle
      adjustment = 100;
      reason = `Losing too fast (${trendKgPerWeek.toFixed(2)} kg/week). Increasing by 100 kcal to preserve muscle.`;
    } else {
      reason = `Good progress (${trendKgPerWeek.toFixed(2)} kg/week). No adjustment needed.`;
    }
  } else if (goal === "lean_bulk" || goal === "bulk") {
    if (trendKgPerWeek < 0.05) {
      // Not gaining — increase calories
      adjustment = 100;
      reason = `Weight not increasing (${trendKgPerWeek.toFixed(2)} kg/week). Increasing by 100 kcal.`;
    } else if (trendKgPerWeek > 0.5) {
      // Gaining too fast — reduce surplus
      adjustment = -100;
      reason = `Gaining too fast (${trendKgPerWeek.toFixed(2)} kg/week). Reducing by 100 kcal.`;
    } else {
      reason = `Good progress (${trendKgPerWeek.toFixed(2)} kg/week). No adjustment needed.`;
    }
  } else {
    reason = "Maintain goal — no automatic adjustment.";
  }

  const adjustedCalories = Math.max(1200, currentCalories + adjustment);
  return { adjustedCalories, trendKgPerWeek: Math.round(trendKgPerWeek * 100) / 100, adjustment, reason };
}

export const EVERYDAY_STARS: { name: string; why: string }[] = [
  { name: "Leafy greens (spinach, kale)", why: "Vitamins, fiber, and folate — the base of any healthy plate." },
  { name: "Berries", why: "Among the highest antioxidant fruits, low in sugar." },
  { name: "Salmon & fatty fish", why: "Omega-3s for heart and brain health; great protein." },
  { name: "Eggs", why: "Complete protein and choline; cheap and versatile." },
  { name: "Greek yogurt", why: "High protein, gut-friendly probiotics, calcium." },
  { name: "Oats", why: "Slow-release whole-grain carbs with beta-glucan fiber." },
  { name: "Beans & lentils", why: "Plant protein + fiber that feeds your gut microbiome." },
  { name: "Nuts & seeds", why: "Healthy fats and minerals — a small handful a day." },
];


