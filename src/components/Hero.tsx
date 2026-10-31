"use client";

import { site } from "@/content/site";
import type { ResolvedImage } from "@/lib/images";
import { scrollToId } from "@/lib/scroll";
import { MaskLine, useReveal } from "./reveal";
import { Button, container } from "./ui";
import { Visual } from "./Visual";

const { hero, cv } = site;

export function Hero({ figure }: { figure: ResolvedImage }) {
  const ref = useReveal<HTMLElement>({ immediate: true });

  return (
    <section
      ref={ref}
      id="top"
      aria-labelledby="hero-title"
      className={`${container} grid min-h-[100svh] items-center gap-4 pt-20 pb-12 md:grid-cols-12 md:gap-10 md:pt-28`}
    >
      <div className="md:col-span-6 lg:col-span-6">
        <p data-reveal="fade" className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted sm:text-[12px]">
          {hero.label}
        </p>
        <h1
          id="hero-title"
          className="mt-6 text-[clamp(3.4rem,10.5vw,9.5rem)] leading-[0.9] font-semibold tracking-[-0.045em]"
        >
          {hero.headline.map((line, i) => (
            <MaskLine key={line.text} className={i === 1 ? "pl-[0.9em]" : i === 2 ? "pl-[0.35em]" : ""}>
              {"emphasis" in line && line.emphasis ? (
                <em className="text-accent-display not-italic">{line.text}</em>
              ) : (
                line.text
              )}
            </MaskLine>
          ))}
        </h1>
        <p data-reveal="fade" className="mt-8 max-w-[34rem] text-[17px] leading-relaxed text-ink/80 md:text-lg">
          {hero.sub}
        </p>
        <p
          data-reveal="fade"
          className="mt-6 inline-flex items-center gap-3 rounded-full border border-line bg-surface px-4 py-2 text-[13px] text-ink"
        >
          <span className="pulse-dot h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
          {hero.status}
        </p>
        <div data-reveal="fade" className="mt-8 flex flex-wrap gap-3">
          <Button onClick={() => scrollToId("projects")}>{hero.primaryCta}</Button>
          <Button variant="secondary" href={cv.designed} download>
            {hero.secondaryCta}
          </Button>
        </div>
      </div>
      <Visual
        spec={{ kind: "hero", figure }}
        priority
        className="order-first h-[44svh] md:order-none md:col-span-6 md:h-[82svh]"
      />
    </section>
  );
}
