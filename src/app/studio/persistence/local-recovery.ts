import type { AtlasSceneDefinition } from "@/types/scene";
import type { WorldAreaId } from "@/types/portfolio";

export interface RecoverySnapshot {
  scene: AtlasSceneDefinition;
  revision: number;
  activeAreaId: WorldAreaId;
  timestamp: number;
}

const RECOVERY_STORAGE_KEY = "atlas_studio_recovery_snapshot";

export function saveRecoverySnapshot(
  scene: AtlasSceneDefinition,
  revision: number,
  activeAreaId: WorldAreaId,
): void {
  if (typeof window === "undefined") return;

  try {
    const snapshot: RecoverySnapshot = {
      scene,
      revision,
      activeAreaId,
      timestamp: Date.now(),
    };
    window.localStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(snapshot));
  } catch (err) {
    console.warn("[LocalRecovery] Failed to write recovery snapshot:", err);
  }
}

export function getRecoverySnapshot(): RecoverySnapshot | null {
  if (typeof window === "undefined") return null;

  try {
    const item = window.localStorage.getItem(RECOVERY_STORAGE_KEY);
    if (!item) return null;
    const parsed = JSON.parse(item) as RecoverySnapshot;
    if (parsed && parsed.scene && parsed.timestamp) {
      return parsed;
    }
  } catch (err) {
    console.warn("[LocalRecovery] Failed to read recovery snapshot:", err);
  }
  return null;
}

export function clearRecoverySnapshot(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(RECOVERY_STORAGE_KEY);
  } catch (err) {
    console.warn("[LocalRecovery] Failed to clear recovery snapshot:", err);
  }
}
