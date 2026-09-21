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
    (AREA_VARIABLE_NAMES as Record<string, string>)[area.id] ??
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

/**
 * Serializes an AppContent definition into clean TypeScript code matching
 * src/data/app-content.ts.
 */
export function serializeAppContent(content: import("@/types/content").AppContent): string {
  const serialized = JSON.stringify(content, null, 2);

  return `import type { AppContent } from "@/types/content";

/**
 * Single Canonical Source of Truth for Project Atlas App Content.
 *
 * Persisted and authored via Atlas Studio (/studio) and consumed across
 * homepage, about page, layout metadata, openGraph, and JSON-LD.
 */
export const defaultAppContent: AppContent = ${serialized};
`;
}

/**
 * Serializes a WorldManifest into clean TypeScript code matching
 * src/data/scenes/manifest.ts.
 */
export function serializeWorldManifest(manifest: import("@/types/scene").WorldManifest): string {
  const serialized = JSON.stringify(manifest, null, 2);

  return `import type { WorldManifest } from "@/types/scene";

/**
 * Canonical World Manifest for Project Atlas.
 *
 * Defines registered areas, default active area, area display order,
 * room registrations, and default room entry points.
 * Studio and runtime read from this single source of truth.
 */
export const defaultWorldManifest: WorldManifest = ${serialized};
`;
}

