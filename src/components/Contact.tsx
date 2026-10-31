"use client";

import { site } from "@/content/site";
import type { ResolvedImage } from "@/lib/images";
import { MaskLine, useReveal } from "./reveal";
import { brandIcons, BrandSvg } from "./icons";
import { Button, container, SectionLabel } from "./ui";
import { Visual } from "./Visual";

const { contact, cv } = site;

export function Contact({ figure }: { figure: ResolvedImage }) {
  const ref = useReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      id="contact"
      aria-labelledby="contact-title"
      className={`${container} border-t border-line py-20 md:py-28`}
    >
      <div className="grid items-center gap-8 md:grid-cols-12 md:gap-10">
        <Visual spec={{ kind: "contact", figure }} className="h-[50svh] md:col-span-5 md:h-[70svh]" />
        <div className="md:col-span-6 md:col-start-7">
          <SectionLabel number={contact.number} label={contact.label} />
          <h2
            id="contact-title"
            className="mt-6 text-[clamp(3rem,8vw,7.5rem)] leading-[0.9] font-display font-medium tracking-[-0.02em]"
          >
            {contact.heading.map((l, i) => (
              <MaskLine key={l} className={i === 1 ? "text-accent-display italic" : ""}>
                {l}
              </MaskLine>
            ))}
          </h2>
          <p data-reveal="fade" className="mt-8 max-w-[32rem] text-[17px] leading-relaxed text-ink/80">
            {contact.line}
          </p>
          <div data-reveal="fade" className="mt-10 flex flex-wrap items-center gap-3">
            <ul className="flex flex-wrap gap-3" aria-label="Contact links">
              {contact.links.map((l) => {
                const external = l.href.startsWith("http");
                const icon = brandIcons[l.icon];
                return (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      aria-label={external ? `${l.label} (opens in a new tab)` : l.label}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      style={{ "--brand": icon.brand } as React.CSSProperties}
                      className="group relative grid h-14 w-14 place-items-center rounded-full border border-line bg-surface text-ink transition-[background-color,border-color,color,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--brand)] hover:bg-[var(--brand)] hover:text-white"
                    >
                      <BrandSvg name={l.icon} className="h-[22px] w-[22px]" />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute top-full mt-2 font-mono text-[10px] tracking-[0.1em] whitespace-nowrap text-muted uppercase opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                      >
                        {l.label}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
            <span aria-hidden className="mx-2 hidden h-8 w-px bg-line sm:block" />
            <Button href={cv.designed} download>
              {contact.cvCta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
