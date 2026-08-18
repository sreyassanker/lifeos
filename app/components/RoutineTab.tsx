"use client";

import { useState } from "react";
import { CHRONOTYPES, CHRONOTYPE_QUESTIONS, DEFAULT_HABITS, HABIT_SCIENCE } from "@/app/lib/routine";
import type { ChronotypeId } from "@/app/lib/routine";
import { useLocalStorage } from "@/app/lib/use-local-state";

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

export default function RoutineTab() {
  const [answers, setAnswers] = useState<(ChronotypeId | null)[]>(CHRONOTYPE_QUESTIONS.map(() => null));
  const [result, setResult] = useState<ChronotypeId | null>(null);
  const [habits, setHabits] = useLocalStorage<string[]>("lifeos-habits", DEFAULT_HABITS);
  const [done, setDone] = useLocalStorage<Record<string, boolean>>("lifeos-habits-done", {});
  const [newHabit, setNewHabit] = useState("");

  const chronotype = CHRONOTYPES.find((c) => c.id === result) ?? null;
  const answered = answers.filter(Boolean).length;
  const doneCount = habits.filter((h) => done[h]).length;
  const streak = doneCount === habits.length && habits.length > 0 ? "✓ Perfect day — keep the streak!" : `${doneCount}/${habits.length} done today`;

  const submitQuiz = () => {
    const counts: Record<ChronotypeId, number> = { lark: 0, intermediate: 0, owl: 0 };
    answers.forEach((a) => {
      if (a) counts[a] += 1;
    });
    const winner = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "intermediate") as ChronotypeId;
    setResult(winner);
  };

  return (
    <div className="space-y-6">
      {/* Chronotype quiz */}
      <Card
        title="Find your chronotype"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" strokeLinecap="round" />
          </svg>
        }
      >
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Your body has a natural rhythm for when you&apos;re sharpest. Building your day around it beats fighting it — 3
          quick questions:
        </p>
        <div className="mt-4 space-y-4">
          {CHRONOTYPE_QUESTIONS.map((q, qi) => (
            <div key={q.question}>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {qi + 1}. {q.question}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() =>
                      setAnswers((prev) => prev.map((a, i) => (i === qi ? opt.type : a)))
                    }
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      answers[qi] === opt.type
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : "border-zinc-200 bg-white text-zinc-600 hover:border-emerald-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-emerald-900"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={submitQuiz}
          disabled={answered < CHRONOTYPE_QUESTIONS.length}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Show my ideal day
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </Card>

      {chronotype && (
        <Card
          title={`${chronotype.emoji} ${chronotype.name}`}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19V5m16 14V9M4 19h16" strokeLinecap="round" />
              <path d="M8 15h2m6-4h2m-8 6h2" strokeLinecap="round" />
            </svg>
          }
        >
          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{chronotype.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Wakes naturally: {chronotype.wake}
            </span>
            <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
              Sleeps: {chronotype.sleep}
            </span>
            <span className="rounded-full bg-zinc-500/10 px-3 py-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              Peak: {chronotype.peakHours}
            </span>
          </div>
          <div className="mt-5 space-y-2">
            {chronotype.schedule.map((slot) => (
              <div
                key={slot.time}
                className="flex flex-col gap-1 rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-2.5 sm:flex-row sm:items-center sm:gap-4 dark:border-zinc-800 dark:bg-zinc-950/40"
              >
                <span className="w-32 shrink-0 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  {slot.time}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{slot.activity}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{slot.why}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Tip: if your life demands earlier mornings than your chronotype, shift gradually — 15–30 min every few days —
            with morning sunlight and a fixed wake time. Consistency matters more than the clock.
          </p>
        </Card>
      )}

      {/* Habit tracker */}
      <Card
        title={`Daily habit tracker · ${streak}`}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8L12 2z" strokeLinejoin="round" />
          </svg>
        }
      >
        <div className="space-y-2">
          {habits.map((habit) => (
            <button
              key={habit}
              onClick={() => setDone((prev) => ({ ...prev, [habit]: !prev[habit] }))}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                done[habit]
                  ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40"
                  : "border-zinc-200 bg-white hover:border-emerald-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-900"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                  done[habit] ? "border-emerald-500 bg-emerald-500 text-white" : "border-zinc-300 dark:border-zinc-600"
                }`}
              >
                {done[habit] && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{habit}</span>
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = newHabit.trim();
            if (!trimmed) return;
            setHabits((prev) => [...prev, trimmed]);
            setNewHabit("");
          }}
          className="mt-3 flex gap-2"
        >
          <input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="Add your own habit…"
            className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-200"
          />
          <button
            type="submit"
            className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Add
          </button>
        </form>
      </Card>

      {/* Habit science */}
      <Card
        title="Habit science — why these work"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M9 9h6v6H9z" strokeLinejoin="round" />
          </svg>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {HABIT_SCIENCE.map((tip) => (
            <div key={tip.title} className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{tip.title}</h4>
              <p className="mt-1.5 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{tip.body}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
