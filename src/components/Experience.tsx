import { site } from "@/content/site";
import { Reveal } from "./reveal";
import { Arrow, container, MaskLine, SectionLabel } from "./ui";

const { experience } = site;

function InfoList({ label, items }: { label: string; items: readonly { title: string; detail: string }[] }) {
  return (
    <div data-reveal="fade">
      <p className="font-mono text-[11px] tracking-[0.14em] text-muted">{label}</p>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {items.map((it) => (
          <li key={it.title} className="py-4">
            <p className="font-display text-xl leading-tight">{it.title}</p>
            <p className="mt-1 text-[15px] text-ink/70">{it.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Experience() {
  return (
    <Reveal
      id="experience"
      aria-labelledby="experience-title"
      className={`${container} border-t border-line py-20 md:py-28`}
    >
      <SectionLabel number={experience.number} label={experience.label} />
      <h2
        id="experience-title"
        className="mt-6 text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.95] font-display font-medium tracking-[-0.02em]"
      >
        {experience.heading.map((l, i) => (
          <MaskLine key={l} className={i === 1 ? "text-accent-display italic" : ""}>
            {l}
          </MaskLine>
        ))}
      </h2>

      <ol className="mt-12 border-t border-line">
        {experience.roles.map((r, i) => {
          const href = "href" in r ? r.href : undefined;
          return (
            <li
              key={r.role}
              data-reveal="fade"
              className="grid gap-4 border-b border-line py-8 md:grid-cols-12 md:gap-10"
            >
              <div className="md:col-span-5">
                <p className="font-mono text-[12px] text-accent-text">
                  {experience.number}.{i + 1}
                </p>
                <h3 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-none">{r.role}</h3>
                <p className="mt-2 font-mono text-[11.5px] uppercase tracking-[0.12em] text-muted">
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent-text"
                    >
                      {r.org}
                      <Arrow className="h-3 w-3" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  ) : (
                    r.org
                  )}
                </p>
              </div>
              <ul className="space-y-2 md:col-span-7 md:pt-7">
                {r.points.map((pt) => (
                  <li key={pt} className="flex gap-3 text-[17px] leading-relaxed text-ink/80">
                    <span className="mt-[0.7em] h-1 w-3 shrink-0 bg-accent" aria-hidden />
                    {pt}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>

      <div className="mt-14 grid gap-10 md:grid-cols-2">
        <InfoList label={experience.educationLabel} items={experience.education} />
        <InfoList label={experience.certificationsLabel} items={experience.certifications} />
      </div>
    </Reveal>
  );
}
