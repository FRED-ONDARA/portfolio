import "server-only";
import fs from "node:fs";
import path from "node:path";
import { cutouts, placeholderFigure, projectScreenshotDir, type CutoutKey } from "@/content/images";
import { site, type ProjectSlug } from "@/content/site";

export type ResolvedImage = { src: string; alt: string };
export type ResolvedImages = {
  cutouts: Record<CutoutKey, ResolvedImage>;
  screenshots: Partial<Record<ProjectSlug, string>>;
};

const publicDir = path.join(process.cwd(), "public");
const exists = (src: string) => fs.existsSync(path.join(publicDir, src));

// Resolved at build time: missing cutouts reuse hero.png, and a missing hero.png
// uses the placeholder silhouette. TODO: replace the placeholder with a real hero.png.
export function resolveImages(): ResolvedImages {
  const heroSrc = exists(cutouts.hero.src) ? cutouts.hero.src : placeholderFigure;

  const resolved = Object.fromEntries(
    (Object.keys(cutouts) as CutoutKey[]).map((key) => {
      const { src, alt } = cutouts[key];
      return [key, { src: exists(src) ? src : heroSrc, alt }];
    }),
  ) as Record<CutoutKey, ResolvedImage>;

  const screenshots: Partial<Record<ProjectSlug, string>> = {};
  for (const { slug } of site.projects.items) {
    const src = `${projectScreenshotDir}/${slug}.png`;
    if (exists(src)) screenshots[slug] = src;
  }

  return { cutouts: resolved, screenshots };
}
