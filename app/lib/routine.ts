// Chronotype + routine + habit data, based on:
// - Chronotype research (UCLA Health, Cleveland Clinic, Timeshifter): schedule demanding
//   tasks at your natural peak; consistency beats perfection.
// - Habit formation (Duhigg habit loop; Clear 4 Laws; 2024 meta-analysis PMC11641623
//   on habit stacking; implementation intentions research by Gollwitzer).

export type ChronotypeId = "lark" | "intermediate" | "owl";

export interface Chronotype {
  id: ChronotypeId;
  name: string;
  emoji: string;
  description: string;
  wake: string;
  sleep: string;
  peakHours: string;
  schedule: { time: string; activity: string; why: string }[];
}

export const CHRONOTYPES: Chronotype[] = [
  {
    id: "lark",
    name: "Early bird (Lark)",
    emoji: "🌅",
    description:
      "You're naturally alert in the first hours after waking and fade in the evening. Roughly 10–20% of people are true larks.",
    wake: "05:30–06:30",
    sleep: "21:30–22:30",
    peakHours: "8 AM – 12 PM",
    schedule: [
      { time: "06:00", activity: "Wake + 10–15 min morning sunlight", why: "Anchors your circadian rhythm." },
      { time: "06:30–07:30", activity: "Exercise (larks train best early)", why: "Your strength and mood peak in the morning." },
      { time: "08:00–12:00", activity: "Deep work — hardest cognitive tasks", why: "This is your biological peak window." },
      { time: "12:00–13:00", activity: "Lunch (protein + veg)", why: "Keep blood sugar stable for the afternoon." },
      { time: "13:00–16:00", activity: "Meetings, email, routine tasks", why: "Post-lunch dip; save easy work for here." },
      { time: "16:00–17:00", activity: "Second wind — light exercise or walk", why: "A short burst beats the slump." },
      { time: "19:00–20:00", activity: "Dinner (≥3h before bed)", why: "Late meals hurt sleep quality." },
      { time: "21:00–21:30", activity: "Wind down: dim lights, no screens", why: "Prepares melatonin release." },
      { time: "21:30–22:00", activity: "Sleep — consistent time", why: "Regularity is the #1 sleep lever." },
    ],
  },
  {
    id: "intermediate",
    name: "Intermediate (Most people)",
    emoji: "🌤️",
    description:
      "You're the most common type: alert a few hours after waking, with a gentle dip mid-afternoon and a second wind in the evening.",
    wake: "06:30–08:00",
    sleep: "22:30–00:00",
    peakHours: "10 AM – 1 PM and 4–6 PM",
    schedule: [
      { time: "07:00", activity: "Wake + 10–15 min morning sunlight", why: "Anchors your circadian rhythm." },
      { time: "07:30–08:00", activity: "Breakfast (protein + whole grain)", why: "Steady energy, no sugar spike." },
      { time: "08:30–10:00", activity: "Light work, email, planning", why: "Warm up before your peak." },
      { time: "10:00–13:00", activity: "Deep work — hardest cognitive tasks", why: "Your first peak window." },
      { time: "13:00–14:00", activity: "Lunch + short walk", why: "Movement after meals improves digestion." },
      { time: "14:00–16:00", activity: "Meetings, admin, routine tasks", why: "Post-lunch dip — keep it light." },
      { time: "16:00–18:00", activity: "Deep work #2 or exercise", why: "Second peak — great for training." },
      { time: "19:00–20:00", activity: "Dinner (≥3h before bed)", why: "Late meals hurt sleep quality." },
      { time: "22:00–22:30", activity: "Wind down: dim lights, no screens", why: "Prepares melatonin release." },
      { time: "22:30–23:30", activity: "Sleep — consistent time", why: "Regularity is the #1 sleep lever." },
    ],
  },
  {
    id: "owl",
    name: "Night owl",
    emoji: "🌙",
    description:
      "You peak in the late afternoon and evening and struggle with early mornings. True owls are ~20% of people — and it's largely genetic, not laziness.",
    wake: "08:00–09:30",
    sleep: "00:30–02:00",
    peakHours: "4 PM – 9 PM",
    schedule: [
      { time: "08:30", activity: "Wake + 10–15 min morning sunlight", why: "Shifts your late rhythm earlier, gently." },
      { time: "09:00–10:00", activity: "Breakfast + light work, email", why: "Ease in — your brain is still warming up." },
      { time: "10:00–12:00", activity: "Routine tasks, admin, meetings", why: "Save peak hours for what matters." },
      { time: "12:00–13:00", activity: "Lunch + walk", why: "Movement after meals improves digestion." },
      { time: "13:00–16:00", activity: "Moderate work — code, writing drafts", why: "Second-best window; steady progress." },
      { time: "16:00–19:00", activity: "Deep work — hardest cognitive tasks", why: "Your biological peak window." },
      { time: "19:00–20:00", activity: "Exercise", why: "Owls train best in the evening." },
      { time: "20:00–21:00", activity: "Dinner (≥3h before bed)", why: "Late meals hurt sleep quality." },
      { time: "23:30–00:00", activity: "Wind down: dim lights, no screens", why: "Prepares melatonin release." },
      { time: "00:30–01:30", activity: "Sleep — consistent time", why: "Regularity beats early rising for owls." },
    ],
  },
];

