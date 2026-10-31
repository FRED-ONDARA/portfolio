import type { ComponentProps } from "react";

type ButtonProps = {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  className?: string;
} & (
  | ({ href: string } & Omit<ComponentProps<"a">, "className" | "children">)
  | ({ href?: undefined } & Omit<ComponentProps<"button">, "className" | "children">)
);

const base =
  "group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full px-6 font-mono text-[12px] font-medium uppercase tracking-[0.08em] transition-colors duration-500";
const variants = {
  primary: "bg-accent text-on-accent",
  secondary: "border border-ink/80 text-ink hover:text-bg",
};
const fills = {
  primary: "bg-ink",
  secondary: "bg-ink",
};

/** Uppercase pill button with a fill that rises on hover. */
export function Button({ variant = "primary", children, className = "", ...props }: ButtonProps) {
  const inner = (
    <>
      <span
        aria-hidden
        className={`absolute inset-0 translate-y-full rounded-full transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:translate-y-0 ${fills[variant]}`}
      />
      <span
        className={`relative z-10 inline-flex items-center gap-2 ${variant === "primary" ? "group-hover:text-bg" : ""} transition-colors duration-500`}
      >
        {children}
      </span>
    </>
  );
  const cls = `${base} ${variants[variant]} ${className}`;
  if ("href" in props && props.href !== undefined) {
    return (
      <a className={cls} {...(props as ComponentProps<"a">)}>
        {inner}
      </a>
    );
  }
  return (
    <button className={cls} {...(props as ComponentProps<"button">)}>
      {inner}
    </button>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`h-3.5 w-3.5 ${className}`}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M4 12 12 4M5.5 4H12v6.5" />
    </svg>
  );
}

/** Numbered section label with a hairline, e.g. "01 — ABOUT". */
export function SectionLabel({ number, label }: { number: string; label: string }) {
  return (
    <div
      data-reveal="fade"
      className="flex items-center gap-4 font-mono text-[12px] uppercase tracking-[0.12em] text-muted"
    >
      <span className="text-accent-text">{number}</span>
      <span className="h-px w-10 bg-line" />
      <span>{label}</span>
    </div>
  );
}

export const container = "mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-10";
