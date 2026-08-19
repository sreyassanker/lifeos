<div align="center">

# LifeOS

### Your Daily Health & Time Companion

A free, privacy-first, scientifically-grounded health platform — now available as a **native Android app** for Android 16.

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

LifeOS bundles the everyday basics of health management into one place — **sleep, body, nutrition, fitness, and daily routine** — backed by 55+ peer-reviewed research papers and running entirely in your browser. No account. No tracking. Your data stays in your browser.

### Key Capabilities

- **Sleep** — Cycle calculator, chronotype scheduling, sleep quality scoring, circadian alignment
- **Body** — 11 body measurements, Navy body fat %, body shape analysis, goal projection, WHO waist thresholds
- **Nutrition** — Mifflin-St Jeor macro calculator, personalized meal plan from 140+ foods, glycemic index/load, micronutrient RDA tracking, regional food preferences
- **Fitness** — 23 bodyweight exercises with YouTube demos, MET-based calorie burn, WHO weekly targets, progressive overload tracking
- **Intelligence** — JITAI context-aware coaching, recovery score, vitality index, adaptive calorie adjustment, gamification (streaks + badges)

---

## Features

### Dashboard

The command center for your day:

- **Sleep target** — Calculated from your wake time using 90-minute sleep cycles
- **Daily macros** — Calories, protein, carbs, fat personalized to your profile
- **Water tracker** — Tap-to-log glasses with visual progress
- **Habit checklist** — Quick daily habit tracking with streak persistence
- **Today's workout** — Exercises from your weekly plan with calorie burn estimates
- **Meal plan** — Breakfast, lunch, dinner, and snacks sized to your macros
- **Recovery score** — 0-100 readiness index combining sleep, training, and rest
- **Vitality index** — Unified health score across sleep, nutrition, exercise, and body trends
- **Gamification** — Daily streak counter and 6 achievement badges
- **Smart tips** — Time-of-day coaching nudges (caffeine cutoff, protein intake, sleep reminders)
- **Progress chart** — Weight trend visualization from weekly check-ins

### Body

Your personalization hub:

- **11 body measurements** — Neck, shoulders, chest, waist, hips, thighs, calves, knees, ankles, upper arms, forearms
- **Body fat %** — US Navy circumference method (±3% accuracy)
- **Body shape analysis** — Apple, pear, hourglass, or rectangular classification
- **Health markers** — Waist-to-hip ratio, waist-to-height ratio, WHO risk thresholds
- **Goal projection** — Target body fat with estimated weight and timeline
- **Adaptive calories** — Auto-adjusts calorie target based on weight trend stalls or rapid changes
- **Profile** — Age, weight, height, sex, activity level, goal, country, and state
- **Regional preferences** — Food recommendations based on your location (58 countries, 7 with state-level detail)

### Sleep

Science-backed sleep optimization:

- **Cycle calculator** — Enter wake or bed time → get optimal sleep times based on 90-minute cycles
- **Sleep quality scoring** — Efficiency rating (excellent/good/fair/poor) with score out of 100
- **Circadian alignment** — Wake time consistency metric with personalized tips
- **Sleep positions** — Evidence-based guide (side sleeping for snoring, back for posture)
- **Sleep hygiene checklist** — Interactive checklist with science-backed tips

### Routine

Chronotype-based daily scheduling:

- **3-question chronotype quiz** — Identify your natural peak hours
- **Personalized schedule** — Time-blocked day with optimal focus, exercise, and wind-down windows
- **Habit tracker** — Daily habit tracking with streak persistence

### Nutrition

Evidence-based meal planning:

- **Macro calculator** — Mifflin-St Jeor BMR + activity multiplier + goal adjustment
- **Personalized meal plan** — 4-5 meals/day from 140+ whole foods, sized to your targets
- **Diet awareness** — Omnivore, vegetarian, or vegan with allergy exclusions
- **Glycemic index/load** — GI and GL badges on every food (low/medium/high)
- **Micronutrient tracking** — Iron, calcium, vitamin D, B12, zinc, magnesium vs RDA
- **Shopping list** — Auto-generated from your meal plan
- **Regional foods** — Country/state-specific food preferences and dietary guidance
- **Supplement guide** — Evidence-based recommendations (creatine, omega-3, vitamin D, fiber)
- **Sports health** — Mortality benefits by sport type

### Fitness

Bodyweight-only, indoor, no equipment:

- **23 exercises** — Upper push, lower body, core, cardio, mobility
- **YouTube demos** — Embedded videos from authentic fitness channels
- **Weekly plan** — Monday through Sunday with rest days
- **MET calorie burn** — Estimated calories per exercise based on your weight
- **WHO targets** — 150+ min/week moderate activity with progress tracking
- **Evidence-based guidelines** — ACSM 2025 Position Stand recommendations

---

## Research

Every number and plan in LifeOS traces back to published research:

### Foundations

