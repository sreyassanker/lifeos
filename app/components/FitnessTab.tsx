"use client";

import { useState } from "react";
import Image from "next/image";
import { AB_CIRCUIT, BODY_FAT_LEVELS, KEY_FACTS, WEEK_PLAN } from "@/app/lib/fitness";
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

function DemoThumb({ demo, align = "row" }: { demo: ExerciseDemo; align?: "row" | "col" }) {
  const [open, setOpen] = useState(false);
  const youtubeUrl = demo.youtube
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(demo.youtube)}`
    : null;

  return (
    <div className={align === "col" ? "flex flex-col gap-1.5" : "flex items-center gap-2"}>
      <button
        onClick={() => setOpen((v) => !v)}
        title={open ? "Hide larger view" : "Show larger view"}
        className="group relative shrink-0 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700"
      >
        <Image
          src={demo.img}
          alt="Exercise demonstration"
          loading="lazy"
          width={80}
          height={56}
          className="h-14 w-20 object-cover transition group-hover:scale-105"
        />
      </button>
      {youtubeUrl && (
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-[11px] font-semibold text-zinc-500 underline-offset-2 hover:text-emerald-600 hover:underline dark:text-zinc-400"
        >
          ▶ Watch form
        </a>
      )}
      {open && (
        <div className="w-full">
          <Image
            src={demo.img}
            alt="Exercise demonstration, larger view"
            width={850}
            height={567}
            className="w-full max-w-xs rounded-lg border border-zinc-200 dark:border-zinc-700"
          />
          {demo.note && <p className="mt-1 text-[11px] italic leading-4 text-zinc-500 dark:text-zinc-400">{demo.note}</p>}
        </div>
      )}
    </div>
  );
}

const demos = (demo?: ExerciseDemo | ExerciseDemo[]): ExerciseDemo[] => (demo ? (Array.isArray(demo) ? demo : [demo]) : []);

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

      {/* This week */}
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
          3 strength days + 2 cardio days + active recovery + full rest. The abs circuit (below) runs on strength days
          only — <strong>2–3 sessions/week is enough; daily is counterproductive.</strong> Tap any thumbnail to enlarge
          the demo.
        </p>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
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
                    <div key={item.text}>
                      <p className="text-xs leading-5 text-zinc-600 dark:text-zinc-400">• {item.text}</p>
                      {demos(item.demo).length > 0 && (
                        <div className="ml-3 mt-1 flex flex-wrap gap-3">
                          {demos(item.demo).map((demo, i) => (
                            <DemoThumb key={`${item.text}-${i}`} demo={demo} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Ab circuit */}
      <Card
        title="The science-based ab circuit (strength days)"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
            <path d="M12 8v4l3 3" strokeLinecap="round" />
          </svg>
        }
      >
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Four exercises covering all four core regions (lower abs, obliques, upper abs, serratus) — selected from EMG
          research. Do the circuit after your main lift, 2–3 days/week.
        </p>
        <div className="mt-4 space-y-3">
          {AB_CIRCUIT.map((ex, i) => (
            <div key={ex.name} className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {i + 1}. {ex.name}
                    </h4>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                      {ex.target}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                      {ex.setsReps}
                    </span>
                    <span className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                      Rest {ex.rest}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{ex.form}</p>
                </div>
                {ex.demo && (
                  <div className="shrink-0 sm:w-44">
                    <DemoThumb demo={ex.demo} align="col" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-zinc-400 dark:text-zinc-500">
          Demo images: public-domain exercise dataset (yuhonas/free-exercise-db). YouTube links open a form search —
          always prioritize good form over load.
        </p>
      </Card>
    </div>
  );
}
