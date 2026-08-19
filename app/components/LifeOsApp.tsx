"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import DashboardTab from "@/app/components/DashboardTab";
import BodyTab from "@/app/components/BodyTab";
import SleepTab from "@/app/components/SleepTab";
import RoutineTab from "@/app/components/RoutineTab";
import NutritionTab from "@/app/components/NutritionTab";
import FitnessTab from "@/app/components/FitnessTab";
import WorkoutLogger from "@/app/components/WorkoutLogger";
import MealLogger from "@/app/components/MealLogger";
import HeartRateZones from "@/app/components/HeartRateZones";
import SettingsTab from "@/app/components/SettingsTab";
import OnboardingWizard from "@/app/components/OnboardingWizard";
import { DashboardSkeleton } from "@/app/components/Skeleton";
import { DEFAULT_PROFILE } from "@/app/lib/macros";
import type { Profile } from "@/app/lib/macros";
import { useLocalStorage } from "@/app/lib/use-local-state";

const TABS = [
  {
    id: "today",
    label: "Today",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4m8-4v4M3 9h18" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "body",
    label: "Body",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5m0 0 3.5 3.5M12 12 8.5 15.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "sleep",
    label: "Sleep",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "routine",
    label: "Routine",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "nutrition",
    label: "Nutrition",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3v18M5 5l7 7 7-7M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "fitness",
    label: "Fitness",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6.5 6.5h11v11h-11z" strokeLinejoin="round" />
        <path d="M6.5 6.5 4 4m2.5 13.5L4 20m13.5-13.5L20 4m-2.5 13.5L20 20" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "workout",
    label: "Log",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 14l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "meals",
    label: "Meals",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    id: "hr",
    label: "HR",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ── Animated number counter ────────────────────────────────────── */
function AnimatedNumber({ value, duration = 800, suffix = "" }: { value: number; duration?: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = ref.current;
    const diff = value - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(step);
      else ref.current = value;
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return <>{display}{suffix}</>;
}

/* ── Stagger fade-in wrapper ───────────────────────────────────── */
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      {children}
    </div>
  );
}

/* ── Tap-feedback button wrapper ───────────────────────────────── */
function TapButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      {...props}
      className={`${className} transition-transform duration-100 ${pressed ? "scale-95" : "scale-100"}`}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      {children}
    </button>
  );
}

export default function LifeOsApp() {
  const [tab, setTab] = useState<TabId>("today");
  const [displayTab, setDisplayTab] = useState<TabId>("today");
  const [tabDirection, setTabDirection] = useState<"in" | "out">("in");
  const [profile, setProfile] = useLocalStorage<Profile>("lifeos-profile", DEFAULT_PROFILE);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const tabOrder: TabId[] = ["today", "body", "sleep", "routine", "nutrition", "fitness", "workout", "meals", "hr", "settings"];

  // Check if first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem("lifeos-onboarded");
    if (!hasVisited) setShowOnboarding(true);
    // Small delay for skeleton to show
    const timer = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleOnboardingComplete = (p: Profile) => {
    setProfile(p);
    localStorage.setItem("lifeos-onboarded", "true");
    setShowOnboarding(false);
  };

  const switchTab = useCallback((newTab: TabId) => {
    if (newTab === tab) return;
    setTabDirection("out");
    setTimeout(() => {
      setDisplayTab(newTab);
      setTab(newTab);
      setTabDirection("in");
    }, 150);
  }, [tab]);

  if (showOnboarding) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="sticky top-3 z-40 rounded-2xl border border-zinc-200 bg-white/90 p-1.5 shadow-lg shadow-zinc-900/5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {TABS.map((t) => (
            <TapButton
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                tab === t.id
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <span className="shrink-0">{t.icon}</span>
              <span className="whitespace-nowrap">{t.label}</span>
            </TapButton>
          ))}
        </div>
      </div>

      <div
        className="mt-6"
        style={{
          opacity: tabDirection === "in" ? 1 : 0,
          transform: tabDirection === "in" ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}
      >
        {!loaded ? (
          <DashboardSkeleton />
        ) : (
          <>
            {displayTab === "today" && <DashboardTab />}
            {displayTab === "body" && <BodyTab />}
            {displayTab === "sleep" && <SleepTab />}
            {displayTab === "routine" && <RoutineTab />}
            {displayTab === "nutrition" && <NutritionTab />}
            {displayTab === "fitness" && <FitnessTab />}
            {displayTab === "workout" && <WorkoutLogger />}
            {displayTab === "meals" && <MealLogger />}
            {displayTab === "hr" && <HeartRateZones />}
            {displayTab === "settings" && <SettingsTab />}
          </>
        )}
      </div>
    </div>
  );
}
