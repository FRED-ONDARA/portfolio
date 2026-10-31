import * as THREE from "three";

// Procedural textures (generated once, on the client, when the 3D scene loads).
// Planets are sampled as 3D noise on the sphere so the maps have no seams.

function hash(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

function noise3(x: number, y: number, z: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);
  const zf = smooth(z - zi);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const c = (dx: number, dy: number, dz: number) => hash(xi + dx, yi + dy, zi + dz);
  const x00 = lerp(c(0, 0, 0), c(1, 0, 0), xf);
  const x10 = lerp(c(0, 1, 0), c(1, 1, 0), xf);
  const x01 = lerp(c(0, 0, 1), c(1, 0, 1), xf);
  const x11 = lerp(c(0, 1, 1), c(1, 1, 1), xf);
  return lerp(lerp(x00, x10, yf), lerp(x01, x11, yf), zf);
}

function fbm(x: number, y: number, z: number, octaves = 4) {
  let sum = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise3(x * f, y * f, z * f);
    f *= 2;
    amp *= 0.5;
  }
  return sum / (1 - Math.pow(0.5, octaves));
}

type RGB = [number, number, number];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const band = (lo: number, hi: number, v: number) => clamp01((v - lo) / (hi - lo));

/** Paints an equirectangular map by calling `shade` with the unit-sphere point of each pixel. */
function equirect(
  w: number,
  h: number,
  shade: (x: number, y: number, z: number) => RGB,
  alpha?: (x: number, y: number, z: number) => number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  for (let j = 0; j < h; j++) {
    const lat = Math.PI * (0.5 - (j + 0.5) / h);
    const cy = Math.sin(lat);
    const r = Math.cos(lat);
    for (let i = 0; i < w; i++) {
      const lng = 2 * Math.PI * ((i + 0.5) / w);
      const x = r * Math.cos(lng);
      const z = r * Math.sin(lng);
      const [cr, cg, cb] = shade(x, cy, z);
      const k = (j * w + i) * 4;
      img.data[k] = cr;
      img.data[k + 1] = cg;
      img.data[k + 2] = cb;
      img.data[k + 3] = alpha ? Math.round(alpha(x, cy, z) * 255) : 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

function toTexture(canvas: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function craters(canvas: HTMLCanvasElement, count: number, seed: number) {
  const ctx = canvas.getContext("2d")!;
  for (let i = 0; i < count; i++) {
    const x = hash(i, seed, 1) * canvas.width;
    const y = (0.15 + hash(i, seed, 2) * 0.7) * canvas.height;
    const r = 1.5 + Math.pow(hash(i, seed, 3), 3) * canvas.height * 0.08;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(40,38,36,0.28)");
    g.addColorStop(0.7, "rgba(40,38,36,0.12)");
    g.addColorStop(0.85, "rgba(255,255,255,0.12)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.6, r, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export type PlanetKind = "mercury" | "venus" | "earth" | "moon" | "mars" | "jupiter" | "saturn";

const cache = new Map<string, THREE.Texture>();
function cached(key: string, make: () => THREE.Texture) {
  let t = cache.get(key);
  if (!t) {
    t = make();
    cache.set(key, t);
  }
  return t;
}

export function planetTexture(kind: PlanetKind, size = 256) {
  return cached(`${kind}-${size}`, () => {
    const w = size;
    const h = size / 2;
    switch (kind) {
      case "earth": {
        const deep = hex("#1d3146");
        const shallow = hex("#3a5a72");
        const green = hex("#5d6b4c");
        const desert = hex("#a8977a");
        const ice = hex("#e9ecee");
        return toTexture(
          equirect(w, h, (x, y, z) => {
            const n = fbm(x * 1.7 + 3, y * 1.7, z * 1.7, 5);
            const ay = Math.abs(y);
            const base =
              n < 0.53
                ? mix(deep, shallow, band(0.3, 0.53, n))
                : mix(
                    mix(green, desert, band(0.45, 0.65, fbm(x * 3 + 9, y * 3, z * 3, 3)) * (1 - ay)),
                    hex("#7e7a62"),
                    band(0.62, 0.75, n) * 0.6,
                  );
            // Small, soft-edged polar caps.
            return mix(base, ice, band(0.935, 0.975, ay + (n - 0.5) * 0.05));
          }),
        );
      }
      case "mars":
        return toTexture(
          equirect(w, h, (x, y, z) => {
            const n = fbm(x * 2.2, y * 2.2 + 5, z * 2.2, 5);
            if (Math.abs(y) > 0.93) return hex("#e6ded6");
            return mix(hex("#6f3b29"), hex("#b56a45"), band(0.3, 0.7, n));
          }),
        );
      case "venus":
        return toTexture(
          equirect(w, h, (x, y, z) => {
            const n = fbm(x * 2 + Math.sin(y * 6), y * 4, z * 2, 4);
            return mix(hex("#c9b088"), hex("#ece0c6"), band(0.3, 0.75, n));
          }),
        );
      case "jupiter": {
        const cols = ["#d9c8a9", "#a7805e", "#ece2cf", "#8f6d50", "#cdb391"].map(hex);
        return toTexture(
          equirect(w, h, (x, y, z) => {
            const turb = fbm(x * 3, y * 3, z * 3, 4);
            const b = (Math.sin(y * 22 + turb * 3.2) * 0.5 + 0.5) * (cols.length - 1);
            const i = Math.floor(b);
            return mix(cols[i], cols[Math.min(i + 1, cols.length - 1)], b - i);
          }),
        );
      }
      case "saturn": {
        const cols = ["#e6d6b1", "#c9ae7f", "#efe4c9", "#b99a6c"].map(hex);
        return toTexture(
          equirect(w, h, (x, y, z) => {
            const turb = fbm(x * 2, y * 2, z * 2, 3);
            const b = (Math.sin(y * 16 + turb * 1.6) * 0.5 + 0.5) * (cols.length - 1);
            const i = Math.floor(b);
            return mix(cols[i], cols[Math.min(i + 1, cols.length - 1)], b - i);
          }),
        );
      }
      case "mercury":
      case "moon": {
        const dark = hex(kind === "moon" ? "#7d7b77" : "#6f6a64");
        const light = hex(kind === "moon" ? "#cfccc6" : "#a9a39b");
        const canvas = equirect(w, h, (x, y, z) =>
          mix(dark, light, band(0.3, 0.72, fbm(x * 2.5, y * 2.5, z * 2.5, 5))),
        );
        craters(canvas, kind === "moon" ? 70 : 90, kind === "moon" ? 7 : 3);
        return toTexture(canvas);
      }
    }
  });
}

export function cloudTexture(size = 256) {
  return cached(`clouds-${size}`, () =>
    toTexture(
      equirect(
        size,
        size / 2,
        () => [255, 255, 255],
        (x, y, z) => band(0.55, 0.78, fbm(x * 2.4 + 20, y * 3.2, z * 2.4, 5)) * 0.85,
      ),
    ),
  );
}

/** 1D radial band texture for Saturn's rings (u = inner → outer). */
export function ringTexture() {
  return cached("rings", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 4;
    const ctx = canvas.getContext("2d")!;
    for (let i = 0; i < 256; i++) {
      const u = i / 255;
      const n = noise3(u * 40, 0.5, 0.5) * 0.6 + noise3(u * 120, 2, 1) * 0.4;
      const gap = u > 0.62 && u < 0.67 ? 0.1 : 1; // Cassini-style division
      const a = (0.25 + n * 0.65) * gap * (u < 0.04 || u > 0.97 ? 0.2 : 1);
      const c = mix(hex("#bfa983"), hex("#efe3c8"), n);
      ctx.fillStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;
      ctx.fillRect(i, 0, 1, 4);
    }
    return toTexture(canvas);
  });
}

/** Soft radial glow used for the sun's corona. */
export function glowTexture() {
  return cached("glow", () => {
    const s = 256;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = s;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, "rgba(255,190,120,0.9)");
    g.addColorStop(0.22, "rgba(255,140,70,0.45)");
    g.addColorStop(0.5, "rgba(255,110,50,0.12)");
    g.addColorStop(1, "rgba(255,100,40,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    return toTexture(canvas);
  });
}
