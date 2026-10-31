// Canonical URL for metadata, sitemap and robots. Vercel sets VERCEL_PROJECT_PRODUCTION_URL;
// set NEXT_PUBLIC_SITE_URL to override (e.g. a custom domain).
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
