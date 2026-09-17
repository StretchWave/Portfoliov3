import type { MetadataRoute } from "next";
import { getAllProjects } from "@/features/portfolio/project-registry";
import { SITE_CONFIG, getCanonicalSiteUrl } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getAllProjects();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_CONFIG.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: getCanonicalSiteUrl("/about"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: getCanonicalSiteUrl("/projects"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: getCanonicalSiteUrl("/skills"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: getCanonicalSiteUrl("/sandbox"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: getCanonicalSiteUrl("/resume"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: getCanonicalSiteUrl("/interactive"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.85,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: getCanonicalSiteUrl(`/projects/${project.slug}`),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: project.featured ? 0.8 : 0.6,
  }));

  return [...staticRoutes, ...projectRoutes];
}
