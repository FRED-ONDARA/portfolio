import type { FocusId, ProjectSlug } from "@/content/site";
import type { ResolvedImage } from "@/lib/images";

// Plain data describing what a section's 3D slot shows. Keeps three.js out of section bundles.
export type VisualSpec =
  | { kind: "hero"; figure: ResolvedImage }
  | { kind: "about"; figure: ResolvedImage }
  | { kind: "focus"; figures: Record<FocusId, ResolvedImage>; active: FocusId }
  | { kind: "project"; slug: ProjectSlug; screenshot?: string }
  | { kind: "contact"; figure: ResolvedImage };
