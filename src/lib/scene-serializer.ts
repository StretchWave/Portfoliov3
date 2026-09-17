import type { WorldAreaId } from "@/types/portfolio";
import type { AreaSceneDefinition, EnvironmentConfig } from "@/types/scene";

export const AREA_VARIABLE_NAMES: Record<WorldAreaId, string> = {
  "atlas-hub": "atlasHubScene",
  "software-district": "softwareDistrictScene",
  "intelligence-observatory": "intelligenceObservatoryScene",
  "creative-workshop": "creativeWorkshopScene",
};

/**
 * Serializes an AreaSceneDefinition into clean TypeScript code matching
 * the canonical source format in src/data/scenes/*.ts.
 */
export function serializeAreaScene(area: AreaSceneDefinition, varName?: string): string {
  const variableName =
    varName ??
    AREA_VARIABLE_NAMES[area.id] ??
    `${area.id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}Scene`;
  const name = area.metadata?.name ?? area.id;

  const serialized = JSON.stringify(area, null, 2);

  return `import type { AreaSceneDefinition } from "@/types/scene";

/**
 * ${name} Scene Definition.
 * Canonical data representation.
 */
export const ${variableName}: AreaSceneDefinition = ${serialized};
`;
}

/**
 * Serializes an EnvironmentConfig into clean TypeScript code matching
 * src/data/scenes/environment.ts.
 */
export function serializeEnvironmentConfig(env: EnvironmentConfig): string {
  const serialized = JSON.stringify(env, null, 2);

  return `import type { EnvironmentConfig } from "@/types/scene";

/**
 * Global default environment configuration for Project Atlas.
 * Defines background, fog, lighting, ground plane, and grid parameters.
 */
export const defaultEnvironmentConfig: EnvironmentConfig = ${serialized} as const satisfies EnvironmentConfig;
`;
}
