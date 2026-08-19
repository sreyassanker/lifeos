# LifeOS v2 — Personalization Plan

> Research-backed roadmap to turn LifeOS from a static science-based companion into a
> **personalized health OS**: it learns your body from measurements, shows you a virtual
> version of it, plans what you should eat and how you should train to reach the body you
> want — all still privacy-first, running in the browser, no account required.

Status: **Built (v1 of phases 1–5, with 3D avatar removed).** Phases 1–5 shipped: Body tab (full measurements → Navy body fat, shape, WHR, goal projection) · personalized meal plans for all diets with swaps + shopping list · exercise demos (local public-domain images + YouTube form links) · Today-tab command center with progress tracking. The 3D body avatar (Three.js/MakeHuman) was removed to reduce bundle size; the body analysis and goal projection remain. Remaining stretch items are in Phase 6.

---

## 1. Vision

Today LifeOS gives everyone the same science. v2 makes it *personal*:

1. **We know your body** — you enter measurements (waist, neck, hips, shoulders, weight, height).
2. **We show your body** — estimated body fat %, shape, and health markers from your real measurements.
   (The 3D avatar was removed in favor of a lighter-weight analysis approach.)
3. **You pick your goal body** — target body fat % and weight. We project your timeline and goal measurements.
4. **We plan your food** — a full day of natural, whole-food meals (breakfast, lunch, dinner,
   snacks) built from real food data to hit *your* calorie & macro targets.
5. **We show you how to train** — every exercise in your plan comes with an animated
   demonstration (GIF from a public-domain dataset, plus YouTube links for real-life form).

Everything stays client-side: measurements and progress live in localStorage, like today.

---

## 2. Research summary (what we verified)

### 2.1 Body shape & composition from measurements — ✅ feasible, evidence-backed

- **Body fat % from circumference (US Navy method)** — the standard DOD/CDC field method.
  Needs only neck, waist, height (men) + hip (women). Accuracy ~±3% vs. DEXA — good enough for
  tracking *trends*. Formula is public domain.
- **Body shape classification** (apple / pear / hourglass / rectangle / inverted triangle for
  women; V-taper / rectangle / oval for men) — based on ratios of bust/chest, waist, hips,
  shoulders. Note: these are **fashion/fitness conventions, not hard medical science** — we
  present them as "shape tendencies," never as health verdicts.
- **Waist-to-hip / waist-to-height ratios** — these *are* evidence-based health markers
  (WHO/IDF: WHR ≥0.90 men / ≥0.85 women signals elevated cardiometabolic risk;
  waist-to-height <0.5 is a widely used healthy target).
- **Somatotypes (ecto/meso/endomorph)** — largely **discredited as fixed biology**; body type
  changes with training and nutrition. We can include it as a fun "tendency" label with a
  clear caveat, or skip it. Recommendation: include as optional, labeled as tendency.
- **Virtual body rendering** — fully feasible client-side:
  - **2D SVG silhouette** (front + side view) parameterized by measurements: zero
    dependencies, works offline, looks clean, fast to build. **Recommended for v1.**
  - **3D avatar** (Three.js / React Three Fiber, e.g. open-source `bodyapps-viz` or SMPL-based
    models): much more impressive but significantly more work + bundle size. Later phase.

### 2.2 Food data — free & open options exist; we recommend bundling

| Source | Cost | Notes |
| --- | --- | --- |
| **USDA FoodData Central** | Free API key, ~1,000 req/hr/IP | Gold-standard data, **public domain**. Key must NOT be exposed in client code → needs a small proxy/server. Data can be downloaded and bundled. |
| **Open Food Facts** | Free, CORS-enabled, no key for basic search | Great for barcode scanning later; product data (processed foods), crowdsourced quality varies. |
| **Edamam / Spoonacular / Nutritionix** | Paid tiers | Richer recipe search, but costs money and needs a backend. |
| **Bundled curated dataset** ⭐ | Free | We download ~150–300 **natural whole foods** from USDA (public domain), keep per-100g macros (kcal, protein, carbs, fat, fiber), and ship them in the app. Works offline, zero keys, zero server, matches the privacy-first philosophy. |

**Recommendation:** bundle a curated whole-foods dataset (sourced from USDA, attributed) for
v1. Add Open Food Facts barcode scanning in a later phase if desired.

### 2.3 Exercise demonstrations — free animated GIFs exist ⭐

- **`yuhonas/free-exercise-db`** (GitHub) — **public domain** dataset: 800+ exercises, JSON +
  images/GIFs, browsable. Perfect fit: we can copy the few dozen exercises our plans use into
  the app. Zero API, works offline.
