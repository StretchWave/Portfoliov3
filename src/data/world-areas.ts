import type { WorldAreaId } from "@/types/portfolio";
import { getAllAreaScenes } from "./scenes";

export interface WorldAreaInfo {
  id: WorldAreaId;
  name: string;
  categoryTitle: string;
  description: string;
  accent: string;
}

/**
 * World Area registry derived from canonical scene definitions.
 * Maintains backwards compatibility for conventional components while ensuring
 * single source of truth from scene metadata.
 */
export const WORLD_AREAS: Record<WorldAreaId, WorldAreaInfo> = Object.fromEntries(
  getAllAreaScenes().map((scene) => [
    scene.id,
    {
      id: scene.id,
      name: scene.metadata.name,
      categoryTitle: scene.metadata.categoryTitle,
      description: scene.metadata.description,
      accent: scene.metadata.accent,
    },
  ]),
) as Record<WorldAreaId, WorldAreaInfo>;
