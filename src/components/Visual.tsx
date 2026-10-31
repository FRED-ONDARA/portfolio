"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useIsMobile, useReducedMotion, useWebGL } from "@/lib/hooks";
import { interactedStore, loaderDoneStore, useStore } from "@/lib/store";
import { toolLogos } from "@/content/logos";
import { site } from "@/content/site";
import type { VisualSpec } from "./visual-spec";

const ViewSlot = dynamic(() => import("./three/ViewSlot"), { ssr: false });

// The slot wrapper carries the accessible label, so the image itself is decorative.
function StaticFigure({ src, priority }: { src: string; priority?: boolean }) {
  return (
    <div className="absolute inset-[10%_8%]">
      <Image
        src={src}
        alt=""
        fill
        {...(priority ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
        sizes="(min-width: 768px) 45vw, 90vw"
        className="figure-fallback object-contain"
      />
    </div>
  );
}

// Static stand-ins for the generated project visuals (no WebGL / still loading).
function StaticProject({ slug }: { slug: string }) {
  const stroke = "var(--muted)";
  return (
    <svg viewBox="0 0 200 150" className="figure-fallback absolute inset-[12%] h-[76%] w-[76%]" aria-hidden>
      {slug === "globyx" && (
        <g fill="none" stroke={stroke} strokeWidth="1">
          <circle cx="100" cy="75" r="50" />
          <ellipse cx="100" cy="75" rx="22" ry="50" />
          <ellipse cx="100" cy="75" rx="50" ry="18" />
          <path d="M70 60 Q100 20 135 55" stroke="var(--accent)" strokeWidth="2" />
          <circle cx="70" cy="60" r="3" fill="var(--accent)" stroke="none" />
        </g>
      )}
      {slug === "matlab-coppeliasim" && (
        <g fill="none" stroke="var(--accent)" strokeWidth="2">
          <path d="M30 100 C 50 40, 120 30, 170 70 S 90 140, 30 100" />
          <rect x="120" y="40" width="22" height="16" rx="4" fill="var(--ink)" stroke="none" />
        </g>
      )}
      {slug === "hiwonder-arms" && (
        <g fill="none" stroke="var(--ink)" strokeWidth="6" strokeLinecap="round">
          <path d="M80 130 L90 80 L130 55 L145 70" />
          <circle cx="90" cy="80" r="5" fill="var(--accent)" stroke="none" />
          <rect x="60" y="128" width="50" height="8" rx="3" fill="var(--ink)" stroke="none" />
        </g>
      )}
      {slug === "terminal-bench-3" && (
        <g>
          <rect x="20" y="25" width="160" height="100" rx="10" fill="#151517" />
          <text x="34" y="62" fill="#f5f3ef" fontSize="10" fontFamily="monospace">
            $ terminal-bench run
          </text>
          <rect x="34" y="72" width="7" height="12" fill="var(--accent)" />
        </g>
      )}
    </svg>
  );
}

function Fallback({ spec, priority }: { spec: VisualSpec; priority?: boolean }) {
  switch (spec.kind) {
    case "focus": {
      return <StaticFigure src={spec.figures[spec.active].src} />;
    }
    case "tools": {
      const tool = site.skills.ai.find((t) => t.id === spec.active) ?? site.skills.ai[0];
      const logo = toolLogos[tool.logo];
      const dark = logo.color === "#0C0C0D" || logo.color === "#191919";
      return (
        <svg
          viewBox={logo.viewBox}
          className="figure-fallback absolute inset-[30%] h-[40%] w-[40%]"
          style={{ color: dark ? "var(--ink)" : logo.color }}
          fill="currentColor"
          aria-hidden
        >
          <path d={logo.path} />
        </svg>
      );
    }
    case "project":
      return spec.screenshot ? (
        <Image
          src={spec.screenshot}
          alt=""
          fill
          sizes="(min-width: 768px) 45vw, 90vw"
          className="object-contain p-[8%]"
        />
      ) : (
        <StaticProject slug={spec.slug} />
      );
    default:
      return <StaticFigure src={spec.figure.src} priority={priority} />;
  }
}

function labelFor(spec: VisualSpec) {
  switch (spec.kind) {
    case "focus":
      return spec.figures[spec.active].alt;
    case "project":
      return undefined;
    case "tools": {
      const tool = site.skills.ai.find((t) => t.id === spec.active) ?? site.skills.ai[0];
      return `${tool.name} logo`;
    }
    default:
      return spec.figure.alt;
  }
}

/**
 * A section's visual slot. Shows a static image until the shared 3D canvas is ready,
 * then the 3D scene takes over. Without WebGL the static image stays.
 */
export function Visual({
  spec,
  className = "",
  priority,
}: {
  spec: VisualSpec;
  className?: string;
  priority?: boolean;
}) {
  const webgl = useWebGL();
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const loaded = useStore(loaderDoneStore, false);
  const interacted = useStore(interactedStore, false);
  const [ready, setReady] = useState(false);
  const [near, setNear] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const label = labelFor(spec);
  const use3D = webgl && loaded && interacted && near;

  // Build this slot's 3D scene only once it approaches the viewport; keep it after that.
  useEffect(() => {
    const el = box.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "60% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  return (
    <div ref={box} className={`relative ${className}`} role={label ? "img" : undefined} aria-label={label}>
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: use3D && ready ? 0 : 1 }}
        aria-hidden={use3D && ready}
      >
        <Fallback spec={spec} priority={priority} />
      </div>
      {use3D && <ViewSlot spec={spec} reduced={reduced} mobile={mobile} onReady={() => setReady(true)} />}
    </div>
  );
}