- **ExerciseDB API** — ~1,500 exercises with GIF animations; free tier (some mirrors need no
  key at all, e.g. `exercisedb.dev`). Good if we want a searchable full library.
- **YouTube embeds** — explicitly **permitted by YouTube's ToS** via the embeddable player
  (`youtube-nocookie.com` iframe). Caveats: creators can disable embedding, and embeds are a
  third-party dependency. Use as a **secondary "watch real-life form" link**, not the primary
  demo.

**Recommendation:** bundle the public-domain GIFs for every exercise in our plans (primary,
offline, reliable). Add YouTube links as a secondary layer. If we later want a full searchable
library, ExerciseDB API slots in easily.

---

## 3. Architecture decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Backend? | **No — keep client-only** (Next.js App Router + localStorage) | Matches the current privacy-first brand; personalization math all runs locally. A backend can be added later only if we need sync/accounts. |
| Body visual | **Analysis only** (body fat %, shape, health markers) | The 3D avatar was removed to reduce bundle size. Body analysis and goal projection remain. |
| Food data | **Bundled curated USDA subset** (public domain, attributed) | No keys, no server, offline, deterministic. |
| Exercise media | **Bundled public-domain GIFs** + optional YouTube links | GIFs reliable & offline; YouTube adds real-life clarity. |
| State | Extend existing `useLocalStorage` pattern | Consistent with the codebase. |

---

## 4. Roadmap

Each phase is independently shippable and builds on the previous.

### Phase 1 — Measurements & Body Analysis (new "Body" tab) 🎯 foundation

- Extend the profile with a **measurements step**: neck, waist, hip, shoulders/chest/bust,
  optional wrist/forearm/ankle/thigh/calf. Unit toggle cm/in, kg/lb.
