import { chipLogos } from "@/content/logos";
import { site } from "@/content/site";
import { LogoMark } from "./LogoMark";
import { Reveal } from "./reveal";

const { skills } = site;

/** Toolkit grid and "How I work" steps. Static, so rendered on the server. */
export function SkillsToolkit() {
  return (
    <Reveal as="div">
      {/* Toolkit: the rest of the skills from the CV. */}
      <p data-reveal="fade" className="mt-20 font-mono text-[11px] tracking-[0.14em] text-muted">
        {skills.toolkitLabel}
      </p>
      <div className="mt-6 grid gap-px overflow-hidden rounded-[14px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {skills.toolkit.map((group) => (
          <div key={group.title} data-reveal="fade" className="bg-surface p-6">
            <h3 className="font-display text-2xl leading-tight">{group.title}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {group.items.map((item) => {
                const logo = "logo" in item ? chipLogos[item.logo] : undefined;
                return (
                  <li
                    key={item.name}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-bg px-3 py-1.5 text-[14px] text-ink"
                  >
                    {logo && (
                      <span style={{ color: logo.color }}>
                        <LogoMark logo={logo} className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {item.name}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* How I work: four steps. */}
      <p data-reveal="fade" className="mt-20 font-mono text-[11px] tracking-[0.14em] text-muted">
        {skills.processLabel}
      </p>
      <ol className="mt-6 grid gap-8 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
        {skills.process.map((step, i) => (
          <li key={step.title} data-reveal="fade">
            <span className="font-display text-5xl leading-none text-accent-display italic">0{i + 1}.</span>
            <h3 className="mt-4 font-display text-2xl leading-tight">{step.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/75">{step.body}</p>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
