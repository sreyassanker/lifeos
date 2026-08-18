"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { ClothingPartId, Measurements } from "@/app/lib/body";
import type { Sex } from "@/app/lib/macros";

// Fixed appearance: body skin and a sporty outfit (no user-configurable
// skin-tone or clothing-color pickers).
const SKIN_TONE = "#d9a07a";
const OUTFIT_COLORS: Record<ClothingPartId, string> = {
  shirt: "#2563eb", // blue
  pants: "#1e293b", // slate
  shoes: "#dc2626", // red
};

// ── Realistic body from measurements ──────────────────────────────────────
// The avatar is a 19k-vertex MakeHuman base mesh (CC0, makehumancommunity/
// makehuman) deformed by MakeHuman's own measurement morph targets (CC0).
// Two sex-specific bases ship with the app — body-male.json and body-female.json
// (built by scripts/build-body-assets.mjs) — so Male/Female profiles get the
// right overall shape. Each measurement the user enters is converted to a morph
// weight (0 = the asset's default value, -1 = fully shrunk, +1 = fully grown)
// and the mesh is displaced by the weighted sum of the morph deltas. The
// measurement rings in body.json are the exact vertex rings MakeHuman's own
// plugin uses to measure the body, so a user's tape-measure values map 1:1
// onto the mesh. The body is shaded with a realistic skin material, soft studio
// lighting, and a contact shadow.
//
// The avatar ships dressed: a shirt, pants, socks and shoes. Clothes are built
// straight from the (deformed) body mesh — triangles whose centroid falls in a
// garment's height band are kept, pushed a few mm outward along the body
// normals, and re-indexed — so the outfit fits perfectly at every measurement
// and both sexes, and each piece is its own mesh with its own color.

// three r183+ deprecated THREE.Clock in favor of THREE.Timer, but
// @react-three/fiber's internal store still constructs one THREE.Clock per
// Canvas (state.clock) and three warns on every construction. Substitute an
// identical, warning-free implementation before any Canvas mounts.
type ClockLike = {
  autoStart: boolean;
  startTime: number;
  oldTime: number;
  elapsedTime: number;
  running: boolean;
  start(): void;
  stop(): void;
  getElapsedTime(): number;
  getDelta(): number;
};

class SilentClock implements ClockLike {
  autoStart: boolean;
  startTime = 0;
  oldTime = 0;
  elapsedTime = 0;
  running = false;

  constructor(autoStart = true) {
    this.autoStart = autoStart;
  }

  start(): void {
    this.startTime = performance.now();
    this.oldTime = this.startTime;
    this.elapsedTime = 0;
    this.running = true;
  }

  stop(): void {
    this.getElapsedTime();
    this.running = false;
    this.autoStart = false;
  }

  getElapsedTime(): number {
    this.getDelta();
    return this.elapsedTime;
  }

  getDelta(): number {
    let diff = 0;
    if (this.autoStart && !this.running) {
      this.start();
      return 0;
    }
    if (this.running) {
      const newTime = performance.now();
      diff = (newTime - this.oldTime) / 1000;
      this.oldTime = newTime;
      this.elapsedTime += diff;
    }
    return diff;
  }
}

// Patch only in the browser, before any Canvas mounts. During Next.js
// prerendering this module also evaluates in Node, where the three namespace
// is frozen and no Canvas exists to patch for anyway — just skip it there.
if (typeof window !== "undefined") {
  try {
    (THREE as unknown as { Clock: new (autoStart?: boolean) => ClockLike }).Clock =
      SilentClock as unknown as new (autoStart?: boolean) => ClockLike;
  } catch {
    // Frozen namespace (e.g. server-side evaluation) — nothing to patch.
  }
}

