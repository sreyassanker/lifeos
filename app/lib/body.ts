// Body analysis — all measurements in cm (circumferences), formulas:
// - Body fat %: US Navy circumference method (DoD/CDC): neck, waist, height (+hip for women).
//   Accuracy ~±3% vs. DEXA — treat as a trend, not an absolute.
// - BMI: weight/height², with its known limitation callout (doesn't distinguish muscle/fat).
// - Shape: fashion/fitness conventions from bust/shoulder:waist:hip ratios — "tendency" labels.
// - WHR & waist-to-height: evidence-based cardiometabolic risk markers.
//   WHO 2008 consultation: WHR ≥0.90 (men) / ≥0.85 (women) = increased risk.
//   Waist circumference: ≥94 cm (men) / ≥80 cm (women) = increased risk;
//   ≥102 cm (men) / ≥88 cm (women) = substantially increased risk.
// - Somatotype: informal frame tendency from wrist/ankle — NOT fixed biology (NASM, PMC12882503).
// - Projection: fat-free mass preserved; ACSM fat loss 0.5–1% body weight/week.
// - Mobile AI body composition (Poltronieri et al. 2026): emerging methods using
//   smartphone cameras may improve accessibility of body composition tracking.

import type { Goal } from "@/app/lib/macros";

export interface Measurements {
  neckCm: number; // circumference
  shoulderCm: number; // linear width (biacromial distance, between the shoulder bones)
  chestCm: number; // chest / bust circumference
  waistCm: number; // circumference at the navel
  hipCm: number; // circumference at the widest point
  wristCm?: number; // circumference
  ankleCm?: number; // circumference
  thighCm?: number; // circumference
  calfCm?: number; // circumference
  kneeCm?: number; // circumference
  upperArmCm?: number; // circumference
  forearmCm?: number; // circumference
}

export type BodyShapeId =
  | "hourglass"
  | "pear"
  | "inverted_triangle"
  | "apple"
  | "rectangle"
  | "v_taper"
  | "oval";

export interface BodyShapeResult {
  id: BodyShapeId;
  label: string;
  description: string;
}

const SHAPE_INFO: Record<BodyShapeId, { label: string; description: string }> = {
  hourglass: {
    label: "Hourglass",
    description:
      "Bust and hips are similar in size with a clearly narrower waist. A common 'classic' silhouette — every shape is healthy at a healthy body fat.",
  },
  pear: {
    label: "Pear (triangle)",
    description:
      "Hips are wider than the shoulders/bust. Fat tends to store lower-body-first; this shape is associated with lower cardiometabolic risk than waist-dominant shapes.",
  },
  inverted_triangle: {
    label: "Inverted triangle",
    description:
      "Shoulders/bust are wider than the hips. Common in swimmers and trained upper bodies — a strength-friendly frame.",
  },
  apple: {
    label: "Apple (oval)",
    description:
      "The waist is the widest point relative to bust and hips. Fat stores centrally — the shape where waist circumference matters most for health.",
  },
  rectangle: {
    label: "Rectangle",
    description:
      "Shoulders, waist, and hips are roughly similar in width — a straight-line silhouette. Responds well to building shoulders/back for a V-taper.",
  },
  v_taper: {
    label: "V-taper",
    description:
      "Shoulders are clearly wider than the waist — the classic athletic 'V' silhouette many strength goals target.",
  },
  oval: {
    label: "Oval",
    description:
      "The waist is the widest point. Central fat distribution is the one that matters most for metabolic health — waist-to-height is the key number here.",
  },
};

export function bodyShape(m: Measurements, sex: "male" | "female"): BodyShapeResult {
  if (sex === "female") {
    const wb = m.waistCm / m.chestCm;
    const hb = m.hipCm / m.chestCm;
    if (wb >= 0.75) return { id: "apple", ...SHAPE_INFO.apple };
    if (hb >= 1.05) return { id: "pear", ...SHAPE_INFO.pear };
    if (hb <= 0.95) return { id: "inverted_triangle", ...SHAPE_INFO.inverted_triangle };
    if (wb <= 0.75) return { id: "hourglass", ...SHAPE_INFO.hourglass };
    return { id: "rectangle", ...SHAPE_INFO.rectangle };
  }
  const sw = m.shoulderCm / m.waistCm;
  const wh = m.waistCm / m.hipCm;
  if (sw <= 1.15 || wh >= 0.95) return { id: "oval", ...SHAPE_INFO.oval };
  if (sw >= 1.22) return { id: "v_taper", ...SHAPE_INFO.v_taper };
  return { id: "rectangle", ...SHAPE_INFO.rectangle };
}

/** US Navy body-fat formula. Returns percentage (e.g. 18.4). Null when inputs are invalid. */
export function bodyFatNavy(m: Measurements, sex: "male" | "female", heightCm: number): number | null {
  const { neckCm, waistCm, hipCm } = m;
  if (neckCm <= 0 || waistCm <= 0 || heightCm <= 0) return null;
  if (sex === "male") {
    const diff = waistCm - neckCm;
    if (diff <= 0) return null;
    return 495 / (1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(heightCm)) - 450;
  }
  const diff = waistCm + hipCm - neckCm;
  if (diff <= 0) return null;
  return 495 / (1.29579 - 0.35004 * Math.log10(diff) + 0.221 * Math.log10(heightCm)) - 450;
}

