// Bodyweight-only fitness plan — no equipment, indoor, science-based.
//
// Sources:
// - ACSM 2025 Position Stand (Currier et al., Med Sci Sports Exerc 2026;58:851-872):
//   137 systematic reviews (>30,000 participants).
//   Strength: ≥80% 1RM, full ROM, 2–3 sets, ≥2 sessions/wk.
//   Hypertrophy: ≥10 sets/muscle group/week; load range doesn't matter.
//   Power: moderate loads (30–70% 1RM), ≤24 reps/set, fast concentric.
//   Training to failure NOT required — 2–3 RIR is sufficient.
// - Body-fat thresholds for visible abs: ~10–12% men, ~16–20% women.
// - Diet reveals abs; training builds them (spot reduction is a myth).
// - Core programming: 2–3x/week, static + dynamic across 3 planes (Healthline).
// - Demo videos: curated from authentic YouTube fitness channels.

export interface ExerciseDemo {
  /** YouTube video ID for in-app embed */
  videoId: string;
  /** Channel / creator name */
  creator: string;
  note?: string;
}

export interface Exercise {
  name: string;
  target: string;
  setsReps: string;
  rest: string;
  form: string;
  demo: ExerciseDemo;
}

export interface PlanItem {
  text: string;
  demo?: ExerciseDemo;
  /** MET value (Metabolic Equivalent of Task) — Ainsworth 2024 Compendium */
  met?: number;
  /** Estimated duration in minutes for this item */
  durationMin?: number;
}

export interface DayPlan {
  day: string;
  title: string;
  items: PlanItem[];
  /** Estimated total duration for this day's workout */
  totalMin?: number;
}

// ── MET-based calorie estimation ──────────────────────────────────────────
// Calories = MET × weight(kg) × duration(hours)
// Source: Ainsworth et al. (2024) Compendium of Physical Activities.
export function estimateCaloriesBurn(items: PlanItem[], weightKg: number): number {
  let totalCal = 0;
  for (const item of items) {
    if (item.met && item.durationMin) {
      totalCal += item.met * weightKg * (item.durationMin / 60);
    }
  }
  return Math.round(totalCal);
}

export function dayCaloriesBurn(day: DayPlan, weightKg: number): number {
  return estimateCaloriesBurn(day.items, weightKg);
}

// ── WHO Physical Activity Targets (2020) ──────────────────────────────────
// Adults: 150–300 min/week moderate-intensity OR 75–150 min vigorous.
// MET ≥6 counts as vigorous; MET 3–5.9 counts as moderate.
// https://iris.who.int/bitstream/handle/10665/336656/9789240015128-eng.pdf
export const WHO_WEEKLY_MODERATE_MIN = 150;
export const WHO_WEEKLY_VIGOROUS_MIN = 75;

export function classifyIntensity(met: number): "light" | "moderate" | "vigorous" {
  if (met >= 6) return "vigorous";
  if (met >= 3) return "moderate";
  return "light";
}

/** Compute total moderate-equivalent minutes for a set of day plans.
 *  Vigorous minutes count double (per WHO guidelines).
 */
export function weeklyModerateEquivMin(days: DayPlan[]): number {
  let total = 0;
  for (const day of days) {
    for (const item of day.items) {
      if (!item.met || !item.durationMin) continue;
      const intensity = classifyIntensity(item.met);
      if (intensity === "vigorous") total += item.durationMin * 2;
      else if (intensity === "moderate") total += item.durationMin;
    }
  }
  return Math.round(total);
}

// ── Week-day mapping ────────────────────────────────────────────────────
// WEEK_PLAN is indexed Monday=0 … Sunday=6, but Date#getDay() returns
// Sunday=0 … Saturday=6. Single helper so every consumer maps the same way.
export function planDayIndex(dayOfWeek: number): number {
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
}

export function todayPlanIndex(): number {
  return planDayIndex(new Date().getDay());
}

