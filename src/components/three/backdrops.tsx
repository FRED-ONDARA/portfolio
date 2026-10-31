"use client";

import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { pointer, type Theme } from "@/lib/store";

// Backdrops behind the figures. One visual language, "signal": a contour aura,
// a rippling dot floor and a bundle of fiber strands. Each is one draw call and
// fades out before its edges, so nothing is clipped by the section's frame.

const noiseGLSL = /* glsl */ `
  float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float noise3(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x), mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x), mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm3(vec3 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * noise3(p); p *= 2.03; a *= 0.5; } return s; }
`;

function tones(theme: Theme) {
  return theme === "dark"
    ? { ink: new THREE.Color("#f5f3ef"), glow: new THREE.Color("#ff7a3d"), line: 0.16, glowAlpha: 0.2, dot: 0.55 }
    : { ink: new THREE.Color("#0c0c0d"), glow: new THREE.Color("#ff7a3d"), line: 0.19, glowAlpha: 0.16, dot: 0.42 };
}

/* ---------- Aura: drifting topographic contours around a warm glow ---------- */

const auraVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const auraFragment = /* glsl */ `
  uniform float uTime;
  uniform float uSeed;
  uniform float uAspect;
  uniform vec2 uPointer;
  uniform vec3 uInk;
  uniform vec3 uGlow;
  uniform float uLineAlpha;
  uniform float uGlowAlpha;
  varying vec2 vUv;
  ${noiseGLSL}
  void main() {
    vec2 p = (vUv - 0.5) * 2.0 * vec2(uAspect, 1.0);
    float r = length(p * vec2(1.0 / uAspect, 1.0));
    float mask = smoothstep(1.0, 0.45, r);

    // Contours of a slow noise field, bent into rings around the figure.
    vec2 q = p * 1.1 + uPointer * 0.12;
    float n = fbm3(vec3(q, uTime * 0.035 + uSeed));
    float k = (n * 1.3 + length(p - vec2(0.0, 0.2)) * 0.85) * 10.0;
    float f = abs(fract(k) - 0.5);
    float w = fwidth(k);
    float line = 1.0 - smoothstep(0.0, w * 1.25, 0.5 - f);
    float major = 1.0 - step(0.5, mod(floor(k), 4.0));

    vec2 g = p - vec2(0.0, 0.32);
    float glow = exp(-dot(g, g) * 1.7);

    float la = line * uLineAlpha * (0.55 + 0.6 * major) * mask * (0.45 + 0.75 * glow);
    vec3 lc = mix(uInk, uGlow, smoothstep(0.35, 0.95, glow));
    float ga = glow * uGlowAlpha * mask;
    float a = la + ga * (1.0 - la);
    vec3 col = (lc * la + uGlow * ga * (1.0 - la)) / max(a, 1e-4);
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;

export function Aura({
  theme,
  reduced,
  seed = 0,
  width = 4.6,
  height = 5.2,
  position = [0, 0.15, -2.1] as [number, number, number],
}: {
  theme: Theme;
  reduced: boolean;
  seed?: number;
  width?: number;
  height?: number;
  position?: [number, number, number];
}) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSeed: { value: seed },
          uAspect: { value: width / height },
          uPointer: { value: new THREE.Vector2() },
          uInk: { value: new THREE.Color() },
          uGlow: { value: new THREE.Color() },
          uLineAlpha: { value: 0 },
          uGlowAlpha: { value: 0 },
        },
        vertexShader: auraVertex,
        fragmentShader: auraFragment,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    [seed, width, height],
  );
  const t = tones(theme);
  material.uniforms.uInk.value.copy(t.ink);
  material.uniforms.uGlow.value.copy(t.glow);
  material.uniforms.uLineAlpha.value = t.line;
  material.uniforms.uGlowAlpha.value = t.glowAlpha;

  useFrame((_, dt) => {
    if (!reduced) material.uniforms.uTime.value += dt;
    const ptr = material.uniforms.uPointer.value as THREE.Vector2;
    ptr.x = THREE.MathUtils.damp(ptr.x, reduced ? 0 : pointer.x, 2, dt);
    ptr.y = THREE.MathUtils.damp(ptr.y, reduced ? 0 : pointer.y, 2, dt);
  });

  return (
    <mesh position={position} renderOrder={-4}>
      <planeGeometry args={[width, height]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

/* ---------- Signal floor: a dot field with ripples spreading from the figure ---------- */

const floorVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uAmp;
  varying float vAlpha;
  varying float vWave;
  void main() {
    float d = length(position.xz);
    float wave = 0.5 + 0.5 * sin(d * 5.5 - uTime * 1.5);
    float crest = pow(wave, 6.0);
    vec3 p = position + vec3(0.0, crest * uAmp * exp(-d * 0.6), 0.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.7 + crest * 0.9) / -mv.z;
    vAlpha = (1.0 - smoothstep(1.1, 2.4, d)) * (1.0 - smoothstep(1.6, 2.5, abs(position.x)));
    vWave = crest;
  }
`;

