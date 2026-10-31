"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { pointer } from "@/lib/store";
import { ACCENT, type ScenePalette } from "./palette";

// Shared studio lighting: key, soft fill and a rim light from behind.
export function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 5]} intensity={1.7} />
      <directionalLight position={[-4, 1, 3]} intensity={0.45} />
      <directionalLight position={[0, 3, -5]} intensity={1.1} />
    </>
  );
}

let blobTexture: THREE.CanvasTexture | null = null;
export function getBlobTexture() {
  if (blobTexture) return blobTexture;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(0.45, "rgba(0,0,0,0.45)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  blobTexture = new THREE.CanvasTexture(canvas);
  return blobTexture;
}

// Cheap soft contact shadow: a radial gradient on the floor.
export function ContactBlob({
  width = 1.6,
  depth = 0.45,
  opacity = 0.22,
  position = [0, 0, 0] as [number, number, number],
}) {
  const texture = useMemo(() => getBlobTexture(), []);
  return (
    <mesh position={position} rotation-x={-Math.PI / 2} renderOrder={-2}>
      <planeGeometry args={[width, depth]} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

type ShapeProps = { palette: ScenePalette; reduced: boolean; count?: number; parallax?: number };

// A few quiet background objects: rounded cubes, thin rings, a sphere. One orange piece.
export function BackgroundShapes({ palette, reduced, count = 5, parallax = 0.18 }: ShapeProps) {
  const group = useRef<THREE.Group>(null);
  const items = useRef<THREE.Object3D[]>([]);

  useFrame((state, dt) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    if (!reduced) {
      // Opposite drift to the figure for a subtle depth effect.
      group.current.position.x = THREE.MathUtils.damp(group.current.position.x, -pointer.x * parallax, 3, dt);
      group.current.position.y = THREE.MathUtils.damp(group.current.position.y, -pointer.y * parallax * 0.6, 3, dt);
      items.current.forEach((o, i) => {
        if (!o) return;
        o.rotation.x += dt * 0.08 * (i % 2 ? 1 : -1);
        o.rotation.y += dt * 0.12;
        o.position.y = (o.userData.y as number) + Math.sin(t * 0.6 + i) * 0.06;
      });
    }
  });

  const set = (i: number) => (o: THREE.Object3D | null) => {
    if (o) {
      o.userData.y = o.position.y;
      items.current[i] = o;
    }
  };

  return (
    <group ref={group}>
      <RoundedBox ref={set(0)} args={[0.62, 0.62, 0.62]} radius={0.12} smoothness={4} position={[-1.55, 1.05, -1.6]}>
        <meshStandardMaterial color={palette.solid} roughness={0.85} />
      </RoundedBox>
      <mesh ref={set(1)} position={[1.45, 1.3, -1.1]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color={ACCENT} roughness={0.4} />
      </mesh>
      {count > 2 && (
        <mesh ref={set(2)} position={[1.5, -0.55, -1.8]} rotation={[1.1, 0.3, 0]}>
          <torusGeometry args={[0.55, 0.012, 16, 96]} />
          <meshStandardMaterial color={palette.ink} roughness={0.5} />
        </mesh>
      )}
      {count > 3 && (
        <RoundedBox ref={set(3)} args={[0.42, 0.42, 0.42]} radius={0.1} smoothness={4} position={[-1.3, -1.0, -0.6]}>
          <meshPhysicalMaterial
            color={palette.glass}
            roughness={0.25}
            clearcoat={1}
            clearcoatRoughness={0.4}
            transparent
            opacity={0.55}
          />
        </RoundedBox>
      )}
      {count > 4 && (
        <mesh ref={set(4)} position={[-0.9, 1.6, -2.4]} rotation={[0.4, 0.9, 0]}>
          <torusGeometry args={[0.32, 0.01, 16, 64]} />
          <meshStandardMaterial color={palette.soft} roughness={0.6} />
        </mesh>
      )}
    </group>
  );
}

// Slowly expanding concentric "signal" rings in the accent color.
export function SignalRings({
  count = 3,
  speed = 0.22,
  maxScale = 1.55,
  opacity = 0.45,
  reduced = false,
  position = [0, 0.4, -1.2] as [number, number, number],
}) {
  const rings = useRef<THREE.Mesh[]>([]);
  useFrame((state) => {
    const t = reduced ? 0.35 : state.clock.elapsedTime * speed;
    rings.current.forEach((m, i) => {
      if (!m) return;
      const f = (t + i / count) % 1;
      const s = 0.5 + f * maxScale;
      m.scale.setScalar(s);
      (m.material as THREE.MeshBasicMaterial).opacity = Math.sin(f * Math.PI) * opacity;
    });
  });
  return (
    <group position={position}>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) rings.current[i] = m;
          }}
        >
          <ringGeometry args={[0.985, 1, 128]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

const fiberPaths: [number, number, number][][] = [
  [
    [-2.6, -1.2, -1.4],
    [-1.2, -0.3, -1.6],
    [0.2, -0.8, -1.9],
    [1.6, 0.4, -1.6],
    [2.8, 0.1, -1.4],
  ],
  [
    [-2.8, 0.9, -2.2],
    [-1.4, 1.5, -2.0],
    [0.4, 1.0, -2.3],
    [1.8, 1.7, -2.1],
    [2.9, 1.2, -2.0],
  ],
];

// Thin fiber-optic light lines with pulses travelling along them.
export function FiberLines({
  palette,
  reduced = false,
  opacity = 0.6,
}: {
  palette: ScenePalette;
  reduced?: boolean;
  opacity?: number;
}) {
  const curves = useMemo(
    () => fiberPaths.map((p) => new THREE.CatmullRomCurve3(p.map((v) => new THREE.Vector3(...v))).getPoints(80)),
    [],
  );
  const pulses = useRef<{ material: { dashOffset: number } }[]>([]);
  useFrame((_, dt) => {
    if (reduced) return;
    pulses.current.forEach((l, i) => {
      if (l) l.material.dashOffset -= dt * (0.35 + i * 0.12);
    });
  });
  return (
    <group>
      {curves.map((points, i) => (
        <group key={i}>
          <Line points={points} color={palette.line} lineWidth={1} transparent opacity={0.5} />
          <Line
            ref={(l) => {
              if (l) pulses.current[i] = l as unknown as { material: { dashOffset: number } };
            }}
            points={points}
            color={ACCENT}
            lineWidth={2}
            dashed
            dashSize={0.35}
            gapSize={2.4}
            transparent
            opacity={opacity}
            toneMapped={false}
          />
        </group>
      ))}
    </group>
  );
}
