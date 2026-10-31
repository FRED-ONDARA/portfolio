"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { pointer } from "@/lib/store";
import type { ScenePalette } from "./palette";
import { cloudTexture, glowTexture, planetTexture, ringTexture, type PlanetKind } from "./textures";

/* ---------- Sun: animated granulation, limb darkening and a soft corona ---------- */

const sunVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const sunFragment = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPos;
  float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float noise(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * noise(p); p *= 2.1; a *= 0.5; } return s; }
  void main() {
    vec3 p = normalize(vPos) * 3.2;
    // Large slow swirls plus fine granulation, kept low-contrast so it reads as plasma, not spots.
    float n = fbm(p + vec3(uTime * 0.05, uTime * 0.03, 0.0));
    float grain = fbm(p * 7.0 - vec3(0.0, uTime * 0.08, uTime * 0.05));
    float limb = clamp(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
    vec3 deep = vec3(0.80, 0.27, 0.05);
    vec3 warm = vec3(0.98, 0.50, 0.14);
    vec3 hot = vec3(1.0, 0.80, 0.50);
    vec3 col = mix(deep, warm, smoothstep(0.25, 0.75, n));
    col += (grain - 0.5) * 0.16;
    col = mix(col, hot, pow(limb, 3.0) * 0.55);
    col *= 0.62 + 0.38 * pow(limb, 0.5);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export function Sun({ radius = 0.42, reduced }: { radius?: number; reduced: boolean }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 3 } },
        vertexShader: sunVertex,
        fragmentShader: sunFragment,
        toneMapped: false,
      }),
    [],
  );
  const glow = useMemo(() => glowTexture(), []);
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (reduced) return;
    material.uniforms.uTime.value += dt;
    if (mesh.current) mesh.current.rotation.y += dt * 0.04;
  });
  return (
    <group>
      <sprite scale={radius * 6} renderOrder={-3}>
        <spriteMaterial map={glow} transparent depthWrite={false} toneMapped={false} />
      </sprite>
      <mesh ref={mesh}>
        <sphereGeometry args={[radius, 64, 64]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

/* ---------- Planets ---------- */

/** UVs for a ring so a 1D texture maps from inner (u=0) to outer (u=1) edge. */
function ringGeometry(inner: number, outer: number) {
  const g = new THREE.RingGeometry(inner, outer, 128, 1);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const r = Math.hypot(pos.getX(i), pos.getY(i));
    uv.setXY(i, (r - inner) / (outer - inner), 0.5);
  }
  return g;
}

export function Planet({
  kind,
  radius,
  spin = 0.15,
  tilt = 0.2,
  reduced,
  rings = false,
  textureSize = 256,
}: {
  kind: PlanetKind;
  radius: number;
  spin?: number;
  tilt?: number;
  reduced: boolean;
  rings?: boolean;
  textureSize?: number;
}) {
  const map = useMemo(() => planetTexture(kind, textureSize), [kind, textureSize]);
  const ringMap = useMemo(() => (rings ? ringTexture() : null), [rings]);
  const ringGeo = useMemo(() => (rings ? ringGeometry(radius * 1.35, radius * 2.3) : null), [rings, radius]);
  const body = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (!reduced && body.current) body.current.rotation.y += dt * spin;
  });
  return (
    <group rotation={[0, 0, tilt]}>
      <mesh ref={body}>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial map={map} roughness={0.95} metalness={0} />
      </mesh>
      {ringGeo && ringMap && (
        <mesh geometry={ringGeo} rotation={[-Math.PI / 2 + 0.35, 0, 0]}>
          <meshStandardMaterial map={ringMap} transparent side={THREE.DoubleSide} depthWrite={false} roughness={1} />
        </mesh>
      )}
    </group>
  );
}

/* ---------- Earth: surface, drifting clouds and a thin atmosphere ---------- */

const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const atmosphereFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec3 vNormal;
  void main() {
    float rim = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 4.0);
    gl_FragColor = vec4(uColor, rim * uStrength);
    #include <colorspace_fragment>
  }
