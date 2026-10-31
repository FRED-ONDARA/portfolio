// Routes an image through Next's optimizer so 3D textures download as compressed
// WebP/AVIF (alpha preserved) instead of the full PNG. 750px covers every cutout
// at its native size; 75 is the default allowed quality.
export function optimizedImage(src: string, width = 750) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
}
