import type { WorldAreaId } from "@/types/portfolio";
import type { AreaSceneDefinition, AtlasSceneDefinition, EnvironmentConfig } from "@/types/scene";

import { atlasHubScene } from "./atlas-hub";
import { creativeWorkshopScene } from "./creative-workshop";
import { defaultEnvironmentConfig } from "./environment";
import { intelligenceObservatoryScene } from "./intelligence-observatory";
import { softwareDistrictScene } from "./software-district";

export { atlasHubScene } from "./atlas-hub";
export { creativeWorkshopScene } from "./creative-workshop";
export { defaultEnvironmentConfig } from "./environment";
export { intelligenceObservatoryScene } from "./intelligence-observatory";
export { softwareDistrictScene } from "./software-district";

const areaScenes: Record<WorldAreaId, AreaSceneDefinition> = {
  "atlas-hub": atlasHubScene,
  "software-district": softwareDistrictScene,
  "intelligence-observatory": intelligenceObservatoryScene,
  "creative-workshop": creativeWorkshopScene,
};

/**
 * Retrieve the canonical scene definition for a world area.
 */
export function getAreaScene(areaId: WorldAreaId): AreaSceneDefinition {
  const scene = areaScenes[areaId];
  if (!scene) {
    throw new Error(`[scenes] Area scene "${areaId}" not found in scene registry.`);
  }
  return scene;
}

/**
 * Retrieve all registered area scene definitions.
 */
export function getAllAreaScenes(): readonly AreaSceneDefinition[] {
  return Object.values(areaScenes);
}

/**
 * Retrieve the global environment configuration.
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  return defaultEnvironmentConfig;
}

/**
 * Construct the default full Atlas scene document containing all registered areas.
 */
export function getDefaultAtlasScene(): AtlasSceneDefinition {
  return {
    version: 1,
    environment: defaultEnvironmentConfig,
    areas: {
      "atlas-hub": atlasHubScene,
      "software-district": softwareDistrictScene,
      "intelligence-observatory": intelligenceObservatoryScene,
      "creative-workshop": creativeWorkshopScene,
    },
  };
}
