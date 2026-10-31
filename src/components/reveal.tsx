"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import { loaderDoneStore, useStore } from "@/lib/store";

export { MaskLine } from "./ui";

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
        if (lines.length) gsap.set(lines, { y: 0 });
        if (fades.length) gsap.to(fades, { opacity: 1, y: 0, duration: 0.4 });
        return;
      }
      const tl = gsap.timeline({
        scrollTrigger: immediate ? undefined : { trigger: el, start: "top 78%", once: true },
        delay: immediate ? 0.15 : 0,
      });
      if (lines.length) tl.to(lines, { y: 0, duration: 1.1, ease: "expo.out", stagger: 0.09 });
      if (fades.length) tl.to(fades, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.07 }, "-=0.8");
    }, el);
    return () => ctx.revert();
  }, [loaded, reduced, immediate]);

  return ref;
}

/** Server-friendly wrapper: renders a section (or div) and runs the reveal animation on it. */
export function Reveal({
  as = "section",
  children,
  ...props
}: { as?: "section" | "div"; children: React.ReactNode } & React.HTMLAttributes<HTMLElement>) {
  const ref = useReveal<HTMLElement>();
  const Tag = as;
  return (
    <Tag ref={ref as React.RefObject<HTMLElement & HTMLDivElement>} {...props}>
      {children}
    </Tag>
  );
}
