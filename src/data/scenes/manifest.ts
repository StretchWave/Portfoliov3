import type { WorldManifest } from "@/types/scene";

/**
 * Canonical World Manifest for Project Atlas.
 *
 * Defines registered areas, default active area, area display order,
 * room registrations, and default room entry points.
 * Studio and runtime read from this single source of truth.
 */
export const defaultWorldManifest: WorldManifest = {
  version: 1,
  defaultAreaId: "atlas-hub",
  areaOrder: [
    "atlas-hub",
    "software-district",
    "intelligence-observatory",
    "creative-workshop",
  ],
  areas: {
    "atlas-hub": {
      id: "atlas-hub",
      name: "Atlas Central Hub",
      categoryTitle: "Interactive Exhibition Nexus",
      description: "Central exhibition rotunda and district transit nexus.",
      accent: "#68e4ff",
      rooms: [{ id: "main-hall", name: "Main Exhibition Rotunda", isDefault: true }],
      defaultRoomId: "main-hall",
    },
    "software-district": {
      id: "software-district",
      name: "Software Systems District",
      categoryTitle: "Architecture & Native Platforms",
      description: "Desktop platforms, media pipelines, and systems tooling.",
      accent: "#38bdf8",
      rooms: [{ id: "main-floor", name: "Systems Development Deck", isDefault: true }],
      defaultRoomId: "main-floor",
    },
    "intelligence-observatory": {
      id: "intelligence-observatory",
      name: "Intelligence Observatory",
      categoryTitle: "Data & Telemetry Deck",
      description: "Geospatial risk modeling and predictive analytics observation platform.",
      accent: "#a78bfa",
      rooms: [{ id: "observation-deck", name: "Analytics Observation Platform", isDefault: true }],
      defaultRoomId: "observation-deck",
    },
    "creative-workshop": {
      id: "creative-workshop",
      name: "Creative Workshop",
      categoryTitle: "Game Mechanics & Interactive Tools",
      description: "Combat timing trainers, audio DSP, and procedural environments arena.",
      accent: "#f59e0b",
      rooms: [{ id: "workshop-floor", name: "Mechanics Arena & Lab", isDefault: true }],
      defaultRoomId: "workshop-floor",
    },
  },
};