const floorFragment = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uGlow;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vWave;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float disc = 1.0 - smoothstep(0.32, 0.5, length(c));
    vec3 col = mix(uInk, uGlow, vWave * 0.85);
    gl_FragColor = vec4(col, disc * vAlpha * uOpacity * (0.35 + 0.65 * vWave));
    #include <colorspace_fragment>
  }
`;

export function SignalFloor({
  theme,
  reduced,
  y = -1.86,
  amp = 0.09,
  cols = 56,
  rows = 34,
}: {
  theme: Theme;
  reduced: boolean;
  y?: number;
  amp?: number;
  cols?: number;
  rows?: number;
}) {
  const dpr = useThree((s) => s.viewport.dpr);
  const geometry = useMemo(() => {
    const pos = new Float32Array(cols * rows * 3);
    let k = 0;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        pos[k++] = (i / (cols - 1) - 0.5) * 5.2;
        pos[k++] = 0;
        pos[k++] = (j / (rows - 1) - 0.5) * 3.6 - 0.5;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [cols, rows]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 0 },
          uAmp: { value: amp },
          uInk: { value: new THREE.Color() },
          uGlow: { value: new THREE.Color() },
          uOpacity: { value: 0 },
        },
        vertexShader: floorVertex,
        fragmentShader: floorFragment,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    [amp],
  );
  const t = tones(theme);
  material.uniforms.uInk.value.copy(t.ink);
  material.uniforms.uGlow.value.copy(t.glow);
  material.uniforms.uOpacity.value = t.dot;
  material.uniforms.uSize.value = 26 * dpr;

  useFrame((_, dt) => {
    if (!reduced) material.uniforms.uTime.value += dt;
  });

  return <points geometry={geometry} material={material} position={[0, y, 0]} renderOrder={-3} />;
}

/* ---------- Fiber bundle: strands converging behind the figure, with light pulses ---------- */

const fiberVertex = /* glsl */ `
  attribute float aT;
  attribute float aSeed;
  varying float vT;
  varying float vSeed;
  void main() {
    vT = aT; vSeed = aSeed;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fiberFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uInk;
  uniform vec3 uGlow;
  uniform float uBase;
  varying float vT;
  varying float vSeed;
  void main() {
    float ends = sin(vT * 3.14159);
    float d = fract(vT - uTime * (0.07 + vSeed * 0.08) - vSeed * 7.0);
    float pulse = exp(-d * 28.0) * step(0.35, fract(vSeed * 13.7));
    vec3 col = mix(uInk, uGlow, pulse);
    gl_FragColor = vec4(col, ends * (uBase + pulse * 0.85));
    #include <colorspace_fragment>
  }
`;

export function FiberBundle({ theme, reduced, count = 34 }: { theme: Theme; reduced: boolean; count?: number }) {
  const geometry = useMemo(() => {
    const seg = 90;
    const pos: number[] = [];
    const t: number[] = [];
    const seeds: number[] = [];
    const index: number[] = [];
    for (let s = 0; s < count; s++) {
      const r = (k: number) => {
        const v = Math.sin((s + 1) * 37.71 + k * 11.3) * 43758.5453;
        return v - Math.floor(v);
      };
      const spreadL = (r(1) - 0.5) * 3.2;
      const spreadR = (r(2) - 0.5) * 3.2;
      const z = -1.5 - r(3) * 0.8;
      const wob = 0.08 + r(4) * 0.12;
      const seed = r(5);
      const base = pos.length / 3;
      for (let i = 0; i <= seg; i++) {
        const u = i / seg;
        const x = (u - 0.5) * 5.4;
        // Spread at both sides, pinched into a bundle behind the figure.
        const pinch = Math.exp(-x * x * 0.9);
        const side = u < 0.5 ? spreadL : spreadR;
        const y = 0.55 + side * (1 - pinch) * 0.75 + Math.sin(x * 2.2 + s) * wob * (1 - pinch);
        pos.push(x, y, z);
        t.push(u);
        seeds.push(seed);
        if (i > 0) index.push(base + i - 1, base + i);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("aT", new THREE.Float32BufferAttribute(t, 1));
    g.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 1));
    g.setIndex(index);
    return g;
  }, [count]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uInk: { value: new THREE.Color() },
          uGlow: { value: new THREE.Color() },
          uBase: { value: 0.1 },
        },
        vertexShader: fiberVertex,
        fragmentShader: fiberFragment,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );
  const tn = tones(theme);
  material.uniforms.uInk.value.copy(tn.ink);
  material.uniforms.uGlow.value.copy(tn.glow);
  material.uniforms.uBase.value = theme === "dark" ? 0.16 : 0.12;

  useFrame((_, dt) => {
    if (!reduced) material.uniforms.uTime.value += dt;
  });

  return <lineSegments geometry={geometry} material={material} renderOrder={-3} />;
}
