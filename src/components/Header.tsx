"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import { scrollToId } from "@/lib/scroll";
import { menuOpenStore, useStore } from "@/lib/store";
import { MenuOverlay } from "./MenuOverlay";
import { container } from "./ui";

export function Header() {
  const open = useStore(menuOpenStore, false);
  const menuButton = useRef<HTMLButtonElement>(null);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40">
        <div className={`${container} flex h-16 items-center justify-between md:h-20`}>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("top");
            }}
            aria-label={`${site.name}, back to top`}
            className="grid h-10 w-10 place-items-center rounded-full bg-ink text-[13px] font-semibold tracking-[-0.04em] text-bg"
          >
            {site.initials}
          </a>
          <button
            ref={menuButton}
            type="button"
            onClick={() => menuOpenStore.set(true)}
            aria-expanded={open}
            aria-controls="menu-overlay"
            className="group inline-flex h-10 items-center gap-3 rounded-full border border-line bg-surface/80 px-5 font-mono text-[12px] uppercase tracking-[0.1em] backdrop-blur-md transition-colors hover:border-ink"
          >
            Menu
            <span className="flex flex-col gap-[3px]" aria-hidden>
              <span className="h-px w-4 bg-ink transition-transform duration-300 group-hover:translate-x-0.5" />
              <span className="h-px w-4 bg-ink transition-transform duration-300 group-hover:-translate-x-0.5" />
            </span>
          </button>
        </div>
      </header>
      <MenuOverlay returnFocusTo={menuButton} />
    </>
  );
}