- Compute & display, with sources:
  - **Body fat % (US Navy method)** — circumference formula, ±3% caveat noted.
  - **BMI** (with its known limitation callout).
  - **Body shape** (tendency label + explanation that shapes aren't destiny).
  - **Waist-to-hip & waist-to-height** vs. WHO health-risk thresholds.
  - **Somatotype tendency** (optional, labeled as tendency only).
- New `app/lib/body.ts` with all formulas + unit tests. New `BodyTab.tsx`.

### Phase 2 — Virtual Body + Goal Setting 🎯 the "wow"

- **Virtual silhouette**: parameterized SVG (front + side) drawn from measurements —
  shoulders/chest, waist, hips, limbs scaled from height. "Now" body.
- **Goal body**: user picks target body fat % (slider informed by sex-specific healthy/lean
  ranges) or target weight. We render the **goal silhouette** next to "now" (side-by-side
  comparison).
- **Projection**: at a sustainable rate (fat loss 0.5–1% body weight/wk; muscle gain ~0.25–0.5
  kg/mo), estimate **weeks/months to goal** and what daily calorie intake that requires
  (reuses the existing TDEE engine).
- Measurements → goal → nutrition all wired together.

### Phase 3 — Personalized Food & Meal Plans 🎯 the big one

- **Food database** (`app/lib/foods.ts`): ~150–300 natural whole foods from USDA public-domain
  data — proteins (eggs, chicken, fish, tofu, legumes), grains, veg, fruit, dairy, fats.
  Each: kcal/protein/carbs/fat/fiber per 100g + typical serving. Tagged `vegetarian`/`vegan`.
  Attributed to USDA in the UI footer.
- **Meal plan generator** (`app/lib/meal-plan.ts`):
  - Template-based (plate method): every meal = protein + veg + grain + fat, sized to hit the
    user's daily calorie/macro targets from Phase 1 of the existing macro engine.
  - Produces **breakfast, lunch, dinner, and 1–2 snacks** with real foods and **gram amounts**.
  - Diet filter (omnivore / vegetarian / vegan), allergy exclusions, meals-per-day.
  - Totals row: planned kcal & macros vs. target, per meal and per day.
- **Swappable meals**: user swaps any food for an equivalent-category alternative; plan
  rebalances to keep targets.
- **Shopping list** auto-generated from the week's meals.

### Phase 4 — Exercise Demonstrations 🎯 clarity

- Bundle **public-domain GIFs** for every exercise referenced in `fitness.ts` (ab circuit,
  full-body strength moves) using `yuhonas/free-exercise-db` (attribution kept).
- Render the GIF next to each exercise with its form cue; make the exercise cards clickable to
  enlarge.
- **YouTube "watch real form"** links (embeds via `youtube-nocookie.com`) as a secondary layer
  for the core movements (squat, deadlift, push-up, etc.), curated to a few trusted channels.

### Phase 5 — Today Tab becomes a true command center

- Dashboard shows: today's meal plan (with macro checkmarks), today's workout with GIFs, sleep
  target, water, habits — one scroll, all personalized.
- **Progress tracking**: weekly weight/waist/body-fat check-ins → simple trend chart (weight +
  body fat % over time), stored locally. "You're on track / adjust intake by X" nudges.
- Data **export/import** (JSON) so users own their data.

### Phase 6 — Extras (stretch)

- ~~3D body avatar~~ (removed — was too heavy for the bundle; body analysis + projection remain).
- Open Food Facts barcode scanning to add foods to meals.
- PWA install + offline (already natural — everything is local).
- Weekly plan generation (7 days of meals with variety rotation).
- Optional: full ExerciseDB searchable library.

---

## 5. Data models (sketch)

```ts
// app/lib/body.ts
interface Measurements {
  neckCm: number; waistCm: number; hipCm: number;   // hip: both sexes (Navy needs it for women)
  shoulderCm: number; chestCm: number;              // chest = bust for women
  wristCm?: number; forearmCm?: number;
  ankleCm?: number; thighCm?: number; calfCm?: number;
}
// bodyFatNavy(m, sex, heightCm): number  (±3% caveat)
// bodyShape(m, sex): "hourglass" | "pear" | "apple" | "rectangle" | "inverted_triangle" | "v_taper" | "oval"
// whr(m), waistToHeight(m): number + healthRisk label

// app/lib/foods.ts
interface Food {
  id: string; name: string; category: FoodCategory;   // protein | grain | veg | fruit | dairy | fat | legume
  per100g: { kcal: number; proteinG: number; carbsG: number; fatG: number; fiberG: number };
  servingG: number; servingLabel: string;             // e.g. 50g, "1 large egg"
  tags: ("natural" | "vegetarian" | "vegan")[];
}
const FOODS: Food[];  // ~150–300, USDA public domain, attributed

// app/lib/meal-plan.ts
interface PlannedMeal { slot: "breakfast" | "lunch" | "dinner" | "snack"; items: { foodId: string; grams: number }[]; }
function planDay(target: MacroResult, diet: Diet, exclude: string[]): PlannedMeal[];

// app/lib/profile.ts (extended)
interface Profile {
  …existing fields…
  measurements?: Measurements;
  targetBodyFat?: number;        // set in Phase 2
  diet: "omnivore" | "vegetarian" | "vegan";
  allergies: string[];
  mealsPerDay: 3 | 4 | 5;
}
```

---

## 6. Science foundations (all cited, matching repo style)

- **Body fat (Navy)**: circumference method, ±3% vs. DEXA; used by US DoD/CDC.
- **WHR / waist-to-height**: WHO & IDF cardiometabolic-risk thresholds (WHR ≥0.90 M / ≥0.85 F).
- **Rate of change**: fat loss 0.5–1% body weight/week (ACSM); lean muscle gain ~0.25–0.5 kg/mo
  (beginners, ISSN).
- **Protein**: keep existing 1.6–2.2 g/kg engine; distribute ~25–40 g per meal (muscle protein
  synthesis literature).
- **Plate method**: Harvard Healthy Eating Plate already in the app → becomes the meal template.
- **Calories**: existing Mifflin-St Jeor + activity + goal engine is the intake target.
- **Somatotypes**: presented as *tendency*, with caveat that they're not fixed biology (NASM,
  PMC12882503).

---

## 7. Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Measurements entered wrong → bad body fat % | Show ±3% accuracy caveat; encourage consistent same-time-of-day measurement; we render trends, not absolutes. |
| Shape labels feel judgmental | Frame as "tendency," emphasize any body can be healthy & strong. |
| Meal plans too rigid / unappealing | Swappable foods, diet filters, portion-focused (not obsessive gram-counting). |
| YouTube embeds break (embedding disabled / offline) | GIFs are primary; YouTube is additive only. |
| Dataset licensing | Use only public-domain (free-exercise-db, USDA) with attribution. |
| Scope creep | Phases are independently shippable; Phase 1–4 are the core promise. |

---

## 8. What we need from you

1. **Scope for the first build** — which phases? (Suggested: 1–4 in order, then 5.)
2. **2D silhouette vs. 3D avatar** — we recommend 2D first.
3. **Diet types to support** — omnivore + vegetarian + vegan, or fewer?
4. **Language of meal plans** — keep English, or localize (e.g., Hindi, Bengali)?

---

## 9. Suggested build order (if approved)

1. `app/lib/body.ts` + tests → 2. `BodyTab.tsx` (measurements + analysis) →
3. silhouette SVG component + goal projection → 4. `app/lib/foods.ts` + `meal-plan.ts` + tests →
5. `NutritionTab` meal plan UI → 6. exercise GIFs + YouTube links in `FitnessTab` →
7. Today-tab integration + progress tracking.
