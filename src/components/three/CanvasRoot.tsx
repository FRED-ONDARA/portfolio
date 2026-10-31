"use client";

import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor, View } from "@react-three/drei";
import { pointer, qualityStore } from "@/lib/store";

// One fixed, transparent Canvas for the whole page. Every section's View renders into it.
export default function CanvasRoot({ mobile }: { mobile: boolean }) {
  useEffect(() => {
    if (mobile) qualityStore.set("low");

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      pointer.active = true;
    };
    const onLeave = () => (pointer.active = false);
    // Touch devices: tilt from device orientation when available (otherwise figures idle-sway).
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      pointer.x = Math.max(-1, Math.min(1, e.gamma / 30));
      pointer.y = Math.max(-1, Math.min(1, (45 - e.beta) / 30));
      pointer.active = true;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    if (mobile) window.addEventListener("deviceorientation", onOrient, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("deviceorientation", onOrient);
    };
  }, [mobile]);

  return (
    <Canvas
      className="!fixed inset-0 !h-[100lvh] !w-screen"
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 5 }}
      dpr={mobile ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      eventSource={undefined}
      aria-hidden
    >
      <PerformanceMonitor onDecline={() => qualityStore.set("low")} />
      <View.Port />
    </Canvas>
  );
}
