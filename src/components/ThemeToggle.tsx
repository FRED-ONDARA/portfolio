"use client";

import { themeStore, useStore, type Theme } from "@/lib/store";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useStore(themeStore, "light");
  const dark = theme === "dark";

  const toggle = () => {
    const next: Theme = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
    themeStore.set(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label="Dark mode"
      className={`inline-flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.08em] text-ink ${className}`}
    >
      <span className="relative h-6 w-11 rounded-full border border-ink/70 transition-colors">
        <span
          className={`absolute top-1/2 left-1 h-4 w-4 -translate-y-1/2 rounded-full transition-all duration-300 ${dark ? "translate-x-[18px] bg-accent" : "bg-ink"}`}
        />
      </span>
      {dark ? "Dark" : "Light"}
    </button>
  );
}