`;

export function Earth({
  radius = 0.9,
  reduced,
  textureSize = 384,
}: {
  radius?: number;
  reduced: boolean;
  textureSize?: number;
}) {
  const map = useMemo(() => planetTexture("earth", textureSize), [textureSize]);
  const clouds = useMemo(() => cloudTexture(textureSize), [textureSize]);
  const atmosphere = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color("#b7d0e6") }, uStrength: { value: 0.55 } },
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );
  const surface = useRef<THREE.Mesh>(null);
  const cloudMesh = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (reduced) return;
    if (surface.current) surface.current.rotation.y += dt * 0.08;
    if (cloudMesh.current) cloudMesh.current.rotation.y += dt * 0.11;
  });
  return (
    <group rotation={[0.25, 0, 0.41]}>
      <mesh ref={surface}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial map={map} roughness={0.85} metalness={0} />
      </mesh>
      <mesh ref={cloudMesh} scale={1.012}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial map={clouds} transparent depthWrite={false} roughness={1} />
      </mesh>
      <mesh scale={1.035}>
        <sphereGeometry args={[radius, 48, 48]} />
        <primitive object={atmosphere} attach="material" />
      </mesh>
    </group>
  );
}

/* ---------- Starfield: tiny points, dark specks on light, stars on dark ---------- */

export function Starfield({
  count = 140,
  palette,
  spread = [7, 5, 3] as [number, number, number],
  z = -4,
}: {
  count?: number;
  palette: ScenePalette;
  spread?: [number, number, number];
  z?: number;
}) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = (k: number) => {
        const s = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
        return s - Math.floor(s);
      };
      pos[i * 3] = (r(1) - 0.5) * spread[0];
      pos[i * 3 + 1] = (r(2) - 0.5) * spread[1];
      pos[i * 3 + 2] = z + (r(3) - 0.5) * spread[2];
      size[i] = r(4);
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, spread, z]);
  const group = useRef<THREE.Points>(null);
  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    g.position.x = THREE.MathUtils.damp(g.position.x, -pointer.x * 0.25, 2, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, -pointer.y * 0.15, 2, dt);
  });
  return (
    <points ref={group} geometry={geometry}>
      <pointsMaterial
        color={palette.star}
        size={palette.starSize}
        sizeAttenuation
        transparent
        opacity={palette.starOpacity}
        depthWrite={false}
      />
    </points>
  );
}

/* ---------- Solar system ---------- */

type Body = {
  kind: PlanetKind;
  orbit: number;
  radius: number;
  speed: number;
  phase: number;
  rings?: boolean;
  moon?: boolean;
};

const BODIES: Body[] = [
  { kind: "mercury", orbit: 0.85, radius: 0.07, speed: 0.42, phase: 0.4 },
  { kind: "venus", orbit: 1.15, radius: 0.11, speed: 0.3, phase: 2.2 },
  { kind: "earth", orbit: 1.5, radius: 0.13, speed: 0.22, phase: 4.1, moon: true },
  { kind: "mars", orbit: 1.82, radius: 0.09, speed: 0.17, phase: 1.2 },
  { kind: "jupiter", orbit: 2.25, radius: 0.27, speed: 0.1, phase: 5.3 },
  { kind: "saturn", orbit: 2.75, radius: 0.21, speed: 0.07, phase: 3.0, rings: true },
];

function Orbiter({ body, reduced, palette }: { body: Body; reduced: boolean; palette: ScenePalette }) {
  const ref = useRef<THREE.Group>(null);
  const moon = useRef<THREE.Group>(null);
  const angle = useRef(body.phase);
  const points = useMemo(
    () =>
      Array.from({ length: 161 }, (_, i) => {
        const a = (i / 160) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(a) * body.orbit, 0, Math.sin(a) * body.orbit);
      }),
    [body.orbit],
  );
  useFrame((_, dt) => {
    if (!reduced) angle.current += dt * body.speed;
    ref.current?.position.set(Math.cos(angle.current) * body.orbit, 0, Math.sin(angle.current) * body.orbit);
    if (moon.current) {
      const m = angle.current * 5;
      moon.current.position.set(Math.cos(m) * body.radius * 2.4, 0, Math.sin(m) * body.radius * 2.4);
    }
  });
  return (
    <>
      <Line points={points} color={palette.line} lineWidth={0.8} transparent opacity={palette.orbitOpacity} />
      <group ref={ref}>
        {body.kind === "earth" ? (
          <Earth radius={body.radius} reduced={reduced} textureSize={256} />
        ) : (
          <Planet
            kind={body.kind}
            radius={body.radius}
            reduced={reduced}
            rings={body.rings}
            textureSize={body.radius > 0.12 ? 256 : 128}
          />
        )}
        {body.moon && (
          <group ref={moon}>
            <Planet kind="moon" radius={body.radius * 0.3} reduced={reduced} textureSize={64} />
          </group>
        )}
      </group>
    </>
  );
}

export function SolarSystem({ reduced, palette, low }: { reduced: boolean; palette: ScenePalette; low: boolean }) {
  const bodies = low ? BODIES.filter((b) => b.kind !== "mercury" && b.kind !== "mars") : BODIES;
  return (
    <group>
      <pointLight position={[0, 0, 0]} intensity={18} decay={1.2} distance={0} color="#fff1e0" />
      <Sun reduced={reduced} radius={0.5} />
      {bodies.map((b) => (
        <Orbiter key={b.kind} body={b} reduced={reduced} palette={palette} />
      ))}
    </group>
  );
}
