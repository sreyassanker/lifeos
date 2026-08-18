// Six-pack / core training data, based on:
// - Body-fat thresholds for visible abs: ~10–12% men, ~16–20% women (Healthline, Built With Science)
// - Diet is what reveals abs; training is what develops them (spot reduction is a myth)
// - Science-based ab workout (Built With Science / Jeremy Ethier): reverse crunch (lower abs),
//   woodchoppers or bicycle crunches (obliques, ACE high activation), weighted crunches (upper abs),
//   serratus jabs — 1–3x/week, 2x/week is a good start, NOT daily
// - Healthline core programming: 2–3x/week, static + dynamic exercises across 3 planes
// - 7+ hours sleep, weights + cardio, high fruit/veg/lean protein, water over sugary drinks
// - Demo images: public-domain exercise dataset (yuhonas/free-exercise-db), stored locally.

export interface ExerciseDemo {
  img: string;
  youtube?: string;
  note?: string;
}

export interface Exercise {
  name: string;
  target: string;
  setsReps: string;
  rest: string;
  form: string;
  demo?: ExerciseDemo;
}

export interface PlanItem {
  text: string;
  demo?: ExerciseDemo | ExerciseDemo[];
}

export interface DayPlan {
  day: string;
  title: string;
  items: PlanItem[];
}

export const AB_CIRCUIT: Exercise[] = [
  {
    name: "Reverse Crunch",
    target: "Lower abs (rectus abdominis, lower region)",
    setsReps: "2–3 sets × 15–20 reps (bodyweight) → build up to weighted/decline 10–15 reps",
    rest: "60–90s",
    form:
      "Start with a posterior pelvic tilt: squeeze glutes, flatten your lower back. Curl your pelvis toward your belly button — don't just swing your legs. Highest lower-ab activation when done with this form.",
    demo: { img: "/exercises/Reverse_Crunch.jpg", youtube: "reverse crunch form" },
  },
  {
    name: "High-to-Low Cable Woodchoppers",
    target: "Obliques (rotational)",
    setsReps: "2–3 sets × 10–15 reps per side",
    rest: "60–90s",
    form:
      "Arms extended, elbows locked; rotate your torso down and across toward the opposite knee using your obliques, not your arms. Alternative: bicycle crunches 2–3 sets to failure (ACE-rated high oblique activation).",
    demo: {
      img: "/exercises/Cable_Russian_Twists.jpg",
      youtube: "cable woodchopper exercise form",
      note: "Demo shows a rotational oblique movement — the woodchopper pattern is the same rotation, top-down.",
    },
  },
  {
    name: "Weighted Crunches",
    target: "Upper abs",
    setsReps: "2–3 sets × 10–15 reps",
    rest: "60–90s",
    form:
      "Stability-ball or cable crunch. Bring the rib cage forward and down toward the pelvis; hips stay still. Progressively add weight — abs grow like any other muscle.",
    demo: { img: "/exercises/Cable_Crunch.jpg", youtube: "cable crunch form" },
  },
  {
    name: "Serratus Jabs",
    target: "Serratus anterior (rib definition)",
    setsReps: "2–3 sets × 10–15 reps per side",
    rest: "60s",
    form:
      "Band or cable punching motion upward; reach fully at the end to protract the scapula. EMG studies show very high serratus activation.",
    demo: {
      img: "/exercises/Straight-Arm_Dumbbell_Pullover.jpg",
      youtube: "serratus punch exercise",
      note: "Demo shows a straight-arm pullover — the same serratus emphasis via full scapular protraction.",
    },
  },
];

