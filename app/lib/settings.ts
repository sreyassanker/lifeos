// App-level settings, persisted under one key and consumed by every tab
// that needs them (units, rest timer, dark mode, notifications).

export type UnitSystem = "metric" | "imperial";

export interface AppSettings {
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

export const DEFAULT_SETTINGS: AppSettings = {
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

export const SETTINGS_STORAGE_KEY = "lifeos-settings";

/** Applies the effective theme to <html> and follows live system changes when set to "system". */
export function applyTheme(mode: AppSettings["darkMode"]): () => void {
  const root = document.documentElement;
  const mq = window.matchMedia("(prefers-color-scheme: dark)");

  const apply = () => {
    if (mode === "dark") {
      root.classList.add("dark");
    } else if (mode === "light") {
      root.classList.remove("dark");
    } else {
      root.classList.toggle("dark", mq.matches);
    }
  };

  apply();
  if (mode !== "system") return () => {};
  mq.addEventListener("change", apply);
  return () => mq.removeEventListener("change", apply);
}