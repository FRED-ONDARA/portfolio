"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/content/site";
import { useReducedMotion } from "@/lib/hooks";
import { lockScroll, scrollToId } from "@/lib/scroll";
import { menuOpenStore, useStore } from "@/lib/store";
import { ThemeToggle } from "./ThemeToggle";
import { Arrow, container } from "./ui";

const ease = [0.7, 0, 0.2, 1] as const;

export function MenuOverlay({ returnFocusTo }: { returnFocusTo: React.RefObject<HTMLButtonElement | null> }) {
  const open = useStore(menuOpenStore, false);
  const reduced = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);

  const close = (target?: string) => {
    menuOpenStore.set(false);
    if (target) {
      // Let the overlay start closing, then glide to the section.
      setTimeout(() => scrollToId(target), reduced ? 0 : 350);
    } else {
      returnFocusTo.current?.focus();
    }
  };

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const el = panel.current;
    const focusables = () => Array.from(el?.querySelectorAll<HTMLElement>("a, button") ?? []);
    const t = setTimeout(() => focusables()[0]?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        menuOpenStore.set(false);
        returnFocusTo.current?.focus();
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
    };
  }, [open, returnFocusTo]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panel}
          id="menu-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-50 flex flex-col bg-bg"
          initial={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          animate={reduced ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
          exit={reduced ? { opacity: 0 } : { clipPath: "inset(100% 0 0 0)" }}
          transition={{ duration: reduced ? 0.15 : 0.7, ease }}
        >
          <div className={`${container} flex h-16 items-center justify-between md:h-20`}>
            <span
              className="grid h-10 w-10 place-items-center rounded-full bg-ink text-[13px] font-semibold tracking-[-0.04em] text-bg"
              aria-hidden
            >
              {site.initials}
            </span>
            <button
              type="button"
              onClick={() => close()}
              className="inline-flex h-10 items-center gap-3 rounded-full border border-ink px-5 font-mono text-[12px] uppercase tracking-[0.1em]"
            >
              Close
              <svg
                viewBox="0 0 16 16"
                className="h-3 w-3"
                aria-hidden
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 3l10 10M13 3 3 13" />
              </svg>
            </button>
          </div>

          <nav aria-label="Primary" className={`${container} flex flex-1 flex-col justify-center`}>
            <ol className="border-t border-line">
              {site.nav.map((item, i) => (
                <li key={item.id} className="overflow-hidden border-b border-line">
                  <motion.a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      close(item.id);
                    }}
                    initial={reduced ? false : { y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: reduced ? 0 : 0.25 + i * 0.06 }}
                    className="group flex items-baseline gap-5 py-4 md:gap-8 md:py-5"
                  >
                    <span className="font-mono text-[12px] text-accent-text md:text-[13px]">0{i + 1}</span>
                    <span className="text-[clamp(2.6rem,8vw,6.5rem)] leading-[0.95] font-semibold tracking-[-0.045em] transition-[color,transform] duration-500 group-hover:translate-x-3 group-hover:text-accent-display">
                      {item.label}
                    </span>
                  </motion.a>
                </li>
              ))}
            </ol>
          </nav>

          <div className={`${container} flex flex-wrap items-center justify-between gap-4 py-6 md:py-8`}>
            <ThemeToggle />
            <a
              href={site.cv.designed}
              download
              className="group inline-flex items-center gap-2 border-b border-ink pb-1 font-mono text-[12px] uppercase tracking-[0.08em] transition-colors hover:border-accent hover:text-accent-text"
            >
              Download CV
              <Arrow />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