export const WEEK_PLAN: DayPlan[] = [
  {
    day: "Monday",
    title: "Full-body strength + abs",
    items: [
      {
        text: "Squats (or lunges) 3×8–12",
        demo: [
          { img: "/exercises/Barbell_Squat.jpg", youtube: "squat form" },
          { img: "/exercises/Bodyweight_Walking_Lunge.jpg", youtube: "walking lunge form" },
        ],
      },
      { text: "Push-ups (or bench press) 3×8–12", demo: { img: "/exercises/Pushups.jpg", youtube: "push up form" } },
      { text: "Bent-over rows 3×8–12", demo: { img: "/exercises/Bent_Over_Barbell_Row.jpg", youtube: "bent over row form" } },
      { text: "Plank 3×30–60s hold", demo: { img: "/exercises/Plank.jpg", youtube: "plank form" } },
      { text: "AB CIRCUIT (4 exercises above)" },
    ],
  },
  {
    day: "Tuesday",
    title: "Cardio + mobility",
    items: [
      {
        text: "30–40 min brisk walk / jog / cycling (zone 2)",
        demo: [
          { img: "/exercises/Bicycling.jpg", youtube: "cycling zone 2" },
          { img: "/exercises/Jogging_Treadmill.jpg", youtube: "jogging form" },
        ],
      },
      { text: "10 min stretching — hips, hamstrings, shoulders" },
    ],
  },
  {
    day: "Wednesday",
    title: "Full-body strength + abs",
    items: [
      {
        text: "Hip hinge (deadlift/glute bridge) 3×8–12",
        demo: [
          { img: "/exercises/Barbell_Deadlift.jpg", youtube: "deadlift form" },
          { img: "/exercises/Barbell_Glute_Bridge.jpg", youtube: "glute bridge form" },
        ],
      },
      { text: "Overhead press 3×8–12", demo: { img: "/exercises/Standing_Military_Press.jpg", youtube: "overhead press form" } },
      {
        text: "Pull-ups or lat pulldowns 3×6–10",
        demo: [
          { img: "/exercises/Pullups.jpg", youtube: "pull up form" },
          { img: "/exercises/Wide-Grip_Lat_Pulldown.jpg", youtube: "lat pulldown form" },
        ],
      },
      { text: "Side planks 3×20–40s per side", demo: { img: "/exercises/Side_Bridge.jpg", youtube: "side plank form" } },
      { text: "AB CIRCUIT (4 exercises above)" },
    ],
  },
  {
    day: "Thursday",
    title: "Active recovery",
    items: [
      { text: "20–30 min easy walk or yoga flow", demo: { img: "/exercises/Walking_Treadmill.jpg", youtube: "gentle yoga flow" } },
      { text: "Optional: 5,000–8,000 steps total" },
    ],
  },
  {
    day: "Friday",
    title: "Full-body strength + abs",
    items: [
      { text: "Squats 3×8–12 (add weight vs Monday)", demo: { img: "/exercises/Barbell_Squat.jpg", youtube: "squat form" } },
      {
        text: "Push-ups / bench 3×8–12 (add reps or weight)",
        demo: { img: "/exercises/Pushups.jpg", youtube: "push up form" },
      },
      { text: "Rows 3×8–12", demo: { img: "/exercises/Bent_Over_Barbell_Row.jpg", youtube: "bent over row form" } },
      { text: "Dead bug 3×10–12 per side (deep core)", demo: { img: "/exercises/Dead_Bug.jpg", youtube: "dead bug exercise" } },
      { text: "AB CIRCUIT (4 exercises above)" },
    ],
  },
  {
    day: "Saturday",
    title: "Cardio + steps",
    items: [
      {
        text: "40–60 min cardio you enjoy (run, swim, sport)",
        demo: [
          { img: "/exercises/Jogging_Treadmill.jpg", youtube: "jogging form" },
          { img: "/exercises/Rowing_Stationary.jpg", youtube: "rowing machine form" },
        ],
      },
      { text: "Aim for 8,000–10,000 steps" },
    ],
  },
  {
    day: "Sunday",
    title: "Full rest",
    items: [
      { text: "Rest — recovery is when muscles grow" },
      { text: "Consistent sleep and protein today matter as much as training" },
    ],
  },
];

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
      "Treat abs like biceps: add weight, reps, or harder variations over time (weighted crunches, decline reverse crunches) to keep growing.",
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
