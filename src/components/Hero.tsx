"use client";

import { site } from "@/content/site";
import type { ResolvedImage } from "@/lib/images";
import { scrollToId } from "@/lib/scroll";
import { MaskLine, useReveal } from "./reveal";
import { Button, container } from "./ui";
import { Visual } from "./Visual";

const { hero, cv } = site;
// The greeting is written out in full in site.ts; the name inside it is set in italics.
const [greetingBefore, greetingAfter = ""] = hero.greeting.split(site.name);

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
        <p data-reveal="fade" className="mt-5 font-display text-[clamp(1.35rem,2.1vw,1.9rem)] leading-tight text-ink">
          {greetingBefore}
          <span className="italic">{site.name}</span>
          {greetingAfter}
        </p>
        <h1
          id="hero-title"
          className="mt-3 text-[clamp(3rem,8vw,7.2rem)] leading-[0.95] font-display font-medium tracking-[-0.02em]"
        >
          {hero.headline.map((line, i) => (
            <MaskLine key={line.text} className={i === 1 ? "pl-[0.9em]" : i === 2 ? "pl-[0.35em]" : ""}>
              {"emphasis" in line && line.emphasis ? (
                <em className="text-accent-display italic">{line.text}</em>
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
        <dl
          data-reveal="fade"
          className="mt-10 grid max-w-[40rem] grid-cols-1 gap-4 border-t border-line pt-6 sm:grid-cols-3"
        >
          {hero.facts.map((f) => (
            <div key={f.value} className="flex flex-col gap-1">
              <dt className="font-display text-xl leading-none">{f.value}</dt>
              <dd className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted">{f.label}</dd>
            </div>
          ))}
        </dl>
      </div>
      <Visual
        spec={{ kind: "hero", figure }}
        priority
        className="order-first h-[44svh] md:order-none md:col-span-6 md:h-[82svh]"
      />
    </section>
  );
}
