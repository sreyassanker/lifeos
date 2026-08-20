"use client";

import { useEffect, useState } from "react";

interface Props {
  onFinish: () => void;
}

export default function LaunchSplash({ onFinish }: Props) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const closeTimer = setTimeout(() => setClosing(true), 1800);
    const doneTimer = setTimeout(onFinish, 2400);
    return () => {
      clearTimeout(closeTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 transition-opacity duration-600 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Ambient drifting glows */}
      <div className="splash-drift pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
      <div className="splash-drift-rev pointer-events-none absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-teal-300/30 blur-3xl" />

      <div className="relative flex flex-col items-center">
        {/* Logo mark with expanding ring */}
        <div className="relative">
          <div className="splash-ring absolute -inset-3 rounded-[30px] border-2 border-white/40" />
          <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-[30px] bg-white/95 shadow-2xl shadow-emerald-900/40">
            <img src="/icon.svg?v=2" alt="LifeOS" className="absolute h-[100px] w-[100px] max-w-none" />
          </div>
        </div>

        {/* Wordmark */}
        <div className="splash-fade-up mt-8 text-4xl font-extrabold tracking-tight text-white">
          Life<span className="text-white/80">OS</span>
        </div>
        <p className="splash-fade-up-2 mt-2 text-sm font-medium text-white/80">
          Sleep · Fitness · Nutrition
        </p>

        {/* Loading bar */}
        <div className="mt-10 h-1 w-44 overflow-hidden rounded-full bg-white/25">
          <div className="splash-bar h-full w-full rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}