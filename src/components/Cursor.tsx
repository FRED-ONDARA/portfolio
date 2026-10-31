"use client";

import { useEffect, useRef } from "react";
import { useIsTouch, useReducedMotion } from "@/lib/hooks";

const INTERACTIVE = "a, button, [role='tab'], [data-cursor]";

/** Small blend-mode dot that eases after the pointer and grows over links and buttons. */
export function Cursor() {
  const touch = useIsTouch();
  const reduced = useReducedMotion();
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (touch) return;
    const el = dot.current;
    if (!el) return;
    document.documentElement.classList.add("has-cursor");
    const pos = { x: -100, y: -100 };
    const cur = { x: -100, y: -100 };
    let scale = 1;
    let target = 1;
    let visible = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        cur.x = pos.x;
        cur.y = pos.y;
        visible = true;
        el.style.opacity = "1";
      }
      target = (e.target as Element)?.closest?.(INTERACTIVE) ? 4.2 : 1;
    };
    const onLeave = () => {
      visible = false;
      el.style.opacity = "0";
    };
    const loop = () => {
      const k = reduced ? 1 : 0.2;
      cur.x += (pos.x - cur.x) * k;
      cur.y += (pos.y - cur.y) * k;
      scale += (target - scale) * (reduced ? 1 : 0.18);
      el.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [touch, reduced]);

  if (touch) return null;
  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[80] h-3 w-3 rounded-full bg-white opacity-0 mix-blend-difference transition-opacity duration-300"
    />
  );
}
