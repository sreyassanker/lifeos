"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "@/app/lib/use-local-state";
import type { Profile } from "@/app/lib/macros";
import { hapticLight, hapticMedium, hapticSuccess } from "@/app/lib/haptics";
import { requestNotificationPermission, scheduleReminders, cancelAllReminders } from "@/app/lib/notifications";

type UnitSystem = "metric" | "imperial";

interface AppSettings {
  units: UnitSystem;
  darkMode: "system" | "light" | "dark";
  notifications: {
    water: boolean;
    workout: boolean;
    sleep: boolean;
    meal: boolean;
  };
  restTimerDuration: number; // seconds
}

const DEFAULT_SETTINGS: AppSettings = {
  units: "metric",
  darkMode: "system",
  notifications: {
    water: true,
    workout: true,
    sleep: true,
    meal: false,
  },
  restTimerDuration: 90,
};

export default function SettingsTab() {
  const [profile, setProfile] = useLocalStorage<Profile>("lifeos-profile", {} as Profile);
  const [settings, setSettings] = useLocalStorage<AppSettings>(
    "lifeos-settings",
    DEFAULT_SETTINGS
  );
  const [showReset, setShowReset] = useState(false);

  // Apply dark mode
  useEffect(() => {
    const root = document.documentElement;
    if (settings.darkMode === "dark") {
      root.classList.add("dark");
    } else if (settings.darkMode === "light") {
      root.classList.remove("dark");
    } else {
      // system
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  }, [settings.darkMode]);

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateNotification = useCallback(
    async (key: keyof AppSettings["notifications"], value: boolean) => {
      setSettings((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, [key]: value },
      }));
      await hapticLight();
      // Re-schedule notifications with updated settings
      const newSettings = { ...settings, notifications: { ...settings.notifications, [key]: value } };
      if (value) {
        const granted = await requestNotificationPermission();
        if (granted) {
          await scheduleReminders(newSettings.notifications);
        }
      } else {
        await cancelAllReminders();
        // Re-schedule remaining enabled ones
        const remaining = Object.entries(newSettings.notifications).filter(([, v]) => v);
        if (remaining.length > 0) {
          await scheduleReminders(newSettings.notifications);
        }
      }
    },
    [settings, setSettings]
  );

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const exportData = () => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("lifeos-")) {
        data[key] = JSON.parse(localStorage.getItem(key) ?? "null");
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifeos-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          for (const [key, value] of Object.entries(data)) {
            localStorage.setItem(key, JSON.stringify(value));
          }
          window.location.reload();
        } catch {
          alert("Invalid backup file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Compute data size
  const dataSize = (() => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("lifeos-")) {
        total += (localStorage.getItem(key)?.length ?? 0) * 2; // UTF-16
      }
    }
    return total;
  })();

  return (
    <div className="space-y-4">
      {/* Profile summary */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">👤 Profile</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-zinc-500">Sex:</span>{" "}
            <span className="font-medium text-zinc-900 dark:text-white capitalize">{profile.sex}</span>
          </div>
          <div>
            <span className="text-zinc-500">Age:</span>{" "}
            <span className="font-medium text-zinc-900 dark:text-white">{profile.age}</span>
          </div>
          <div>
            <span className="text-zinc-500">Weight:</span>{" "}
            <span className="font-medium text-zinc-900 dark:text-white">{profile.weightKg} kg</span>
          </div>
          <div>
            <span className="text-zinc-500">Height:</span>{" "}
            <span className="font-medium text-zinc-900 dark:text-white">{profile.heightCm} cm</span>
          </div>
          <div>
            <span className="text-zinc-500">Goal:</span>{" "}
            <span className="font-medium text-zinc-900 dark:text-white capitalize">{profile.goal?.replace("_", " ")}</span>
          </div>
          <div>
            <span className="text-zinc-500">Diet:</span>{" "}
            <span className="font-medium text-zinc-900 dark:text-white capitalize">{profile.diet}</span>
          </div>
        </div>
      </div>

      {/* Units */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">📏 Units</h3>
        <div className="mt-3 flex gap-2">
          {(["metric", "imperial"] as UnitSystem[]).map((u) => (
            <button
              key={u}
              onClick={() => updateSetting("units", u)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                settings.units === u
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {u === "metric" ? "Metric (kg/cm)" : "Imperial (lb/in)"}
            </button>
          ))}
        </div>
      </div>

      {/* Dark mode */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">🎨 Appearance</h3>
        <div className="mt-3 flex gap-2">
          {(["system", "light", "dark"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => updateSetting("darkMode", mode)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                settings.darkMode === mode
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {mode === "system" ? "System" : mode === "light" ? "☀️ Light" : "🌙 Dark"}
            </button>
          ))}
        </div>
      </div>

      {/* Rest timer */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">⏱️ Rest Timer</h3>
        <div className="mt-3 flex gap-2">
          {[60, 90, 120, 180].map((s) => (
            <button
              key={s}
              onClick={() => updateSetting("restTimerDuration", s)}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                settings.restTimerDuration === s
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {s}s
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">🔔 Reminders</h3>
        <div className="mt-3 space-y-3">
          {([
            { key: "water" as const, label: "Water intake reminders", emoji: "💧" },
            { key: "workout" as const, label: "Workout time reminders", emoji: "💪" },
            { key: "sleep" as const, label: "Bedtime reminders", emoji: "😴" },
            { key: "meal" as const, label: "Meal logging reminders", emoji: "🍽️" },
          ]).map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {item.emoji} {item.label}
              </span>
              <button
                onClick={() => updateNotification(item.key, !settings.notifications[item.key])}
                className={`relative h-6 w-11 rounded-full transition ${
                  settings.notifications[item.key]
                    ? "bg-emerald-500"
                    : "bg-zinc-300 dark:bg-zinc-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    settings.notifications[item.key] ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data management */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">💾 Data</h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Size: {(dataSize / 1024).toFixed(1)} KB
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={exportData}
            className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
          >
            Export JSON
          </button>
          <button
            onClick={importData}
            className="flex-1 rounded-xl bg-zinc-100 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Import JSON
          </button>
        </div>
        <button
          onClick={() => { setShowReset(true); hapticMedium(); }}
          className="mt-3 w-full rounded-xl bg-red-50 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
        >
          Reset all data
        </button>
      </div>

      {/* Reset confirmation */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Reset all data?
            </h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              This will permanently delete all your LifeOS data including profile, logs, and settings.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { setShowReset(false); hapticLight(); }}
                className="flex-1 rounded-xl bg-zinc-100 py-2.5 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={() => { handleReset(); hapticSuccess(); }}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
