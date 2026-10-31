"use client";

import { site } from "@/content/site";
import type { ResolvedImage } from "@/lib/images";
import { MaskLine, useReveal } from "./reveal";
import { Arrow, Button, container, SectionLabel } from "./ui";
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
          <ul data-reveal="fade" className="mt-8 flex flex-wrap gap-2.5">
            {contact.links.map((l) => {
              const external = l.href.startsWith("http");
              return (
                <li key={l.label}>
                  <a
                    href={l.href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-[15px] transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-bg"
                  >
                    {l.label}
                    <Arrow className="text-accent-display transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </li>
              );
            })}
          </ul>
          <div data-reveal="fade" className="mt-8">
            <Button href={cv.designed} download>
              {contact.cvCta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
