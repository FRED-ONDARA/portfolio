"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { pointer } from "@/lib/store";

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
