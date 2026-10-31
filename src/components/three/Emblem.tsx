"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import type { LogoShape } from "@/content/logos";
import { pointer } from "@/lib/store";

const geometryCache = new Map<string, THREE.ExtrudeGeometry>();

/** Turns a flat logo path into a bevelled 3D solid, centered and normalized to `size`. */
function logoGeometry(logo: LogoShape) {
  let g = geometryCache.get(logo.path);
  if (g) return g;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${logo.viewBox}"><path d="${logo.path}"/></svg>`;
  const shapes = new SVGLoader().parse(svg).paths.flatMap((p) => p.toShapes());
  const [, , w, h] = logo.viewBox.split(" ").map(Number);
  const unit = Math.max(w, h);
  g = new THREE.ExtrudeGeometry(shapes, {
    depth: unit * 0.14,
    bevelEnabled: true,
    bevelThickness: unit * 0.025,
    bevelSize: unit * 0.012,
    bevelSegments: 4,
    curveSegments: 24,
  });
  g.center();
  g.scale(1 / unit, 1 / unit, 1 / unit);
  geometryCache.set(logo.path, g);
  return g;
}

/** A floating, slowly turning 3D logo. Dark marks switch to the theme's ink so they read in dark mode. */
export function Emblem({
  logo,
  size = 2.1,
  ink,
  reduced,
}: {
  logo: LogoShape;
  size?: number;
  ink: string;
  reduced: boolean;
}) {
  const geometry = useMemo(() => logoGeometry(logo), [logo]);
  const dark = new THREE.Color(logo.color).getHSL({ h: 0, s: 0, l: 0 }).l < 0.15;
  const color = dark ? ink : logo.color;
  const group = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const m = reduced ? 0 : 1;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, (Math.sin(t * 0.6) * 0.45 + pointer.x * 0.35) * m, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, (-pointer.y * 0.2 + Math.sin(t * 0.4) * 0.06) * m, 3, dt);
    g.position.y = Math.sin(t * 0.9) * 0.08 * m;
  });

  return (
    <group ref={group}>
      {/* SVG y points down, so flip it; three corrects the face winding for a negative scale. */}
      <mesh geometry={geometry} scale={[size, -size, size]}>
        <meshPhysicalMaterial color={color} metalness={0.35} roughness={0.28} clearcoat={1} clearcoatRoughness={0.18} />
      </mesh>
    </group>
  );
}
