# LifeOS — Your Daily Health & Time Companion

A free, privacy-first web app that bundles the everyday basics of health and time management into one place: **body, sleep, routine, nutrition, and fitness** — all backed by published research and running entirely in your browser (no account, no tracking, data stays in localStorage).

Built with **Next.js 16** (App Router), **React 19**, **TypeScript**, and **Tailwind CSS v4** — the same stack as the sibling TempMail app.

## ✨ What's inside

| Tab | Tools |
| --- | ----- |
| **Today** | Command center: sleep target, calories, water tracker, habit quick-check, today's workout, **today's meal plan**, and **weekly progress tracking** (weight/waist/body-fat trend chart) |
| **Body** | Personalization hub: measurements (cm/in, incl. thighs, calves, knees, arms, wrists) → **body fat % (US Navy method)**, body shape, waist-to-hip & waist-to-height health markers, diet/allergy/meals-per-day setup, **realistic 3D virtual body** — a 19k-vertex human mesh deformed by your real measurements (now vs. goal, drag to rotate), dressed in a recolorable sporty outfit (shirt/pants/socks/shoes), goal body-fat slider with weight & timeline projection |
| **Sleep** | Sleep cycle calculator (90-min cycles → optimal bed/wake times), best sleeping position guide, interactive sleep hygiene checklist |
| **Routine** | 3-question chronotype quiz → personalized time-blocked daily schedule, daily habit tracker (saved locally), habit-formation science |
| **Nutrition** | Macro calculator (Mifflin-St Jeor BMR + activity + goal), **personalized meal plan** (breakfast/lunch/dinner/snacks from ~140 natural whole foods, sized to your macros, diet- and allergy-aware, swappable, with day totals and an auto shopping list), Harvard Healthy Eating Plate guide, everyday foods |
| **Fitness** | Science-based six-pack plan: body-fat targets, day-by-day weekly plan, EMG-backed ab circuit with sets/reps/form — **every exercise comes with a demo image + "watch form" YouTube link** |

## 🧪 Research foundations

- **Sleep:** 90-minute sleep cycles & 7–9h adult needs (Sleep Foundation, Harvard Sleep Medicine); side sleeping best for snoring/apnea/back pain (Johns Hopkins, Mayo Clinic, 2022 PMC study); sleep hygiene practices (Harvard Health, Sleep Foundation).
- **Routine:** chronotypes and scheduling work at your natural peak (UCLA Health); habit loop, habit stacking, and implementation intentions (Duhigg, Clear, 2024 meta-analysis PMC11641623).
- **Nutrition:** Mifflin-St Jeor for BMR; protein 1.6–2.2 g/kg for muscle gain/fat loss (NASM, 2022 meta-analysis PMC8978023); Harvard Healthy Eating Plate.
- **Fitness:** body fat ~10–12% (men) / ~16–20% (women) for visible abs; diet reveals abs, training develops them; EMG-based ab exercise selection (Built With Science, ACE, Healthline).
- **Body:** US Navy circumference body-fat method (DoD/CDC, ±3%); WHO waist-to-hip risk thresholds (≥0.90 men / ≥0.85 women); waist-to-height <0.5 target (Ashwell); sustainable rates — fat loss 0.5–1% body weight/week (ACSM), lean gains ~0.25–0.5 kg/wk; somatotypes presented as informal tendencies, not fixed biology.
- **Virtual body:** MakeHuman base mesh + measurement morph targets (both CC0/public domain, makehumancommunity/makehuman); male and female base bodies from MakeHuman's gender macros; measurements map 1:1 onto the mesh via MakeHuman's own measurement rings (`scripts/build-body-assets.mjs` rebuilds `public/body/body-male.json` + `body-female.json`). The avatar ships dressed — clothes are built from the body mesh itself (offset shells along the body normals), so they deform with the measurements and each piece (shirt/pants/socks/shoes) is a separate mesh with its own color.
- **Meal plans:** template-based plate method (Harvard plate) sized to individual calorie/macro targets; food values from USDA FoodData Central (public domain).
- **Exercise demos:** public-domain exercise dataset (yuhonas/free-exercise-db), images stored locally; YouTube "form search" links.

## 🚀 Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

## 📁 Project Structure

```
app/
├── components/
│   ├── LifeOsApp.tsx      # Tab shell (Today / Body / Sleep / Routine / Nutrition / Fitness)
│   ├── DashboardTab.tsx   # Command center: stats, meal plan, workout, progress chart
│   ├── BodyTab.tsx        # Measurements, body analysis, goal body, diet setup
│   ├── BodyAvatar3D.tsx   # Realistic 3D body: MakeHuman mesh + measurement morphs (Three.js / R3F)
│   ├── SleepTab.tsx       # Cycle calculator, positions, hygiene checklist
│   ├── RoutineTab.tsx     # Chronotype quiz, ideal schedule, habit tracker
│   ├── NutritionTab.tsx   # Profile → macros, personalized meal plan, shopping list
│   └── FitnessTab.tsx     # Six-pack plan: week plan + ab circuit with demos
├── lib/
│   ├── body.ts            # Navy body fat, shape, WHR, BMI, goal projection
│   ├── foods.ts           # ~140 natural whole foods (USDA-derived), diet pools
│   ├── meal-plan.ts       # Personalized meal plan generator + shopping list
│   ├── progress.ts        # Check-in tracking (weight/waist/body fat)
│   ├── sleep.ts           # 90-min cycle math, positions, hygiene data
│   ├── macros.ts          # Mifflin-St Jeor, TDEE, macro split, profile type
│   ├── routine.ts         # Chronotypes, schedules, habit science
│   ├── fitness.ts         # Ab circuit, week plan, exercise demos
│   ├── use-local-state.ts # localStorage-backed state hook
│   └── utils.ts
├── public/exercises/      # Public-domain exercise demo images
├── public/body/           # MakeHuman body meshes + measurement morphs (CC0): body-male.json, body-female.json (built by scripts/build-body-assets.mjs)
├── data/makehuman/        # CC0 source assets (base.obj, gender-*.target, measure-*.target) used to build the bodies
├── globals.css
├── layout.tsx
└── page.tsx
```

> **Roadmap:** the full product plan (virtual body, goal bodies, meal plans, exercise demos, progress) lives in [`PLAN.md`](./PLAN.md).

## 🛠️ Scripts

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `npm run dev`    | Start dev server (Turbopack)       |
| `npm run build`  | Production build                   |
| `npm start`      | Run production build locally       |
| `npm run lint`   | Run ESLint                         |
| `node scripts/build-body-assets.mjs` | Rebuild `public/body/body-male.json` + `body-female.json` from the CC0 MakeHuman assets in `data/makehuman/` |

## ⚠️ Disclaimer

LifeOS provides general educational information based on published research — it is **not medical advice**. Consult a qualified professional for health conditions, sleep disorders, or medical questions.

## 📄 License

MIT — free to use, modify, and share.
