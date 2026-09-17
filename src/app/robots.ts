import type { MetadataRoute } from "next";
import { SITE_CONFIG, getCanonicalSiteUrl } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: getCanonicalSiteUrl("/sitemap.xml"),
  };
}