| Domain | Key Sources | Implementation |
|--------|-------------|----------------|
| **BMR** | Mifflin-St Jeor (1990), Zadka 2026, Mazzola 2025 | `macros.ts` — TDEE calculation |
| **Protein** | Zhao et al. 2024 meta-analysis, NASM guidelines | `macros.ts` — 1.6-2.2 g/kg ranges |
| **Sleep** | Bes et al. 2023 (ultradian cycles), AASM Manual | `sleep.ts` — 90-min cycle math |
| **Body fat** | US Navy method (DoD/CDC), WHO waist thresholds | `body.ts` — Navy formula + WHR |
| **Exercise** | ACSM 2025 (137 reviews, >30k participants) | `fitness.ts` — Training guidelines |
| **Nutrition** | USDA Dietary Guidelines, Atkinson GI Tables | `foods.ts` — 140+ foods with GI |
| **Hydration** | NASEM adequate intake, Li 2024 personalized | `DashboardTab.tsx` — Water tracking |
| **Recovery** | Plews et al. 2014 (HRV baseline concept) | `progress.ts` — Recovery scoring |
| **Gamification** | Edwards et al. 2016 meta-analysis | `DashboardTab.tsx` — Streaks + badges |
| **JITAI** | Nahum-Shani et al. 2016 framework | `coaching.ts` — Context-aware tips |
| **Circadian** | Smets et al. 2020 (temperature-based phase) | `sleep.ts` — Alignment scoring |
| **Regional** | USDA, ICMR-NIN, PAHO/WHO, MHLW guidelines | `regions.ts` — 58 countries |

### Papers Cited

See [`docs/PRODUCTION_AUDIT.md`](./docs/PRODUCTION_AUDIT.md) for the complete 55-paper research compendium with analysis.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Web App (Next.js)                     │
│          React 19 + TypeScript + Tailwind CSS v4        │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Dashboard │ │   Body   │ │  Sleep   │ │ Nutrition│  │
│  │  Tab     │ │  Tab     │ │  Tab     │ │  Tab     │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │
│       │             │             │             │        │
│  ┌────┴─────────────┴─────────────┴─────────────┴────┐  │
│  │                    lib/                            │  │
│  │  macros.ts · body.ts · sleep.ts · foods.ts        │  │
│  │  fitness.ts · meal-plan.ts · progress.ts          │  │
│  │  coaching.ts · vitality.ts · regions.ts           │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
    ┌──────────────────┐     ┌──────────────────┐
    │   Web (Browser)  │     │  Android (APK)   │
    │  localStorage    │     │  Capacitor 8.5   │
    │  Static export   │     │  API 36 (16)     │
    └──────────────────┘     └──────────────────┘
```

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

### Project Structure

```
lifeos-app/
├── app/
│   ├── components/
│   │   ├── LifeOsApp.tsx        # Tab shell
│   │   ├── DashboardTab.tsx     # Command center
│   │   ├── BodyTab.tsx          # Measurements & analysis
│   │   ├── SleepTab.tsx         # Sleep calculator & quality
│   │   ├── RoutineTab.tsx       # Chronotype & habits
│   │   ├── NutritionTab.tsx     # Meal plan & nutrition
│   │   └── FitnessTab.tsx       # Workout plan & demos
│   ├── lib/
│   │   ├── macros.ts            # BMR, TDEE, macros, adaptive calories
│   │   ├── body.ts              # Body fat, shape, WHR, BMI
│   │   ├── sleep.ts             # Cycles, quality, circadian
│   │   ├── foods.ts             # 140+ foods with GI & nutrients
│   │   ├── fitness.ts           # Exercises, METs, weekly plan
│   │   ├── meal-plan.ts         # Meal plan generator
│   │   ├── progress.ts          # Check-ins, recovery score
│   │   ├── coaching.ts          # JITAI context-aware tips
│   │   ├── vitality.ts          # Unified health index
│   │   ├── regions.ts           # 58 countries, regional foods
│   │   ├── routine.ts           # Chronotypes, schedules
│   │   ├── use-local-state.ts   # localStorage hook
│   │   └── utils.ts
│   ├── layout.tsx
│   └── page.tsx
├── android/                      # Capacitor Android project
│   └── app/src/main/
│       ├── AndroidManifest.xml
│       ├── java/.../MainActivity.java
│       └── res/                  # Icons, splash, themes
├── capacitor.config.ts           # Capacitor configuration
├── next.config.ts                # Next.js static export config
└── package.json
```

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

# Production build
npm run build
npm start
```

### Android Build

```bash
# Install dependencies (if not already)
npm install

# Build static export and sync to Android
npm run android:build

# Open in Android Studio
npm run android:open

# Or build APK directly with Gradle
cd android
export JAVA_HOME="/path/to/jdk-21"
export ANDROID_HOME="/path/to/android-sdk"
gradle assembleDebug --no-daemon
```

**APK output:**
```
android/app/build/outputs/apk/debug/app-debug.apk    (5.7 MB)
android/app/build/outputs/apk/release/app-release-unsigned.apk  (4.8 MB)
```

### Android Features

| Feature | Implementation |
|---------|---------------|
| **Edge-to-edge** | Transparent status/navigation bars |
| **Dark mode** | DayNight theme, auto-follows system |
| **Splash screen** | Custom green LifeOS splash |
| **Launcher icon** | Adaptive icon (star on green) |
| **Immersive mode** | Auto-hide system bars |
| **Deep links** | `lifeos://` URL scheme |
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
- **No backend** — All data lives in your browser's localStorage
- **No data leaves your device** — Everything stays local
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
