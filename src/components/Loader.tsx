"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/content/site";
import { useReducedMotion } from "@/lib/hooks";
import { lockScroll } from "@/lib/scroll";
import { loaderDoneStore } from "@/lib/store";

const DURATION = 1200;

/** Counter 0 → 100 with the name in mono type, then a curtain lifts into the hero. */
export function Loader() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    lockScroll(true);
    const duration = reduced ? 300 : DURATION;
    const start = performance.now();
    let raf = 0;
    // Writes straight to the DOM each frame so the count never re-renders React.
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      if (counter.current) counter.current.textContent = String(Math.round(eased * 100));
      if (bar.current) bar.current.style.transform = `scaleX(${eased})`;
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setVisible(false);
        lockScroll(false);
        loaderDoneStore.set(true);
      }
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      lockScroll(false);
    };
  }, [reduced]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden
          className="fixed inset-0 z-[60] hidden flex-col justify-between bg-ink p-5 text-bg md:p-10 [.js_&]:flex"
          exit={reduced ? { opacity: 0 } : { y: "-100%" }}
          transition={{ duration: reduced ? 0.2 : 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex justify-between font-mono text-[12px] uppercase tracking-[0.12em] opacity-70">
            <span>{site.initials}</span>
            <span>Loading</span>
          </div>
          <div className="flex items-end justify-between gap-6">
            <span className="font-mono text-[13px] tracking-[0.2em] md:text-[15px]">{site.loader.label}</span>
            <span className="text-[clamp(5rem,18vw,15rem)] leading-[0.8] font-semibold tracking-[-0.06em] tabular-nums">
              <span ref={counter}>0</span>
              <span className="text-accent">%</span>
            </span>
          </div>
          <div ref={bar} className="absolute bottom-0 left-0 h-[3px] w-full origin-left scale-x-0 bg-accent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
