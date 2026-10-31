"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { pointer } from "@/lib/store";
import { ACCENT, type ScenePalette } from "./palette";

// Shared studio lighting: key, soft fill and a rim light from behind.
// `dim` lowers it so a scene's own light (the sun) shapes the planets' day and night sides.
export function StudioLights({ dim = false }: { dim?: boolean }) {
  return (
    <>
      <ambientLight intensity={dim ? 0.22 : 0.75} />
      <directionalLight position={[3, 4, 5]} intensity={dim ? 0.35 : 1.7} />
      <directionalLight position={[-4, 1, 3]} intensity={dim ? 0.1 : 0.45} />
      <directionalLight position={[0, 3, -5]} intensity={dim ? 0.4 : 1.1} />
    </>
  );
}

/** Drifts its children against the pointer, so background layers sit "behind" the figure. */
export function Parallax({
  amount = 0.18,
  reduced,
  children,
}: {
  amount?: number;
  reduced: boolean;
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const g = group.current;
    if (!g || reduced) return;
    g.position.x = THREE.MathUtils.damp(g.position.x, -pointer.x * amount, 3, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, -pointer.y * amount * 0.6, 3, dt);
  });
  return <group ref={group}>{children}</group>;
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
