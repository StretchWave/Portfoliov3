import { defaultAppContent } from "@/data/app-content";

/**
 * Single source of truth for Project Atlas site identity, canonical URLs,
 * and deployment metadata.
 *
 * Derived canonically from defaultAppContent, editable via Atlas Studio (/studio).
 */
export const SITE_CONFIG = {
  name: defaultAppContent.identity.siteName,
  author: defaultAppContent.identity.author,
  title: defaultAppContent.identity.browserTitle,
  description: defaultAppContent.identity.description,
  url: "https://stretchwave.github.io/Atlas",
  github: defaultAppContent.social.github || "https://github.com/StretchWave",
  repoUrl: "https://github.com/StretchWave/Portfoliov3",
} as const;


export function getCanonicalSiteUrl(path = ""): string {
  if (!path) return SITE_CONFIG.url;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_CONFIG.url}${cleanPath}`;
}
