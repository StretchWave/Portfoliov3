import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { getDefaultAtlasScene } from "../../src/data/scenes";
import {
  getCurrentRevision,
  getStorageStatus,
  saveSceneToProjectSource,
} from "../../src/lib/scene-storage-server";
import type { AtlasSceneDefinition } from "../../src/types/scene";

describe("Scene Storage Server Unit Tests", () => {
  it("retrieves current revision metadata with a positive integer", () => {
    const rev = getCurrentRevision();
    assert.equal(typeof rev.revision, "number");
    assert.ok(rev.revision >= 1);
    assert.equal(typeof rev.lastSavedAt, "number");
  });

  it("retrieves storage status for all 4 world areas plus environment", () => {
    const status = getStorageStatus();
    assert.equal(typeof status.revision, "number");
    assert.equal(status.areas["atlas-hub"]?.exists, true);
    assert.equal(status.areas["software-district"]?.exists, true);
    assert.equal(status.areas["intelligence-observatory"]?.exists, true);
    assert.equal(status.areas["creative-workshop"]?.exists, true);
    assert.equal(status.areas["environment"]?.exists, true);
  });

  it("rejects save when scene fails validation with fatal errors", () => {
    const defaultScene = getDefaultAtlasScene();
    const invalidScene: AtlasSceneDefinition = {
      ...defaultScene,
      areas: {
        ...defaultScene.areas,
        "atlas-hub": {
          ...defaultScene.areas["atlas-hub"]!,
          objects: [
            ...defaultScene.areas["atlas-hub"]!.objects,
            // Object with duplicate ID
            {
              id: "hub-light-entrance", // Duplicate ID
              type: "point-light",
              transform: { position: [0, 0, 0] },
              color: "#ffffff",
              intensity: 10,
              distance: 5,
            },
          ],
        },
      },
    };

    const result = saveSceneToProjectSource(invalidScene);
    assert.equal(result.success, false);
    assert.equal(result.code, "VALIDATION_FAILED");
    assert.ok(result.errors && result.errors.length > 0);
  });

  it("rejects save when interaction references a non-existent project ID", () => {
    const defaultScene = getDefaultAtlasScene();
    const invalidScene: AtlasSceneDefinition = {
      ...defaultScene,
      areas: {
        ...defaultScene.areas,
        "atlas-hub": {
          ...defaultScene.areas["atlas-hub"]!,
          objects: [
            ...defaultScene.areas["atlas-hub"]!.objects,
            {
              id: "test-unknown-project-exhibit",
              type: "architecture",
              moduleType: "column",
              transform: { position: [1, 1, 1] },
              interaction: {
                enabled: true,
                trigger: "click",
                actions: [
                  {
                    type: "show-project",
                    projectId: "non-existent-project-xyz-123",
                  },
                ],
              },
            },
          ],
        },
      },
    };

    const result = saveSceneToProjectSource(invalidScene);
    assert.equal(result.success, false);
    assert.equal(result.code, "VALIDATION_FAILED");
    const unknownProjError = result.errors?.find(
      (e) => e.code === "UNKNOWN_PROJECT_REFERENCE",
    );
    assert.ok(unknownProjError);
  });

  it("rejects save when expectedRevision is stale (concurrency conflict)", () => {
    const scene = getDefaultAtlasScene();
    const currentRev = getCurrentRevision().revision;

    const result = saveSceneToProjectSource(scene, {
      expectedRevision: currentRev - 1, // Stale revision
    });

    assert.equal(result.success, false);
    assert.equal(result.code, "REVISION_CONFLICT");
  });

  it("successfully persists canonical scene and increments revision", () => {
    const scene = getDefaultAtlasScene();
    const beforeRev = getCurrentRevision().revision;

    const result = saveSceneToProjectSource(scene, {
      expectedRevision: beforeRev,
    });

    assert.equal(result.success, true);
    assert.equal(result.revision, beforeRev + 1);
    assert.ok(result.timestamp > 0);

    const afterRev = getCurrentRevision().revision;
    assert.equal(afterRev, beforeRev + 1);
  });
});
