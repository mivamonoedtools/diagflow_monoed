/** Default meta / OG / JSON-LD description for the product. */
export const SITE_DESCRIPTION =
  "Describe any process in plain English and get a clean flowchart, sequence diagram, Gantt chart, or other Mermaid diagram in seconds. Export 2× PNG for Word and slides, or SVG for crisp editing.";

/** Diagflow production host (set `NEXT_PUBLIC_APP_URL` / `BETTER_AUTH_URL` to this on deploy). */
export const DIAGFLOW_PRODUCTION_ORIGIN = "https://diagflow.monoed.africa";

/**
 * Public site origin for metadata, sitemap, robots, and JSON-LD (no trailing slash).
 * In production, set `NEXT_PUBLIC_APP_URL=https://diagflow.monoed.africa` (and align Better Auth).
 */
export function getSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    return DIAGFLOW_PRODUCTION_ORIGIN;
  }

  return "http://localhost:3000";
}

export function getMetadataBase(): URL {
  return new URL(`${getSiteOrigin()}/`);
}
