/**
 * Versioned, fault-tolerant client storage layer for Project Atlas.
 * Provides safe parsing, graceful fallbacks for malformed or corrupted data,
 * and automatic schema migration from legacy keys.
 */

export interface AtlasSettingsV1 {
  version: 1;
  soundEnabled: boolean;
  masterVolume: number;
  ambientVolume: number;
  effectsVolume: number;
  soundProfile: "cybernetic" | "harmonic" | "crisp";
  spatialEnabled: boolean;
  hapticsEnabled: boolean;
}

export interface AtlasDiscoveryV1 {
  version: 1;
  discoveredIds: string[];
  updatedAt: number;
}

const SETTINGS_KEY = "atlas-settings-v1";
const DISCOVERY_KEY = "atlas-discovery-v1";

export const DEFAULT_SETTINGS: AtlasSettingsV1 = {
  version: 1,
  soundEnabled: false,
  masterVolume: 0.45,
  ambientVolume: 0.4,
  effectsVolume: 0.55,
  soundProfile: "cybernetic",
  spatialEnabled: true,
  hapticsEnabled: true,
};

export const DEFAULT_DISCOVERY: AtlasDiscoveryV1 = {
  version: 1,
  discoveredIds: [],
  updatedAt: Date.now(),
};

function clampNumber(val: unknown, min: number, max: number, fallback: number): number {
  if (typeof val !== "number" || Number.isNaN(val)) return fallback;
  return Math.max(min, Math.min(max, val));
}

function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__atlas_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function parseSettings(raw: unknown): AtlasSettingsV1 {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SETTINGS };
  const obj = raw as Record<string, unknown>;
  return {
    version: 1,
    soundEnabled: Boolean(obj.soundEnabled),
    masterVolume: clampNumber(obj.masterVolume, 0, 1, DEFAULT_SETTINGS.masterVolume),
    ambientVolume: clampNumber(obj.ambientVolume, 0, 1, DEFAULT_SETTINGS.ambientVolume),
    effectsVolume: clampNumber(obj.effectsVolume, 0, 1, DEFAULT_SETTINGS.effectsVolume),
    soundProfile:
      obj.soundProfile === "harmonic" || obj.soundProfile === "crisp"
        ? obj.soundProfile
        : "cybernetic",
    spatialEnabled: obj.spatialEnabled !== false,
    hapticsEnabled: obj.hapticsEnabled !== false,
  };
}

export function parseDiscovery(raw: unknown): AtlasDiscoveryV1 {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_DISCOVERY };
  const obj = raw as Record<string, unknown>;
  const ids = Array.isArray(obj.discoveredIds)
    ? obj.discoveredIds.filter((id: unknown): id is string => typeof id === "string")
    : [];
  return {
    version: 1,
    discoveredIds: ids,
    updatedAt: typeof obj.updatedAt === "number" ? obj.updatedAt : Date.now(),
  };
}

/**
 * Loads and validates settings, migrating legacy keys if present.
 */
export function loadSettings(): AtlasSettingsV1 {
  if (!isStorageAvailable()) return { ...DEFAULT_SETTINGS };

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return parseSettings(JSON.parse(raw));
    }

    // Migration from unversioned legacy keys
    const legacySound = window.localStorage.getItem("atlas-sound-enabled");
    const legacyVol = window.localStorage.getItem("atlas-sound-volume");
    const legacyAmb = window.localStorage.getItem("atlas-ambient-volume");
    const legacyFx = window.localStorage.getItem("atlas-effects-volume");
    const legacyProfile = window.localStorage.getItem("atlas-sound-profile");
    const legacySpatial = window.localStorage.getItem("atlas-spatial-enabled");
    const legacyHaptics = window.localStorage.getItem("atlas-haptics-enabled");

    if (legacySound !== null || legacyVol !== null) {
      const migrated: AtlasSettingsV1 = {
        version: 1,
        soundEnabled: legacySound === "true",
        masterVolume: clampNumber(Number.parseFloat(legacyVol ?? ""), 0, 1, DEFAULT_SETTINGS.masterVolume),
        ambientVolume: clampNumber(Number.parseFloat(legacyAmb ?? ""), 0, 1, DEFAULT_SETTINGS.ambientVolume),
        effectsVolume: clampNumber(Number.parseFloat(legacyFx ?? ""), 0, 1, DEFAULT_SETTINGS.effectsVolume),
        soundProfile:
          legacyProfile === "harmonic" || legacyProfile === "crisp" ? legacyProfile : "cybernetic",
        spatialEnabled: legacySpatial !== "false",
        hapticsEnabled: legacyHaptics !== "false",
      };
      saveSettings(migrated);
      return migrated;
    }
  } catch {
    // Non-fatal parse/storage error
  }

  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: Partial<AtlasSettingsV1>): void {
  if (!isStorageAvailable()) return;
  try {
    const current = loadSettings();
    const updated: AtlasSettingsV1 = {
      ...current,
      ...settings,
      version: 1,
    };
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch {
    // Storage quota or privacy sandbox error
  }
}

/**
 * Loads and validates discovery progress, migrating legacy keys if present.
 */
export function loadDiscovery(): AtlasDiscoveryV1 {
  if (!isStorageAvailable()) return { ...DEFAULT_DISCOVERY };

  try {
    const raw = window.localStorage.getItem(DISCOVERY_KEY);
    if (raw) {
      return parseDiscovery(JSON.parse(raw));
    }

    // Migration from legacy array key
    const legacyLog = window.localStorage.getItem("atlas-discovery-log");
    if (legacyLog) {
      const parsedLegacy = JSON.parse(legacyLog);
      if (Array.isArray(parsedLegacy)) {
        const migrated: AtlasDiscoveryV1 = {
          version: 1,
          discoveredIds: parsedLegacy.filter((id: unknown): id is string => typeof id === "string"),
          updatedAt: Date.now(),
        };
        saveDiscovery(migrated.discoveredIds);
        return migrated;
      }
    }
  } catch {
    // Non-fatal parse error
  }

  return { ...DEFAULT_DISCOVERY };
}

export function saveDiscovery(discoveredIds: string[]): void {
  if (!isStorageAvailable()) return;
  try {
    const payload: AtlasDiscoveryV1 = {
      version: 1,
      discoveredIds,
      updatedAt: Date.now(),
    };
    window.localStorage.setItem(DISCOVERY_KEY, JSON.stringify(payload));
  } catch {
    // Storage quota or privacy sandbox error
  }
}
