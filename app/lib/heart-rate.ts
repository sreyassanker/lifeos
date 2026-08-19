// Heart rate zone calculator — Karvonen formula + VO2max estimation.
//
// Source: ACSM's Guidelines for Exercise Testing and Prescription (Paper #22).
// Target Heart Rate (THR) = ((HRmax − HRrest) × %intensity) + HRrest
// HRmax (Tanaka) = 208 − 0.7 × age
// VO2max (Uth estimation) = 15.3 × (HRmax / HRrest)
//
// 5 training zones (Seiler model):
//   Zone 1: Recovery (50–60% HRR)
//   Zone 2: Aerobic base (60–70% HRR) — "easy" pace
//   Zone 3: Tempo (70–80% HRR) — "comfortably hard"
//   Zone 4: Threshold (80–90% HRR) — "hard"
//   Zone 5: VO2max (90–100% HRR) — "max effort"

export interface HRZone {
  zone: number;
  name: string;
  nameShort: string;
  intensityRange: [number, number]; // % of Heart Rate Reserve
  bpmRange: [number, number];       // actual BPM range
  description: string;
  benefit: string;
  color: string;
}

export interface HRProfile {
  age: number;
  restingHR: number;
  maxHR?: number; // optional override
}

export const HR_ZONES: Omit<HRZone, "bpmRange">[] = [
  {
    zone: 1,
    name: "Recovery / Warm-up",
    nameShort: "Recovery",
    intensityRange: [50, 60],
    description: "Light effort. Can hold a full conversation easily.",
    benefit: "Active recovery, blood flow, fat oxidation",
    color: "#22c55e", // green
  },
  {
    zone: 2,
    name: "Aerobic Base",
    nameShort: "Aerobic",
    intensityRange: [60, 70],
    description: "Easy pace. Can speak in short sentences.",
    benefit: "Endurance building, mitochondrial density, fat burning",
    color: "#3b82f6", // blue
  },
  {
    zone: 3,
    name: "Tempo",
    nameShort: "Tempo",
    intensityRange: [70, 80],
    description: "Comfortably hard. Can say a few words only.",
    benefit: "Lactate threshold improvement, cardiovascular efficiency",
    color: "#f59e0b", // amber
  },
  {
    zone: 4,
    name: "Threshold",
    nameShort: "Threshold",
    intensityRange: [80, 90],
    description: "Hard effort. Can barely speak.",
    benefit: "Lactate clearance, race pace training, anaerobic capacity",
    color: "#f97316", // orange
  },
  {
    zone: 5,
    name: "VO₂max / Anaerobic",
    nameShort: "VO₂max",
    intensityRange: [90, 100],
    description: "Maximum effort. Cannot speak.",
    benefit: "VO₂max improvement, speed, neuromuscular power",
    color: "#ef4444", // red
  },
];

// ── Max HR estimation (Tanaka formula) ──────────────────────────────────
// HRmax = 208 − 0.7 × age
// Validated for ages 7–79 (Tanaka et al., 2001).
export function estimatedMaxHR(age: number): number {
  return Math.round(208 - 0.7 * age);
}

// ── Heart Rate Reserve (Karvonen) ───────────────────────────────────────
// HRR = HRmax − HRrest
export function heartRateReserve(maxHR: number, restingHR: number): number {
  return maxHR - restingHR;
}

// ── Target HR for a given zone ──────────────────────────────────────────
// THR = (HRR × %intensity) + HRrest
export function targetHR(
  maxHR: number,
  restingHR: number,
  intensityPercent: number
): number {
  const hrr = heartRateReserve(maxHR, restingHR);
  return Math.round(hrr * (intensityPercent / 100) + restingHR);
}

// ── Compute all 5 zones ────────────────────────────────────────────────
export function computeHRZones(profile: HRProfile): HRZone[] {
  const maxHR = profile.maxHR ?? estimatedMaxHR(profile.age);
  const restingHR = profile.restingHR;
  
  return HR_ZONES.map((z) => ({
    ...z,
    bpmRange: [
      targetHR(maxHR, restingHR, z.intensityRange[0]),
      targetHR(maxHR, restingHR, z.intensityRange[1]),
    ] as [number, number],
  }));
}

// ── VO2max estimation (Uth estimation) ──────────────────────────────────
// VO2max ≈ 15.3 × (HRmax / HRrest)
// Validated against cycle ergometry (Uth et al., 2004).
export function estimatedVO2max(maxHR: number, restingHR: number): number {
  if (restingHR <= 0) return 0;
  return Math.round(15.3 * (maxHR / restingHR) * 10) / 10;
}

// ── VO2max fitness category ────────────────────────────────────────────
export function vo2maxCategory(vo2max: number, age: number, sex: "male" | "female"): {
  category: string;
  percentile: string;
  note: string;
} {
  // Simplified categories based on ACSM norms
  // These are rough — actual norms vary by age group
  if (sex === "male") {
    if (vo2max >= 51) return { category: "Superior", percentile: "Top 20%", note: "Excellent cardiovascular fitness." };
    if (vo2max >= 44) return { category: "Good", percentile: "Top 40%", note: "Above average fitness." };
    if (vo2max >= 35) return { category: "Fair", percentile: "Middle 40%", note: "Average fitness — room to improve." };
    return { category: "Poor", percentile: "Bottom 20%", note: "Focus on consistent aerobic training." };
  } else {
    if (vo2max >= 44) return { category: "Superior", percentile: "Top 20%", note: "Excellent cardiovascular fitness." };
    if (vo2max >= 37) return { category: "Good", percentile: "Top 40%", note: "Above average fitness." };
    if (vo2max >= 30) return { category: "Fair", percentile: "Middle 40%", note: "Average fitness — room to improve." };
    return { category: "Poor", percentile: "Bottom 20%", note: "Focus on consistent aerobic training." };
  }
}

// ── Zone distribution recommendation ────────────────────────────────────
// Seiler's 80/20 polarized model: ~80% Zone 1-2, ~20% Zone 4-5
export function zoneDistributionRecommendation(): {
  zone1_2: number; // % of total time
  zone3: number;
  zone4_5: number;
  note: string;
} {
  return {
    zone1_2: 80,
    zone3: 0,
    zone4_5: 20,
    note: "The 80/20 polarized model (Seiler, 2010) — 80% easy, 20% hard — outperforms threshold training for endurance gains.",
  };
}

// ── Recovery HR (1-minute test) ─────────────────────────────────────────
// A simple recovery indicator: if HR drops >12 bpm in first minute post-exercise,
// recovery is normal. <12 bpm may indicate overtraining or poor fitness.
export function recoveryHRAssessment(hrDropIn1Min: number): {
  status: string;
  note: string;
} {
  if (hrDropIn1Min >= 20) {
    return { status: "Excellent", note: "Strong recovery — heart is well-conditioned." };
  }
  if (hrDropIn1Min >= 12) {
    return { status: "Normal", note: "Adequate recovery. Consistent training will improve this." };
  }
  if (hrDropIn1Min >= 6) {
    return { status: "Below average", note: "Consider more Zone 2 cardio to improve cardiac recovery." };
  }
  return { status: "Poor", note: "Very slow recovery. Check sleep, stress, and overtraining risk." };
}
