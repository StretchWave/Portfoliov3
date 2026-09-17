import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_CONFIG.name} | ${SITE_CONFIG.author}`,
    short_name: "Atlas",
    description: SITE_CONFIG.description,
    start_url: "/",
    display: "standalone",
    background_color: "#07111f",
    theme_color: "#07111f",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
