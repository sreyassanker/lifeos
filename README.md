<div align="center">

# LifeOS

### Your Daily Health & Time Companion

A free, privacy-first, scientifically-grounded health platform — available as a **web app** and a **native Android app** for Android 16 (API 36).

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![Capacitor](https://img.shields.io/badge/Capacitor-8-blue?logo=capacitor)](https://capacitorjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

[Web App](https://lifeos.vercel.app) · [Download APK](#-android-apk) · [Features](#-features) · [Research](#-research) · [Architecture](#-architecture)

</div>

---

## Overview

LifeOS bundles the everyday basics of health management into one place — **sleep, body, nutrition, fitness, and daily routine** — in a single app with **10 tools**, backed by **55+ peer-reviewed research studies**, and running entirely on your device. No account. No tracking. Your data never leaves your device.

Everything adapts to *you*: your profile (sex, age, height, weight, activity, country) drives calories & macros; **your body measurements make the math body-composition-aware** (Katch-McArdle energy on lean mass when body fat is known); and your weekly check-ins keep it honest through adaptive calorie adjustments and progress trends.

### Key Capabilities

- **Onboarding tour** — 5-step guided setup with an animated splash on launch
- **Today** — Sleep target, macros, water, habits, recovery score, vitality index, smart JITAI coaching tips, weekly check-in, XP & badges
- **Body** — 11 measurements, US Navy body fat %, shape analysis, WHO waist thresholds, goal projection — **and feeds body-composition-aware calories & protein**
- **Sleep** — Cycle calculator, sleep quality scoring, circadian alignment, hygiene checklist
- **Routine** — Chronotype quiz (3 questions) → personalized daily schedule + habit tracker
- **Nutrition** — Macro calculator (Mifflin-St Jeor / Katch-McArdle), meal plans from **120+ foods**, meal logging against targets, GI/GL, micronutrient RDAs, regional foods (62 countries)
- **Fitness** — 23 bodyweight exercises with **in-app video demos**, MET calorie burn, WHO weekly targets
- **Log** — Workout journal: sets/reps/RPE, rest timer, burn estimation, video watch inline
- **Meals** — Food diary that tracks reality vs. your plan (calories, protein, water)
- **HR** — Karvonen-based heart-rate training zones (5-zone model)
- **Settings & Data** — System-following dark mode, units, reminders, backup/export/import/reset

---

## Features

### Onboarding & Launch

- **Animated splash** — Logo pop + expanding ring + loading bar on a branded gradient (dismisses automatically)
- **First-run wizard** — Welcome → About You (sex, age, weight, height, activity) → Goals (target body fat slider) → Eating style → ready summary

### Today (Dashboard)

The command center for your day:

- **Sleep target** — Calculated from your wake time using 90-minute sleep cycles
- **Daily macros** — Calories, protein, carbs, and fat personalized to your profile
- **Water tracker** — Tap-to-log glasses with visual progress
- **Habit checklist** — Quick daily habit tracking with streak persistence
- **Today's workout & meal plan** — From your weekly plan and nutrition targets
- **Recovery score** — 0–100 readiness index (sleep, training adherence, rest compliance)
- **Vitality index** — Unified 0–100 score across sleep, nutrition, exercise, and body trends (weighted 30/30/25/15)
- **Smart tips** — Time-of-day JITAI coaching nudges (caffeine cutoff, protein, hydration, sleep)
- **Weekly check-in** — Log weight / waist / body fat; drives trends, milestones, and adaptive calories
- **Gamification** — XP points, dynamic badges, and streak rewards

### Body

Your personalization hub — **the measurement data feeds the whole app's nutrition math**:

- **11 body measurements** — Neck, shoulders, chest, waist, hips, thighs, calves, knees, ankles, upper arms, forearms (cm or in)
- **Body fat %** — US Navy circumference method (±3%); adopt it (or a verified % from a check-in) as your working body fat
- **Body-composition-aware targets** — with body fat known, BMR switches from Mifflin-St Jeor to **Katch-McArdle (on lean mass)** and protein is dosed on **lean mass** — two people of equal weight get different targets if their body fat differs
- **Body shape analysis** — Apple, pear, hourglass, rectangle, V-taper, etc.
- **Health markers** — Waist-to-hip ratio, waist-to-height ratio, WHO risk thresholds
- **Goal projection** — Target body fat slider → estimated goal weight, timeline, and goal measurements
- **Adaptive calories** — Recommends ±100 kcal based on your weekly weight trend — and recognizes *recomposition* (weight flat, body fat dropping → holds calories)
- **Regional preferences** — Food guidance based on your location (62 countries, 7 with state-level detail)

### Sleep

- **Cycle calculator** — Enter wake or bed time → optimal times based on 90-minute ultradian cycles
- **Sleep quality scoring** — Efficiency rating with score out of 100
- **Circadian alignment** — Wake-time consistency metric with personalized tips
- **Sleep positions** — Evidence-based guide (side sleeping for snoring, back for posture)
- **Hygiene checklist** — Interactive checklist with science-backed tips

### Routine

- **Chronotype quiz** — 3 questions to identify your natural peak hours
- **Personalized schedule** — Time-blocked day with focus, exercise, and wind-down windows
- **Habit tracker** — Daily habits with streak persistence

### Nutrition

- **Macro calculator** — Mifflin-St Jeor BMR (or Katch-McArdle when body fat is known) + activity multiplier + goal adjustment
- **Personalized meal plan** — 3–5 meals/day built from **120+ whole foods**, sized to your targets (deterministic, "regenerate" gives variety)
- **Meal logging** — Log what you eat; compare reality vs. daily protein/calorie targets
- **Diet awareness** — Omnivore, vegetarian, or vegan with allergy exclusions
- **Glycemic index/load** — Low/medium/high badges on every food
- **Micronutrient tracking** — Iron, calcium, vitamin D, B12, zinc, magnesium vs RDAs
- **Shopping list** — Auto-generated from your meal plan
- **Regional foods** — Country/state-specific food preferences and guidance
- **Supplement & sports health guides** — Evidence-based recommendations

### Fitness

- **23 bodyweight exercises** — Upper push, lower body, core, cardio, mobility
- **In-app video demos** — Watch form videos without leaving the app
- **Weekly plan** — Monday–Sunday with recovery days, planned around WHO targets
- **MET calorie burn** — Calories per exercise based on your weight
- **WHO targets** — 150+ min/week moderate activity with progress tracking
- **Evidence-based guidelines** — ACSM 2025 Position Stand recommendations

### Log (Workout Journal)

- **Session logging** — Log exercises with sets, reps, and RPE
- **Rest timer** — Configurable countdown with haptic feedback
- **Burn estimation** — Session calories via MET values
- **History & adherence** — Past sessions feed weekly reports and gamification

### Meals (Food Diary)

- **Food log** — Tap foods from the database with gram amounts
- **Target tracking** — Daily protein / calories / water vs. your plan
- **Adherence metrics** — Weekly nutrition adherence feeds the extras

### HR

- **Training zones** — Karvonen formula (ACSM): 5 zones from aerobic base to VO₂max
- **Profile-driven** — Based on your age and resting heart rate (Tanaka HRmax estimate)

### Settings & Data

- **Dark mode** — Follows your system automatically, with a manual override; applied at startup and live
- **Notifications** — Opt-in local reminders (water, habits, workouts), rescheduled on change
- **Units** — Metric / imperial for measurements
- **Backup & restore** — One-tap export to a JSON file, import back, or reset
- **Weekly report** — Roll-up of your week (weight, body fat, measurements, activity)
- **Haptics** — Light feedback on key interactions (Android)

---

## Research

Every number and plan in LifeOS traces back to published research:

### Foundations

| Domain | Key Sources | Implementation |
|--------|-------------|----------------|
| **BMR / energy** | Mifflin-St Jeor (1990) + Katch-McArdle (when body fat known) | `macros.ts` — body-composition-aware TDEE |
| **Protein** | NASM/ACSM + meta-analyses (Zhao 2024); dosed on lean mass when body fat is known | `macros.ts` |
| **Adaptive calories** | Hall's dynamic model; weight + body-fat trend (recomposition) | `macros.ts` — `adaptiveCalories()` |
| **Sleep** | Bes et al. 2023 (ultradian cycles), AASM Manual | `sleep.ts` — 90-min cycle math |
| **Body fat** | US Navy method (DoD/CDC), WHO waist thresholds | `body.ts` — Navy formula + WHR/waist-to-height |
| **Exercise** | ACSM 2025 (137 reviews, >30k participants) | `fitness.ts` — training guidelines, METs (Ainsworth 2024) |
| **Heart-rate zones** | ACSM guidelines; Karvonen, Tanaka, Uth estimators | `heart-rate.ts` |
| **Nutrition** | USDA Dietary Guidelines, Atkinson GI Tables (2021) | `foods.ts` — 120+ foods with GI & nutrients |
| **Hydration** | NASEM adequate intake | `DashboardTab.tsx` — water tracking |
| **Recovery** | Plews et al. 2014 (HRV baseline concept) | `progress.ts` — recovery scoring |
| **Gamification** | Edwards et al. 2016 meta-analysis | `gamification.ts` — XP + badges |
| **JITAI** | Nahum-Shani et al. 2016 framework | `coaching.ts` — context-aware tips |
| **Circadian** | Smets et al. 2020 (temperature-based phase) | `sleep.ts` — alignment scoring |
| **Regional** | USDA, ICMR-NIN, PAHO/WHO, MHLW, Nordic 2023 guidelines | `regions.ts` — 62 countries |

### Papers Cited

A compendium of PDF references and research notes lives in [`docs/papers/`](./docs/papers/). Build and audit history: [`docs/BUILD_REPORT_2026-08-20.md`](./docs/BUILD_REPORT_2026-08-20.md) and [`docs/APK_BUILD_REPORT.md`](./docs/APK_BUILD_REPORT.md).

---

## Architecture

One source of truth on the front end: **components** (UI) → **`app/lib/`** (pure, testable logic) → **`localStorage`** (persistence). No backend, no network calls.

```
lifeos-app/
├── app/
│   ├── page.tsx                          # landing page → mounts the app at #app
│   ├── layout.tsx                        # root layout, manifest, theme
│   ├── globals.css                       # Tailwind + animation keyframes
│   ├── components/
│   │   ├── LifeOsApp.tsx                 # tab shell + splash/onboarding gating
│   │   ├── LaunchSplash.tsx              # animated launch splash
│   │   ├── OnboardingWizard.tsx          # 5-step first-run setup
│   │   ├── DashboardTab.tsx             # today — check-ins, recovery, vitality
│   │   ├── BodyTab.tsx                  # measurements → body-fat-aware targets
│   │   ├── SleepTab.tsx · RoutineTab.tsx
│   │   ├── NutritionTab.tsx · MealLogger.tsx
│   │   ├── FitnessTab.tsx · WorkoutLogger.tsx
│   │   ├── HeartRateZones.tsx · SettingsTab.tsx
│   │   ├── WeeklyReport.tsx · GamificationPanel.tsx
│   │   └── DataManager.tsx · Skeleton.tsx
│   └── lib/                              # domain logic (no React) — shared by all tabs
│       ├── macros.ts      # BMR (Mifflin/Katch), macros, adaptive calories
│       ├── body.ts · body-history.ts     # body fat, trends, goal projection
│       ├── sleep.ts · routine.ts         # cycles, chronotypes
│       ├── foods.ts · meal-plan.ts · meal-log.ts
│       ├── fitness.ts · workout-log.ts · heart-rate.ts
│       ├── progress.ts · coaching.ts · vitality.ts
│       ├── gamification.ts · settings.ts · notifications.ts · haptics.ts
│       └── regions.ts · animations.ts · use-local-state.ts · utils.ts
├── android/                              # Capacitor 8 wrapper (API 36)
│   └── app/src/main/                     # manifest, MainActivity, res (icons/splash)
├── docs/
│   └── papers/                           # research PDF compendium
└── capacitor.config.ts · next.config.ts · package.json
```

**How it fits together:** each tab is a React component that reads/writes `localStorage` through typed lib functions (`lib/macros.ts` computes calories, `lib/meal-plan.ts` builds meals, `lib/coaching.ts` picks tips, etc.). The same web bundle is exported statically and served either in the browser or inside the Capacitor shell on Android — identical behavior, no backend.

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16.3.1 | React framework with static export |
| **UI** | React 19.2.8 | Component library |
| **Language** | TypeScript 5 | Type safety |
| **Styling** | Tailwind CSS v4 | Utility-first CSS |
| **State** | localStorage | Client-side persistence (no backend) |
| **Android** | Capacitor 8.5 | Native Android wrapper |
| **Build** | Gradle 8.14.3 | Android build system |
| **Target** | Android 16 (API 36) | Latest Android platform |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **JDK 21** (for Android builds)
- **Android SDK** API 36 (for Android builds)

### Web Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:3000

# Production build (static export)
npm run build
npm start
```

### Android Build

```bash
# Install dependencies (if not already)
npm install

# Build static export and sync to Android
npm run android:build

# Open in Android Studio (or build directly with Gradle)
npm run android:open
```

**Build the APK with Gradle** (Windows PowerShell):

```powershell
# Point at a JDK 21 (Capacitor 8 / Gradle 8.14 needs JDK 21, not 17)
$env:JAVA_HOME = "C:\jdk21\jdk-21.0.2"

cd android
.\gradlew.bat assembleDebug   --no-daemon   # installable debug APK
.\gradlew.bat assembleRelease --no-daemon   # unsigned release APK
```

On macOS/Linux replace the last two lines with:

```bash
cd android
export JAVA_HOME="/path/to/jdk-21"
gradle assembleDebug --no-daemon
gradle assembleRelease --no-daemon
```

**APK output (current sizes):**
```
android/app/build/outputs/apk/debug/app-debug.apk            → LifeOS.apk              (~9.6 MB, installable)
android/app/build/outputs/apk/release/app-release-unsigned.apk → LifeOS-release.apk     (~8.1 MB, Play Store)
```

### <a id="android-apk"></a>Android Features

| Feature | Implementation |
|---------|---------------|
| **Edge-to-edge** | Transparent status/navigation bars |
| **Dark mode** | DayNight theme + in-app system-following theme |
| **Animated splash** | Custom green LifeOS startup animation |
| **Launcher icon** | Adaptive icon (star on green) |
| **Immersive mode** | Auto-hide system bars |
| **Deep links** | `lifeos://` URL scheme |
| **Reminders** | Local notifications (water, habits, workouts) |
| **Haptics** | Tap feedback via Capacitor |
| **Backup** | Android 12+ cloud backup rules |
| **Predictive back** | `enableOnBackInvokedCallback` |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build (static export) |
| `npm start` | Run production build locally |
| `npm run lint` | Run ESLint |
| `npm run android:build` | Build + sync Android |
| `npm run android:open` | Open in Android Studio |
| `npm run android:sync` | Sync web assets to Android |

---

## Privacy

LifeOS is **privacy by design**:

- **No accounts** — Nothing to sign up for
- **No tracking** — No analytics, no cookies, no fingerprinting
- **No backend** — All data lives in your device's localStorage
- **No data leaves your device** — Everything stays local (including backups you export yourself)
- **Open source** — Full code transparency

---

## Disclaimer

LifeOS provides general educational information based on published research. It is **not medical advice**. For health conditions, sleep disorders, or medical questions, consult a qualified healthcare professional.

---

## License

MIT — free to use, modify, and share.

---

<div align="center">

**Built with evidence, not trends.**

[Web App](https://lifeos.vercel.app) · [GitHub](https://github.com/sreyassanker/lifeos) · [Download APK](#-android-apk)

</div>