const MORPH_BY_KEY: Record<keyof Measurements, string> = {
  neckCm: "neck-circ",
  shoulderCm: "shoulder-dist",
  chestCm: "bust-circ",
  waistCm: "waist-circ",
  hipCm: "hips-circ",
  wristCm: "wrist-circ",
  ankleCm: "ankle-circ",
  thighCm: "thigh-circ",
  calfCm: "calf-circ",
  kneeCm: "knee-circ",
  upperArmCm: "upperarm-circ",
  forearmCm: "upperarm-circ", // no forearm morph — scale with the upper arm
};

interface BodyAsset {
  positions: number[];
  indices: number[];
  baseHeightCm: number;
  minY: number;
  sex: string;
  nails?: number[];
  rings: Record<string, { kind: string; verts: number[]; defaultCm: number }>;
  morphs: Record<string, { decr: number[][]; incr: number[][] }>;
}

type MorphDeltas = Map<number, [number, number, number]>;

// Apply each morph's delta at the weight sign it was built for: a positive
// weight grows toward the incr target, a negative weight shrinks toward the
// decr target (|w| scales the delta). MakeHuman's decr/incr targets are both
// deltas from the base shape, so adding both at once (as an early build did)
// partially cancelled the morphs out.
function deltasFor(asset: BodyAsset, weights: Record<string, number>): MorphDeltas {
  const deltas = new Map<number, [number, number, number]>();
  for (const [morphId, w] of Object.entries(weights)) {
    const m = asset.morphs[morphId];
    if (!m || w === 0) continue;
    const src = w > 0 ? m.incr : m.decr;
    const s = Math.abs(w);
    for (const [idx, dx, dy, dz] of src) {
      const cur = deltas.get(idx) ?? [0, 0, 0];
      deltas.set(idx, [cur[0] + s * dx, cur[1] + s * dy, cur[2] + s * dz]);
    }
  }
  return deltas;
}

function weightsFor(asset: BodyAsset, m: Partial<Measurements> | undefined): Record<string, number> {
  const weights: Record<string, number> = {};
  for (const [key, morphId] of Object.entries(MORPH_BY_KEY)) {
    const ring = asset.rings[morphId];
    if (!ring) continue;
    const value = m?.[key as keyof Measurements];
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    const k = ring.defaultCm;
    const lo = k * 0.72;
    const hi = k * 1.28;
    const v = Math.min(Math.max(value, lo), hi);
    weights[morphId] = v <= k ? (v - k) / (k - lo) : (v - k) / (hi - k);
  }
  return weights;
}

// ── Outfit (clothes on top of the skin) ───────────────────────────────────
// Each piece is a height band of the body, expressed as a fraction of total
// height (feet = 0). Landmarks are the body's own measurement rings: ankle
// ≈ 0.08, knee ≈ 0.31, thigh ≈ 0.44, hips ≈ 0.52, waist ≈ 0.62, wrist ≈ 0.62,
// shoulders ≈ 0.835. The shirt covers the torso waist→neck (male figures are
// shirtless); the pants cover mid-thigh→waist; shoes cover the feet.
const CLOTHING_PIECES: {
  id: ClothingPartId;
  minY: number;
  maxY: number;
  thickness: number; // fabric offset outward along the body normal, in meters
}[] = [
  { id: "shirt", minY: 0.62, maxY: 0.87, thickness: 0.016 },
  { id: "pants", minY: 0.28, maxY: 0.62, thickness: 0.012 },
  { id: "shoes", minY: 0.0, maxY: 0.07, thickness: 0.02 },
];

