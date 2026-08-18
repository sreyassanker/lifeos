"use client";

import { useState } from "react";
import DashboardTab from "@/app/components/DashboardTab";
import BodyTab from "@/app/components/BodyTab";
import SleepTab from "@/app/components/SleepTab";
import RoutineTab from "@/app/components/RoutineTab";
import NutritionTab from "@/app/components/NutritionTab";
import FitnessTab from "@/app/components/FitnessTab";

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
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function LifeOsApp() {
  const [tab, setTab] = useState<TabId>("today");

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="sticky top-3 z-40 rounded-2xl border border-zinc-200 bg-white/90 p-1.5 shadow-lg shadow-zinc-900/5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                tab === t.id
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <span className="shrink-0">{t.icon}</span>
              <span className="truncate">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {tab === "today" && <DashboardTab />}
        {tab === "body" && <BodyTab />}
        {tab === "sleep" && <SleepTab />}
        {tab === "routine" && <RoutineTab />}
        {tab === "nutrition" && <NutritionTab />}
        {tab === "fitness" && <FitnessTab />}
      </div>
    </div>
  );
}
