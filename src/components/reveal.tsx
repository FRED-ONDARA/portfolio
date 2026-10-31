"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import { loaderDoneStore, useStore } from "@/lib/store";

/** One masked line of a headline; slides up from behind its mask. */
export function MaskLine({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span data-reveal="line" className={`block overflow-hidden pb-[0.08em] ${className}`}>
      <span className="block will-change-transform">{children}</span>
    </span>
  );
}

/**
 * Reveals [data-reveal] children: headlines line by line, body text with a soft fade-up.
 * `immediate` plays once the loader finishes (hero); otherwise on scroll into view.
 */
export function useReveal<T extends HTMLElement>({ immediate = false } = {}) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const loaded = useStore(loaderDoneStore, false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !loaded) return;
    const ctx = gsap.context(() => {
      const lines = el.querySelectorAll('[data-reveal="line"] > span');
      const fades = el.querySelectorAll('[data-reveal="fade"]');
      if (reduced) {
        gsap.set(lines, { y: 0 });
        gsap.to(fades, { opacity: 1, y: 0, duration: 0.4 });
        return;
      }
      const tl = gsap.timeline({
        scrollTrigger: immediate ? undefined : { trigger: el, start: "top 78%", once: true },
        delay: immediate ? 0.15 : 0,
      });
      tl.to(lines, { y: 0, duration: 1.1, ease: "expo.out", stagger: 0.09 });
      tl.to(fades, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.07 }, "-=0.8");
    }, el);
    return () => ctx.revert();
  }, [loaded, reduced, immediate]);

  return ref;
}
