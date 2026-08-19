"use client";

import { useMemo } from "react";
import {
  SLEEP_HYGIENE,
  SLEEP_NEEDS,
  SLEEP_POSITIONS,
  bedtimesForWake,
  wakeTimesForBed,
} from "@/app/lib/sleep";
import { useLocalStorage } from "@/app/lib/use-local-state";

function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{label}</span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 font-mono text-sm text-zinc-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-200"
      />
    </label>
  );
}

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

export default function SleepTab() {
  const [wake, setWake] = useLocalStorage<string>("lifeos-wake", "07:00");
  const [bed, setBed] = useLocalStorage<string>("lifeos-bed", "23:00");
  const [checked, setChecked] = useLocalStorage<Record<string, boolean>>("lifeos-sleep-hygiene", {});

  const bedtimes = useMemo(() => (wake ? bedtimesForWake(wake) : []), [wake]);
  const wakeTimes = useMemo(() => (bed ? wakeTimesForBed(bed) : []), [bed]);

  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Cycle calculator */}
      <Card
        title="Sleep cycle calculator"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" strokeLinejoin="round" />
          </svg>
        }
      >
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Sleep runs in ~90-minute cycles. Waking mid-cycle leaves you groggy — waking at a cycle boundary leaves you
          refreshed. Based on your wake-up time, aim for <strong>5–6 complete cycles</strong> (7.5–9h) plus ~15 min to
          fall asleep.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
            <TimeInput label="I need to wake up at" value={wake} onChange={setWake} />
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">→ Go to bed at</p>
            <div className="space-y-2">
              {bedtimes.map((t) => (
                <div
                  key={t.label}
                  className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-3 py-2 dark:border-emerald-900 dark:bg-zinc-900"
                >
                  <span className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{t.value}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3 rounded-xl border border-teal-200 bg-teal-50/60 p-4 dark:border-teal-900 dark:bg-teal-950/30">
            <TimeInput label="I'm going to bed at" value={bed} onChange={setBed} />
            <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">→ Wake up at</p>
            <div className="space-y-2">
              {wakeTimes.map((t) => (
                <div
                  key={t.label}
                  className="flex items-center justify-between rounded-lg border border-teal-200 bg-white px-3 py-2 dark:border-teal-900 dark:bg-zinc-900"
                >
                  <span className="font-mono text-lg font-bold text-teal-700 dark:text-teal-300">{t.value}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {SLEEP_NEEDS.map((band) => (
            <span
              key={band.age}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <strong>{band.age}:</strong> {band.hours}
            </span>
          ))}
        </div>
      </Card>

      {/* Positions */}
      <Card
        title="Best sleeping position"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 18v-6a3 3 0 0 1 3-3h1V7a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v2h1a3 3 0 0 1 3 3v6M3 18h18M3 18l-1 2m19-2 1 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          {SLEEP_POSITIONS.map((pos) => (
            <div
              key={pos.name}
              className={`rounded-xl border p-4 ${
                pos.verdict === "Best"
                  ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30"
                  : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{pos.name}</h4>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    pos.verdict === "Best"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {pos.verdict}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{pos.summary}</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                {pos.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* Hygiene checklist */}
      <Card
        title={`Sleep hygiene checklist · ${doneCount}/${SLEEP_HYGIENE.length}`}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
      >
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Tick what you already do — the gaps are your quick wins. Progress is saved in your browser.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {SLEEP_HYGIENE.map((item) => (
            <button
              key={item.label}
              onClick={() => setChecked((prev) => ({ ...prev, [item.label]: !prev[item.label] }))}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                checked[item.label]
                  ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40"
                  : "border-zinc-200 bg-white hover:border-emerald-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-900"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                  checked[item.label]
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-zinc-300 dark:border-zinc-600"
                }`}
              >
                {checked[item.label] && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span>
                <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.label}</span>
                <span className="mt-0.5 block text-xs leading-5 text-zinc-500 dark:text-zinc-400">{item.detail}</span>
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
