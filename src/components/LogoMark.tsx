import type { LogoShape } from "@/content/logos";

export function LogoMark({ logo, className = "" }: { logo: LogoShape; className?: string }) {
  return (
    <svg viewBox={logo.viewBox} className={className} aria-hidden fill="currentColor">
      <path d={logo.path} />
    </svg>
  );
}
