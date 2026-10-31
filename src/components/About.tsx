"use client";

import { site } from "@/content/site";
import type { ResolvedImage } from "@/lib/images";
import { MaskLine, useReveal } from "./reveal";
import { container, SectionLabel } from "./ui";
import { Visual } from "./Visual";

const { about } = site;

export function About({ figure }: { figure: ResolvedImage }) {
  const ref = useReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      id="about"
      aria-labelledby="about-title"
      className={`${container} border-t border-line py-20 md:py-28`}
    >
      <div className="grid items-center gap-8 md:grid-cols-12 md:gap-10">
        <Visual spec={{ kind: "about", figure }} className="h-[52svh] md:col-span-5 md:h-[74svh]" />
        <div className="md:col-span-6 md:col-start-7">
          <SectionLabel number={about.number} label={about.label} />
          <h2
            id="about-title"
            className="mt-6 text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.95] font-display font-medium tracking-[-0.02em]"
          >
            {about.heading.map((l, i) => (
              <MaskLine key={l} className={i === 1 ? "text-accent-display italic" : ""}>
                {l}
              </MaskLine>
            ))}
          </h2>
          <p data-reveal="fade" className="mt-8 max-w-[36rem] text-[17px] leading-relaxed text-ink/80">
            {about.body}
          </p>
          <ul className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-[14px] border border-line bg-line sm:grid-cols-2">
            {about.facts.map((f, i) => (
              <li key={f.title} data-reveal="fade" className="flex flex-col gap-3 bg-surface p-5">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                  <span className="text-accent-text">0{i + 1}</span> · {f.label}
                </span>
                <span className="font-display text-xl leading-tight tracking-[-0.01em]">{f.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
