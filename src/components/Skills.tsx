"use client";

import { useEffect, useRef, useState } from "react";
import { toolLogos } from "@/content/logos";
import { site, type AiToolId } from "@/content/site";
import { useIsMobile, useReducedMotion } from "@/lib/hooks";
import { LogoMark } from "./LogoMark";
import { useReveal } from "./reveal";
import { container, MaskLine, SectionLabel } from "./ui";
import { Visual } from "./Visual";

const { skills } = site;

/** Picks the tool in the middle of the viewport (desktop), or cycles through them (phones). */
function useActiveTool(cards: React.RefObject<(HTMLElement | null)[]>) {
  const mobile = useIsMobile();
  const reduced = useReducedMotion();
  const [active, setActive] = useState<AiToolId>(skills.ai[0].id);

  useEffect(() => {
    if (mobile) {
      if (reduced) return;
      const id = setInterval(() => {
        setActive((cur) => {
          const i = skills.ai.findIndex((t) => t.id === cur);
          return skills.ai[(i + 1) % skills.ai.length].id;
        });
      }, 3600);
      return () => clearInterval(id);
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.tool as AiToolId);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    cards.current?.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [mobile, reduced, cards]);

  return active;
}

export function Skills({ children }: { children?: React.ReactNode }) {
  const ref = useReveal<HTMLElement>();
  const cards = useRef<(HTMLElement | null)[]>([]);
  const active = useActiveTool(cards);
  const current = skills.ai.find((t) => t.id === active) ?? skills.ai[0];

  return (
    <section
      ref={ref}
      id="skills"
      aria-labelledby="skills-title"
      className={`${container} border-t border-line py-20 md:py-28`}
    >
      <div className="grid gap-6 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-7">
          <SectionLabel number={skills.number} label={skills.label} />
          <h2
            id="skills-title"
            className="mt-6 text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.95] font-display font-medium tracking-[-0.02em]"
          >
            {skills.heading.map((l, i) => (
              <MaskLine key={l} className={i === 1 ? "text-accent-display italic" : ""}>
                {l}
              </MaskLine>
            ))}
          </h2>
        </div>
        <p data-reveal="fade" className="max-w-[30rem] self-end text-[17px] leading-relaxed text-ink/80 md:col-span-5">
          {skills.intro}
        </p>
      </div>

      {/* AI tools: floating 3D logo on the left, explanations on the right. */}
      <p data-reveal="fade" className="mt-16 font-mono text-[11px] tracking-[0.14em] text-muted">
        {skills.aiLabel}
      </p>
      <div className="mt-6 grid gap-8 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-24">
            <Visual spec={{ kind: "tools", active }} className="h-[40svh] md:h-[68svh]" />
            <p className="mt-2 text-center font-mono text-[11px] tracking-[0.14em] text-muted" aria-live="polite">
              {current.name.toUpperCase()} · {current.maker.toUpperCase()}
            </p>
          </div>
        </div>
        <ol className="md:col-span-7">
          {skills.ai.map((tool, i) => {
            const logo = toolLogos[tool.logo];
            const isActive = tool.id === active;
            return (
              <li
                key={tool.id}
                ref={(el) => {
                  cards.current[i] = el;
                }}
                data-tool={tool.id}
                className={`flex flex-col justify-center border-t border-line py-10 border-l-2 pl-5 transition-colors duration-500 md:min-h-[62vh] border-l-transparent ${isActive ? "md:border-l-accent" : ""}`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface"
                    style={{ color: logo.color === "#0C0C0D" || logo.color === "#191919" ? "var(--ink)" : logo.color }}
                  >
                    <LogoMark logo={logo} className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.12em] text-muted">
                    <span className="text-accent-text">
                      {skills.number}.{i + 1}
                    </span>{" "}
                    · {tool.maker.toUpperCase()}
                  </span>
                  <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[10.5px] tracking-[0.1em] text-ink">
                    {tool.kind}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-[clamp(2rem,3.6vw,3.25rem)] leading-none">{tool.name}</h3>
                <p className="mt-5 max-w-[34rem] text-[17px] leading-relaxed text-ink/80">{tool.what}</p>
                <div className="mt-5 max-w-[34rem] border-l-2 border-accent pl-4">
                  <p className="font-mono text-[10.5px] tracking-[0.14em] text-muted">HOW I USE IT</p>
                  <p className="mt-1.5 text-[16px] leading-relaxed text-ink">{tool.how}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {children}
    </section>
  );
}
