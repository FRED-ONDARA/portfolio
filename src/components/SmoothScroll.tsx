"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import { setLenis } from "@/lib/scroll";
import { themeStore, type Theme } from "@/lib/store";

// Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync.
export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    themeStore.set((document.documentElement.dataset.theme as Theme) ?? "light");
  }, []);

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return null;
}
