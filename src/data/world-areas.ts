import type { WorldAreaId } from "@/types/portfolio";

export interface WorldAreaInfo {
  id: WorldAreaId;
  name: string;
  categoryTitle: string;
  description: string;
  accent: string;
}

export const WORLD_AREAS: Record<WorldAreaId, WorldAreaInfo> = {
  "atlas-hub": {
    id: "atlas-hub",
    name: "Atlas Central Hub",
    categoryTitle: "Systems Exhibition Hall",
    description: "The primary reference environment showcasing core flagship projects and district portals.",
    accent: "#68e4ff",
  },
  "software-district": {
    id: "software-district",
    name: "Software Systems District",
    categoryTitle: "Server Lab & Architecture",
    description: "Desktop platforms, audio DSP visualizers, automation tooling, and deterministic policy engines.",
    accent: "#38bdf8",
  },
  "intelligence-observatory": {
    id: "intelligence-observatory",
    name: "Intelligent Systems Observatory",
    categoryTitle: "Decision-Support & Telemetry",
    description: "Large-scale geospatial flood risk modeling, data pipelines, and predictive analytics.",
    accent: "#818cf8",
  },
  "creative-workshop": {
    id: "creative-workshop",
    name: "Creative & Interactive Workshop",
    categoryTitle: "Interaction Arena & Mechanics",
    description: "Combat timing mechanics, mobile client streaming, and browser-native experimentation.",
    accent: "#f472d0",
  },
};
