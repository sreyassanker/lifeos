// Rebuilds public/body/body-<sex>.json from full MakeHuman OBJ exports.
//
// The app (BodyAvatar3D) consumes a compact custom schema:
//   { format, sex, positions[], indices[], baseHeightCm, minY,
//     rings: { <morphId>: { kind, verts[], defaultCm } },
//     morphs: { <morphId>: { decr[][], incr[][] } } }
//
// positions are in decimeters relative to the feet (the renderer divides by 10
// to get meters); baseHeightCm is the real figure height in cm.
//
// Measurement rings are located on the new mesh by slicing horizontal bands,
// clustering the band vertices by proximity, and classifying the blobs as
// trunk (straddles the body axis) vs limbs (outboard). This is robust to the
// export pose (these bodies have arms spread in an A-pose). The ring default
// value is the silhouette girth of the band — the sum of chords of the
// per-angle maximum radius — so waist/hip/bust read as real circumferences.
//
// For every measurement we then synthesize grow/shrink morph targets that
// scale that ring's girth by ±28%, the same range the app maps tape-measure
// values onto in weightsFor().
//
// Usage: node scripts/build-body-assets.mjs <male.obj> <female.obj>

import fs from "node:fs";
import path from "node:path";

const SKIN_MATERIALS = new Set([
  "Std_Skin_Head",
  "Std_Skin_Body",
  "Std_Skin_Arm",
  "Std_Skin_Leg",
]);

// Ring placement on the figure (fraction of height, feet = 0) and how the
// ring value is interpreted by the app.
// Design notes
// ------------
// These exports are character-style models (A-pose, coarse horizontal detail),
// so exact horizontal "tape rings" can't be recovered. Instead:
//  * ring.verts is the gathered body-blob nearest the landmark (used by the
//    app only for the pants crop / measurement mapping);
//  * ring.defaultCm is a realistic per-sex landmark value (the app clamps the
//    user's measurement to 0.72–1.28 × this, so it just centers the weight
//    mapping — it doesn't need to match this exact mesh);
//  * each morph is synthesized from a vertical radius profile so the bulge is
//    centered on the true local surface radius, not on a fragmentary slice.
const RING_DEFS = [
  { id: "neck-circ", f: 0.885, kind: "trunk", metric: "circ", male: 38, female: 32 },
  { id: "shoulder-dist", f: 0.84, kind: "trunk", metric: "dist", male: 40, female: 36 },
  { id: "bust-circ", f: 0.72, kind: "trunk", metric: "circ", male: 92, female: 88 },
  { id: "waist-circ", f: 0.6, kind: "trunk", metric: "circ", male: 84, female: 68 },
  { id: "hips-circ", f: 0.46, kind: "trunk", metric: "circ", male: 99, female: 97 },
  { id: "thigh-circ", f: 0.34, kind: "legs", metric: "circ", male: 55, female: 56 },
  { id: "calf-circ", f: 0.2, kind: "legs", metric: "circ", male: 37, female: 36 },
  { id: "ankle-circ", f: 0.05, kind: "legs", metric: "circ", male: 22, female: 21 },
  { id: "knee-circ", f: 0.27, kind: "legs", metric: "circ", male: 36, female: 33 },
  { id: "upperarm-circ", f: 0.72, kind: "arms", metric: "circ", male: 30, female: 28 },
  { id: "wrist-circ", f: 0.62, kind: "arms", metric: "circ", male: 17, female: 15 },
];

// ── OBJ parsing (skin body only, quads triangulated) ──────────────────────
function parseObj(file) {
  const vertices = [];
  const indices = [];
  const nailIndices = [];
  let material = "";
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (raw.startsWith("v ")) {
      const p = raw.trim().split(/\s+/);
      vertices.push([Number(p[1]), Number(p[2]), Number(p[3])]);
    } else if (raw.startsWith("usemtl ")) {
      material = raw.slice(7).trim();
    } else if (raw.startsWith("f ")) {
      const ids = raw
        .slice(2)
        .trim()
        .split(/\s+/)
        .map((q) => parseInt(q.split("/")[0], 10) - 1);
      if (material === "Std_Nails") {
        for (let i = 1; i < ids.length - 1; i++) nailIndices.push(ids[0], ids[i], ids[i + 1]);
        continue;
      }
      if (!SKIN_MATERIALS.has(material)) continue;
      for (let i = 1; i < ids.length - 1; i++) indices.push(ids[0], ids[i], ids[i + 1]);
    }
  }
  return { vertices, indices, nailIndices };
}

function buildBody(obj) {
  const n = obj.vertices.length;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const v of obj.vertices) {
    if (v[1] < minY) minY = v[1];
    if (v[1] > maxY) maxY = v[1];
  }
  const positions = obj.vertices.map((v) => [v[0] / 10, (v[1] - minY) / 10, v[2] / 10]);
  const adj = new Array(n);
  for (let i = 0; i < n; i++) adj[i] = [];
  for (let i = 0; i < obj.indices.length; i += 3) {
    const a = obj.indices[i], b = obj.indices[i + 1], c = obj.indices[i + 2];
    adj[a].push(b, c);
    adj[b].push(a, c);
    adj[c].push(a, b);
  }
  return { positions, indices: obj.indices, adj, baseHeightCm: maxY - minY, n };
}

