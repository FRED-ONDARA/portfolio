"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Soft, low-saturation flowers built from curved petal shapes. A few touches, not a garden.

export const FLOWER_PALETTES = {
  ivory: { outer: "#f4eee4", inner: "#ecd9cc", center: "#d98a4e" },
  blush: { outer: "#ecd0c6", inner: "#f6e6df", center: "#e3b56a" },
  white: { outer: "#fbfaf7", inner: "#efe8df", center: "#ff7a3d" },
} as const;
export type FlowerTone = keyof typeof FLOWER_PALETTES;

/** A cupped, slightly curled petal with its base at the origin, pointing up +Y. */
function petalGeometry(length: number, width: number, cup: number) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(width * 0.9, length * 0.18, width * 1.05, length * 0.72, 0, length);
  s.bezierCurveTo(-width * 1.05, length * 0.72, -width * 0.9, length * 0.18, 0, 0);
  const g = new THREE.ShapeGeometry(s, 16);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const across = x / width;
    const along = y / length;
    // Cup across the petal, then curl the tip back.
    pos.setZ(
      i,
      cup * width * across * across * 0.9 -
        cup * length * 0.35 * along * along +
        cup * length * 0.5 * along * along * along,
    );
  }
  g.computeVertexNormals();
  return g;
}

const petalCache = new Map<string, THREE.BufferGeometry>();
function petal(length: number, width: number, cup: number) {
  const key = `${length}-${width}-${cup}`;
  let g = petalCache.get(key);
  if (!g) {
    g = petalGeometry(length, width, cup);
    petalCache.set(key, g);
  }
  return g;
}

function PetalRing({
  count,
  length,
  width,
  cup,
  open,
  color,
  offset = 0,
}: {
  count: number;
  length: number;
  width: number;
  cup: number;
  open: number;
  color: string;
  offset?: number;
}) {
  const geo = petal(length, width, cup);
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <group key={i} rotation={[0, 0, offset + (i / count) * Math.PI * 2]}>
          <mesh geometry={geo} rotation={[open, 0, 0]}>
            <meshPhysicalMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.28}
              roughness={0.6}
              sheen={1}
              sheenColor="#ffffff"
              sheenRoughness={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** One blossom facing +Z, with an optional curved stem and a leaf. */
export function Flower({
  tone = "ivory",
  size = 1,
  stem = 0,
  lean = 0,
  sway = 0,
  reduced,
}: {
  tone?: FlowerTone;
  size?: number;
  stem?: number;
  lean?: number;
  sway?: number;
  reduced: boolean;
}) {
  const c = FLOWER_PALETTES[tone];
  const head = useRef<THREE.Group>(null);
  const stemGeo = useMemo(() => {
    if (!stem) return null;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(lean * 0.3, -stem * 0.35, -0.04),
      new THREE.Vector3(lean * 0.15, -stem * 0.7, 0.02),
      new THREE.Vector3(0, -stem, 0),
    ]);
    return new THREE.TubeGeometry(curve, 32, 0.014, 6, false);
  }, [stem, lean]);
  const leaf = useMemo(() => petal(0.32, 0.1, 0.5), []);

  useFrame((state) => {
    if (reduced || !head.current) return;
    const t = state.clock.elapsedTime + sway;
    head.current.rotation.z = Math.sin(t * 0.7) * 0.06;
    head.current.rotation.x = Math.sin(t * 0.5) * 0.05;
  });

  return (
    <group scale={size}>
      {stemGeo && (
        <>
          <mesh geometry={stemGeo}>
            <meshStandardMaterial color="#7d8a68" roughness={0.8} />
          </mesh>
          <mesh geometry={leaf} position={[lean * 0.2, -stem * 0.55, 0]} rotation={[0.3, 0.4, -1.1]}>
            <meshStandardMaterial color="#8c9a74" roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
      <group ref={head}>
        <PetalRing count={7} length={0.34} width={0.15} cup={0.55} open={0.55} color={c.outer} />
        <PetalRing count={5} length={0.24} width={0.12} cup={0.75} open={0.95} color={c.inner} offset={0.4} />
        <mesh position={[0, 0, 0.05]}>
          <sphereGeometry args={[0.06, 24, 24]} />
          <meshStandardMaterial color={c.center} roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

/** A small bouquet of three stems. */
export function Bouquet({ reduced, scale = 1 }: { reduced: boolean; scale?: number }) {
  return (
    <group scale={scale}>
      <group position={[0, 0.25, 0]} rotation={[0, 0, 0.12]}>
        <Flower tone="ivory" size={1} stem={1.1} lean={0.3} reduced={reduced} />
      </group>
      <group position={[0.32, 0.02, -0.1]} rotation={[0.1, -0.3, -0.25]}>
        <Flower tone="blush" size={0.85} stem={0.9} lean={-0.2} sway={1.3} reduced={reduced} />
      </group>
      <group position={[-0.3, -0.05, 0.05]} rotation={[0, 0.3, 0.4]}>
        <Flower tone="white" size={0.72} stem={0.8} lean={0.25} sway={2.1} reduced={reduced} />
      </group>
    </group>
  );
}