/** Is today (by WEEK_PLAN index) a full rest day (no planned work)? */
export function isRestPlanDay(index: number): boolean {
  return (WEEK_PLAN[index]?.totalMin ?? 0) === 0;
}

export const KEY_FACTS: { fact: string; detail: string }[] = [
  {
    fact: "Abs are made in the kitchen, revealed by diet",
    detail:
      "No amount of crunches removes belly fat. Visible abs need ~10–12% body fat (men) / ~16–20% (women) — a calorie deficit achieved through diet. Training builds the muscle underneath; the deficit reveals it.",
  },
  {
    fact: "Don't train abs every day",
    detail:
      "Abs are muscles — they need rest. 2–3 targeted sessions per week is enough (2 is a great start). Daily ab work is counterproductive.",
  },
  {
    fact: "Spot reduction is a myth",
    detail:
      "You can't burn belly fat by working the belly. Fat loss is whole-body; genetics decide where it comes off last (usually the midsection).",
  },
  {
    fact: "Progressive overload applies to abs too",
    detail:
      "Treat abs like biceps: add reps, harder variations (decline reverse crunches, hanging leg raises) over time to keep growing.",
  },
  {
    fact: "Sleep and stress affect your abs",
    detail:
      "Under 7 hours of sleep is linked to weight gain (ghrelin/leptin disruption), and chronic stress raises cortisol, which encourages belly fat storage.",
  },
  {
    fact: "Protein protects muscle while you cut",
    detail:
      "In a deficit, eat 1.8–2.2 g protein per kg of body weight daily to lose fat while keeping (or building) muscle.",
  },
  {
    fact: "You don't need to train to failure",
    detail:
      "ACSM 2025 Position Stand (137 reviews, >30k participants): training to failure does NOT enhance strength, hypertrophy, or power. 2–3 reps in reserve (RIR) is sufficient for full benefits.",
  },
  {
    fact: "Volume matters more than load for hypertrophy",
    detail:
      "ACSM 2025: muscle hypertrophy is enhanced by ≥10 sets per muscle group per week. Load range (30–100% 1RM) doesn't matter — total volume is the key driver.",
  },
  {
    fact: "RT is safe for all ages",
    detail:
      "ACSM 2025: analysis of >38,000 participants (>6,700 RT) found RT does not increase serious adverse events. Nonserious adverse events occur at similar rates to aerobic exercise.",
  },
];

export interface BodyFatEstimate {
  label: string;
  men: string;
  women: string;
}

export const BODY_FAT_LEVELS: BodyFatEstimate[] = [
  { label: "Visible six-pack", men: "~10–12%", women: "~16–20%" },
  { label: "Athletic / lean", men: "~12–15%", women: "~20–24%" },
  { label: "Healthy normal range", men: "17.6–25.3%", women: "28.8–35.7%" },
];

// ── Weekly plan (bodyweight-only, no equipment, indoor) ────────────────────
// Core/ab exercises are merged directly into each strength day — no separate section.

