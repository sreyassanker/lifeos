"use client";

import { useState } from "react";
import { BODY_FAT_LEVELS, KEY_FACTS, WEEK_PLAN } from "@/app/lib/fitness";
import type { ExerciseDemo } from "@/app/lib/fitness";

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
        <span className="text-emerald-600 dark:text-emerald-400">{icon}</span>
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

// ── YouTube embed with thumbnail → click to play ──────────────────────────
function YouTubeEmbed({ demo, compact = false }: { demo: ExerciseDemo; compact?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const thumbUrl = `https://img.youtube.com/vi/${demo.videoId}/mqdefault.jpg`;

  if (playing) {
    return (
      <div className="w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={`https://www.youtube.com/embed/${demo.videoId}?autoplay=1&rel=0&modestbranding=1`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
            title={`${demo.creator} — form demo`}
          />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      className="group relative w-full overflow-hidden rounded-lg border border-zinc-200 transition hover:border-emerald-400 dark:border-zinc-700 dark:hover:border-emerald-600"
      title={`Play demo by ${demo.creator}`}
    >
      <img
        src={thumbUrl}
        alt={`${demo.creator} tutorial`}
        className={`w-full object-cover ${compact ? "h-24" : "h-32"}`}
        loading="lazy"
      />
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/40">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-zinc-900 shadow-lg transition group-hover:scale-110">
          ▶
        </div>
      </div>
      {/* Creator badge */}
      <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
        {demo.creator}
      </span>
    </button>
  );
}

// ── Inline exercise item with optional YouTube embed ──────────────────────
function ExerciseItem({ text, demo }: { text: string; demo?: ExerciseDemo }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 text-xs leading-5 text-zinc-700 dark:text-zinc-300">• {text}</p>
        {demo && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="group relative shrink-0 overflow-hidden rounded-md border border-zinc-200 transition hover:border-emerald-400 dark:border-zinc-700"
            title={`Play demo by ${demo.creator}`}
          >
            <img
              src={`https://img.youtube.com/vi/${demo.videoId}/mqdefault.jpg`}
              alt={`${demo.creator} tutorial`}
              className="h-12 w-16 object-cover transition group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/40">
              <span className="text-xs font-bold text-white drop-shadow">▶</span>
            </div>
          </button>
        )}
      </div>
      {demo && expanded && (
        <div className="mt-2 space-y-2">
          <YouTubeEmbed demo={demo} compact />
          {demo.note && (
            <p className="rounded-lg bg-emerald-50/60 px-3 py-2 text-[11px] leading-4 text-zinc-600 dark:bg-emerald-950/30 dark:text-zinc-400">
              <strong>Form tip:</strong> {demo.note}
            </p>
          )}
          <button
            onClick={() => setExpanded(false)}
            className="text-[11px] font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
          >
            Hide video
          </button>
        </div>
      )}
    </div>
  );
}

export default function FitnessTab() {
  const today = new Date().getDay();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="space-y-6">
      {/* The truth first */}
      <Card
        title="The truth about six-packs"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 3h6v3l-3 3-3-3V3zM9 9l-2 9a4 4 0 0 0 10 0l-2-9" strokeLinejoin="round" />
          </svg>
        }
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {KEY_FACTS.map((f) => (
            <div key={f.fact} className="rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{f.fact}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{f.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-950/60 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Body fat level</th>
                <th className="px-4 py-2.5 font-semibold">Men</th>
                <th className="px-4 py-2.5 font-semibold">Women</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {BODY_FAT_LEVELS.map((row) => (
                <tr key={row.label}>
                  <td className="px-4 py-2.5 font-medium text-zinc-800 dark:text-zinc-200">{row.label}</td>
                  <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{row.men}</td>
                  <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{row.women}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ACSM evidence-based guidelines */}
      <Card
        title="Evidence-based training guidelines (ACSM 2025)"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 3h6v3l-3 3-3-3V3zM9 9l-2 9a4 4 0 0 0 10 0l-2-9" strokeLinejoin="round" />
          </svg>
        }
      >
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          From the ACSM Position Stand (Currier et al. 2026) — 137 systematic reviews, {">30,000"} participants:
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {[
            { label: "For strength", detail: "Lift heavier (≥80% 1RM), full range of motion, 2–3 sets per exercise, ≥2 sessions/week. Perform strength exercises at the beginning of your session." },
            { label: "For hypertrophy", detail: "≥10 sets per muscle group per week. Load range (30–100% 1RM) doesn't matter — total volume is the key driver. Eccentric overload helps." },
            { label: "For power", detail: "Moderate loads (30–70% 1RM), ≤24 reps per set, fast concentric phase. Olympic-style weightlifting is effective." },
            { label: "Not required", detail: "Training to failure, specific periodization schemes, time under tension, blood flow restriction, or specific set structures do NOT consistently improve outcomes." },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.label}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{item.detail}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-zinc-400 dark:text-zinc-500">
          Key takeaway: consistency and progressive overload matter most. Don&apos;t overcomplicate — any form of RT is
          better than none. 2–3 reps in reserve (RIR) is sufficient; you don&apos;t need to train to failure.
        </p>
      </Card>

      {/* This week — bodyweight plan with embedded YouTube demos */}
      <Card
        title={`This week's plan — today is ${dayNames[today]}`}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="17" rx="2" />
            <path d="M8 2v4m8-4v4M3 9h18" strokeLinecap="round" />
          </svg>
        }
      >
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          All <strong>bodyweight — no equipment needed</strong>. 3 strength days with core merged in, 2 cardio/mobility days, 1 HIIT day, full rest.
          Tap any thumbnail to watch the exercise video in-app. Tap again to collapse.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {WEEK_PLAN.map((d) => {
            const isToday = d.day === dayNames[today];
            return (
              <div
                key={d.day}
                className={`rounded-xl border p-4 ${
                  isToday
                    ? "border-emerald-400 bg-emerald-50/70 dark:border-emerald-600 dark:bg-emerald-950/40"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {d.day}
                    {isToday && (
                      <span className="ml-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Today
                      </span>
                    )}
                  </h4>
                </div>
                <p className="mt-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">{d.title}</p>
                <div className="mt-2 space-y-2">
                  {d.items.map((item) => (
                    <ExerciseItem key={item.text} text={item.text} demo={item.demo} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