function buildClothing(
  meters: Float32Array,
  normals: THREE.BufferAttribute,
  indices: number[],
  h: number,
  sex: string
): { id: ClothingPartId; geometry: THREE.BufferGeometry }[] {
  // Pants only: this figure is posed A-pose with the arms spread out to the
  // sides (reaching |x| far beyond the torso/legs), so anything further from
  // the center line than the torso/leg "core" is an arm. The core half-width
  // is read from the geometry each height slab: a large gap in |x| splits the
  // near-axis body from the out-spread arms (that slab's core is the gap's
  // lower side), while a slab without such a gap is entirely core (legs).
  function coreHalfWidth(yMin: number, yMax: number) {
    let core = 0;
    const n = meters.length / 3;
    const slabStep = 0.03 * h;
    for (let y = yMin; y <= yMax; y += slabStep) {
      const xs: number[] = [];
      for (let v = 0; v < n; v++) {
        const yy = meters[v * 3 + 1];
        if (Math.abs(yy - y) < 0.01) xs.push(Math.abs(meters[v * 3]));
      }
      if (xs.length < 3) continue;
      xs.sort((a, b) => a - b);
      let gap = -1;
      let below = 0;
      for (let i = 1; i < xs.length; i++) {
        const g = xs[i] - xs[i - 1];
        if (g > gap) {
          gap = g;
          below = xs[i - 1];
        }
      }
      const slabCore = gap > 0.12 ? below : xs[xs.length - 1];
      if (slabCore > core) core = slabCore;
    }
    return core;
  }

  // A vertex on the cloth surface: body position + outward normal × thickness.
  type Pt = { x: number; y: number; z: number; nx: number; ny: number; nz: number };
  const at = (v: number): Pt => ({
    x: meters[v * 3],
    y: meters[v * 3 + 1],
    z: meters[v * 3 + 2],
    nx: normals.getX(v),
    ny: normals.getY(v),
    nz: normals.getZ(v),
  });
  // Sutherland–Hodgman clip of a polygon against the half-space y <= limit
  // (keepBelow) or y >= limit. Interpolated intersection points carry lerped
  // normals so the cloth still hugs the surface at the cut.
  function clipY(pts: Pt[], limit: number, keepBelow: boolean): Pt[] {
    const out: Pt[] = [];
    for (let i = 0; i < pts.length; i++) {
      const cur = pts[i];
      const nxt = pts[(i + 1) % pts.length];
      const cIn = keepBelow ? cur.y <= limit : cur.y >= limit;
      const nIn = keepBelow ? nxt.y <= limit : nxt.y >= limit;
      if (cIn) out.push(cur);
      if (cIn !== nIn) {
        const t = (limit - cur.y) / (nxt.y - cur.y);
        out.push({
          x: cur.x + (nxt.x - cur.x) * t,
          y: limit,
          z: cur.z + (nxt.z - cur.z) * t,
          nx: cur.nx + (nxt.nx - cur.nx) * t,
          ny: cur.ny + (nxt.ny - cur.ny) * t,
          nz: cur.nz + (nxt.nz - cur.nz) * t,
        });
      }
    }
    return out;
  }

  return CLOTHING_PIECES.flatMap((piece) => {
    if (piece.id === "shirt" && sex === "male") return [];
    const minY = piece.minY * h;
    // Male figures are shirtless, so their pants sit low on the hips to leave
    // the abs/chest visible; female pants stay high-waisted.
    const maxY = piece.id === "pants" && sex === "male" ? 0.55 * h : piece.maxY * h;
    // Female shirt reaches the wrist: the arms spread outward and the hand bulge
    // sits past |x| 0.62m, so anything beyond that is a hand, left bare.
    const xLimit =
      piece.id === "pants"
        ? Math.max(0.05, coreHalfWidth(minY, maxY) * 1.2)
        : piece.id === "shirt" && sex === "female"
          ? 0.62
          : Infinity;
    const th = piece.thickness;

    const dedup = new Map<string, number>();
    const positions: number[] = [];
    const triIndices: number[] = [];

    const push = (p: Pt): number => {
      const key = `${p.x.toFixed(6)},${p.y.toFixed(6)},${p.z.toFixed(6)}`;
      const hit = dedup.get(key);
      if (hit !== undefined) return hit;
      const id = positions.length / 3;
      dedup.set(key, id);
      positions.push(p.x + p.nx * th, p.y + p.ny * th, p.z + p.nz * th);
      return id;
    };

    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i];
      const b = indices[i + 1];
      const c = indices[i + 2];
      if (piece.id === "pants" || (piece.id === "shirt" && xLimit !== Infinity)) {
        const cx = (Math.abs(meters[a * 3]) + Math.abs(meters[b * 3]) + Math.abs(meters[c * 3])) / 3;
        if (cx > xLimit) continue;
      }
      let pts = [at(a), at(b), at(c)];
      pts = clipY(pts, maxY, true);
      if (pts.length < 3) continue;
      pts = clipY(pts, minY, false);
      if (pts.length < 3) continue;
      const ids = pts.map(push);
      for (let k = 1; k < ids.length - 1; k++) {
        triIndices.push(ids[0], ids[k], ids[k + 1]);
      }
    }

    // Finished hem: cap every open boundary edge with a thin lip so the cut
    // edges read as a clean collar/hem rather than a torn edge.
    const nVerts = positions.length / 3;
    const edgeCount = new Map<string, number>();
    const edgeVerts = new Map<string, [number, number]>();
    for (let i = 0; i < triIndices.length; i += 3) {
      const t0 = triIndices[i];
      const t1 = triIndices[i + 1];
      const t2 = triIndices[i + 2];
      for (const [ea, eb] of [
        [t0, t1],
        [t1, t2],
        [t2, t0],
      ] as const) {
        const key = ea < eb ? `${ea}_${eb}` : `${eb}_${ea}`;
        edgeCount.set(key, (edgeCount.get(key) ?? 0) + 1);
        edgeVerts.set(key, [ea, eb]);
      }
    }
    let yMin = Infinity;
    for (let v = 0; v < nVerts; v++) {
      const y = positions[v * 3 + 1];
      if (y < yMin) yMin = y;
    }
    const lip = 0.01;
    for (const [key, count] of edgeCount) {
      if (count !== 1) continue;
      const [ea, eb] = edgeVerts.get(key)!;
      const ay = positions[ea * 3 + 1];
      const by = positions[eb * 3 + 1];
      const midY = (ay + by) / 2;
      const nearTop = Math.abs(midY - maxY) < 0.008;
      const nearBot = Math.abs(midY - minY) < 0.008;
      if (!nearTop && !nearBot) continue; // interior mesh seam — leave it alone
      const ax = positions[ea * 3];
      const az = positions[ea * 3 + 2];
      const bx = positions[eb * 3];
      const bz = positions[eb * 3 + 2];
      const up = nearTop ? 1 : -1;
      const a2 = push({ x: ax, y: ay + up * lip, z: az, nx: 0, ny: 0, nz: 0 });
      const b2 = push({ x: bx, y: by + up * lip, z: bz, nx: 0, ny: 0, nz: 0 });
      triIndices.push(ea, eb, b2, ea, b2, a2);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.setIndex(triIndices);
    geometry.computeVertexNormals();
    return [{ id: piece.id, geometry }];
  });
}

