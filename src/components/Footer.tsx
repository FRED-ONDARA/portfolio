"use client";

import { site } from "@/content/site";
import { scrollToId } from "@/lib/scroll";
import { container } from "./ui";

export function Footer() {
  return (
    <footer
      className={`${container} flex items-center justify-between border-t border-line py-8 font-mono text-[12px] uppercase tracking-[0.08em] text-muted`}
    >
      <span>{site.footer.copyright}</span>
      <button
        type="button"
        onClick={() => scrollToId("top")}
        className="group inline-flex items-center gap-2 text-ink transition-colors hover:text-accent-text"
      >
        {site.footer.backToTop}
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5"
          aria-hidden
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
        </svg>
      </button>
    </footer>
  );
}
