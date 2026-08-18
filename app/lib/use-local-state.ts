"use client";

import { useCallback, useSyncExternalStore } from "react";

const cache = new Map<string, unknown>();
const listenersByKey = new Map<string, Set<() => void>>();

function getListeners(key: string): Set<() => void> {
  let set = listenersByKey.get(key);
  if (!set) {
    set = new Set();
    listenersByKey.set(key, set);
  }
  return set;
}

function read<T>(key: string, initial: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  let value: T = initial;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) value = JSON.parse(raw) as T;
  } catch {
    // ignore corrupted storage
  }
  cache.set(key, value);
  return value;
}

function write<T>(key: string, value: T): void {
  cache.set(key, value);
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable
  }
}

/** useState that persists to localStorage (JSON), hydration-safe via useSyncExternalStore. */
export function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const listeners = getListeners(key);
      listeners.add(onChange);
      return () => {
        listeners.delete(onChange);
      };
    },
    [key]
  );

  const getSnapshot = useCallback(() => read(key, initial), [key, initial]);

  const value = useSyncExternalStore(subscribe, getSnapshot, () => initial);

  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      const prev = read(key, initial);
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      write(key, next);
      getListeners(key).forEach((listener) => listener());
    },
    [key, initial]
  );

  return [value, set];
}
