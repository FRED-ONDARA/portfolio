import { site } from "@/content/site";

const { marquee } = site;

/** A slow, endless band of tools under the hero. Pauses on hover; static with reduced motion. */
export function Marquee() {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={hidden || undefined}>
      {marquee.items.map((item) => (
        <li key={item} className="flex items-center gap-10 whitespace-nowrap">
          <span className="font-display text-[clamp(1.25rem,2vw,1.75rem)] text-ink/80">{item}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label={marquee.label} className="border-y border-line py-6">
      <p className="mx-auto mb-4 w-full max-w-[1440px] px-4 font-mono text-[11px] tracking-[0.14em] text-muted sm:px-6 md:px-10">
        {marquee.label}
      </p>
      <div className="marquee group flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="marquee-track flex group-hover:[animation-play-state:paused]">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  );
}
