"use client";

import { site } from "@/content/site";
import { scrollToId } from "@/lib/scroll";
import { container } from "./ui";

/** A small line-drawn blossom, one of the site's few flower touches. */
function FlowerMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-6 w-6 text-ink" aria-hidden fill="none" stroke="currentColor" strokeWidth="1">
      {[0, 72, 144, 216, 288].map((r) => (
        <path key={r} d="M16 15.5c-2.6-2.4-3-6.4 0-9.5 3 3.1 2.6 7.1 0 9.5Z" transform={`rotate(${r} 16 15.5)`} />
      ))}
      <circle cx="16" cy="15.5" r="1.6" fill="var(--accent)" stroke="none" />
      <path d="M16 21v9M16 26.5c1.8-1.6 3.6-1.9 5.2-1.2" strokeLinecap="round" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer
      className={`${container} flex items-center justify-between border-t border-line py-8 font-mono text-[12px] uppercase tracking-[0.08em] text-muted`}
    >
      <span className="inline-flex items-center gap-3">
        <FlowerMark />
        {site.footer.copyright}
      </span>
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