export const CHRONOTYPE_QUESTIONS: { question: string; options: { label: string; type: ChronotypeId }[] }[] = [
  {
    question: "If you had no alarm and no obligations, when would you naturally wake up?",
    options: [
      { label: "Before 6:30 AM", type: "lark" },
      { label: "6:30 – 8:00 AM", type: "intermediate" },
      { label: "After 8:00 AM", type: "owl" },
    ],
  },
  {
    question: "When do you feel mentally sharpest and most productive?",
    options: [
      { label: "Early morning", type: "lark" },
      { label: "Late morning / midday", type: "intermediate" },
      { label: "Evening / night", type: "owl" },
    ],
  },
  {
    question: "If you could choose your ideal work hours, they'd be…",
    options: [
      { label: "8 AM – 2 PM", type: "lark" },
      { label: "9 AM – 5 PM", type: "intermediate" },
      { label: "12 PM – 8 PM or later", type: "owl" },
    ],
  },
];

export interface HabitTip {
  title: string;
  body: string;
}

export const HABIT_SCIENCE: HabitTip[] = [
  {
    title: "The habit loop: cue → routine → reward",
    body: "Every habit runs on a loop (Duhigg). Make the cue obvious (shoes by the door), the routine easy, and the reward satisfying (check it off, feel the win).",
  },
  {
    title: "Habit stacking: attach to an existing habit",
    body: "A 2024 meta-analysis found attaching a new habit to an established one works well: 'After I pour my morning coffee, I do 10 push-ups.'",
  },
  {
    title: "Implementation intentions: if-then plans",
    body: "'If it's 7 PM, then I run for 20 minutes.' Pre-deciding when and where removes decision fatigue — one of the strongest predictors of follow-through.",
  },
  {
    title: "Start absurdly small",
    body: "2 minutes a day beats 30 minutes once. Once the habit is automatic, scale it. Consistency creates the identity: 'I'm someone who…'",
  },
  {
    title: "Never miss twice",
    body: "One missed day is an accident; two is the start of a new (bad) habit. Missing once is fine — just don't let it become a streak of two.",
  },
  {
    title: "Give it time: 21 to 66+ days",
    body: "The '21 days' myth is too short. Real-world research (Lally, 2010) found habits take 18 to 254 days, averaging ~66. Judge yourself over months, not weeks.",
  },
];

export const DEFAULT_HABITS = [
  "Wake up at a consistent time",
  "Morning sunlight (10–15 min)",
  "Exercise",
  "8 glasses / 2L water",
  "No caffeine after lunch",
  "Wind down 30 min before bed",
  "Sleep by target bedtime",
  "Plan tomorrow's top 3 tasks",
];
