"use client";

import { useEffect, useRef } from "react";
import { View } from "@react-three/drei";
import { ScrollTrigger } from "@/lib/gsap";
import type { VisualSpec } from "../visual-spec";
import { SlotScene, type SlotState } from "./SlotScene";

// A section's image slot. The DOM box is tracked by drei's View; its 3D scene renders
// into the single shared Canvas (see CanvasRoot) clipped to this box.
export default function ViewSlot({
  spec,
  reduced,
  mobile,
  onReady,
}: {
  spec: VisualSpec;
  reduced: boolean;
  mobile: boolean;
  onReady: () => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const state = useRef<SlotState>({ hovered: false, progress: 0.5 });

  useEffect(() => {
    if (!wrap.current) return;
    const st = ScrollTrigger.create({
      trigger: wrap.current,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        state.current.progress = self.progress;
      },
    });
    state.current.progress = st.progress;
    return () => st.kill();
  }, []);

  return (
    <div
      ref={wrap}
      className="absolute inset-0"
      onPointerEnter={() => (state.current.hovered = true)}
      onPointerLeave={() => (state.current.hovered = false)}
    >
      <View className="absolute inset-0">
        <SlotScene spec={spec} state={state.current} reduced={reduced} mobile={mobile} onReady={onReady} />
      </View>
    </div>
  );
}