// Spatial hash + union-find: cluster a horizontal band into blobs.
function blobsInBand(body, y0, tol, dProx) {
  const { positions } = body;
  const cell = dProx;
  const parent = new Int32Array(body.n);
  for (let i = 0; i < body.n; i++) parent[i] = i;
  const rank = new Int8Array(body.n);
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const union = (a, b) => {
    a = find(a);
    b = find(b);
    if (a === b) return;
    if (rank[a] < rank[b]) [a, b] = [b, a];
    parent[b] = a;
    if (rank[a] === rank[b]) rank[a]++;
  };

  const inBand = new Int8Array(body.n);
  const grid = new Map();
  for (let v = 0; v < body.n; v++) {
    const [x, y, z] = positions[v];
    if (Math.abs(y - y0) > tol) continue;
    inBand[v] = 1;
    const kx = Math.floor(x / cell);
    const kz = Math.floor(z / cell);
    for (let ox = kx - 1; ox <= kx + 1; ox++) {
      for (let oz = kz - 1; oz <= kz + 1; oz++) {
        const key = `${ox},${oz}`;
        const bucket = grid.get(key);
        if (!bucket) continue;
        for (const u of bucket) {
          const dx = positions[u][0] - x;
          const dz = positions[u][2] - z;
          if (dx * dx + dz * dz <= dProx * dProx) union(v, u);
        }
      }
    }
    const key = `${kx},${kz}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(v);
  }

  const seen = new Set();
  const blobs = [];
  for (let v = 0; v < body.n; v++) {
    if (!inBand[v]) continue;
    const root = find(v);
    if (seen.has(root)) continue;
    seen.add(root);
    const verts = [];
    let sumX = 0, sumZ = 0, minX = Infinity, maxX = -Infinity, sumR = 0;
    for (let u = 0; u < body.n; u++) {
      if (!inBand[u] || find(u) !== root) continue;
      const [x, , z] = positions[u];
      verts.push(u);
      sumX += x;
      sumZ += z;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      sumR += Math.hypot(x, z);
    }
    blobs.push({
      verts,
      cx: sumX / verts.length,
      cz: sumZ / verts.length,
      minX,
      maxX,
      meanR: sumR / verts.length,
      crossesAxis: minX <= 0 && maxX >= 0,
    });
  }
  return blobs;
}

// ── Vertex utilities ──────────────────────────────────────────────────────
function synthesize(body, def, sex, tolY, dProx) {
  const { positions } = body;
  const h = body.baseHeightCm / 10;
  const y0 = def.f * h;
  const blobs = blobsInBand(body, y0, tolY, dProx);
  if (!blobs.length) return null;

  // Pick the blobs that make up this ring for the given body region.
  let ringBlobs;
  switch (def.kind) {
    case "trunk": {
      const central = blobs.filter((b) => b.crossesAxis);
      ringBlobs = central.length
        ? [central.sort((a, b) => b.verts.length - a.verts.length)[0]]
        : [blobs.sort((a, b) => b.verts.length - a.verts.length)[0]];
      break;
    }
    case "arms": {
      const outboard = blobs.filter((b) => !b.crossesAxis);
      ringBlobs = outboard.length ? outboard : [];
      break;
    }
    case "legs": {
      const outboard = blobs.filter((b) => !b.crossesAxis);
      // Hands hang low in the A-pose and could land on a leg cut: keep the
      // blobs whose centroid sits within a leg's radial reach of the axis.
      ringBlobs = outboard.filter((b) => Math.hypot(b.cx, b.cz) <= 1.9);
      break;
    }
  }
  if (!ringBlobs.length) return null;

  if (process.env.DEBUG_RING === def.id) {
    console.log(`-- ${def.id} band blobs:`, blobs.map((b) => ({
      n: b.verts.length,
      cx: +b.cx.toFixed(2),
      cz: +b.cz.toFixed(2),
      minX: +b.minX.toFixed(2),
      maxX: +b.maxX.toFixed(2),
      axis: b.crossesAxis,
    })));
  }

  // Ring body: per-vertex "local center" (axis for trunk, blob center for limbs).
  const centerOf = new Map();
  const ringVerts = new Set();
  for (const b of ringBlobs) {
    for (const v of b.verts) {
      ringVerts.add(v);
      centerOf.set(v, def.kind === "trunk" ? [0, 0] : [b.cx, b.cz]);
    }
  }

  // Calibration: the app maps a tape value to (value − k)/(0.28·k) then scales
  // the ±28% morph. k is a realistic value for this landmark/sex so the mapping
  // is centered for typical users — it doesn't need to equal this mesh's own
  // girth.
  const defaultCm = def[sex];

  // Local surface radius per ring blob (mean radial distance of its gathered
  // vertices) — used to keep each morph's bulge on the ring's surface instead
  // of bleeding into the whole figure.
  const blobMeanR = new Map();
  let trunkMeanR = 0;
  if (def.kind === "trunk") {
    let sum = 0;
    for (const v of ringVerts) {
      const [x, , z] = positions[v];
      sum += Math.hypot(x, z);
    }
    trunkMeanR = sum / ringVerts.size || 1.0;
  } else {
    for (const b of ringBlobs) {
      let sum = 0;
      for (const v of b.verts) {
        const [x, , z] = positions[v];
        sum += Math.hypot(x - b.cx, z - b.cz);
      }
      blobMeanR.set(b, sum / b.verts.length || 0.5);
    }
  }

  // Morph targets: grow/shrink the ring girth by ±28%, with smooth vertical
  // falloff and a tight radial falloff around the ring's surface radius.
  const SIGMA_Y = 0.05;
  const SIGMA_R = 0.28;
  const gauss = (x, s) => Math.exp(-(x * x) / (s * s));

  const incr = new Map();
  const decr = new Map();
  const limbCenters = ringBlobs.map((b) => [b.cx, b.cz]);

  for (let v = 0; v < body.n; v++) {
    const [x, y, z] = positions[v];
    const dy = (y - y0) / h;
    const fy = gauss(dy, SIGMA_Y);
    if (fy < 0.002) continue;

    let center;
    let surfR;
    if (def.kind === "trunk") {
      center = [0, 0];
      surfR = trunkMeanR;
    } else {
      center = centerOf.get(v) || nearestCenter([x, z], limbCenters);
      if (!center) continue;
      const b = ringBlobs.find((bl) => bl.cx === center[0] && bl.cz === center[1]);
      surfR = b ? blobMeanR.get(b) : 0.5;
    }
    const rx = x - center[0], rz = z - center[1];
    const r = Math.hypot(rx, rz);
    if (r < 1e-4) continue;
    const fr = gauss(r - surfR, SIGMA_R);
    const influence = fy * fr;
    if (influence < 0.002) continue;

    const growR = (1.28 - 1) * r * influence;
    const shrR = (0.72 - 1) * r * influence;
    if (!incr.has(v)) incr.set(v, [0, 0, 0]);
    if (!decr.has(v)) decr.set(v, [0, 0, 0]);
    const iv = incr.get(v), dv = decr.get(v);
    iv[0] += (growR * rx) / r;
    iv[2] += (growR * rz) / r;
    dv[0] += (shrR * rx) / r;
    dv[2] += (shrR * rz) / r;
  }

  return {
    id: def.id,
    kind: def.metric === "dist" ? "dist" : "circ",
    verts: [...ringVerts],
    defaultCm: +defaultCm.toFixed(1),
    incr: [...incr.entries()].map(([i, d]) => [i, +d[0].toFixed(5), +d[1].toFixed(5), +d[2].toFixed(5)]),
    decr: [...decr.entries()].map(([i, d]) => [i, +d[0].toFixed(5), +d[1].toFixed(5), +d[2].toFixed(5)]),
  };
}

function nearestCenter(p, centers) {
  let best = null;
  let bd = Infinity;
  for (const c of centers) {
    const d = Math.hypot(p[0] - c[0], p[1] - c[1]);
    if (d < bd) {
      bd = d;
      best = c;
    }
  }
  return best;
}

function run(objFile, sex, outFile) {
  const obj = parseObj(objFile);
  const body = buildBody(obj);
  const h = body.baseHeightCm / 10;
  const tolY = 0.03 * h;
  const dProx = 0.12;

  const rings = {};
  const morphs = {};
  for (const def of RING_DEFS) {
    const ring = synthesize(body, def, sex, tolY, dProx);
    if (!ring) {
      console.warn(`[${sex}] no ring for ${def.id} — skipped`);
      continue;
    }
    rings[ring.id] = { kind: ring.kind, verts: ring.verts, defaultCm: ring.defaultCm };
    morphs[ring.id] = { decr: ring.decr, incr: ring.incr };
    console.log(
      `[${sex}] ${ring.id.padEnd(16)} default=${ring.defaultCm}cm ringVerts=${ring.verts.length} morphInc=${ring.incr.length}`
    );
  }

  const dest = {
    format: "makehuman-cc0-v1",
    sex,
    positions: body.positions.flat(),
    indices: body.indices,
    baseHeightCm: +body.baseHeightCm.toFixed(1),
    minY: 0,
    rings,
    morphs,
  };
  if (obj.nailIndices.length) dest.nails = obj.nailIndices;

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(dest));
  console.log(`[${sex}] wrote ${outFile} (verts=${body.n}, tris=${body.indices.length / 3}, height=${body.baseHeightCm.toFixed(1)}cm)`);
}

const [, , maleObj, femaleObj] = process.argv;
if (!maleObj || !femaleObj) {
  console.error("Usage: node scripts/build-body-assets.mjs <male.obj> <female.obj>");
  process.exit(1);
}
run(maleObj, "male", path.resolve("public/body/body-male.json"));
run(femaleObj, "female", path.resolve("public/body/body-female.json"));