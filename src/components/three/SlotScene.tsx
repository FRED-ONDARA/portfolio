"use client";

import { Suspense, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import type { FocusId } from "@/content/site";
import { pointer, qualityStore, themeStore, useStore } from "@/lib/store";
import type { VisualSpec } from "../visual-spec";
import { CutoutFigure, type FigureState } from "./CutoutFigure";
import { scenePalette } from "./palette";
import { BackgroundShapes, FiberLines, SignalRings, StudioLights } from "./Scene";
import { CodeWindow, Globe, RobotArm, Rover, ScreenshotPlane, TerminalWindow } from "./visuals";

export type SlotState = FigureState & { progress: number };

// Camera glides with the section's scroll progress (from ScrollTrigger) and the pointer.
function CameraRig({ state, reduced, distance }: { state: SlotState; reduced: boolean; distance: number }) {
  const camera = useThree((s) => s.camera);
  const target = useRef(new THREE.Vector3(0, 0, 0));
  useFrame((_, dt) => {
    const p = reduced ? 0 : state.progress - 0.5;
    const px = reduced ? 0 : pointer.x;
    const py = reduced ? 0 : pointer.y;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, px * 0.35, 2.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.15 - p * 0.55 + py * 0.15, 2.5, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, distance + Math.abs(p) * 0.5, 2.5, dt);
    camera.lookAt(target.current);
  });
  return null;
}

// Fades a group in/out by scale; used when a focus tab swaps its accent object.
function Swap({ show, children, reduced }: { show: boolean; children: React.ReactNode; reduced: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const s = reduced ? (show ? 1 : 0) : THREE.MathUtils.damp(g.scale.x, show ? 1 : 0, 5, dt);
    g.scale.setScalar(s);
    g.visible = s > 0.01;
  });
  return (
    <group ref={ref} scale={show ? 1 : 0}>
      {children}
    </group>
  );
}

function FocusFigures({
  spec,
  state,
  reduced,
  quality,
}: {
  spec: Extract<VisualSpec, { kind: "focus" }>;
  state: SlotState;
  reduced: boolean;
  quality: "high" | "low";
}) {
  const ids = Object.keys(spec.figures) as FocusId[];
  const vis = useRef(
    Object.fromEntries(ids.map((id) => [id, { current: id === spec.active ? 1 : 0 }])) as Record<
      FocusId,
      { current: number }
    >,
  );
  useFrame((_, dt) => {
    for (const id of ids) {
      const v = vis.current[id];
      const target = id === spec.active ? 1 : 0;
      v.current = reduced ? target : THREE.MathUtils.damp(v.current, target, 6, dt);
    }
  });
  return (
    <>
      {ids.map((id) => (
        <CutoutFigure
          key={id}
          src={spec.figures[id].src}
          state={state}
          reduced={reduced}
          quality={quality}
          visibility={vis.current[id]}
          position={[0.2, -0.05, 0]}
        />
      ))}
    </>
  );
}

// Mounts only after everything in the Suspense boundary (textures) has loaded.
function Ready({ onReady }: { onReady: () => void }) {
  useEffect(() => onReady(), [onReady]);
  return null;
}

export function SlotScene({
  spec,
  state,
  reduced,
  mobile,
  onReady,
}: {
  spec: VisualSpec;
  state: SlotState;
  reduced: boolean;
  mobile: boolean;
  onReady: () => void;
}) {
  const theme = useStore(themeStore, "light");
  const quality = useStore(qualityStore, "high");
  const palette = scenePalette(theme);
  const low = quality === "low" || mobile;
  const shapeCount = low ? 2 : 5;

  const isProject = spec.kind === "project";
  const distance = isProject ? 7.2 : 8.4;

  let content: React.ReactNode = null;
  switch (spec.kind) {
    case "hero":
      content = (
        <>
          <BackgroundShapes palette={palette} reduced={reduced} count={shapeCount} />
          <SignalRings reduced={reduced} position={[0, 0.3, -1.4]} />
          {!low && <FiberLines palette={palette} reduced={reduced} />}
          <CutoutFigure src={spec.figure.src} state={state} reduced={reduced} quality={quality} />
        </>
      );
      break;
    case "about":
      content = (
        <>
          <BackgroundShapes palette={palette} reduced={reduced} count={Math.min(shapeCount, 3)} parallax={0.14} />
          <CutoutFigure src={spec.figure.src} state={state} reduced={reduced} quality={quality} />
        </>
      );
      break;
    case "focus":
      content = (
        <>
          <Swap show={spec.active === "telecom"} reduced={reduced}>
            <SignalRings reduced={reduced} position={[0, 0.3, -1.4]} />
            {!low && <FiberLines palette={palette} reduced={reduced} />}
          </Swap>
          <Swap show={spec.active === "robotics"} reduced={reduced}>
            <group position={[-1.25, -0.25, -1.2]}>
              <RobotArm palette={palette} reduced={reduced} scale={0.62} float={false} />
            </group>
          </Swap>
          <Swap show={spec.active === "web"} reduced={reduced}>
            <group position={[-0.9, 0.55, -1.6]} rotation={[0, 0.35, 0]} scale={0.85}>
              <CodeWindow palette={palette} reduced={reduced} theme={theme} />
            </group>
          </Swap>
          <FocusFigures spec={spec} state={state} reduced={reduced} quality={quality} />
        </>
      );
      break;
    case "project":
      content = spec.screenshot ? (
        <ScreenshotPlane src={spec.screenshot} reduced={reduced} />
      ) : spec.slug === "globyx" ? (
        <Globe palette={palette} reduced={reduced} />
      ) : spec.slug === "matlab-coppeliasim" ? (
        <Rover palette={palette} reduced={reduced} />
      ) : spec.slug === "hiwonder-arms" ? (
        <RobotArm palette={palette} reduced={reduced} />
      ) : (
        <TerminalWindow palette={palette} reduced={reduced} />
      );
      break;
    case "contact":
      content = (
        <>
          <SignalRings
            count={4}
            speed={0.38}
            maxScale={1.4}
            opacity={0.5}
            reduced={reduced}
            position={[0, 0.5, -1.2]}
          />
          <BackgroundShapes palette={palette} reduced={reduced} count={2} parallax={0.12} />
          <CutoutFigure src={spec.figure.src} state={state} reduced={reduced} quality={quality} />
        </>
      );
      break;
  }

  return (
    <>
      <PerspectiveCamera makeDefault fov={30} position={[0, 0.15, distance]} near={0.1} far={50} />
      <CameraRig state={state} reduced={reduced} distance={distance} />
      <StudioLights />
      <Suspense fallback={null}>
        {content}
        <Ready onReady={onReady} />
      </Suspense>
    </>
  );
}
