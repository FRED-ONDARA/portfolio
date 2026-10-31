"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useIsMobile, useWebGL } from "@/lib/hooks";
import { interactedStore, loaderDoneStore, useStore } from "@/lib/store";
import { Cursor } from "./Cursor";
import { SmoothScroll } from "./SmoothScroll";

const CanvasRoot = dynamic(() => import("./three/CanvasRoot"), { ssr: false });

const EVENTS = ["pointermove", "pointerdown", "wheel", "touchstart", "keydown", "scroll"] as const;
const IDLE_FALLBACK_MS = 5000;

// Client-only page chrome: smooth scroll, cursor and the shared 3D canvas.
// three.js loads on the first interaction (or after an idle fallback) so it never
// competes with the first paint; until then each slot shows its static cutout.
export function Experience() {
  const webgl = useWebGL();
  const mobile = useIsMobile();
  const loaded = useStore(loaderDoneStore, false);
  const interacted = useStore(interactedStore, false);

  useEffect(() => {
    if (!loaded || interactedStore.get()) return;
    const go = () => interactedStore.set(true);
    EVENTS.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    const timer = setTimeout(go, IDLE_FALLBACK_MS);
    return () => {
      clearTimeout(timer);
      EVENTS.forEach((e) => window.removeEventListener(e, go));
    };
  }, [loaded]);

  return (
    <>
      <SmoothScroll />
      <Cursor />
      {webgl && loaded && interacted && <CanvasRoot mobile={mobile} />}
    </>
  );
}