export const WEEK_PLAN: DayPlan[] = [
  // ── Monday: Upper Push + Core ────────────────────────────────────────────
  {
    day: "Monday",
    title: "Upper push + core",
    totalMin: 35,
    items: [
      {
        text: "Push-ups — 3 × 12–20 (chest, shoulders, triceps)",
        met: 8.0, durationMin: 5,
        demo: { videoId: "c-lBErfxszs", creator: "Davis Diley / ATHLEAN-X", note: "Hands under shoulders, full range of motion. Keep core tight — no sagging hips." },
      },
      {
        text: "Diamond push-ups — 3 × 8–12 (triceps, inner chest)",
        met: 8.0, durationMin: 4,
        demo: { videoId: "YEdjByGD_A4", creator: "Frayzo Fitness", note: "Hands together under chest forming a diamond. Elbows stay close to your body." },
      },
      {
        text: "Pike push-ups — 3 × 8–12 (shoulders)",
        met: 8.0, durationMin: 4,
        demo: { videoId: "89-8waE2XKI", creator: "STRIQfit", note: "Feet elevated, hips high — press your head toward the floor. Targets deltoids like an overhead press." },
      },
      {
        text: "Tricep dips (chair) — 3 × 10–15 (triceps)",
        met: 5.0, durationMin: 4,
        demo: { videoId: "4ua3MzaU0QU", creator: "Andrew Kwong (DeltaBolic)", note: "Hands on chair edge, lower until elbows are ~90°. Keep back close to the chair." },
      },
      {
        text: "Plank — 3 × 30–60s (core stability)",
        met: 3.8, durationMin: 3,
        demo: { videoId: "xe2MXatLTUw", creator: "Andrew Kwong (DeltaBolic)", note: "Forearms on ground, body in a straight line. Squeeze glutes and brace abs — don't hold your breath." },
      },
      {
        text: "Dead bug — 3 × 10/side (deep core, coordination)",
        met: 3.8, durationMin: 3,
        demo: { videoId: "DqLL45uk2Tk", creator: "Derek Ward", note: "Lie on your back, arms up, knees bent 90°. Extend opposite arm + leg while keeping lower back flat on the floor." },
      },
    ],
  },

  // ── Tuesday: Cardio + Mobility ───────────────────────────────────────────
  {
    day: "Tuesday",
    title: "Cardio + mobility",
    totalMin: 40,
    items: [
      {
        text: "Jump rope (simulated) — 30–40 min zone 2 (heart rate 60–70% max)",
        met: 12.3, durationMin: 30,
        demo: { videoId: "5q4qOTTvnYM", creator: "Coach Kozak / HASfit", note: "No rope needed — just bounce on the balls of your feet with the same arm motion. Stay relaxed." },
      },
      {
        text: "Full body stretching flow — 10 min cooldown",
        met: 2.5, durationMin: 10,
        demo: { videoId: "KrUnq66qn_k", creator: "Yoga With Adriene", note: "Focus on hips, hamstrings, shoulders. Hold each stretch 20–30s, breathe deeply." },
      },
    ],
  },

  // ── Wednesday: Lower Body + Core ─────────────────────────────────────────
  {
    day: "Wednesday",
    title: "Lower body + core",
    totalMin: 35,
    items: [
      {
        text: "Bodyweight squats — 3 × 15–20 (quads, glutes)",
        met: 5.0, durationMin: 5,
        demo: { videoId: "PPmvh7gBTi0", creator: "Jeff Nippard", note: "Feet shoulder-width, push knees out over toes, descend until thighs are parallel or below." },
      },
      {
        text: "Reverse lunges — 3 × 10/side (quads, glutes, balance)",
        met: 5.0, durationMin: 5,
        demo: { videoId: "38xlLGfguz4", creator: "Oliver Sjostrom", note: "Step back, lower until both knees are ~90°. Front knee tracks over the second toe." },
      },
      {
        text: "Single-leg glute bridge — 3 × 12/side (glutes, hamstrings)",
        met: 3.8, durationMin: 4,
        demo: { videoId: "4ilXaDauMnE", creator: "Bret Contreras", note: "Lie on your back, one foot flat, extend the other leg. Drive through the heel to lift hips." },
      },
      {
        text: "Calf raises (standing) — 3 × 15–20 (calves)",
        met: 3.8, durationMin: 3,
        demo: { videoId: "baEXLy09Ncc", creator: "Jeff Nippard", note: "Rise onto balls of feet, pause 1s at the top, lower slowly (3s eccentric). Full range of motion." },
      },
      {
        text: "Side plank — 3 × 30–40s/side (obliques, core stability)",
        met: 3.8, durationMin: 3,
        demo: { videoId: "TSXVcb2Wc9k", creator: "ATHLEAN-X", note: "Forearm on ground, body in a straight line from head to feet. Stack or stagger your feet." },
      },
      {
        text: "Bicycle crunch — 3 × 15/side (obliques, rectus abdominis)",
        met: 4.0, durationMin: 3,
        demo: { videoId: "cFDS2S6Vqis", creator: "Go with JO FITNESS", note: "Don't pull on your neck — hands lightly behind ears. Rotate torso, bring elbow toward opposite knee." },
      },
    ],
  },

  // ── Thursday: Active Recovery ────────────────────────────────────────────
  {
    day: "Thursday",
    title: "Active recovery",
    totalMin: 25,
    items: [
      {
        text: "Gentle yoga / mobility flow — 20–30 min",
        met: 2.5, durationMin: 25,
        demo: { videoId: "2IcWJobNDck", creator: "Yoga With Adriene", note: "Move slowly, breathe deeply. Focus on areas that feel tight from the week." },
      },
      {
        text: "Optional: aim for 5,000–8,000 steps total today",
      },
    ],
  },

  // ── Friday: Upper Back / Hinge + Core ────────────────────────────────────
  {
    day: "Friday",
    title: "Upper back / hinge + core",
    totalMin: 30,
    items: [
      {
        text: "Superman hold — 3 × 12–15 (erector spinae, glutes)",
        met: 3.8, durationMin: 4,
        demo: { videoId: "ydT74SAts7M", creator: "ATHLEAN-X", note: "Lie face down, arms extended overhead. Lift arms + legs simultaneously, hold 2–3s, lower slowly." },
      },
      {
        text: "Bird-dog — 3 × 10/side (core stability, coordination)",
        met: 3.8, durationMin: 4,
        demo: { videoId: "pS-SfFoc8uk", creator: "Squat University", note: "Hands under shoulders, knees under hips. Extend opposite arm + leg, hold 2s. Keep hips level — no rotation." },
      },
      {
        text: "Reverse crunch — 3 × 15–20 (lower abs)",
        met: 3.8, durationMin: 3,
        demo: { videoId: "0BNhpx_nxDM", creator: "Jeff Nippard", note: "Lie on your back, knees bent. Curl pelvis toward chest — don't swing your legs. Squeeze at the top." },
      },
      {
        text: "Mountain climbers — 3 × 30s (cardio + core)",
        met: 8.0, durationMin: 3,
        demo: { videoId: "0LvR42Z599c", creator: "Romane Lanceford", note: "Push-up position, drive knees toward chest alternately at a controlled pace. Keep hips level." },
      },
    ],
  },

  // ── Saturday: Full Body HIIT + Core ──────────────────────────────────────
  {
    day: "Saturday",
    title: "Full body HIIT + core",
    totalMin: 30,
    items: [
      {
        text: "Burpees — 3 × 10 (full body, cardio)",
        met: 10.0, durationMin: 5,
        demo: { videoId: "1KOttLvp4lU", creator: "Calisthenics Workout Complex", note: "Drop to push-up, jump feet to hands, explode up. Scale by stepping back instead of jumping." },
      },
      {
        text: "Jumping jacks — 3 × 30s (cardio, coordination)",
        met: 8.0, durationMin: 3,
        demo: { videoId: "6q68oE6984E", creator: "HASfit (Coach Kozak)", note: "Land softly on balls of feet. Keep a steady pace — this is zone 2 cardio, not a sprint." },
      },
      {
        text: "High knees — 3 × 30s (cardio, hip flexors)",
        met: 8.0, durationMin: 3,
        demo: { videoId: "MtR8N6lvCSk", creator: "HASfit (Coach Kozak)", note: "Drive knees to hip height, pump arms. Stay on the balls of your feet. Controlled pace." },
      },
      {
        text: "Wall sit — 3 × 30–45s (quads, mental toughness)",
        met: 3.8, durationMin: 3,
        demo: { videoId: "mDdLC-yKudY", creator: "YOGABODY", note: "Back flat against wall, thighs parallel to floor. Press your lower back into the wall." },
      },
    ],
  },

  // ── Sunday: Full Rest ────────────────────────────────────────────────────
  {
    day: "Sunday",
    title: "Full rest",
    totalMin: 0,
    items: [
      { text: "Rest — recovery is when muscles grow" },
      { text: "Consistent sleep and protein today matter as much as training" },
    ],
  },
];
