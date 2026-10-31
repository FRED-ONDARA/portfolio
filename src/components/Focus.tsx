"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site, type FocusId } from "@/content/site";
import type { ResolvedImage } from "@/lib/images";
import { useReducedMotion } from "@/lib/hooks";
import { MaskLine, useReveal } from "./reveal";
import { container, SectionLabel } from "./ui";
import { Visual } from "./Visual";

const { focus } = site;

export function Focus({ figures }: { figures: Record<FocusId, ResolvedImage> }) {
  const ref = useReveal<HTMLElement>();
  const reduced = useReducedMotion();
  const [active, setActive] = useState<FocusId>(focus.tabs[0].id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = focus.tabs.findIndex((t) => t.id === active);
  const tab = focus.tabs[index];

  // Arrow keys move between tabs (WAI-ARIA tabs pattern, automatic activation).
  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = focus.tabs.length - 1;
    const next =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? index === last
          ? 0
          : index + 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? index === 0
            ? last
            : index - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    setActive(focus.tabs[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section
      ref={ref}
      id="focus"
      aria-labelledby="focus-title"
      className={`${container} border-t border-line py-20 md:py-28`}
    >
      <div className="grid items-center gap-8 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-6">
          <SectionLabel number={focus.number} label={focus.label} />
          <h2
            id="focus-title"
            className="mt-6 text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.95] font-display font-medium tracking-[-0.02em]"
          >
            {focus.heading.map((l, i) => (
              <MaskLine key={l} className={i === 1 ? "text-accent-display italic" : ""}>
                {l}
              </MaskLine>
            ))}
          </h2>

          <div
            data-reveal="fade"
            role="tablist"
            aria-label="Focus areas"
            className="mt-10 flex flex-col border-t border-line"
            onKeyDown={onKeyDown}
          >
            {focus.tabs.map((t, i) => {
              const selected = t.id === active;
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${t.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(t.id)}
                  className={`group relative flex items-center gap-5 border-b border-line py-5 text-left transition-colors ${selected ? "text-ink" : "text-muted hover:text-ink"}`}
                >
                  <span className={`font-mono text-[12px] ${selected ? "text-accent-text" : ""}`}>
                    {focus.number}.{i + 1}
                  </span>
                  <span className="text-[clamp(1.35rem,2.4vw,2rem)] font-display tracking-[-0.01em]">{t.title}</span>
                  <span
                    aria-hidden
                    className={`absolute bottom-[-1px] left-0 h-[2px] bg-accent transition-all duration-500 ${selected ? "w-full" : "w-0"}`}
                  />
                </button>
              );
            })}
          </div>

          <div className="relative mt-8 min-h-[7.5rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={tab.id}
                role="tabpanel"
                id={`panel-${tab.id}`}
                aria-labelledby={`tab-${tab.id}`}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
                className="max-w-[34rem] text-[17px] leading-relaxed text-ink/80"
              >
                {tab.body}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
        <Visual
          spec={{ kind: "focus", figures, active }}
          className="order-first h-[52svh] md:order-none md:col-span-6 md:h-[78svh]"
        />
      </div>
    </section>
  );
}
