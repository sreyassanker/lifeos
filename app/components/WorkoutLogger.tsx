"use client";

import { useState, useEffect, useCallback } from "react";
import { WEEK_PLAN, estimateCaloriesBurn, todayPlanIndex, type PlanItem } from "@/app/lib/fitness";
import { logWorkout, getLogsForDate, type WorkoutLog, type LoggedExercise, type LoggedSet } from "@/app/lib/workout-log";
import { useLocalStorage } from "@/app/lib/use-local-state";
import { DEFAULT_PROFILE, type Profile } from "@/app/lib/macros";
import { hapticLight, hapticSuccess, hapticTimerDone } from "@/app/lib/haptics";
import { awardXP } from "@/app/lib/gamification";
import { DEFAULT_SETTINGS, type AppSettings, SETTINGS_STORAGE_KEY } from "@/app/lib/settings";

// ── Rest Timer ──────────────────────────────────────────────────────────
function RestTimer({
  duration,
  onComplete,
  onSkip,
}: {
  duration: number;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    if (remaining <= 0) {
      hapticTimerDone();
      onComplete();
      return;
    }
    const timer = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(timer);
  }, [remaining, onComplete]);

  const progress = ((duration - remaining) / duration) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-zinc-900">
        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Rest timer</p>
        <p className="mt-2 text-6xl font-bold tabular-nums text-zinc-900 dark:text-white">
          {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <button
          onClick={onSkip}
          className="mt-6 rounded-xl bg-zinc-100 px-6 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

// ── Set Input Row ───────────────────────────────────────────────────────
function SetRow({
  setIndex,
  set,
  onUpdate,
  onRemove,
}: {
  setIndex: number;
  set: LoggedSet;
  onUpdate: (updates: Partial<LoggedSet>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 text-center text-xs font-semibold text-zinc-400">#{setIndex + 1}</span>
      <input
        type="number"
        min="1"
        max="100"
        value={set.reps}
        onChange={(e) => onUpdate({ reps: parseInt(e.target.value) || 0 })}
        className="w-16 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-center text-sm font-medium dark:border-zinc-700 dark:bg-zinc-800"
        placeholder="Reps"
      />
      <span className="text-xs text-zinc-400">reps</span>
      <input
        type="number"
        min="0"
        max="500"
        step="0.5"
        value={set.weightKg ?? ""}
        onChange={(e) => onUpdate({ weightKg: e.target.value ? parseFloat(e.target.value) : undefined })}
        className="w-16 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-center text-sm font-medium dark:border-zinc-700 dark:bg-zinc-800"
        placeholder="kg"
      />
      <span className="text-xs text-zinc-400">kg</span>
      <button
        onClick={() => onUpdate({ completed: !set.completed })}
        className={`ml-auto rounded-lg px-2 py-1 text-xs font-semibold transition ${
          set.completed
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
        }`}
      >
        {set.completed ? "✓ Done" : "Set"}
      </button>
      {setIndex > 0 && (
        <button onClick={onRemove} className="text-xs text-zinc-400 hover:text-red-500">
          ×
        </button>
      )}
    </div>
  );
}

// ── Exercise Card ───────────────────────────────────────────────────────
function ExerciseCard({
  item,
  itemIndex,
  logged,
  onLog,
  onStartRest,
  restSeconds,
}: {
  item: PlanItem;
  itemIndex: number;
  logged?: LoggedExercise;
  onLog: (exercise: LoggedExercise) => void;
  onStartRest: (seconds: number) => void;
  restSeconds: number;
}) {
  const [sets, setSets] = useState<LoggedSet[]>(
    logged?.sets ?? [
      { reps: 0, weightKg: undefined, completed: false },
      { reps: 0, weightKg: undefined, completed: false },
      { reps: 0, weightKg: undefined, completed: false },
    ]
  );
  const [notes, setNotes] = useState(logged?.notes ?? "");
  const [showVideo, setShowVideo] = useState(false);

  const updateSet = useCallback(
    (index: number, updates: Partial<LoggedSet>) => {
      setSets((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...updates };
        return next;
      });
    },
    []
  );

  const addSet = useCallback(() => {
    setSets((prev) => [
      ...prev,
      { reps: 0, weightKg: undefined, completed: false },
    ]);
  }, []);

  const removeSet = useCallback((index: number) => {
    setSets((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(() => {
    const exercise: LoggedExercise = {
      exerciseIndex: itemIndex,
      exerciseName: item.text.split(" — ")[0].split(" (")[0],
      target: item.text.match(/\(([^)]+)\)/)?.[1] ?? "",
      sets,
      notes: notes || undefined,
      timestamp: Date.now(),
    };
    onLog(exercise);
  }, [item, itemIndex, sets, notes, onLog]);

  const completedSets = sets.filter((s) => s.completed).length;
  const hasDemo = item.demo;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
            {item.text.split(" — ")[0]}
          </h4>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {item.text.split(" — ").slice(1).join(" — ")}
          </p>
        </div>
        {completedSets > 0 && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            {completedSets}/{sets.length}
          </span>
        )}
      </div>

      {hasDemo && (
        <>
          <button
            onClick={() => setShowVideo(true)}
            className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.6V8.4L15.8 12l-6.3 3.6z" />
            </svg>
            Watch
          </button>

          {showVideo && (
            <div
              className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
              onClick={() => setShowVideo(false)}
            >
              <div
                className="w-full max-w-lg overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <p className="text-sm font-bold text-white">{item.text.split(" — ")[0]}</p>
                  <button
                    onClick={() => setShowVideo(false)}
                    className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    ✕ Close
                  </button>
                </div>
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube.com/embed/${item.demo!.videoId}?autoplay=1&rel=0&playsinline=1`}
                    title={item.text.split(" — ")[0]}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                {item.demo!.note && (
                  <p className="px-4 py-3 text-xs text-zinc-300">{item.demo!.note}</p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-3 space-y-1.5">
        {sets.map((s, i) => (
          <SetRow
            key={i}
            setIndex={i}
            set={s}
            onUpdate={(u) => updateSet(i, u)}
            onRemove={() => removeSet(i)}
          />
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={addSet}
          className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
        >
          + Set
        </button>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes..."
          className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
        />
        <button
          onClick={() => {
            handleSave();
            hapticLight();
            onStartRest(restSeconds);
          }}
          className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500"
        >
          Save
        </button>
      </div>
    </div>
  );
}

// ── Main WorkoutLogger ──────────────────────────────────────────────────
export default function WorkoutLogger() {
  const [profile] = useLocalStorage<Profile>("lifeos-profile", DEFAULT_PROFILE);
  const [settings] = useLocalStorage<AppSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
  const today = new Date().toISOString().split("T")[0];
  const dayIndex = todayPlanIndex();
  const dayPlan = WEEK_PLAN[dayIndex];

  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
  const [showTimer, setShowTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(settings.restTimerDuration);
  const [saved, setSaved] = useState(false);

  // Load existing logs
  useEffect(() => {
    const existing = getLogsForDate(today);
    const todayLog = existing.find((l) => l.dayIndex === dayIndex);
    if (todayLog) {
      setLoggedExercises(todayLog.exercises);
    }
  }, [today, dayIndex]);

  const handleLogExercise = useCallback(
    (exercise: LoggedExercise) => {
      setLoggedExercises((prev) => {
        const existing = prev.findIndex(
          (e) => e.exerciseIndex === exercise.exerciseIndex
        );
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = exercise;
          return next;
        }
        return [...prev, exercise];
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    []
  );

  const handleSaveWorkout = useCallback(() => {
    const completedCount = loggedExercises.filter((e) =>
      e.sets.some((s) => s.completed)
    ).length;

    const log: WorkoutLog = {
      date: today,
      dayIndex,
      exercises: loggedExercises,
      durationMin: dayPlan.totalMin ?? 30,
      caloriesBurned:
        profile.weightKg
          ? estimateCaloriesBurn(dayPlan.items, profile.weightKg)
          : 0,
      completed: completedCount >= dayPlan.items.length * 0.7,
    };

    logWorkout(log);
    awardXP(
      log.completed ? "COMPLETE_WORKOUT" : "LOG_WORKOUT",
      `${dayPlan.day} workout (${log.completed ? "completed" : "partial"})`
    );
    hapticSuccess();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [loggedExercises, today, dayIndex, dayPlan, profile.weightKg]);

  return (
    <div className="space-y-4">
      {showTimer && (
        <RestTimer
          duration={timerDuration}
          onComplete={() => setShowTimer(false)}
          onSkip={() => setShowTimer(false)}
        />
      )}

      {/* Day header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            {dayPlan.day} — {dayPlan.title}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {dayPlan.items.length} exercises · ~{dayPlan.totalMin} min
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              ✓ Saved
            </span>
          )}
          <button
            onClick={handleSaveWorkout}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-500"
          >
            Finish
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{
            width: `${
              dayPlan.items.length > 0
                ? (loggedExercises.filter((e) => e.sets.some((s) => s.completed)).length /
                    dayPlan.items.length) *
                  100
                : 0
            }%`,
          }}
        />
      </div>

      {/* Exercise cards */}
      {dayPlan.items.map((item, i) => (
        <ExerciseCard
          key={i}
          item={item}
          itemIndex={i}
          logged={loggedExercises.find((e) => e.exerciseIndex === i)}
          onLog={handleLogExercise}
          restSeconds={settings.restTimerDuration}
          onStartRest={(seconds) => {
            setTimerDuration(seconds);
            setShowTimer(true);
          }}
        />
      ))}

      {/* Rest day */}
      {dayPlan.totalMin === 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-4xl">😴</p>
          <p className="mt-3 text-lg font-bold text-zinc-900 dark:text-white">Rest day</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Recovery is when muscles grow. Prioritize sleep and nutrition today.
          </p>
        </div>
      )}
    </div>
  );
}
