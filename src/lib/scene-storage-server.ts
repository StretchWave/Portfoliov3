import fs from "node:fs";
import path from "node:path";
import { validateScene, type ValidationError } from "./scene-validation";
import { serializeAreaScene, serializeEnvironmentConfig } from "./scene-serializer";
import type { AtlasSceneDefinition, AreaSceneDefinition, EnvironmentConfig } from "@/types/scene";
import type { WorldAreaId } from "@/types/portfolio";

export interface SceneRevisionData {
  revision: number;
  lastSavedAt: number;
  modifiedAreas: string[];
}

export interface SaveSceneOptions {
  expectedRevision?: number;
  author?: string;
  targetAreaId?: WorldAreaId;
}

export interface SaveSceneResult {
  success: boolean;
  revision: number;
  timestamp: number;
  savedAreas: string[];
  savedEnvironment: boolean;
  errors?: readonly ValidationError[];
  error?: string;
  code?: string;
}

export interface StorageStatus {
  revision: number;
  lastSavedAt: number;
  isLocalDev: boolean;
  areas: Record<string, { lastModified: number; exists: boolean }>;
}

const ALLOWED_FILES: Record<string, string> = {
  "atlas-hub": "atlas-hub.ts",
  "software-district": "software-district.ts",
  "intelligence-observatory": "intelligence-observatory.ts",
  "creative-workshop": "creative-workshop.ts",
  environment: "environment.ts",
};

const MAX_BACKUPS_PER_FILE = 5;

function getScenesDirectory(): string {
  return path.resolve(process.cwd(), "src/data/scenes");
}

function getRevisionFilePath(): string {
  return path.join(getScenesDirectory(), ".revision.json");
}

function getBackupsDirectory(): string {
  return path.join(getScenesDirectory(), ".backups");
}

/**
 * Read the current revision metadata or initialize it if absent.
 */
