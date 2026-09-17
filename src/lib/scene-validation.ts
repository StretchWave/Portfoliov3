/**
 * Scene validation for Project Atlas.
 *
 * Pure logic with no React or Three.js imports. Validates an AtlasSceneDefinition
 * for structural integrity, referential consistency, and safe value ranges.
 */

import { worldAreaIds } from "@/types/portfolio";
import type { WorldAreaId } from "@/types/portfolio";
import { registeredProjects } from "@/data/projects";
import type {
  AtlasSceneDefinition,
  AreaSceneDefinition,
  SceneObject,
  EnvironmentConfig,
  AreaBounds,
  SpawnConfig,
  Vec3,
  PointLightObject,
  PortalObject,
  ArchitectureObject,
} from "@/types/scene";

// ─── Validation Result ───────────────────────────────────────────────────────

export interface ValidationError {
  severity: "error" | "warning";
  /** The scene object ID that caused the error, if applicable. */
  objectId?: string;
  /** The area ID where the error occurred, if applicable. */
  areaId?: string;
  /** The specific field that is invalid, if applicable. */
  field?: string;
  /** A human-readable error message. */
  message: string;
  /** A stable machine-readable error code for filtering/grouping. */
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: readonly ValidationError[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const HEX_COLOR_RE = /^#[0-9a-fA-F]{3,8}$/;
const validAreaIdSet = new Set<string>(worldAreaIds);

function isValidColor(value: unknown): boolean {
  return typeof value === "string" && HEX_COLOR_RE.test(value);
}

function isFinitePositive(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isFiniteNumber(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value);
}

function isVec3(value: unknown): value is Vec3 {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((v) => typeof v === "number" && Number.isFinite(v))
  );
}

function isValidAreaId(value: unknown): value is WorldAreaId {
  return typeof value === "string" && validAreaIdSet.has(value);
}

// ─── Object Validators ──────────────────────────────────────────────────────

function validatePointLight(obj: PointLightObject, errors: ValidationError[], areaId: string): void {
  if (!isVec3(obj.transform?.position)) {
    errors.push({ severity: "error", objectId: obj.id, areaId, field: "transform.position", message: `Point light "${obj.id}" has invalid position.`, code: "INVALID_POSITION" });
  }
  if (!isValidColor(obj.color)) {
    errors.push({ severity: "error", objectId: obj.id, areaId, field: "color", message: `Point light "${obj.id}" has invalid color "${obj.color}".`, code: "INVALID_COLOR" });
  }
  if (!isFinitePositive(obj.intensity)) {
    errors.push({ severity: "error", objectId: obj.id, areaId, field: "intensity", message: `Point light "${obj.id}" has invalid intensity.`, code: "INVALID_INTENSITY" });
  }
  if (!isFinitePositive(obj.distance)) {
    errors.push({ severity: "error", objectId: obj.id, areaId, field: "distance", message: `Point light "${obj.id}" has invalid distance.`, code: "INVALID_DISTANCE" });
  }
}

function validatePortal(obj: PortalObject, errors: ValidationError[], areaId: string): void {
  if (!isVec3(obj.transform?.position)) {
    errors.push({ severity: "error", objectId: obj.id, areaId, field: "transform.position", message: `Portal "${obj.id}" has invalid position.`, code: "INVALID_POSITION" });
  }
  if (!isValidAreaId(obj.targetArea)) {
    errors.push({ severity: "error", objectId: obj.id, areaId, field: "targetArea", message: `Portal "${obj.id}" references invalid area "${obj.targetArea}".`, code: "INVALID_PORTAL_TARGET" });
  }
  if (!obj.targetLabel || typeof obj.targetLabel !== "string") {
    errors.push({ severity: "error", objectId: obj.id, areaId, field: "targetLabel", message: `Portal "${obj.id}" is missing targetLabel.`, code: "MISSING_REQUIRED_FIELD" });
  }
  if (!isValidColor(obj.accent)) {
    errors.push({ severity: "error", objectId: obj.id, areaId, field: "accent", message: `Portal "${obj.id}" has invalid accent color.`, code: "INVALID_COLOR" });
  }
  if (obj.interactionRange !== undefined && !isFinitePositive(obj.interactionRange)) {
    errors.push({ severity: "warning", objectId: obj.id, areaId, field: "interactionRange", message: `Portal "${obj.id}" has invalid interaction range.`, code: "INVALID_RANGE" });
  }
}

function validateArchitecture(obj: ArchitectureObject, errors: ValidationError[], areaId: string): void {
  if (!isVec3(obj.transform?.position)) {
    errors.push({ severity: "error", objectId: obj.id, areaId, field: "transform.position", message: `Architecture object "${obj.id}" has invalid position.`, code: "INVALID_POSITION" });
  }
  const validModuleTypes = ["wall-segment", "column", "frame-rib", "ceiling-panel-light", "light-ribbon", "mesh-primitive"];
  if (!validModuleTypes.includes(obj.moduleType)) {
    errors.push({ severity: "error", objectId: obj.id, areaId, field: "moduleType", message: `Architecture object "${obj.id}" has unknown module type "${obj.moduleType}".`, code: "INVALID_MODULE_TYPE" });
  }
}

function validateSceneObject(obj: SceneObject, errors: ValidationError[], areaId: string): void {
  // Common: all objects must have a non-empty string ID
  if (!obj.id || typeof obj.id !== "string" || obj.id.trim().length === 0) {
    errors.push({ severity: "error", objectId: obj.id ?? "(missing)", areaId, field: "id", message: "Scene object has empty or missing ID.", code: "MISSING_ID" });
    return; // Cannot validate further without an ID
  }

  switch (obj.type) {
    case "point-light":
      validatePointLight(obj, errors, areaId);
      break;
    case "portal":
      validatePortal(obj, errors, areaId);
      break;
    case "architecture":
      validateArchitecture(obj, errors, areaId);
      break;
    case "decoration":
    case "teleport-point":
    case "trigger-volume":
    case "audio-source":
    case "info-display":
      if (!isVec3(obj.transform?.position)) {
        errors.push({
          severity: "error",
          objectId: obj.id,
          areaId,
          field: "transform.position",
          message: `${obj.type} "${obj.id}" has invalid position.`,
          code: "INVALID_POSITION",
        });
      }
      break;
    default:
      errors.push({
        severity: "warning",
        objectId: (obj as SceneObject).id,
        areaId,
        field: "type",
        message: `Unknown scene object type "${(obj as SceneObject).type}".`,
        code: "UNKNOWN_OBJECT_TYPE",
      });
  }

  // Validate interaction definition if present
  if (obj.interaction && obj.interaction.enabled) {
    const inter = obj.interaction;
    const validTriggers = [
      "click",
      "double-click",
      "hover",
      "hover-enter",
      "hover-exit",
      "proximity",
      "proximity-enter",
      "proximity-exit",
      "interact-key",
      "tap",
    ];
    if (inter.trigger && !validTriggers.includes(inter.trigger)) {
      errors.push({
        severity: "warning",
        objectId: obj.id,
        areaId,
        field: "interaction.trigger",
        message: `Object "${obj.id}" has unknown interaction trigger "${inter.trigger}".`,
        code: "INVALID_INTERACTION_TRIGGER",
      });
    }

    if (Array.isArray(inter.actions)) {
      inter.actions.forEach((act, idx) => {
        if (act.type === "show-project") {
          if (!act.projectId) {
            errors.push({
              severity: "error",
              objectId: obj.id,
              areaId,
              field: `interaction.actions[${idx}].projectId`,
              message: `Object "${obj.id}" action "show-project" is missing projectId.`,
              code: "MISSING_REQUIRED_FIELD",
            });
          } else {
            const knownProjects = new Set(registeredProjects.map((p) => p.id));
            if (!knownProjects.has(act.projectId)) {
              errors.push({
                severity: "error",
                objectId: obj.id,
                areaId,
                field: `interaction.actions[${idx}].projectId`,
                message: `Object "${obj.id}" references unknown project "${act.projectId}".`,
                code: "UNKNOWN_PROJECT_REFERENCE",
              });
            }
          }
        }
        if (act.type === "teleport-player" && !act.teleportPointId && !act.targetArea) {
          errors.push({
            severity: "error",
            objectId: obj.id,
            areaId,
            field: `interaction.actions[${idx}]`,
            message: `Object "${obj.id}" teleport action requires targetArea or teleportPointId.`,
            code: "MISSING_REQUIRED_FIELD",
          });
        }
        if (act.type === "open-district" && act.targetArea && !isValidAreaId(act.targetArea)) {
          errors.push({
            severity: "error",
            objectId: obj.id,
            areaId,
            field: `interaction.actions[${idx}].targetArea`,
            message: `Object "${obj.id}" action references invalid district "${act.targetArea}".`,
            code: "INVALID_PORTAL_TARGET",
          });
        }
      });
    }
  }
}

// ─── Area Validators ────────────────────────────────────────────────────────

function validateBounds(bounds: AreaBounds, errors: ValidationError[], areaId: string): void {
  if (!isFiniteNumber(bounds.minX) || !isFiniteNumber(bounds.maxX) || !isFiniteNumber(bounds.minZ) || !isFiniteNumber(bounds.maxZ)) {
    errors.push({ severity: "error", areaId, field: "bounds", message: `Area "${areaId}" has non-finite bound values.`, code: "INVALID_BOUNDS" });
    return;
  }
  if (bounds.minX >= bounds.maxX) {
    errors.push({ severity: "error", areaId, field: "bounds", message: `Area "${areaId}" has invalid X bounds: minX (${bounds.minX}) >= maxX (${bounds.maxX}).`, code: "INVALID_BOUNDS" });
  }
  if (bounds.minZ >= bounds.maxZ) {
    errors.push({ severity: "error", areaId, field: "bounds", message: `Area "${areaId}" has invalid Z bounds: minZ (${bounds.minZ}) >= maxZ (${bounds.maxZ}).`, code: "INVALID_BOUNDS" });
  }
}

function validateSpawn(spawn: SpawnConfig, bounds: AreaBounds, errors: ValidationError[], areaId: string): void {
  if (!isVec3(spawn.position)) {
    errors.push({ severity: "error", areaId, field: "spawn.position", message: `Area "${areaId}" has invalid spawn position.`, code: "INVALID_POSITION" });
    return;
  }
  if (!isFiniteNumber(spawn.yaw)) {
    errors.push({ severity: "error", areaId, field: "spawn.yaw", message: `Area "${areaId}" has invalid spawn yaw.`, code: "INVALID_YAW" });
  }

  const [x, , z] = spawn.position;
  if (x < bounds.minX || x > bounds.maxX || z < bounds.minZ || z > bounds.maxZ) {
    errors.push({ severity: "warning", areaId, field: "spawn.position", message: `Area "${areaId}" spawn position [${x}, ${spawn.position[1]}, ${z}] is outside bounds.`, code: "SPAWN_OUTSIDE_BOUNDS" });
  }
}

function validateAreaScene(area: AreaSceneDefinition, errors: ValidationError[]): void {
  const areaId = area.id;

  // Area ID must be a valid WorldAreaId
  if (!isValidAreaId(areaId)) {
    errors.push({ severity: "error", areaId, field: "id", message: `Area has invalid ID "${areaId}".`, code: "INVALID_AREA_ID" });
  }

  // Metadata
  if (!area.metadata?.name || typeof area.metadata.name !== "string") {
    errors.push({ severity: "error", areaId, field: "metadata.name", message: `Area "${areaId}" is missing metadata name.`, code: "MISSING_REQUIRED_FIELD" });
  }

  // Bounds
  validateBounds(area.bounds, errors, areaId);

  // Spawn
  validateSpawn(area.spawn, area.bounds, errors, areaId);

  // Atmosphere
  if (area.atmosphere.particleColor !== undefined && !isValidColor(area.atmosphere.particleColor)) {
    errors.push({ severity: "warning", areaId, field: "atmosphere.particleColor", message: `Area "${areaId}" has invalid particle color.`, code: "INVALID_COLOR" });
  }

  // Object ID uniqueness within area
  const objectIds = new Set<string>();
  for (const obj of area.objects) {
    if (obj.id && objectIds.has(obj.id)) {
      errors.push({ severity: "error", objectId: obj.id, areaId, field: "id", message: `Duplicate object ID "${obj.id}" in area "${areaId}".`, code: "DUPLICATE_ID" });
    }
    if (obj.id) objectIds.add(obj.id);
    validateSceneObject(obj, errors, areaId);
  }

  // Light budget warning
  const lightCount = area.objects.filter((o) => o.type === "point-light").length;
  if (lightCount > 6) {
    errors.push({ severity: "warning", areaId, message: `Area "${areaId}" has ${lightCount} point lights (budget: ≤6).`, code: "LIGHT_BUDGET_EXCEEDED" });
  }
}

// ─── Environment Validators ─────────────────────────────────────────────────

function validateEnvironment(env: EnvironmentConfig, errors: ValidationError[]): void {
  if (!isValidColor(env.background)) {
    errors.push({ severity: "error", field: "environment.background", message: "Environment has invalid background color.", code: "INVALID_COLOR" });
  }

  // Fog
  if (!isValidColor(env.fog?.color)) {
    errors.push({ severity: "error", field: "environment.fog.color", message: "Environment fog has invalid color.", code: "INVALID_COLOR" });
  }
  if (!isFinitePositive(env.fog?.near) || !isFinitePositive(env.fog?.far)) {
    errors.push({ severity: "error", field: "environment.fog", message: "Environment fog has invalid near/far values.", code: "INVALID_FOG" });
  }
  if (env.fog?.near >= env.fog?.far) {
    errors.push({ severity: "warning", field: "environment.fog", message: "Environment fog near >= far.", code: "INVALID_FOG" });
  }

  // Hemisphere light
  if (!isValidColor(env.hemisphereLight?.skyColor) || !isValidColor(env.hemisphereLight?.groundColor)) {
    errors.push({ severity: "error", field: "environment.hemisphereLight", message: "Hemisphere light has invalid colors.", code: "INVALID_COLOR" });
  }

  // Directional light
  if (!isVec3(env.directionalLight?.position)) {
    errors.push({ severity: "error", field: "environment.directionalLight.position", message: "Directional light has invalid position.", code: "INVALID_POSITION" });
  }
  if (!isFinitePositive(env.directionalLight?.intensity)) {
    errors.push({ severity: "error", field: "environment.directionalLight.intensity", message: "Directional light has invalid intensity.", code: "INVALID_INTENSITY" });
  }

  // Ground
  if (!isFinitePositive(env.ground?.size)) {
    errors.push({ severity: "error", field: "environment.ground.size", message: "Ground has invalid size.", code: "INVALID_SIZE" });
  }
}

// ─── Main Validation ────────────────────────────────────────────────────────

/**
 * Validates an AtlasSceneDefinition for structural integrity.
 * Returns a list of errors/warnings. An empty list means the scene is valid.
 */
export function validateScene(scene: AtlasSceneDefinition): ValidationResult {
  const errors: ValidationError[] = [];

  // Version
  if (typeof scene.version !== "number" || scene.version < 1) {
    errors.push({ severity: "error", field: "version", message: "Scene version must be a positive integer.", code: "INVALID_VERSION" });
  }

  // Environment
  if (!scene.environment) {
    errors.push({ severity: "error", field: "environment", message: "Scene is missing environment configuration.", code: "MISSING_REQUIRED_FIELD" });
  } else {
    validateEnvironment(scene.environment, errors);
  }

  // Areas
  if (!scene.areas || typeof scene.areas !== "object") {
    errors.push({ severity: "error", field: "areas", message: "Scene is missing areas.", code: "MISSING_REQUIRED_FIELD" });
  } else {
    // Check for globally duplicate object IDs across all areas
    const globalObjectIds = new Map<string, string>(); // objectId → areaId

    for (const [areaId, areaScene] of Object.entries(scene.areas)) {
      if (!areaScene) continue;
      validateAreaScene(areaScene, errors);

      // Cross-area duplicate check
      for (const obj of areaScene.objects) {
        if (!obj.id) continue;
        const existingArea = globalObjectIds.get(obj.id);
        if (existingArea && existingArea !== areaId) {
          errors.push({
            severity: "warning",
            objectId: obj.id,
            areaId,
            field: "id",
            message: `Object ID "${obj.id}" exists in both "${existingArea}" and "${areaId}".`,
            code: "CROSS_AREA_DUPLICATE_ID",
          });
        }
        globalObjectIds.set(obj.id, areaId);
      }
    }
  }

  return {
    valid: errors.filter((e) => e.severity === "error").length === 0,
    errors,
  };
}

/**
 * Validates a single area scene definition in isolation.
 */
export function validateAreaScene_standalone(area: AreaSceneDefinition): ValidationResult {
  const errors: ValidationError[] = [];
  validateAreaScene(area, errors);
  return {
    valid: errors.filter((e) => e.severity === "error").length === 0,
    errors,
  };
}
