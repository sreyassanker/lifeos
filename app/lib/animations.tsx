"use client";

import { useState, useEffect, useRef } from "react";

/* ── Animated number counter ────────────────────────────────────── */
export function AnimatedNumber({ value, duration = 800, suffix = "" }: { value: number; duration?: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = ref.current;
    const diff = value - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(start + diff * eased);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(step);
      else ref.current = value;
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return <>{display}{suffix}</>;
}

/* ── Animated decimal number ────────────────────────────────────── */
export function AnimatedDecimal({ value, decimals = 1, duration = 800 }: { value: number; decimals?: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = ref.current;
    const diff = value - start;
    if (Math.abs(diff) < 0.001) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * eased;
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(step);
      else ref.current = value;
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return <>{display.toFixed(decimals)}</>;
}

/* ── Stagger fade-in wrapper ───────────────────────────────────── */
export function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      {children}
    </div>
  );
}

/* ── Animated progress bar ─────────────────────────────────────── */
export function AnimatedBar({ value, max = 100, color = "bg-emerald-500", height = "h-2", delay = 0 }: { value: number; max?: number; color?: string; height?: string; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setWidth(Math.min((value / max) * 100, 100)), delay);
    return () => clearTimeout(timer);
  }, [value, max, delay]);
  return (
    <div className={`w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700 ${height}`}>
      <div
        className={`h-full rounded-full ${color}`}
        style={{
          width: `${width}%`,
          transition: "width 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </div>
  );
}

/* ── Tap-feedback wrapper ──────────────────────────────────────── */
export function TapButton({ children, className = "", onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      {...props}
      onClick={onClick}
      className={`${className} transition-transform duration-100 ${pressed ? "scale-95" : "scale-100"}`}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      {children}
    </button>
  );
}

/* ── Toast notification ────────────────────────────────────────── */
export function showToast(message: string, type: "success" | "info" | "warning" = "success") {
  if (typeof document === "undefined") return;
  const colors = {
    success: "bg-emerald-600",
    info: "bg-sky-600",
    warning: "bg-amber-600",
  };
  const icons = { success: "✓", info: "ℹ", warning: "⚠" };
  const toast = document.createElement("div");
  toast.className = `fixed bottom-6 left-1/2 z-[9999] flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-2xl ${colors[type]}`;
  toast.style.cssText = "transform: translateX(-50%) translateY(20px); opacity: 0; transition: all 0.3s ease;";
  toast.innerHTML = `<span>${icons[type]}</span> ${message}`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.transform = "translateX(-50%) translateY(0)";
    toast.style.opacity = "1";
  });
  setTimeout(() => {
    toast.style.transform = "translateX(-50%) translateY(20px)";
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