function BodyMesh({
  asset,
  weights,
  ghost,
}: {
  asset: BodyAsset;
  weights: Record<string, number>;
  ghost?: boolean;
}) {
  const { geometry, nails, pieces } = useMemo(() => {
    const deltas = deltasFor(asset, weights);
    const meters = new Float32Array(asset.positions.length);
    for (let i = 0; i < asset.positions.length; i += 3) {
      const d = deltas.get(i / 3);
      meters[i] = asset.positions[i] + (d ? d[0] : 0);
      meters[i + 1] = asset.positions[i + 1] + (d ? d[1] : 0) - asset.minY;
      meters[i + 2] = asset.positions[i + 2] + (d ? d[2] : 0);
    }
    // Feet to y = 0 and mesh units → meters.
    for (let i = 0; i < meters.length; i++) meters[i] /= 10;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(meters, 3));
    geometry.setIndex(asset.indices);
    geometry.computeVertexNormals();

    const nails = asset.nails?.length
      ? (() => {
          const g = new THREE.BufferGeometry();
          g.setAttribute("position", geometry.getAttribute("position"));
          g.setIndex(asset.nails as number[]);
          g.computeVertexNormals();
          return g;
        })()
      : null;

    const h = asset.baseHeightCm / 100;
    const pieces = buildClothing(
      meters,
      geometry.getAttribute("normal") as THREE.BufferAttribute,
      asset.indices,
      h,
      asset.sex
    );
    return { geometry, nails, pieces };
  }, [asset, weights]);

  const ghostProps = {
    transparent: ghost,
    opacity: ghost ? 0.42 : 1,
    depthWrite: !ghost,
  };

  return (
    <>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color={SKIN_TONE} roughness={ghost ? 0.55 : 0.62} metalness={0} {...ghostProps} />
      </mesh>
      {nails && (
        <mesh geometry={nails} castShadow>
          <meshStandardMaterial color="#ffffff" roughness={ghost ? 0.5 : 0.35} metalness={0.1} {...ghostProps} />
        </mesh>
      )}
      {pieces.map((p) => (
        <mesh key={p.id} geometry={p.geometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={OUTFIT_COLORS[p.id]}
            roughness={ghost ? 0.55 : 0.85}
            metalness={0}
            side={THREE.DoubleSide}
            {...ghostProps}
          />
        </mesh>
      ))}
    </>
  );
}