export function getCurrentRevision(): SceneRevisionData {
  const revPath = getRevisionFilePath();
  try {
    if (fs.existsSync(revPath)) {
      const content = fs.readFileSync(revPath, "utf-8");
      const parsed = JSON.parse(content) as SceneRevisionData;
      if (typeof parsed.revision === "number") {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[SceneStorage] Warning reading revision file:", err);
  }

  return {
    revision: 1,
    lastSavedAt: Date.now(),
    modifiedAreas: [],
  };
}

/**
 * Safely create a backup of a file before overwriting.
 * Automatically keeps only the most recent MAX_BACKUPS_PER_FILE backups.
 */
function createBackup(filePath: string, fileKey: string): void {
  if (!fs.existsSync(filePath)) return;

  const backupsDir = getBackupsDirectory();
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const timestamp = Date.now();
  const backupName = `${fileKey}.${timestamp}.bak`;
  const backupPath = path.join(backupsDir, backupName);

  fs.copyFileSync(filePath, backupPath);

  // Prune older backups for this fileKey
  try {
    const allBackups = fs
      .readdirSync(backupsDir)
      .filter((name) => name.startsWith(`${fileKey}.`) && name.endsWith(".bak"))
      .sort(); // Lexicographical sort on timestamp string

    if (allBackups.length > MAX_BACKUPS_PER_FILE) {
      const toDelete = allBackups.slice(0, allBackups.length - MAX_BACKUPS_PER_FILE);
      for (const oldFile of toDelete) {
        fs.unlinkSync(path.join(backupsDir, oldFile));
      }
    }
  } catch (err) {
    console.warn("[SceneStorage] Warning pruning backups:", err);
  }
}

/**
 * Atomically writes content to disk via temporary file rename.
 */
function atomicWriteFile(targetPath: string, content: string): void {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const tempPath = `${targetPath}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}.tmp`;
  fs.writeFileSync(tempPath, content, "utf-8");
  fs.renameSync(tempPath, targetPath);
}

/**
 * Returns runtime & scene storage status.
 */
export function getStorageStatus(): StorageStatus {
  const scenesDir = getScenesDirectory();
  const revisionData = getCurrentRevision();
  const areas: Record<string, { lastModified: number; exists: boolean }> = {};

  for (const [key, filename] of Object.entries(ALLOWED_FILES)) {
    const filePath = path.join(scenesDir, filename);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      areas[key] = { lastModified: stats.mtimeMs, exists: true };
    } else {
      areas[key] = { lastModified: 0, exists: false };
    }
  }

  return {
    revision: revisionData.revision,
    lastSavedAt: revisionData.lastSavedAt,
    isLocalDev: process.env.NODE_ENV !== "production",
    areas,
  };
}

/**
 * Save scene definition to canonical project source files with full validation,
 * concurrency conflict checking, automated backups, and atomic writes.
 */
export function saveSceneToProjectSource(
  scene: AtlasSceneDefinition,
  options: SaveSceneOptions = {},
): SaveSceneResult {
  // 1. Validate complete scene structure & references
  const validation = validateScene(scene);
  const fatalErrors = validation.errors.filter((e) => e.severity === "error");

  if (fatalErrors.length > 0) {
    return {
      success: false,
      revision: getCurrentRevision().revision,
      timestamp: Date.now(),
      savedAreas: [],
      savedEnvironment: false,
      errors: fatalErrors,
      error: `Validation failed with ${fatalErrors.length} error(s): ${fatalErrors[0].message}`,
      code: "VALIDATION_FAILED",
    };
  }

  // 2. Concurrency Check (Revision Conflict)
  const currentRev = getCurrentRevision();
  if (
    typeof options.expectedRevision === "number" &&
    options.expectedRevision < currentRev.revision
  ) {
    return {
      success: false,
      revision: currentRev.revision,
      timestamp: Date.now(),
      savedAreas: [],
      savedEnvironment: false,
      error: `Source changed since this Studio session loaded it (expected rev ${options.expectedRevision}, current rev ${currentRev.revision}).`,
      code: "REVISION_CONFLICT",
    };
  }

  const scenesDir = getScenesDirectory();
  const savedAreas: string[] = [];
  let savedEnvironment = false;

  try {
    // 3. Save Environment if present and modified
    if (scene.environment) {
      const envPath = path.join(scenesDir, ALLOWED_FILES.environment);
      const newContent = serializeEnvironmentConfig(scene.environment);

      let shouldWrite = true;
      if (fs.existsSync(envPath)) {
        const existing = fs.readFileSync(envPath, "utf-8");
        if (existing.trim() === newContent.trim()) {
          shouldWrite = false;
        }
      }

      if (shouldWrite) {
        createBackup(envPath, "environment");
        atomicWriteFile(envPath, newContent);
        savedEnvironment = true;
      }
    }

    // 4. Save Area Scenes
    for (const [areaId, areaScene] of Object.entries(scene.areas)) {
      if (!areaScene) continue;

      const fileName = ALLOWED_FILES[areaId];
      if (!fileName) {
        console.warn(`[SceneStorage] Skipping unmapped area: "${areaId}"`);
        continue;
      }

      const areaPath = path.join(scenesDir, fileName);
      const newContent = serializeAreaScene(areaScene);

      let shouldWrite = true;
      if (fs.existsSync(areaPath)) {
        const existing = fs.readFileSync(areaPath, "utf-8");
        if (existing.trim() === newContent.trim()) {
          shouldWrite = false;
        }
      }

      if (shouldWrite) {
        createBackup(areaPath, areaId);
        atomicWriteFile(areaPath, newContent);
        savedAreas.push(areaId);
      }
    }

    // 5. Increment revision and write revision metadata
    const nextRevision = currentRev.revision + 1;
    const nextRevisionData: SceneRevisionData = {
      revision: nextRevision,
      lastSavedAt: Date.now(),
      modifiedAreas: savedAreas,
    };

    atomicWriteFile(
      getRevisionFilePath(),
      JSON.stringify(nextRevisionData, null, 2),
    );

    return {
      success: true,
      revision: nextRevision,
      timestamp: nextRevisionData.lastSavedAt,
      savedAreas,
      savedEnvironment,
      errors: validation.errors.filter((e) => e.severity === "warning"),
    };
  } catch (err) {
    return {
      success: false,
      revision: currentRev.revision,
      timestamp: Date.now(),
      savedAreas,
      savedEnvironment,
      error: `Filesystem persistence failed: ${String(err)}`,
      code: "WRITE_FAILED",
    };
  }
}
