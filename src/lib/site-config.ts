/**
 * Single source of truth for Project Atlas site identity, canonical URLs,
 * and deployment metadata.
 */
export const SITE_CONFIG = {
  name: "Project Atlas",
  author: "Mishal",
  title: "Project Atlas — Interactive Engineering Portfolio",
  description:
    "Interactive engineering portfolio and systems index showcasing architecture, systems engineering, and interactive 3D computing.",
  url: "https://stretchwave.github.io/Atlas",
  github: "https://github.com/StretchWave",
  repoUrl: "https://github.com/StretchWave/Portfoliov3",
} as const;

export function getCanonicalSiteUrl(path = ""): string {
  if (!path) return SITE_CONFIG.url;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_CONFIG.url}${cleanPath}`;
}
