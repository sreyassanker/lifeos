"use client";

import { useRef } from "react";
import { showToast } from "@/app/lib/animations";
import { TapButton } from "@/app/lib/animations";

const STORAGE_PREFIX = "lifeos-";

function getAllData(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      try {
        data[key] = JSON.parse(localStorage.getItem(key) ?? "null");
      } catch {
        data[key] = localStorage.getItem(key);
      }
    }
  }
  return data;
}

function setAllData(data: Record<string, unknown>) {
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith(STORAGE_PREFIX)) {
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    }
  }
}

function getDataSize(): string {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      total += (localStorage.getItem(key) ?? "").length;
    }
  }
  if (total < 1024) return `${total} B`;
  if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`;
  return `${(total / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DataManager() {
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const data = getAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifeos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Backup downloaded!", "success");
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(String(ev.target?.result));
        if (typeof data !== "object" || data === null) throw new Error("Invalid format");
        // Confirm before overwriting
        const keys = Object.keys(data).filter((k) => k.startsWith(STORAGE_PREFIX));
        if (keys.length === 0) {
          showToast("No LifeOS data found in file", "warning");
          return;
        }
        setAllData(data);
        showToast(`Restored ${keys.length} settings! Reloading...`, "success");
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        showToast("Invalid backup file", "warning");
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-selected
    if (fileRef.current) fileRef.current.value = "";
  };

  const clearAll = () => {
    if (!confirm("Are you sure? This will delete ALL your LifeOS data. Make a backup first.")) return;
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) keys.push(key);
    }
    keys.forEach((k) => localStorage.removeItem(k));
    showToast("All data cleared. Reloading...", "info");
    setTimeout(() => window.location.reload(), 1500);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
        <span className="text-emerald-600 dark:text-emerald-400">💾</span>
        Data backup
      </h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Your data lives in your browser. Export a backup to keep it safe.
      </p>
      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
        Current size: {getDataSize()}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <TapButton
          onClick={exportData}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-500"
        >
          📥 Export backup
        </TapButton>
        <TapButton
          onClick={() => fileRef.current?.click()}
          className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          📤 Import backup
        </TapButton>
        <TapButton
          onClick={clearAll}
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
        >
          🗑️ Clear all data
        </TapButton>
      </div>
      <input ref={fileRef} type="file" accept=".json" onChange={importData} className="hidden" />
    </div>
  );
}
