// Image mappings. Files live in /public/images/.
// To use a new cutout: drop the PNG into /public/images/ and point a key at it here.
// Missing files fall back to hero.png, then to a placeholder silhouette (see src/lib/images.ts).

export const cutouts = {
  hero: { src: "/images/hero.png", alt: "Fredrick Ondara in a white shirt, hands in pockets" },
  about: { src: "/images/about.png", alt: "Fredrick Ondara laughing, wearing a yellow tee and backpack" },
  "focus-telecom": { src: "/images/focus-telecom.png", alt: "Fredrick Ondara in a pink tee" },
  "focus-robotics": { src: "/images/focus-robotics.png", alt: "Fredrick Ondara in an orange tee with headphones" },
  "focus-web": { src: "/images/focus-web.png", alt: "Fredrick Ondara in a red plaid shirt" },
  contact: { src: "/images/contact.png", alt: "Fredrick Ondara with palms pressed together in greeting" },
} as const;

export type CutoutKey = keyof typeof cutouts;

// Optional real screenshots: /public/images/projects/<slug>.png replaces the generated 3D visual.
export const projectScreenshotDir = "/images/projects";

export const placeholderFigure = "/images/placeholder-figure.png";
