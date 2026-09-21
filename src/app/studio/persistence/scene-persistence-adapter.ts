import type { AtlasSceneDefinition } from "@/types/scene";
import type { AppContent } from "@/types/content";
import type { SaveSceneResult, StorageStatus } from "@/lib/scene-storage-server";

export interface SaveSceneClientOptions {
  clientRevision?: number;
  activeAreaId?: string;
  appContent?: AppContent;
  force?: boolean;
}

export interface ScenePersistenceAdapter {
  saveScene(
    scene: AtlasSceneDefinition,
    options?: SaveSceneClientOptions,
  ): Promise<SaveSceneResult>;
  getStatus(): Promise<StorageStatus>;
}

export class LocalApiPersistenceAdapter implements ScenePersistenceAdapter {
  async saveScene(
    scene: AtlasSceneDefinition,
    options?: SaveSceneClientOptions,
  ): Promise<SaveSceneResult> {
    const res = await fetch("/api/studio/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scene,
        clientRevision: options?.clientRevision,
        activeAreaId: options?.activeAreaId,
        appContent: options?.appContent,
        force: options?.force,
      }),
    });

    const data = await res.json();
    return data as SaveSceneResult;
  }

  async getStatus(): Promise<StorageStatus> {
    const res = await fetch("/api/studio/status");
    if (!res.ok) {
      throw new Error(`Failed to fetch storage status: ${res.statusText}`);
    }
    return (await res.json()) as StorageStatus;
  }
}

export const defaultPersistenceAdapter = new LocalApiPersistenceAdapter();
