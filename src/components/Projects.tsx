"use client";

import { site, type ProjectSlug } from "@/content/site";
import { MaskLine, useReveal } from "./reveal";
import { Arrow, container, SectionLabel } from "./ui";
import { Visual } from "./Visual";

const { projects } = site;

function ProjectRow({ index, screenshot }: { index: number; screenshot?: string }) {
  const p = projects.items[index];
  const ref = useReveal<HTMLElement>();
  const flip = index % 2 === 1;
  const href = "href" in p ? p.href : undefined;

  return (
    <article
      ref={ref}
      aria-labelledby={`project-${p.slug}`}
      className="grid items-center gap-6 border-t border-line py-12 md:grid-cols-12 md:gap-10 md:py-16"
    >
      <div
        className={`relative overflow-hidden rounded-[14px] border border-line bg-surface md:col-span-7 ${flip ? "md:order-2 md:col-start-6" : ""}`}
      >
        <Visual spec={{ kind: "project", slug: p.slug, screenshot }} className="aspect-[4/3] w-full" />
      </div>
      <div className={`md:col-span-5 ${flip ? "md:order-1 md:col-start-1 md:row-start-1" : ""}`}>
        <div
          data-reveal="fade"
          className="flex items-center gap-4 font-mono text-[12px] uppercase tracking-[0.12em] text-muted"
        >
          <span className="text-accent-text">
            {projects.number}.{index + 1}
          </span>
          <span className="h-px w-8 bg-line" />
          <span className="rounded-full border border-line px-2.5 py-1 text-[11px] text-ink">{p.tag}</span>
        </div>
        <h3
          id={`project-${p.slug}`}
          className="mt-5 text-[clamp(2rem,3.6vw,3.25rem)] leading-[1] font-display font-medium tracking-[-0.02em]"
        >
          <MaskLine>{p.title}</MaskLine>
        </h3>
        <div data-reveal="fade" className="mt-5 max-w-[32rem] space-y-2 text-[17px] leading-relaxed text-ink/80">
          {p.body.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        {href && (
          <a
            data-reveal="fade"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-6 inline-flex items-center gap-2 border-b border-ink pb-1 font-mono text-[12px] uppercase tracking-[0.08em] transition-colors hover:border-accent hover:text-accent-text"
          >
            Visit site
            <Arrow className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <span className="sr-only">(opens {p.title} in a new tab)</span>
          </a>
        )}
      </div>
    </article>
  );
}

export function Projects({ screenshots }: { screenshots: Partial<Record<ProjectSlug, string>> }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className={`${container} border-t border-line pt-20 pb-12 md:pt-28`}
    >
      <div ref={ref} className="mb-6 md:mb-10">
        <SectionLabel number={projects.number} label={projects.label} />
        <h2
          id="projects-title"
          className="mt-6 text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.95] font-display font-medium tracking-[-0.02em]"
        >
          {projects.heading.map((l, i) => (
            <MaskLine key={l} className={i === 1 ? "text-accent-display italic" : ""}>
              {l}
            </MaskLine>
          ))}
        </h2>
      </div>
      {projects.items.map((p, i) => (
        <ProjectRow key={p.slug} index={i} screenshot={screenshots[p.slug]} />
      ))}
      <p className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-8 text-[15px] text-muted">
        <span className="font-mono text-[12px] uppercase tracking-[0.12em]">{projects.more.label}:</span>
        {projects.more.links.map((l, i) => (
          <span key={l.href} className="inline-flex items-center gap-3">
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent-text hover:decoration-accent"
            >
              {l.title}
            </a>
            {i < projects.more.links.length - 1 && <span aria-hidden>,</span>}
          </span>
        ))}
      </p>
    </section>
  );
}