export function bmi(weightKg: number, heightCm: number): number | null {
  if (weightKg <= 0 || heightCm <= 0) return null;
  const h = heightCm / 100;
  return weightKg / (h * h);
}

export function bmiCategory(bmiValue: number): { label: string; tone: "ok" | "warn" | "bad" } {
  if (bmiValue < 18.5) return { label: "Underweight", tone: "warn" };
  if (bmiValue < 25) return { label: "Healthy range", tone: "ok" };
  if (bmiValue < 30) return { label: "Overweight", tone: "warn" };
  return { label: "Obese", tone: "bad" };
}

// ACE body-fat ranges (%). Fitness industry convention, useful as a trend target.
export function bodyFatCategory(bf: number, sex: "male" | "female"): string {
  if (sex === "male") {
    if (bf < 6) return "Essential fat";
    if (bf < 14) return "Athletes";
    if (bf < 18) return "Fitness";
    if (bf < 25) return "Average";
    return "Above average";
  }
  if (bf < 14) return "Essential fat";
  if (bf < 21) return "Athletes";
  if (bf < 25) return "Fitness";
  if (bf < 32) return "Average";
  return "Above average";
}

/** WHO waist-to-hip thresholds: ≥0.90 (men) / ≥0.85 (women) = increased cardiometabolic risk. */
export function waistToHip(m: Measurements): number {
  return m.waistCm / m.hipCm;
}

export function waistToHipRisk(m: Measurements, sex: "male" | "female"): {
  value: number;
  label: string;
  ok: boolean;
} {
  const value = waistToHip(m);
  const threshold = sex === "male" ? 0.9 : 0.85;
  return {
    value,
    label: value < threshold ? "Below WHO risk threshold" : "Above WHO risk threshold",
    ok: value < threshold,
  };
}

/** Ashwell: keep waist < half your height. */
export function waistToHeight(m: Measurements, heightCm: number): { value: number; ok: boolean; label: string } {
  const value = m.waistCm / heightCm;
  return {
    value,
    ok: value < 0.5,
    label: value < 0.5 ? "Under the 0.5 target — great" : "Above the 0.5 target (waist < half height)",
  };
}

/**
 * Informal somatotype *tendency* from wrist/ankle frame (Heath-Carter needs callipers —
 * this is a rough heuristic and NOT fixed biology). Null if wrist/ankle not provided.
 */
export function somatotypeTendency(m: Measurements, heightCm: number): { label: string; note: string } | null {
  if (!m.wristCm || !m.ankleCm || heightCm <= 0) return null;
  const frame = (m.wristCm + m.ankleCm) / heightCm;
  if (frame < 0.205)
    return {
      label: "Ectomorph tendency",
      note: "Slender frame, narrow joints. Gains come slowly but are very achievable with a calorie surplus and progressive overload.",
    };
  if (frame > 0.245)
    return {
      label: "Endomorph tendency",
      note: "Broader frame, gains size easily but fat comes along too. Prioritize protein and a slight deficit when leaning out.",
    };
  return {
    label: "Mesomorph tendency",
    note: "Athletic, medium frame — responds well to both building and leaning out. (These are tendencies, not fixed biology.)",
  };
}

// ---- Goal projection ------------------------------------------------------

/** Target weight that preserves fat-free mass at the target body fat %. */
export function targetWeightFor(weightKg: number, bodyFatPct: number, targetBodyFatPct: number): number {
  const ffm = weightKg * (1 - bodyFatPct / 100);
  return ffm / (1 - targetBodyFatPct / 100);
}

/** Sustainable weekly rate: ACSM 0.5–1% body weight/week for fat loss; ~0.25–0.5 kg/wk lean gains. */
export function weeklyRateKg(goal: Goal, weightKg: number): number {
  switch (goal) {
    case "cut":
      return weightKg * 0.007;
    case "lean_bulk":
      return 0.15;
    case "bulk":
      return 0.25;
    default:
      return 0;
  }
}

export function weeksToReach(currentKg: number, targetKg: number, weeklyKg: number): number | null {
  const delta = currentKg - targetKg;
  if (Math.abs(weeklyKg) < 0.001 || Math.sign(delta) !== Math.sign(weeklyKg)) return null;
  return Math.ceil(Math.abs(delta) / Math.abs(weeklyKg));
}

export function formatWeeks(weeks: number): string {
  if (weeks <= 0) return "now";
  if (weeks < 9) return `${weeks} week${weeks > 1 ? "s" : ""}`;
  const months = Math.round((weeks / 4.33) * 10) / 10;
  return `≈ ${months} month${months > 1 ? "s" : ""}`;
}

// ---- Units ----------------------------------------------------------------

export const CM_PER_INCH = 2.54;