function AvatarCanvas({
  asset,
  m,
  ghost,
}: {
  asset: BodyAsset;
  m: Partial<Measurements> | undefined;
  ghost?: boolean;
}) {
  const weights = useMemo(() => weightsFor(asset, m), [asset, m]);
  const h = asset.baseHeightCm / 100;
  return (
    // shadows={{ type: PCFShadowMap }} — PCFSoftShadowMap is deprecated in
    // three r183+ (PCFShadowMap is soft now) and would warn every frame.
    <Canvas camera={{ position: [0.9, 0.55 * h, 1.35 * h], fov: 38 }} dpr={[1, 2]} shadows={{ type: THREE.PCFShadowMap }}>
      <ambientLight intensity={0.45} />
      {/* Soft studio key + fill */}
      <directionalLight position={[2.2, 3.2, 2.4]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-2.2, 1.2, -1.5]} intensity={0.5} color="#dde6ff" />
      <spotLight position={[0, 3.4, 0]} intensity={0.4} angle={0.6} penumbra={1} color="#ffffff" />

      <BodyMesh asset={asset} weights={weights} ghost={ghost} />

      <ContactShadows
        position={[0, 0.005, 0]}
        opacity={0.55}
        scale={h * 1.4}
        blur={2.2}
        far={h * 0.5}
        resolution={512}
        color={ghost ? "#64748b" : "#0f172a"}
      />
      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.7}
        minDistance={0.8 * h}
        maxDistance={2.4 * h}
        target={[0, 0.58 * h, 0]}
      />
    </Canvas>
  );
}

export default function BodyAvatar3D({
  now,
  goal,
  sex,
}: {
  now: Measurements | undefined;
  goal?: Measurements | undefined;
  sex: Sex;
  heightCm: number;
  weightKg: number;
}) {
  const [asset, setAsset] = useState<BodyAsset | null>(null);
  useEffect(() => {
    let cancelled = false;
    new THREE.FileLoader().load(`/body/body-${sex}.json`, (data) => {
      if (!cancelled) setAsset(JSON.parse(String(data)) as BodyAsset);
    });
    return () => {
      cancelled = true;
    };
  }, [sex]);
  const hasGoal = Boolean(goal);

  if (!asset) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950/40">
        Loading your body…
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="h-80 w-full overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-900">
        <div className="flex items-center gap-1.5 px-3 pt-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SKIN_TONE }} /> Now
        </div>
        <AvatarCanvas asset={asset} m={now} />
      </div>
      {hasGoal && (
        <div className="h-80 w-full overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-900">
          <div className="flex items-center gap-1.5 px-3 pt-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SKIN_TONE, opacity: 0.5 }} /> Goal
          </div>
          <AvatarCanvas asset={asset} m={goal} ghost />
        </div>
      )}
    </div>
  );
}
