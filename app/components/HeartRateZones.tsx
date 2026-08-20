"use client";

import { useState, useMemo } from "react";
import {
  computeHRZones,
  estimatedMaxHR,
  estimatedVO2max,
  vo2maxCategory,
  zoneDistributionRecommendation,
  recoveryHRAssessment,
  type HRZone,
} from "@/app/lib/heart-rate";
import { useLocalStorage } from "@/app/lib/use-local-state";
import { DEFAULT_PROFILE, type Profile } from "@/app/lib/macros";

export default function HeartRateZones() {
  const [profile] = useLocalStorage<Profile>("lifeos-profile", DEFAULT_PROFILE);
  const [restingHR, setRestingHR] = useState(65);
  const [customMaxHR, setCustomMaxHR] = useState<number | undefined>(undefined);
  const [recoveryDrop, setRecoveryDrop] = useState(15);

  const maxHR = customMaxHR ?? estimatedMaxHR(profile.age);
  const zones = useMemo(
    () => computeHRZones({ age: profile.age, restingHR, maxHR: customMaxHR }),
    [profile.age, restingHR, customMaxHR]
  );
  const vo2max = estimatedVO2max(maxHR, restingHR);
  const vo2Category = vo2maxCategory(vo2max, profile.age, profile.sex);
  const distribution = zoneDistributionRecommendation();
  const recovery = recoveryHRAssessment(recoveryDrop);

  return (
    <div className="space-y-4">
      {/* Inputs */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">
          ❤️ Heart Rate Zones
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Based on the Karvonen formula (ACSM Guidelines, Paper #22)
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Resting HR (bpm)
            </label>
            <input
              type="number"
              min="40"
              max="120"
              value={restingHR}
              onChange={(e) => setRestingHR(parseInt(e.target.value) || 65)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Max HR (bpm)
            </label>
            <input
              type="number"
              min="120"
              max="220"
              value={customMaxHR ?? ""}
              placeholder={String(maxHR)}
              onChange={(e) =>
                setCustomMaxHR(e.target.value ? parseInt(e.target.value) : undefined)
              }
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium dark:border-zinc-700 dark:bg-zinc-800"
            />
            <p className="mt-0.5 text-[10px] text-zinc-400">
              Default: {estimatedMaxHR(profile.age)} (Tanaka: 208 − 0.7 × age)
            </p>
          </div>
        </div>
      </div>

      {/* VO2max */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Estimated VO₂max
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Uth estimation: 15.3 × (HRmax / HRrest)
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {vo2max}
            </p>
            <p className="text-xs text-zinc-500">ml/kg/min</p>
          </div>
        </div>
        <div className="mt-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {vo2Category.category}
            </span>
            <span className="text-xs text-zinc-500">{vo2Category.percentile}</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {vo2Category.note}
          </p>
        </div>
      </div>

      {/* Zone chart */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Training Zones</h4>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Target HR = ((HRmax − HRrest) × %intensity) + HRrest
        </p>

        <div className="mt-4 space-y-2">
          {zones.map((z) => (
            <ZoneRow key={z.zone} zone={z} maxBPM={maxHR} />
          ))}
        </div>
      </div>

      {/* Polarized distribution */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
          📊 Recommended Distribution
        </h4>
        <div className="mt-3 flex h-4 overflow-hidden rounded-full">
          <div className="bg-emerald-500" style={{ width: `${distribution.zone1_2}%` }} />
          <div className="bg-blue-500" style={{ width: `${distribution.zone1_2}%` }} />
          <div className="bg-amber-500" style={{ width: "0%" }} />
          <div className="bg-orange-500" style={{ width: `${distribution.zone4_5 / 2}%` }} />
          <div className="bg-red-500" style={{ width: `${distribution.zone4_5 / 2}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-semibold text-zinc-500">
          <span>Z1-2: 80%</span>
          <span>Z3: 0%</span>
          <span>Z4-5: 20%</span>
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {distribution.note}
        </p>
      </div>

      {/* Recovery HR test */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
          🔄 Recovery HR Test
        </h4>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Measure how much your HR drops in the first minute after exercise
        </p>
        <div className="mt-3 flex items-center gap-3">
          <label className="text-xs text-zinc-600 dark:text-zinc-400">HR drop (bpm):</label>
          <input
            type="number"
            min="0"
            max="60"
            value={recoveryDrop}
            onChange={(e) => setRecoveryDrop(parseInt(e.target.value) || 0)}
            className="w-20 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-center text-sm font-medium dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>
        <div className="mt-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {recovery.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{recovery.note}</p>
        </div>
      </div>
    </div>
  );
}

function ZoneRow({ zone, maxBPM }: { zone: HRZone; maxBPM: number }) {
  const width = ((zone.intensityRange[1] - zone.intensityRange[0]) / 100) * 100;
  const offset = (zone.intensityRange[0] / 100) * 100;

  return (
    <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: zone.color }}
          />
          <span className="text-sm font-bold text-zinc-900 dark:text-white">
            Zone {zone.zone}: {zone.nameShort}
          </span>
        </div>
        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
          {zone.bpmRange[0]}–{zone.bpmRange[1]} bpm
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className="h-full rounded-full"
          style={{
            backgroundColor: zone.color,
            width: `${width}%`,
            marginLeft: `${offset}%`,
          }}
        />
      </div>
      <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400">
        {zone.benefit}
      </p>
    </div>
  );
}
