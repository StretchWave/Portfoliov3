#!/usr/bin/env tsx

/**
 * Scene JSON to TypeScript Converter.
 * Reads an exported Atlas scene JSON snapshot and generates/updates
 * typed TypeScript source files in src/data/scenes/.
 *
 * Usage:
 *   npx tsx scripts/scene-to-ts.ts <path-to-atlas-scene.json>
 */

import fs from "node:fs";
import path from "node:path";
import { validateScene } from "../src/lib/scene-validation";
import type { AreaSceneDefinition, AtlasSceneDefinition, EnvironmentConfig } from "../src/types/scene";

const inputFile = process.argv[2];

if (!inputFile) {
  console.error("Usage: npx tsx scripts/scene-to-ts.ts <path-to-scene.json>");
  process.exit(1);
}

const resolvedPath = path.resolve(process.cwd(), inputFile);
if (!fs.existsSync(resolvedPath)) {
  console.error(`Error: File not found: ${resolvedPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(resolvedPath, "utf-8");
let scene: AtlasSceneDefinition;

try {
  scene = JSON.parse(raw);
} catch (e) {
  console.error("Error: Failed to parse JSON:", e);
  process.exit(1);
}

const validation = validateScene(scene);
const fatalErrors = validation.errors.filter((e) => e.severity === "error");

if (fatalErrors.length > 0) {
  console.error(`Validation failed with ${fatalErrors.length} fatal error(s):`);
  for (const err of fatalErrors) {
    console.error(`  [${err.code}] ${err.areaId ? `(${err.areaId}) ` : ""}${err.message}`);
  }
  process.exit(1);
}

const scenesDir = path.resolve(process.cwd(), "src/data/scenes");

// 1. Generate environment.ts
function generateEnvironmentTS(env: EnvironmentConfig): string {
  return `import type { EnvironmentConfig } from "@/types/scene";

/**
 * Global default environment configuration for Project Atlas.
 * Generated from Atlas Studio scene snapshot.
 */
export const defaultEnvironmentConfig: EnvironmentConfig = ${JSON.stringify(env, null, 2)} as const satisfies EnvironmentConfig;
`;
}

// 2. Generate area scene ts
function generateAreaTS(area: AreaSceneDefinition, varName: string): string {
  return `import type { AreaSceneDefinition } from "@/types/scene";

/**
 * ${area.metadata.name} Scene Definition.
 * Generated from Atlas Studio scene snapshot.
 */
export const ${varName}: AreaSceneDefinition = ${JSON.stringify(area, null, 2)} as const satisfies AreaSceneDefinition;
`;
}

if (scene.environment) {
  const envPath = path.join(scenesDir, "environment.ts");
  fs.writeFileSync(envPath, generateEnvironmentTS(scene.environment), "utf-8");
  console.log(`✔ Updated: ${envPath}`);
}

const AREA_VAR_NAMES: Record<string, string> = {
  "atlas-hub": "atlasHubScene",
  "software-district": "softwareDistrictScene",
  "intelligence-observatory": "intelligenceObservatoryScene",
  "creative-workshop": "creativeWorkshopScene",
};

for (const [areaId, areaData] of Object.entries(scene.areas)) {
  if (!areaData) continue;
  const varName = AREA_VAR_NAMES[areaId] ?? `${areaId.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}Scene`;
  const filePath = path.join(scenesDir, `${areaId}.ts`);
  fs.writeFileSync(filePath, generateAreaTS(areaData, varName), "utf-8");
  console.log(`✔ Updated: ${filePath}`);
}

console.log("\nAll scene data files successfully written from JSON snapshot.");
